<template>
  <div class="formula-content">
    <van-pull-refresh v-model="isRefreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="listLoading"
        :finished="listFinished"
        finished-text="没有更多配方了"
        @load="loadMore"
      >
        <div class="formula-list" v-if="dataList.length > 0">
          <van-swipe-cell v-for="(item, index) in dataList" :key="index" class="mb-4">
            <div class="formula-item" @click.stop="itemClick(item, index)">
              <div class="formula-item-left">
                <div class="font-size-4 font-bold">{{ item.name }}</div>
                <div class="font-size-3 tips-color flex items-center mt-2">
                  <div>{{ item.configJson.legumes ? `${item.configJson.legumes}g` : '-' }}</div>
                  <div class="ml-2 mr-2 divider"></div>
                  <div>
                    {{ item.configJson.proportion ? `1:${item.configJson.proportion.toFixed(1) / 2}` : '-' }}
                    <div class="divider-empty"></div>
                    {{ item.configJson.proportion ? (item.configJson.proportion / 2) * item.configJson.legumes + 'ml' : '-' }}
                  </div>
                  <div class="ml-2 mr-2 divider"></div>
                  <div>
                    {{ item.configJson.gear ? `${item.configJson.gear}(${dangweiType(item.configJson.gear)})` : '-' }}
                  </div>
                </div>
                <div class="mt-3 flex items-center">
                  <div @click.stop="edit(item)" class="operate-eidt">
                    <i class="iconfont icon-a-ziyuan39 mr-1 icon-size-12"></i>
                  </div>
                  <div class="flex operate-setting mr-2" @click.stop="showShare(item)">
                    <van-image width="10" height="10" src="/static/images/common/share.png" />
                    <span class="ml-1">分享</span>
                  </div>
                  <div @click.stop="setTop(item, index)" v-if="dataList.length > 1" class="operate-eidt">
                    <van-image width="38" height="28" src="/static/images/formula/top.png" />
                  </div>
                </div>
              </div>
              <div class="formula-item-right">
                <van-image width="78" height="78" :src="item.configJson.bgUrl" />
                <div class="img-num" :style="{ color: item.configJson.textColor }">
                  {{ item.configJson.accordionItems ? item.configJson.accordionItems.length : '' }}
                </div>
              </div>
            </div>
            
            <template #right>
              <div class="action-box bg-red-50" @click.stop="deleteItem(item, index)" style="height: 100%; display: flex; align-items: center; padding: 0 15px;">
                <van-image width="34" height="34" src="/static/images/formula/del.png" />
              </div>
            </template>
          </van-swipe-cell>
        </div>

        <div class="no-data" v-if="dataList.length === 0 && !listLoading && !isRefreshing">
          <van-image width="124" height="100" :src="`${aliyunBaseUrl}no-data.png`" />
          <p class="desc-color">暂无配方</p>
          <p class="title-color">快去打造您的专属美味吧~</p>
          <div class="create cursor-pointer" @click="addFormula">
            <van-icon name="plus" size="12px" class="mr-1" />
            创建配方
          </div>
        </div>
      </van-list>
    </van-pull-refresh>

    <div class="long-create" v-if="dataList.length > 0">
      <div class="btn cursor-pointer" @click="addFormula">
        <van-icon name="plus" size="12px" class="mr-1" />
        创建配方
      </div>
    </div>

    <van-dialog v-model:show="isUse" title="配方配置成功" message="专属于您的美味，已准备就绪~" @confirm="finishBack" />
    <van-dialog v-model:show="isAllClear" title="是否清空所有配方" show-cancel-button @confirm="finishAllClear" />
    <van-dialog v-model:show="delShow" title="确认删除配方" message="删除后无法恢复，请谨慎操作" show-cancel-button @confirm="confirmDelete" />

    <van-action-sheet
      v-model:show="shareShow"
      :actions="shareActions"
      cancel-text="取消"
      close-on-click-action
      @select="onShareSelect"
    />
    <van-action-sheet
      v-model:show="sheetShow"
      :actions="brewActions"
      cancel-text="取消"
      close-on-click-action
      @select="onBrewSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { httpGet, httpDelete, httpPut } from '@/utils/http'
import { useUserStore, useBluetoothStore, useMachineBStatusStore } from '@/store'
import { dangweiType, retry, stringToGB2312, convertIntStrToNumber } from '@/utils'
import { CoffeeMachineProtocol } from '@/utils/coffeebBlueTool'
import { useRequest } from '@/hooks/useRequest'

const router = useRouter()
const aliyunBaseUrl = import.meta.env.VITE_COFFEE_BASE_URL || '/'
const cdnBaseUrl = import.meta.env.VITE_CDN_BASE_URL || 'https://cdn.bincoocoffee.cn'
const coffeeMachineProtocol = CoffeeMachineProtocol.getInstance()
const machineStatusStore = useMachineBStatusStore()
const bluetoothStore = useBluetoothStore()
const userStore = useUserStore()
const userInfo = userStore.userInfo

const formulaBgList = [
  { url: `${cdnBaseUrl}/a4fe367f3bf4c0ab36b4b932689d57bb3456610c1daa287e66aa44268a528373.png`, color: '#F5ABBD' },
  { url: `${cdnBaseUrl}/753a976ec38d2c7c62784cfb711880923b4b2bd9a926c8a92f7ef539e946db3b.png`, color: '#A1B9D9' },
  { url: `${cdnBaseUrl}/7af32880c9244e35fa97b89de490fbd2beb6c6221ae1f58e07c2ed79ed1a71b1.png`, color: '#99CEB3' },
  { url: `${cdnBaseUrl}/ce2564f7e0e213f415624a2a8001d4d3a8b9a85743e23b7db308b73a37a8e16f.png`, color: '#D9C1A1' },
]

const formulaId = ref<number | null>(null)
const dataList = ref<any[]>([])
const pageNum = ref(1)
const pageSize = ref(8)
const total = ref(0)

// Vant List / PullRefresh 状态
const isRefreshing = ref(false)
const listLoading = ref(false)
const listFinished = ref(false)

const isUse = ref(false)
const isAllClear = ref(false)
const delShow = ref(false)
const crrentItem = ref<any>(null)

const shareShow = ref(false)
const shareData = ref<any>({})
const sheetShow = ref(false)
const sheetData = ref<any>({})

const runStatus = computed(() => machineStatusStore.runStatus)

const shareActions = [
  { name: '分享到咖啡机', value: 'machine' },
  { name: '快速冲煮', value: 'quick' }
]
const brewActions = [
  { name: '开始冲煮', value: 'brew' }
]

const onShareSelect = (action: any) => {
  if (action.value === 'machine') sendFormula(shareData.value)
  if (action.value === 'quick') quickBrewingMode()
}

const onBrewSelect = (action: any) => {
  if (action.value === 'brew') start(sheetData.value)
}

const finishBack = () => { isUse.value = false }
const addFormula = () => { router.push('/pages-coffeeb/formula/formula') }

const encodedParams = (item: any) => {
  const params = {
    ...item.configJson,
    avatar: item.avatar,
    createTime: item.createTime,
    deviceId: item.deviceId,
    id: item.id,
    isEdit: true,
    name: item.name,
    userId: item.userId,
    sort: item.sort,
    sharedToDevice: item.sharedToDevice,
  }
  return encodeURIComponent(JSON.stringify(params))
}

const edit = (item: any) => { router.replace(`/pages-coffeeb/formula/formula?data=${encodedParams(item)}`) }
const itemClick = (item: any, index: number) => { router.replace(`/pages-coffeeb/formulaDetail/formulaDetail?data=${encodedParams(item)}`) }

const queryList = (page: number, isRefresh = false) => {
  const params = {
    pageNum: page,
    pageSize: pageSize.value,
    userId: userInfo?.id || '',
    deviceId: bluetoothStore.connectedDevice?.productInfo?.id || '',
  }

  const { run } = useRequest<any>(() => httpGet('/repice/repice/list', params))
  run().then((res: any) => {
    if (res && res.rows) {
      res.rows.forEach((el: any) => {
        el.configJson = JSON.parse(el.configJson || '{}')
        const sign = Math.floor(Math.random() * formulaBgList.length)
        el.configJson.bgUrl = formulaBgList[sign].url
        el.configJson.textColor = formulaBgList[sign].color
      })

      const formattedData = convertIntStrToNumber(res.rows)
      if (isRefresh) {
        dataList.value = formattedData
        isRefreshing.value = false
      } else {
        dataList.value = [...dataList.value, ...formattedData]
        listLoading.value = false
      }

      total.value = res.total || 0
      if (dataList.value.length >= total.value) {
        listFinished.value = true
      }
    } else {
      isRefreshing.value = false
      listLoading.value = false
      listFinished.value = true
    }
  }).catch(() => {
    isRefreshing.value = false
    listLoading.value = false
    listFinished.value = true
  })
}

const onRefresh = () => {
  pageNum.value = 1
  listFinished.value = false
  queryList(pageNum.value, true)
}

const loadMore = () => {
  if (listFinished.value) return
  pageNum.value += 1
  queryList(pageNum.value, false)
}

onMounted(() => { onRefresh() })

const setTop = (item: any, index: number) => { setTopAndUpdateSharedToDevice(item, index, true) }
const setTopAndUpdateSharedToDevice = (item: any, index: number, isSetTop = true) => {
  const { run } = useRequest<any>(() =>
    httpPut('/repice/repice', {
      id: item.id,
      deviceId: item.deviceId,
      userId: userStore.userInfo?.id || '',
      name: item.name,
      imageUrl: item.imageUrl,
      sort: isSetTop && dataList.value.length > 0 ? dataList.value[0].sort + 1 : Number(item.sort),
      sharedToDevice: isSetTop ? item.sharedToDevice : 1,
      configJson: JSON.stringify(item.configJson),
    })
  )
  run().then((response: any) => {
    if (response && response.code === 200) {
      onRefresh()
      if (isSetTop) showToast({ type: 'success', message: '更新成功' })
    } else {
      showToast({ type: 'fail', message: response?.msg || '操作失败' })
    }
  })
}

const deleteAllFormula = () => { isAllClear.value = true }
const finishAllClear = () => {
  const ids = dataList.value.map((item) => item.id)
  if (!ids.length) return
  httpDelete(`/repice/repice/${ids}`).then(() => {
    showToast({ type: 'success', message: '清空成功' })
    onRefresh()
  })
}

const deleteItem = (item: any, index: number) => {
  delShow.value = true
  crrentItem.value = item
}

const confirmDelete = () => {
  if (!crrentItem.value) return
  httpDelete(`/repice/repice/${[crrentItem.value.id]}`).then((res: any) => {
    if (res && res.code === 200) {
      showToast({ type: 'success', message: '删除成功' })
      onRefresh()
    } else {
      showToast({ type: 'fail', message: res?.msg || '删除失败' })
    }
  })
}

const showShare = (data: any) => {
  formulaId.value = data.id
  shareData.value = data
  shareShow.value = true
}

const showSheet = (data: any) => {
  sheetData.value = data
  sheetShow.value = true
}

const sendFormula = async (data: any) => {
  if (runStatus.value !== 0) {
    showToast({ type: 'fail', message: '请空闲状态分享配方哟~' })
    return
  }
  showLoadingToast({ message: '分享中...', forbidClick: true, duration: 0 })
  try {
    await retry(() => send(data), 3, 500)
  } catch (error) {
    showToast({ type: 'fail', message: '命令执行失败，请重新尝试' })
  } finally {
    closeToast()
  }
}

const send = async (formulaData: any) => {
  const obj = formulaData.configJson
  const data = [
    (formulaData.id >> 24) & 0xff, (formulaData.id >> 16) & 0xff, (formulaData.id >> 8) & 0xff, formulaData.id & 0xff,
    obj.proportion / 2, obj.legumes, obj.grind ? 1 : 0, obj.gear, obj.speed, obj.accordionItems.length,
  ]
  for (let i = 0; i < 5; i++) {
    if (i < obj.accordionItems.length) {
      const item = obj.accordionItems[i]
      data.push(item.water, Number(`3.${item.velocity}`) * 10, item.temperature, item.type, item.time)
    } else {
      data.push(0, 0, 0, 0, 0)
    }
  }
  const bytes = stringToGB2312(formulaData.name)
  data.push(...bytes)
  
  const response = await coffeeMachineProtocol.sendRecipeData(data)
  if (response == 'dd') {
    showSheet(formulaData)
    setTopAndUpdateSharedToDevice(formulaData, 0, false)
  } else {
    throw new Error('命令执行失败')
  }
}

const start = async (item: any) => {
  if (runStatus.value !== 0) {
    showToast({ type: 'fail', message: '设备当前正在运行，请先停止当前任务' })
    return
  }
  const data = [1, item.configJson.grind ? 1 : 0, (item.id >> 24) & 0xff, (item.id >> 16) & 0xff, (item.id >> 8) & 0xff, item.id & 0xff, item.configJson.accordionItems.length, 0, 0, 0]
  showLoadingToast({ message: '发送中...', forbidClick: true, duration: 0 })
  try {
    await retry(async () => {
      const response = await coffeeMachineProtocol.sendBrewMode(data)
      if (response === 'dd') {
        localStorage.setItem('id', item.id)
        router.push('/pages-coffeeb/pulverizing/pulverizing?id=' + item.id)
      } else {
        throw new Error('失败')
      }
    }, 3, 500)
  } catch (error: any) {
    showToast({ type: 'fail', message: '命令执行失败' })
  } finally {
    closeToast()
  }
}

const quickBrewingMode = async () => {
  const res = await machineStatusStore.saveQuickCookingRecipe(formulaId.value)
  if (res.code === 200) {
    router.push(`/pages-coffeeb/grind/grind`)
  } else {
    showToast({ type: 'fail', message: res.msg || '接口调用失败' })
  }
}
</script>

<style lang="scss" scoped>
.formula-content {
  min-height: 100vh;
  padding-bottom: 80px;
  background-color: white;
  
  .formula-list {
    padding: 18px 18px 0 18px;
    .formula-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 16px;
      font-size: 14px;
      color: #222222;
      border-bottom: 1px solid #f5f5f5;
      
      .formula-item-left {
        .operate-eidt {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 28px;
          margin-right: 8px;
          color: #666666;
          background: #f1f1f1;
          border-radius: 14px;
        }
        .operate-setting {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 62px;
          height: 28px;
          font-size: 12px;
          color: #004097;
          background: #e5ebf4;
          border-radius: 14px;
        }
      }
      .formula-item-right {
        position: relative;
        display: flex;
        .img-num {
          position: absolute;
          right: 4px;
          bottom: -12px;
          font-family: Roboto;
          font-size: 30px;
          font-weight: 600;
          color: #f5abbd;
          letter-spacing: -0.04em;
        }
      }
    }
  }

  .divider {
    display: inline-block;
    width: 1px;
    height: 10px;
    background-color: #e6e6e6;
  }
  .divider-empty {
    display: inline-block;
    width: 10px;
    height: 10px;
  }
  
  .no-data {
    height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    font-size: 16px;
    .desc-color { color: #222222; margin-top: 22px; }
    .title-color { color: #666666; margin-top: 16px; font-size: 14px; }
    .create {
      width: 165px;
      height: 44px;
      line-height: 44px;
      background: #004097;
      border-radius: 22px;
      color: #ffffff;
      margin-top: 16px;
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}

.long-create {
  width: 100%;
  position: fixed;
  left: 0;
  bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  .btn {
    width: 343px;
    height: 44px;
    line-height: 44px;
    background: #004097;
    border-radius: 22px;
    color: #ffffff;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 4px 10px rgba(0, 64, 151, 0.2);
  }
}
</style>