<route lang="json5">
{
  style: {
    navigationBarTitleText: '配方详情',
    navigationBarBackgroundColor: '#ffffff',
    disableScroll: true,
  },
}
</route>

<template>
  <view class="page-container" @click="closeOutside">
    <view class="share-content title-color" v-if="isShare && nickName">
      <text class="mr-1">来自</text>
      <wd-img :width="22" :height="22" :radius="11" :src="avatar" />
      <text class="ml-1">{{ nickName }}</text>
    </view>
    <view
      class="base-card flex items-center justify-between ml-4 mr-5"
      :style="{
        backgroundImage: `url(${cdnBaseUrl}/97b213a04c4d7e9e6a6e5a17b2f35052d988a229e55f68d4946a79a440a64bbe.png)`,
      }"
    >
      <view class="flex-1">
        <view class="base-title">{{ name }}</view>
        <view class="base-tips" v-if="!isEdit">{{ tips }}</view>
      </view>
      <view class="w-20 ml-4">
        <wd-img :width="80" :height="80" src="/static/images/formula/formula-logo.png" />
      </view>
    </view>
    <view class="page-content mx-5">
      <wd-row>
        <wd-col :span="12" v-for="(item, index) in formulaData" :key="index">
          <view class="flex mb-5 items-center">
            <view class="flex"><wd-img :width="34" :height="34" :src="item.icon" /></view>
            <view class="ml-2.5">
              <view class="title-color">{{ item.title }}</view>
              <view class="mt-2 font-size-4 font-500 flex">
                <view>{{ item.value || '-' }}</view>
                <view class="ml-1">{{ item.unit || '' }}</view>
              </view>
            </view>
          </view>
        </wd-col>
      </wd-row>
    </view>
    <view class="font-size-4.5 mb-1 mt-5 mx-5">注水</view>
    <bc-stage-bar :stages="accordionItems" />
    <view class="footer fixed bottom-5 left-0 right-0" v-if="!isShare">
      <view class="operation-box" v-if="isEdit">
        <view class="share-name-btn" @click="showSheet(0)">
          <wd-img :width="20" :height="20" :src="`${aliyunBaseUrl}details-share.png`" />
        </view>
        <view class="share-coffee-machine" @click="start()">
          <i class="iconfont icon-a-lujing1"></i>
          开始冲煮
        </view>
        <view class="more-operation">
          <wd-tooltip
            placement="top"
            custom-style="width: 100%;"
            custom-class="custom-more"
            custom-arrow="custom-tooltip-arrow"
            :offset="{ x: 10, y: 100 }"
            v-model="moreShow"
            useContentSlot
          >
            <view class="share-name-btn">更多</view>
            <template #content>
              <view class="flex flex-col p-4 more-content">
                <view @click="edit" class="flex">
                  <i class="iconfont icon-a-ziyuan39 icon-size-12 mr-2"></i>
                  编辑
                </view>
                <view @click="deleteFormula" class="flex mt-4">
                  <i class="iconfont icon-shanchu icon-size-12 mr-2"></i>
                  删除
                </view>
              </view>
            </template>
          </wd-tooltip>
        </view>
      </view>
      <view class="operation-box" v-else>
        <view class="share-name-btn" @click="showSheet(0)">
          <wd-img :width="20" :height="20" :src="`${aliyunBaseUrl}details-share.png`" />
        </view>
        <view class="share-coffee-machine" @click="start">
          <i class="iconfont icon-a-lujing1"></i>
          开始冲煮
        </view>
        <view class="share-name-btn" @click="edit">编辑</view>
      </view>
    </view>
    <view
      class="footer fixed bottom-5 left-0 right-0 px-5"
      v-else-if="isShare && bluetoothStore.connectedDevice"
    >
      <wd-button block @click="edit" size="large">另存为我的配方</wd-button>
    </view>
  </view>
  <bc-confirm
    :show="delShow"
    :objData="objData"
    @close="delShow = false"
    @success="confirmDelect"
  ></bc-confirm>
  <bc-confirm
    :show="isUse"
    :objData="objUseData"
    :isCancel="false"
    @close="isUse = false"
    @success="finishBack"
  ></bc-confirm>
  <bc-share
    :show="shareShow"
    :generateImageBoolean="false"
    :quicklyBoilingBoolean="userId !== 3"
    @close="closeShare"
    :objData="shareData"
    @shareToCoffeeMachine="sendFormula(false)"
    @quickBoiling="quickBrewingMode"
  />
  <bc-action-sheet :show="sheetShow" @close="closeSheet" :objData="sheetData" @success="start" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant' 
import { useMachineBStatusStore, useBluetoothStore } from '@/store'
import { CoffeeMachineProtocol } from '@/utils/coffeebBlueTool'
import { stringToGB2312, retry } from '@/utils'

const route = useRoute()
const router = useRouter()
const machineStatusStore = useMachineBStatusStore()
const bluetoothStore = useBluetoothStore()
const coffeeMachineProtocol = CoffeeMachineProtocol.getInstance()

// 🌟 補回被誤刪的 UI 渲染必需變數與函式
const cdnBaseUrl = import.meta.env.VITE_CDN_BASE_URL || 'https://cdn.bincoocoffee.cn'
const aliyunBaseUrl = import.meta.env.VITE_COFFEE_BASE_URL || '/'
const closeOutside = () => { /* 點擊空白處關閉的空函式，防報錯 */ }
const showMore = ref(false) // 預防如果有用到展開更多選單的變數

// 🌟 1. 絕對防禦預設值：給予完整的結構，避免畫面第一次渲染讀取 .length 時當機
const isShare = ref(false)
const nickName = ref('')
const avatar = ref('')
const name = ref('未命名配方')
const tips = ref('')
const isEdit = ref(false)
const recipeId = ref<number>(Date.now())

const configJson = ref<any>({
  legumes: 15,
  proportion: 30,
  grind: true,
  gear: 60,
  speed: 120,
  accordionItems: [] // 👈 核心防禦：確保一開始就有陣列，.length 就不會報錯
})
const accordionItems = ref<any[]>([])

const runStatus = computed(() => machineStatusStore.runStatus)

// 🌟 2. 拔除 onMounted，改為「同步解析」，讓資料在畫面渲染前就準備好！
// 🌟 同步解析：在畫面畫出來前把資料塞進去
// 🌟 同步解析：在畫面畫出來前把資料塞進去
const initRecipeData = () => {
  const queryData = route.query.data as string
  if (!queryData) return

  try {
    let rawJson = queryData
    if (rawJson.includes('%')) {
      rawJson = decodeURIComponent(rawJson)
    }
    const params = JSON.parse(rawJson)

    isShare.value = params.isShare || false
    nickName.value = params.nickName || 'Bincoo 玩家'
    
    // 🔥 圖片防呆 1：如果沒有頭像，給予一個隨機的可愛預設頭像，防止 /undefined 報錯
    avatar.value = params.avatar || `https://api.dicebear.com/9.x/thumbs/svg?seed=${params.id || 'bincoo'}`
    
    name.value = params.name || '未命名配方'
    tips.value = params.tips || ''
    recipeId.value = params.id || Date.now()

    let config = params.configJson
    if (typeof config === 'string') {
      config = JSON.parse(config)
    }
    
    // 安全地合併傳進來的資料
    configJson.value = { ...configJson.value, ...(config || {}) }
    
    // 🔥 圖片防呆 2：如果沒有配方背景圖，給予一張官方預設背景，防止 /undefined 報錯
    if (!configJson.value.bgUrl) {
      configJson.value.bgUrl = `${cdnBaseUrl}/7af32880c9244e35fa97b89de490fbd2beb6c6221ae1f58e07c2ed79ed1a71b1.png`
    }

    // 終極暴力防呆，確保它永遠是個陣列
    if (!configJson.value.accordionItems || !Array.isArray(configJson.value.accordionItems)) {
      configJson.value.accordionItems = []
    }
    accordionItems.value = configJson.value.accordionItems

    console.log('🚀 詳情頁同步解析掛載成功！', params)
  } catch (error) {
    console.error('🚨 詳情頁解析失敗:', error)
  }
}

// ⚡ 立即呼叫執行！不等待 Vue 的生命週期
initRecipeData()


// 🌟 3. 補齊畫面可能需要的計算屬性，防止舊版模板找不到變數報錯
const totalWaterVolume = computed(() => {
  return ((configJson.value.legumes || 15) * (configJson.value.proportion || 30)) / 2
})
const nowWater = computed(() => {
  return accordionItems.value.reduce((total: number, item: any) => total + (item.water || 0), 0)
})
const dangweiType = computed(() => {
  const dangwei = configJson.value.gear || 60
  if (dangwei > 82) return '法压冷萃'
  if (dangwei > 47 && dangwei <= 82) return '手冲咖啡'
  if (dangwei > 23 && dangwei <= 47) return '爱乐压'
  if (dangwei > 0 && dangwei <= 23) return '意式浓缩'
  return ''
})


// 🌟 4. 分享至咖啡機 (發送 0x06 指令)
const shareRecipeToDevice = async () => {
  if (!bluetoothStore.connectedDevice) {
    showToast({ type: 'fail', message: '请先连接咖啡机' })
    return
  }
  if (runStatus.value !== 0) {
    showToast({ type: 'fail', message: '请在空闲状态下分享配方哟~' })
    return
  }

  showLoadingToast({ message: '分享中...', forbidClick: true, duration: 0 })
  try {
    await retry(() => sendCommand(), 3, 500)
  } catch (error) {
    showToast({ type: 'fail', message: '分享失败，请重新尝试' })
  } finally {
    closeToast()
  }
}

const sendCommand = async () => {
  const obj = configJson.value
  const idNum = Number(recipeId.value) || 0
  const data = [
    (idNum >> 24) & 0xff, (idNum >> 16) & 0xff, (idNum >> 8) & 0xff, idNum & 0xff,
    (obj.proportion || 30) / 2, (obj.legumes || 15), obj.grind ? 1 : 0, (obj.gear || 60), (obj.speed || 120), obj.accordionItems.length,
  ]
  
  for (let i = 0; i < 5; i++) {
    if (i < obj.accordionItems.length) {
      const item = obj.accordionItems[i]
      data.push(item.water, Number(`3.${item.velocity || 3}`) * 10, item.temperature, item.type || 0, item.time)
    } else {
      data.push(0, 0, 0, 0, 0)
    }
  }
  
  const bytes = stringToGB2312(name.value)
  data.push(...bytes)

  const response = await coffeeMachineProtocol.sendRecipeData(data)
  if (response === 'dd') {
    showToast({ type: 'success', message: '已分享至咖啡机！' })
  } else {
    throw new Error('设备无响应')
  }
}

// 🌟 5. 啟動快速沖煮 (發送 0x04 指令)
const startBrewing = async () => {
  if (!bluetoothStore.connectedDevice) {
    showToast({ type: 'fail', message: '请先连接咖啡机' })
    return
  }
  if (runStatus.value !== 0) {
    showToast({ type: 'fail', message: '设备正在运行，请先停止' })
    return
  }
  
  const obj = configJson.value
  const idNum = Number(recipeId.value) || 0
  const data = [
    1, obj.grind ? 1 : 0, 
    (idNum >> 24) & 0xff, (idNum >> 16) & 0xff, (idNum >> 8) & 0xff, idNum & 0xff,
    obj.accordionItems.length, 0, 0, 0
  ]

  showLoadingToast({ message: '启动中...', forbidClick: true, duration: 0 })
  try {
    await retry(async () => {
      const response = await coffeeMachineProtocol.sendBrewMode(data)
      if (response === 'dd') {
        localStorage.setItem('id', String(recipeId.value))
        router.push('/pages-coffeeb/pulverizing/pulverizing?id=' + recipeId.value)
      } else {
        throw new Error('启动失败')
      }
    }, 3, 500)
  } catch (error) {
    showToast({ type: 'fail', message: '启动失败' })
  } finally {
    closeToast()
  }
}

const handleBack = () => router.back()
</script>

<style lang="scss" scoped>
.page-container {
  height: calc(100vh - 240rpx);
  // height: 100vh;
  padding: 40rpx 0 120rpx 0;
  overflow: auto;
  background-color: white;
  .share-content {
    display: flex;
    align-items: center;
    margin-top: -20rpx;
    margin-bottom: 28rpx;
    margin-left: 40rpx;
    font-size: 28rpx;
  }
  .base-card {
    height: 222rpx;
    padding: 0rpx 40rpx;
    color: #ffffff;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    border-radius: 20rpx;
    .base-title {
      font-size: 40rpx;
      line-height: 60rpx;
    }
    .base-tips {
      margin-top: 10rpx;
      font-size: 24rpx;
      line-height: 36rpx;
      opacity: 0.6;
    }
  }
  .page-content {
    padding: 40rpx 40rpx 0 40rpx;
    margin-top: 28rpx;
    font-size: 28rpx;
    color: #222222;
    background-color: #f7f7f7;
    border-radius: 20rpx;
    font-family: 'DigitalNumbers';
  }
  .scroll-box {
    height: calc(100vh - 900rpx);
  }
  .footer {
    background-color: #fff;
    border-top: 1rpx solid #f1f1f1;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 16rpx 18px 32px 18px;
    box-sizing: border-box;
    .operation-box {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: row;
      .share-name-btn,
      .more-operation {
        width: 73px;
        height: 42px;
        border-radius: 23px;
        border: 1px solid #004097;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #004097;
        font-size: 14px;
      }
      .share-coffee-machine {
        flex: 1;
        height: 44px;
        border-radius: 22px;
        background-color: #004097;
        font-size: 14px;
        line-height: 44px;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        margin: 0 13px;
        .icon-a-lujing1 {
          margin-right: 12rpx;
        }
      }
    }
  }
  :deep(.custom-button) {
    width: 100% !important;
  }
  :deep(.custom-more) {
    .wd-transition {
      bottom: 60px !important;
      left: 10px !important;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100px !important;
      background-color: rgba(0, 64, 151, 0.1) !important;
    }
    .wd-tooltip__pos {
      min-width: 100px !important;
      transform: translateX(-30%) !important;
    }
    .more-content {
      font-size: 28rpx;
      color: #004097;
    }
  }
  :deep(.custom-tooltip-arrow) {
    left: 70% !important;
    border-top-color: rgba(0, 64, 151, 0.1) !important;
  }
}
</style>
