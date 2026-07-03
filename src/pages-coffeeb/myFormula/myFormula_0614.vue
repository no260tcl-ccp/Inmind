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
                <div class="font-size-4 font-bold" @click="itemClick(item, index)" style="background-color: yellow;">{{ item.name }}</div>
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
                  <div @click.stop="setTop(item, index)" v-if="dataList.length > 1 && index !== 0" class="operate-eidt">
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
          <van-empty v-if="dataList.length === 0" description="还没有私藏配方哦~" />
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

    <van-action-sheet v-model:show="shareShow" :actions="shareActions" cancel-text="取消" close-on-click-action @select="onShareSelect" />
    <van-action-sheet v-model:show="sheetShow" :actions="brewActions" cancel-text="取消" close-on-click-action @select="onBrewSelect" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { useUserStore, useBluetoothStore, useMachineBStatusStore } from '@/store'
import { retry, stringToGB2312 } from '@/utils'
import { CoffeeMachineProtocol } from '@/utils/coffeebBlueTool'

// 🌟 補上本地的檔位名稱轉換函式
const getDangweiType = (dangwei: number) => {
  const val = Number(dangwei) || 60
  if (val > 82) return '法压冷萃'
  if (val > 47 && val <= 82) return '手冲咖啡'
  if (val > 23 && val <= 47) return '爱乐压'
  if (val > 0 && val <= 23) return '意式浓缩'
  return ''
}

const router = useRouter()
const aliyunBaseUrl = import.meta.env.VITE_COFFEE_BASE_URL || '/'
const cdnBaseUrl = import.meta.env.VITE_CDN_BASE_URL || 'https://cdn.bincoocoffee.cn'
const coffeeMachineProtocol = CoffeeMachineProtocol.getInstance()
const machineStatusStore = useMachineBStatusStore()
const bluetoothStore = useBluetoothStore()

// 定義本地儲存的 Key
const LOCAL_RECIPES_KEY = 'bincoo_my_recipes'

const formulaBgList = [
  { url: `${cdnBaseUrl}/a4fe367f3bf4c0ab36b4b932689d57bb3456610c1daa287e66aa44268a528373.png`, color: '#F5ABBD' },
  { url: `${cdnBaseUrl}/753a976ec38d2c7c62784cfb711880923b4b2bd9a926c8a92f7ef539e946db3b.png`, color: '#A1B9D9' },
  { url: `${cdnBaseUrl}/7af32880c9244e35fa97b89de490fbd2beb6c6221ae1f58e07c2ed79ed1a71b1.png`, color: '#99CEB3' },
  { url: `${cdnBaseUrl}/ce2564f7e0e213f415624a2a8001d4d3a8b9a85743e23b7db308b73a37a8e16f.png`, color: '#D9C1A1' },
]

const formulaId = ref<number | null>(null)
const dataList = ref<any[]>([])

// Vant List / PullRefresh 状态
const isRefreshing = ref(false)
const listLoading = ref(false)
const listFinished = ref(false)

const isUse = ref(false)
const isAllClear = ref(false)
const delShow = ref(false)
const currentItem = ref<any>(null)

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
    id: item.id,
    isEdit: true,
    name: item.name,
  }
  return encodeURIComponent(JSON.stringify(params))
}

//const edit = (item: any) => { router.replace(`/pages-coffeeb/formula/formula?data=${encodedParams(item)}`) }
//const itemClick = (item: any, index: number) => { router.replace(`/pages-coffeeb/formulaDetail/formulaDetail?data=${encodedParams(item)}`) }
// 建議把原本的 replace 改為 push
//const itemClick = (item: any, index: number) => { 
//  router.push(`/pages-coffeeb/formulaDetail/formulaDetail?data=${encodedParams(item)}`) 
//}
// --- 請用這段全新升級的導航邏輯替換 myFormula.vue 裡對應的 itemClick 與 edit ---
console.log('--- 點擊觸發，準備跳轉 ---','000000000')
/**
 * 點擊配方項目進入詳情頁
 */
const itemClick = (item: any, index: number) => {
  console.log('--- 點擊觸發，準備跳轉 ---','aaaaaaaaaa')
  
  const params = {
    ...item.configJson,
    id: item.id,
    isEdit: false,
    name: item.name,
  }

  // 加上 .catch 強制捕捉 Vue Router 的隱形錯誤
  router.push({
    path: '/pages-coffeeb/formulaDetail/formulaDetail',
    query: { data: JSON.stringify(params) }
  }).catch((err) => {
    alert('🚨 跳轉被攔截！原因可能是路由表找不到這個網址');
    console.error('Vue Router 錯誤:', err);
  })
}

/**
 * 點擊編輯按鈕進入編輯頁
 */
const edit = (item: any) => {
  try {
    console.log('--- 準備導航至配方編輯頁 ---', item)
    if (!item) throw new Error('配方項目不存在')

    const params = {
      ...item.configJson,
      id: item.id,
      isEdit: true, // 開啟編輯模式
      name: item.name,
    }

    // 同步改用物件傳參法，確保點擊編輯也順暢無比
    router.push({
      path: '/pages-coffeeb/formula/formula',
      query: {
        data: JSON.stringify(params)
      }
    })

  } catch (error: any) {
    console.error('導航至編輯頁失敗，錯誤原因:', error)
    showToast({ type: 'fail', message: '導航失敗: ' + error.message })
  }
}


// 🔄 改寫：從 LocalStorage 讀取配方列表
const queryList = () => {
  listLoading.value = true
  try {
    console.error('改寫：', '從 LocalStorage 讀取配方列表')
    const localStr = localStorage.getItem(LOCAL_RECIPES_KEY)
    let recipes = localStr ? JSON.parse(localStr) : []
    
    // 處理背景與防呆
    recipes.forEach((el: any) => {
      if (typeof el.configJson === 'string') el.configJson = JSON.parse(el.configJson)
      if (!el.configJson.bgUrl) {
        const sign = Math.floor(Math.random() * formulaBgList.length)
        el.configJson.bgUrl = formulaBgList[sign].url
        el.configJson.textColor = formulaBgList[sign].color
      }
    })

    dataList.value = recipes
  } catch (error) {
    console.error('讀取本地配方失敗:', error)
    dataList.value = []
  } finally {
    listLoading.value = false
    isRefreshing.value = false
    listFinished.value = true // 本地數據一次加載完畢
  }
}

const onRefresh = () => {
  listFinished.value = false
  queryList()
}

const loadMore = () => {
  // 本地數據無需分頁，直接結束
  if (!listLoading.value) {
    listFinished.value = true
  }
}

onMounted(() => { onRefresh() })

// 🔼 改寫：將配方在本地陣列中置頂
const setTop = (item: any, index: number) => {
  try {
    const localStr = localStorage.getItem(LOCAL_RECIPES_KEY)
    if (!localStr) return
    let recipes = JSON.parse(localStr)
    
    // 移除當前項目並插入到陣列最前方
    recipes = recipes.filter((el: any) => el.id !== item.id)
    recipes.unshift(item)
    
    localStorage.setItem(LOCAL_RECIPES_KEY, JSON.stringify(recipes))
    showToast({ type: 'success', message: '已置顶' })
    onRefresh()
  } catch (error) {
    showToast({ type: 'fail', message: '置顶失败' })
  }
}

const deleteAllFormula = () => { isAllClear.value = true }

// 🗑️ 改寫：清空所有本地配方
const finishAllClear = () => {
  localStorage.removeItem(LOCAL_RECIPES_KEY)
  showToast({ type: 'success', message: '清空成功' })
  onRefresh()
}

const deleteItem = (item: any, index: number) => {
  delShow.value = true
  currentItem.value = item
}

// 🗑️ 改寫：刪除單一本地配方
const confirmDelete = () => {
  if (!currentItem.value) return
  try {
    const localStr = localStorage.getItem(LOCAL_RECIPES_KEY)
    if (!localStr) return
    let recipes = JSON.parse(localStr)
    
    recipes = recipes.filter((el: any) => el.id !== currentItem.value.id)
    localStorage.setItem(LOCAL_RECIPES_KEY, JSON.stringify(recipes))
    
    showToast({ type: 'success', message: '删除成功' })
    onRefresh()
  } catch (error) {
    showToast({ type: 'fail', message: '删除失败' })
  }
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

// 📡 藍牙發送邏輯 (維持不變)
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
  // 確保 id 為數字以進行位元運算
  const idNum = Number(formulaData.id) || 0
  const data = [
    (idNum >> 24) & 0xff, (idNum >> 16) & 0xff, (idNum >> 8) & 0xff, idNum & 0xff,
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
    // 分享成功後順便置頂
    setTop(formulaData, 0) 
  } else {
    throw new Error('命令执行失败')
  }
}

const start = async (item: any) => {
  if (runStatus.value !== 0) {
    showToast({ type: 'fail', message: '设备当前正在运行，请先停止当前任务' })
    return
  }
  const idNum = Number(item.id) || 0
  const data = [1, item.configJson.grind ? 1 : 0, (idNum >> 24) & 0xff, (idNum >> 16) & 0xff, (idNum >> 8) & 0xff, idNum & 0xff, item.configJson.accordionItems.length, 0, 0, 0]
  showLoadingToast({ message: '发送中...', forbidClick: true, duration: 0 })
  try {
    await retry(async () => {
      const response = await coffeeMachineProtocol.sendBrewMode(data)
      if (response === 'dd') {
        localStorage.setItem('id', String(item.id))
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
  // 如果快速沖煮原先依賴 API，這裡需調整為存入本地快速沖煮設定
  const res = await machineStatusStore.saveQuickCookingRecipe(formulaId.value)
  if (res.code === 200 || res.success) {
    router.push(`/pages-coffeeb/grind/grind`)
  } else {
    showToast({ type: 'fail', message: res.msg || '接口调用失败' })
  }
}
</script>

<style lang="scss" scoped>
/* 樣式保持原樣，與您提供的完全一致，此處省略以節省版面，請直接沿用您原本的 CSS 即可！ */
</style>