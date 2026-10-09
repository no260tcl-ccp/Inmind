<route lang="json5">
{
  style: {
    navigationBarTitleText: '我的配方',
    navigationBarBackgroundColor: '#ffffff',
    // disableScroll: true,
    enablePullDownRefresh: true, // 必须开启下拉刷新
    onReachBottomDistance: 50, // 必须设置距离
  },
}
</route>

<template>
  <view class="formula-content">
    <scroll-view @scrolltolower="loadMore" scroll-y="true" lower-threshold="30">
      <view class="formula-list">
        <wd-swipe-action v-for="(item, index) in dataList" :key="index">
          <view
            class="formula-item"
            :class="{ 'last-formula-item': index === dataList.length - 1 }"
            @click.stop="itemClick(item, index)"
          >
            <view class="formula-item-left">
              <view>{{ item.name }}</view>
              <view class="font-size-3 tips-color flex items-center mt-2">
                <view>
                  {{ item.configJson.legumes ? `${item.configJson.legumes}g` : '-' }}
                </view>
                <view class="ml-2 mr-2 divider"></view>
                <view>
                  {{
                    item.configJson.proportion
                      ? `1:${item.configJson.proportion.toFixed(1) / 2}`
                      : '-'
                  }}
                  <view class="divider-empty"></view>
                  {{
                    item.configJson.proportion
                      ? (item.configJson.proportion / 2) * item.configJson.legumes + 'ml'
                      : '-'
                  }}
                </view>
                <view class="ml-2 mr-2 divider"></view>
                <view>
                  {{
                    item.configJson.gear
                      ? `${item.configJson.gear}(${dangweiType(item.configJson.gear)})`
                      : '-'
                  }}
                </view>
              </view>
              <view class="mt-3.5 flex">
                <view @click.stop="edit(item)" class="operate-eidt">
                  <i class="iconfont icon-a-ziyuan39 mr-1 icon-size-12"></i>
                </view>
                <view class="flex operate-setting mr-2" @click.stop="showShare(item)">
                  <!-- <i class="iconfont icon-a-svg10 ml-1 icon-size-10"></i> -->
                  <wd-img :width="10" :height="10" src="/static/images/common/share.png" />
                  <text class="ml-1">分享</text>
                </view>
                <view
                  @click.stop="setTop(item, index)"
                  v-if="dataList.length > 1"
                  class="operate-eidt"
                >
                  <wd-img :width="38" :height="28" src="/static/images/formula/top.png" />
                </view>
                <!-- <view class="flex operate-setting" @click.stop="start(item)">
                <view>冲煮</view>
                <i class="iconfont icon-a-svg10 ml-1 icon-size-10"></i>
              </view> -->
              </view>
            </view>
            <view class="formula-item-right">
              <wd-img :width="78" :height="78" :src="item.configJson.bgUrl" />
              <view class="img-num" :style="{ color: item.configJson.textColor }">
                {{ item.configJson.accordionItems ? item.configJson.accordionItems.length : '' }}
              </view>
            </view>
          </view>
          <template #right>
            <view class="action-box">
              <wd-img
                :width="34"
                :height="34"
                src="/static/images/formula/del.png"
                @click.stop="deleteItem(item, index)"
              />
            </view>
          </template>
        </wd-swipe-action>
      </view>
      <view class="no-data" v-if="dataList.length === 0 && total === 0">
        <wd-img :width="124" :height="100" :src="`${aliyunBaseUrl}no-data.png`" />
        <p class="desc-color">暂无配方</p>
        <p class="title-color">快去打造您的专属美味吧~</p>
        <view class="create" @click="addFormula">
          <wd-icon name="add" size="12px" class="mr-1"></wd-icon>
          创建配方
        </view>
      </view>
      <view class="long-create" @click="addFormula" v-else>
        <view class="btn">
          <wd-icon name="add" size="12px" class="mr-1"></wd-icon>
          创建配方
        </view>
      </view>
    </scroll-view>

    <my-loading :loading="loadingStatus" v-if="loadingStatus" />
    <wd-toast />
    <bc-confirm
      :show="isUse"
      :objData="objData"
      :isCancel="false"
      @close="isUse = false"
      @success="finishBack"
    ></bc-confirm>
    <bc-confirm
      :show="isAllClear"
      :objData="clearObjData"
      @close="isAllClear = false"
      @success="finishAllClear"
    ></bc-confirm>
    <bc-confirm
      :show="delShow"
      :objData="objDelData"
      @close="delShow = false"
      @success="confirmDelete"
    ></bc-confirm>
    <bc-share
      :show="shareShow"
      :generateImageBoolean="false"
      @close="closeShare"
      :objData="shareData"
      @shareToCoffeeMachine="sendFormula"
      @quickBoiling="quickBrewingMode"
    />
  </view>
  <bc-action-sheet :show="sheetShow" @close="closeSheet" :objData="sheetData" @success="start" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { httpGet, httpDelete, httpPut } from '@/utils/http'
import { useUserStore, useBluetoothStore, useMachineBStatusStore } from '@/store'
import { useToast, useMessage } from 'wot-design-uni'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import {
  dangweiType,
  retry,
  stringToUTF8Array,
  stringToGB2312,
  convertIntStrToNumber,
} from '@/utils'
import { CoffeeMachineProtocol } from '@/utils/coffeebBlueTool'
import { t } from '@/locale/index'
const aliyunBaseUrl = import.meta.env.VITE_COFFEE_BASE_URL
const coffeeMachineProtocol = CoffeeMachineProtocol.getInstance()
const machineStatusStore = useMachineBStatusStore()
const bluetoothStore = useBluetoothStore()
const formulaId = ref<number>(null)
const message = useMessage()
const userStore = useUserStore()
const userInfo = userStore.userInfo
const toast = useToast()
const paging = ref(null) // 分页组件的引用
const dataList = ref([]) // 数据列表
const loadingStatus = ref<boolean>(false)
const pageNum = ref(1) // 当前页码
const pageSize = ref(8) // 每页条数
const total = ref(0) // 总条数
const isUse = ref(false)
const shareShow = ref(false)
const shareData = ref({})
const sheetShow = ref(false)
const sheetData = ref({})
const objData = {
  icon: '/static/images/popup/sucess.png',
  content: `配方配置成功`,
  tips: '专属于您的美味，已准备就绪~',
}
const isAllClear = ref(false)
const clearObjData = {
  icon: '',
  content: `是否清空所有配方`,
  tips: '',
}
const delShow = ref(false)
const objDelData = {
  icon: '/static/images/popup/delete.png',
  content: '确认删除配方',
  tips: '删除后无法恢复，请谨慎操作',
}
const crrentItem = ref(null)
const cdnBaseUrl = import.meta.env.VITE_CDN_BASE_URL
const formulaBgList = [
  {
    url: `${cdnBaseUrl}/a4fe367f3bf4c0ab36b4b932689d57bb3456610c1daa287e66aa44268a528373.png`,
    color: '#F5ABBD',
  },
  {
    url: `${cdnBaseUrl}/753a976ec38d2c7c62784cfb711880923b4b2bd9a926c8a92f7ef539e946db3b.png`,
    color: '#A1B9D9',
  },
  {
    url: `${cdnBaseUrl}/7af32880c9244e35fa97b89de490fbd2beb6c6221ae1f58e07c2ed79ed1a71b1.png`,
    color: '#99CEB3',
  },
  {
    url: `${cdnBaseUrl}/ce2564f7e0e213f415624a2a8001d4d3a8b9a85743e23b7db308b73a37a8e16f.png`,
    color: '#D9C1A1',
  },
]
const runStatus = ref(machineStatusStore.runStatus)
watch(
  () => machineStatusStore.runStatus,
  (newStatus) => {
    runStatus.value = newStatus
  },
  { immediate: true },
)
const finishBack = () => {
  isUse.value = false
}
const addFormula = () => {
  uni.redirectTo({
    url: '/pages-coffeeb/formula/formula',
  })
}
// 编辑配方
const edit = (item) => {
  // 跳转到编辑页面，并将参数传递过去
  wx.redirectTo({
    url: `/pages-coffeeb/formula/formula?data=${encodedParams(item)}`,
  })
}

// 开始冲煮
const start = async (item) => {
  if (runStatus.value !== 0) {
    toast.error({ msg: '设备当前正在运行，请先停止当前任务', zIndex: 1000 })
    return
  }
  const data = [
    1,
    item.configJson.grind ? 1 : 0,
    (item.id >> 24) & 0xff,
    (item.id >> 16) & 0xff,
    (item.id >> 8) & 0xff,
    item.id & 0xff,
    item.configJson.accordionItems.length,
    0,
    0,
    0,
  ]
  uni.showLoading({ title: '发送中...', mask: true })
  try {
    await retry(
      async () => {
        const response = await coffeeMachineProtocol.sendBrewMode(data)
        if (response === 'dd') {
          closeSheet()
          uni.setStorageSync('id', item.id)
          uni.navigateTo({
            // url: '/pages-coffeeb/brew/brew?id=' + item.id,
            url: '/pages-coffeeb/pulverizing/pulverizing?id=' + item.id,
          })
        } else {
          throw new Error('命令执行失败，请重新尝试')
        }
      },
      3,
      500,
    )
  } catch (error) {
    toast.error({ msg: error.message, zIndex: 1000 })
  } finally {
    uni.hideLoading()
  }
}

// 查询数据列表
const queryList = (pageNum) => {
  console.log(pageNum)
  const params = {
    pageNum,
    pageSize: pageSize.value,
    userId: userInfo.id,
    deviceId: bluetoothStore.connectedDevice.productInfo.id,
  }

  // 发送请求获取数据
  const { run } = useRequest<IResponseData>(() => httpGet('/repice/repice/list', params))

  run().then((res) => {
    res.rows.forEach((el, index) => {
      el.configJson = JSON.parse(el.configJson)
      const sign = Math.floor(Math.random() * formulaBgList.length)
      el.configJson.bgUrl = formulaBgList[sign].url
      el.configJson.textColor = formulaBgList[sign].color
    })

    dataList.value = [...dataList.value, ...convertIntStrToNumber(res.rows)]
    total.value = res.total
    uni.stopPullDownRefresh() // 停止下拉刷新
    if (dataList.value.length === total.value && total.value > 8) {
      toast.success('没有更多配方了')
    }
  })
}

const setTop = (item, index) => {
  setTopAndUpdateSharedToDevice(item, index, true)
}
// 置顶和更新sharedToDevice
const setTopAndUpdateSharedToDevice = (item, index, isSetTop = true) => {
  const { run: updateFormulaApi } = useRequest<IResponseData>(() =>
    httpPut('/repice/repice', {
      id: item.id,
      deviceId: item.deviceId,
      userId: userStore.userInfo.id, // 用户id
      name: item.name,
      imageUrl: item.imageUrl,
      sort: isSetTop ? dataList.value[0].sort + 1 : Number(item.sort),
      sharedToDevice: isSetTop ? item.sharedToDevice : 1,
      configJson: JSON.stringify({
        legumes: item.configJson.legumes, // 咖啡粉
        proportion: item.configJson.proportion, // 粉水比
        grind: item.configJson.grind, // 研磨开关
        gear: item.configJson.gear, // 档位
        speed: item.configJson.speed, // 转速
        accordionItems: item.configJson.accordionItems, // 注水段数
      }), // 转换字符串  配方参数
    }),
  )
  updateFormulaApi().then((response) => {
    if (response.code === 200) {
      pageNum.value = 1
      dataList.value.length = 0
      queryList(pageNum.value)
      if (isSetTop) {
        toast.success(t('totast.error.gxcg'))
      }
    } else {
      toast.error(response.msg)
    }
  })
}
const encodedParams = (item) => {
  // 构建参数对象
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

  // 将参数对象序列化为 JSON 字符串
  const serializedParams = JSON.stringify(params)
  // URL 编码
  const encodedParams = encodeURIComponent(serializedParams)
  return encodedParams
}
// 处理项点击事件
const itemClick = (item, index) => {
  // 页面跳转
  uni.redirectTo({
    url: `/pages-coffeeb/formulaDetail/formulaDetail?data=${encodedParams(item)}`,
  })
}

onShow(() => {
  dataList.value.length = 0
  pageNum.value = 1
  queryList(pageNum.value)
})

const loadMore = () => {
  if (dataList.value.length === total.value) {
    toast.success('没有更多配方了')
    return
  }
  pageNum.value += 1
  queryList(pageNum.value)
}

// 下拉刷洗
onPullDownRefresh(() => {
  pageNum.value = 1
  dataList.value.length = 0
  queryList(pageNum.value)
})

// 删除数据方法
const delectFormula = async () => {
  // 删除掉服务器上面的配方
  const dataToSend = 'D kkkk'

  // 发送删除请求
  const ids = paging.value.map((item) => item.id)
  const { run } = useRequest<IResponseData>(() => httpDelete(`/repice/repice/${ids}`))

  run().then(async (res) => {
    try {
      loadingStatus.value = true // 设置加载状态
      toast.success('清空指令发送成功') // 成功提示
      pageNum.value = 1
      dataList.value.length = 0
      queryList(pageNum.value)
    } catch (error) {
      console.error('冲泡指令发送失败:', error)
      toast.error('清空指令发送失败') // 失败提示
    } finally {
      loadingStatus.value = false // 重置加载状态
    }
  })
}
const deleteAllFormula = () => {
  isAllClear.value = true
}
const finishAllClear = () => {
  delectFormula()
}
const deleteItem = async (item, index) => {
  delShow.value = true
  crrentItem.value = item
}
const confirmDelete = () => {
  // 发送删除请求
  const ids = [crrentItem.value.id]
  const { run } = useRequest<IResponseData>(() => httpDelete(`/repice/repice/${ids}`))
  run().then((res) => {
    toast.close()
    if (res.code === 200) {
      pageNum.value = 1
      dataList.value.length = 0
      queryList(pageNum.value)
      toast.success('删除成功')
      delShow.value = false
    } else {
      toast.error(res.msg)
    }
  })
}
const showShare = (data) => {
  formulaId.value = data.id // 保存当前选中的配方以备快速冲煮使用
  shareShow.value = true
  shareData.value = data
}
const closeShare = () => {
  shareShow.value = false
}
const showSheet = (data) => {
  sheetShow.value = true
  sheetData.value = data
}

const closeSheet = () => {
  sheetShow.value = false
}
const sendFormula = async (data) => {
  if (runStatus.value !== 0) {
    toast.warning('请空闲状态分享配方哟~')
    return
  }
  // 发送失败重试3次
  uni.showLoading({ title: '分享中...', mask: true })
  try {
    await retry(() => send(data), 3, 500)
  } catch (error) {
    console.log(error, '配置命令执行失败')
    toast.error('命令执行失败，请重新尝试')
  } finally {
    uni.hideLoading()
  }
}
const send = async (formulaData) => {
  // 将32位整数ID值分解为4个8位字节
  // 通过位移和按位与操作提取ID的各个字节段
  // 第一个字节：取ID值的最高8位
  // 第二个字节：取ID值的第二个8位
  // 第三个字节：取ID值的第三个8位
  // 第四个字节：取ID值的最低8位
  console.log('formulaData', formulaData)
  const obj = formulaData.configJson
  const data = [
    (formulaData.id >> 24) & 0xff,
    (formulaData.id >> 16) & 0xff,
    (formulaData.id >> 8) & 0xff,
    formulaData.id & 0xff,
    obj.proportion / 2,
    obj.legumes,
    obj.grind ? 1 : 0,
    obj.gear,
    obj.speed,
    obj.accordionItems.length,
  ]
  // 遍历最多5段配方数据
  for (let i = 0; i < 5; i++) {
    if (i < obj.accordionItems.length) {
      const item = obj.accordionItems[i]
      data.push(item.water)
      data.push(Number(`3.${item.velocity}`) * 10)
      data.push(item.temperature)
      data.push(item.type)
      data.push(item.time)
    } else {
      // 不足5段的用0填充
      data.push(...[0, 0, 0, 0, 0])
    }
  }
  // const bytes = stringToUTF8Array(formulaData.name)
  const bytes = stringToGB2312(formulaData.name)
  console.log('bytes111', bytes)
  data.push(...bytes)
  console.log('配方数据:', data)
  const response = await coffeeMachineProtocol.sendRecipeData(data)
  if (response == 'dd') {
    // isUse.value = true
    closeShare()
    showSheet(formulaData)
    // 刷新数据
    setTopAndUpdateSharedToDevice(formulaData, null, false)
  } else {
    throw new Error('命令执行失败，请重新尝试')
  }
}

const quickBrewingMode = async () => {
  const res = await machineStatusStore.saveQuickCookingRecipe(formulaId.value)
  if (res.code === 200) {
    const url = `/pages-coffeeb/grind/grind`
    const pages = getCurrentPages()
    if (pages.length >= 9) {
      uni.redirectTo({ url })
    } else {
      uni.navigateTo({ url })
    }
  } else {
    toast.error({ msg: res.msg || '接口调用失败', zIndex: 1000 })
  }
}
</script>

<style lang="scss" scoped>
.formula-content {
  height: 100vh;
  margin-bottom: 120rpx;
  background-color: white;
  .formula-list {
    padding: 36rpx 36rpx 0 36rpx;
    .formula-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 32rpx;
      // padding: 18rpx 0;
      margin-bottom: 32rpx;
      font-size: 28rpx;
      color: #222222;
      border-bottom: 1px solid #f5f5f5;
      .formula-item-left {
        .operate-eidt {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 76rpx;
          height: 56rpx;
          margin-right: 16rpx;
          color: #666666;
          background: #f1f1f1;
          border-radius: 28rpx;
        }
        .operate-setting {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 124rpx;
          height: 56rpx;
          font-size: 24rpx;
          color: #004097;
          background: #e5ebf4;
          border-radius: 28rpx;
        }
      }
      .formula-item-right {
        position: relative;
        display: flex;
        .img-num {
          position: absolute;
          right: 8rpx;
          bottom: -24rpx;
          font-family: Roboto;
          font-size: 60px;
          font-weight: 600;
          color: #f5abbd;
          letter-spacing: -0.04em;
        }
      }
    }
    .last-formula-item {
      padding-bottom: 0rpx;
      border-bottom: none;
    }
  }
  // 添加分割线样式
  .divider {
    display: inline-block;
    width: 2rpx;
    height: 20rpx;
    background-color: #e6e6e6;
  }
  .divider-empty {
    display: inline-block;
    width: 20rpx;
    height: 20rpx;
  }
  .action-box {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 90%;
    margin-left: 20rpx;
  }
}
.no-data {
  height: 700px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  font-size: 32rpx;
  .desc-color {
    color: #222222;
    margin-top: 22px;
  }
  .title-color {
    color: #666666;
    margin-top: 16px;
  }
  .create {
    width: 165px;
    height: 44px;
    line-height: 44px;
    background: #004097;
    border-radius: 22px;
    color: #ffffff;
    margin-top: 16px;
    text-align: center;
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
  .btn {
    width: 343px;
    height: 44px;
    line-height: 44px;
    background: #004097;
    border-radius: 22px;
    color: #ffffff;
    margin-top: 16px;
    text-align: center;
  }
}
</style>
