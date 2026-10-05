<template>
  <div class="page-container">
    <!-- 頂部導覽列 (移除右側設定圖示) -->
    <van-nav-bar fixed placeholder :border="false" class="nav-transparent">
      <template #left>
        <div @click="toHome">
          <i class="iconfont icon-a-ze-arrow-leftCopy2 icon-size-22"></i>
        </div>
      </template>
    </van-nav-bar>

    <div class="page-content pb-10">
      <!-- 設備狀態與圖片 -->
      <div class="flex flex-col items-center justify-center mb-6 mt-4">
        <van-image width="180" height="160" :src="homeImg" />
        <div class="page-content-title mt-4 text-xl font-bold text-gray-800">
          {{ bluetoothStore.connectedDevice?.productInfo?.deviceName || '全自动咖啡机' }}
        </div>
        
        <div
          class="state-box flex items-center justify-center mt-3 bg-white px-4 py-1.5 rounded-full shadow-sm text-sm"
          :style="{ color: runStateObj.color }"
          @click="toState"
        >
          <i class="iconfont mr-1" :class="runStateObj.icon"></i>
          <span>{{ runStateObj.text }}</span>
          <span v-if="runStateObj.isJump" class="jump-text ml-2 underline">查看详情</span>
        </div>
      </div>

      <!-- 配方輪播區塊 (Swiper) -->
      <div class="swiper-card px-4">
        <div class="flex justify-between items-center font-size-4" @click="router.push('/pages-coffeeb/myFormula/myFormula')">
          <div class="font-bold text-gray-800 text-base">配方管理</div>
          <van-icon name="arrow" color="#999" />
        </div>

        <div class="swiper-card-content mt-4" :style="{ marginBottom: localRecipes.length > 0 ? '0' : '15px' }">
          <!-- 有資料時顯示輪播 -->
          <van-swipe v-if="localRecipes.length > 0" class="swiper" :loop="false" :width="260" :show-indicators="false">
            <van-swipe-item v-for="(item, index) in localRecipes" :key="item.id" class="pr-3">
              <div class="swiper-item flex items-center bg-white shadow-sm rounded-lg p-2 h-full cursor-pointer" @click="goToDetail(item)">
                
                <!-- 左側圖片與段數 -->
                <div class="img-box relative flex-shrink-0 flex justify-center items-center h-20 w-20 bg-gray-50 rounded-md overflow-visible">
                  <van-image width="78" height="78" :src="item.rawConfig?.bgUrl || defaultRecipeImg" fit="contain" />
                  <div class="img-num absolute -bottom-3 -right-1 font-black text-5xl tracking-tighter" :style="{ color: item.rawConfig?.textColor || '#F5ABBD' }">
                    {{ item.rawConfig?.accordionItems?.length || 2 }}
                  </div>
                </div>

                <!-- 右側文字內容 -->
                <div class="content-box flex flex-col justify-center pl-4 pr-1 text-xs text-gray-500 w-full overflow-hidden">
                  <div class="name van-ellipsis font-bold text-gray-800 text-sm mb-1.5">{{ item.name }}</div>
                  <div class="digital-numbers mb-0.5">
                    粉水比：1:{{ item.ratio }} {{ (item.ratio * item.powder).toFixed(0) }}ml
                  </div>
                  <div class="digital-numbers">
                    咖啡粉：{{ item.powder }}g
                  </div>
                </div>

              </div>
            </van-swipe-item>
          </van-swipe>

          <!-- 沒資料時顯示空狀態與創建引導 -->
          <div v-else class="h-20 flex items-center justify-center text-sm text-gray-500">
            <div class="flex flex-col items-center">
              <div class="flex items-center">
                <span>暂无配方,</span>
                <div class="flex items-center text-blue-700 ml-1 cursor-pointer font-bold" @click="router.push('/pages-coffeeb/formula/formula')">
                  <van-icon name="plus" class="mr-1" />
                  <span>点击创建</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 更多推薦 -->
      <div class="hot-formula text-center cursor-pointer mx-4" @click="router.push('/pages-coffeeb/cloudFormula/cloudFormula')">
        <span class="desc">
          更多推荐 <van-icon name="arrow" class="align-middle" />
        </span>
      </div>

      <!-- 獨立硬體快捷操作區 -->
      <div class="operate-grid mt-6 px-4">
        <van-row gutter="16">
          <van-col span="8">
            <div class="operate bg-white rounded-xl p-3 shadow-sm text-center active:bg-gray-50" @click="router.push('/pages-coffeeb/grind/grind')">
              <van-image width="49" height="49" :src="quickBoilingImg" class="mx-auto" />
              <div class="operate-name mt-2 text-xs font-bold text-gray-700">快速冲煮</div>
            </div>
          </van-col>
          <van-col span="8">
            <div class="operate bg-white rounded-xl p-3 shadow-sm text-center active:bg-gray-50" @click="router.push('/pages-coffeeb/smash/smash')">
              <van-image width="49" height="49" :src="grindImg" class="mx-auto" />
              <div class="operate-name mt-2 text-xs font-bold text-gray-700">研磨</div>
            </div>
          </van-col>
          <van-col span="8">
            <div class="operate bg-white rounded-xl p-3 shadow-sm text-center active:bg-gray-50" @click="router.push('/pages-coffeeb/waterInjection/waterInjection')">
              <van-image width="49" height="49" :src="waterPourImg" class="mx-auto" />
              <div class="operate-name mt-2 text-xs font-bold text-gray-700">注水</div>
            </div>
          </van-col>
        </van-row>
      </div>

      <!-- 底部設置按鈕 (比照微信小程序設計) -->
      <div class="setting-card mt-4 px-4">
        <div class="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center active:bg-gray-50 cursor-pointer" @click="settingShow = true">
          <div class="flex items-center text-gray-800 font-bold text-sm">
            <!-- 您可以替換為特定的 SVG 或 iconfont class -->
            <van-icon name="setting-o" size="18" class="mr-2" />
            <span>设置</span>
          </div>
          <van-icon name="arrow" color="#999" />
        </div>
      </div>

    </div>

    <!-- 移除原本的 van-popup，改為調用 setting-popup 組件 -->
    <setting-popup 
     :setting-show="settingShow" 
     :has-alarm="false" 
     @close-show="settingShow = false" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { useMachineBStatusStore } from '@/store/coffeebStatus'
import { useBluetoothStore } from '@/store/blue'

import homeMachineImg from '@/static/images/ext/2026_0730/icon_mac/ic_machine_ready.png'
import quickBoilingMachineImg from '@/static/images/ext/2026_0730/icon_mac/ic_quick.png'
import grindMachineImg from '@/static/images/ext/2026_0730/icon_mac/ic_grind.png'
import waterPourMachineImg from '@/static/images/ext/2026_0730/icon_mac/ic_water_pour.png'

// 請依照您專案中的實際檔案路徑進行引入，例如：
import SettingPopup from './setting-popup.vue'

// 控制側邊欄彈窗顯示狀態的變數
const settingShow = ref(false)

const router = useRouter()
const bluetoothStore = useBluetoothStore()
const machineStatusStore = useMachineBStatusStore()
const aliyunBaseUrl = import.meta.env.VITE_CDN_BASE_URL || 'https://cdn.bincoocoffee.cn/'

interface Recipe {
  id: number | string;
  name: string;
  powder: number;
  ratio: number;
  temp: number;
  rawConfig?: any;
}

//const colorValue = ref('white')

const homeImg = ref(homeMachineImg) 
const quickBoilingImg = ref(quickBoilingMachineImg) 
const grindImg = ref(grindMachineImg) 
const waterPourImg = ref(waterPourMachineImg)
const defaultRecipeImg = ref(`${aliyunBaseUrl}a4fe367f3bf4c0ab36b4b932689d57bb3456610c1daa287e66aa44268a528373.png`)

const localRecipes = ref<Recipe[]>([])

// 機器運作狀態
const runStateObj = computed(() => {
  const status = machineStatusStore.runStatus
  if (status === 1) { return { text: '研磨中', color: '#004097', icon: 'icon-yanyanjia', isJump: true } }
  else if (status === 2 || status === 3) { return { text: '冲煮中', color: '#004097', icon: 'icon-zhushui', isJump: true } }
  return { text: '设备就绪', color: '#999', icon: 'icon-kongxian', isJump: false }
})

const toHome = () => router.push('/')
const toState = () => { 
  if (runStateObj.value.isJump) { 
    router.push('/pages-coffeeb/pulverizing/pulverizing') 
  } 
}

//const colorConfirm = () => { 
//  showToast({ type: 'success', message: '颜色设置成功' }) 
//}

// 模擬 API 加載體驗
const mockLoadRecipes = () => {
  showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  
  setTimeout(() => {
    try {
      const saved = localStorage.getItem('bincoo_my_recipes')
      if (saved) {
        const rawLibrary = JSON.parse(saved)
        if (Array.isArray(rawLibrary)) {
          localRecipes.value = rawLibrary.map((item: any) => {
            let config = item.configJson
            if (typeof config === 'string') {
              try { config = JSON.parse(config) } catch(e) { config = {} }
            }
            return {
              id: item.id || Date.now(),
              name: item.name || '未命名配方',
              powder: config?.legumes || 15,
              ratio: config?.proportion ? (config.proportion / 2) : 15,
              temp: config?.accordionItems?.temperature || 92,
              rawConfig: config 
            }
          })
        }
      } else {
        localRecipes.value = []
      }
    } catch (e) {
      console.error('读取首页配方失败:', e)
      localRecipes.value = []
    } finally {
      closeToast()
    }
  }, 500)
}

// 跳轉詳情頁 : 此頁小程序無
//const goToDetail = (item: any) => {
//  try {
//    const params = {
//      id: item.id,
//      name: item.name,
//      isShare: false,
//      configJson: item.rawConfig
//    }
//    localStorage.setItem('bincoo_transit_data', JSON.stringify(params))
//    router.push('/pages-coffeeb/formulaDetail/formulaDetail')
//  } catch (err) {
//    console.error('首页卡片跳转详情页发生错误:', err)
//  }
//}

// 初始化與生命週期監聽
onMounted(() => {
  mockLoadRecipes()
})

onActivated(() => {
  mockLoadRecipes()
})
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f6f8fb;
  .nav-transparent {
    background-color: transparent !important;
  }
}

/* 完美還原微信小程序的卡片樣式 */
.swiper-card {
  padding-top: 15px;
  padding-bottom: 15px;
  background: #ffffff;
  border-radius: 10px 10px 0 0; /* 頂部圓角 */
  box-shadow: 0 -2px 10px rgba(0,0,0,0.02);
  
  .swiper-card-content {
    .swiper {
      height: 85px; /* 對應 166rpx */
    }
    .swiper-item {
      height: 100%;
      box-sizing: border-box;
      
      .img-box {
        .img-num {
          font-family: 'Roboto', sans-serif;
          z-index: 10;
          text-shadow: 2px 2px 4px rgba(255,255,255,0.8);
        }
      }
      
      .content-box {
        .digital-numbers {
          font-family: 'DigitalNumbers', monospace;
        }
      }
    }
  }
}

.hot-formula {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 41px; /* 對應 82rpx */
  background: #e5ebf4;
  border-radius: 0 0 10px 10px; /* 底部圓角 */
  margin-bottom: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
  
  .desc {
    font-size: 12px;
    color: #004097;
    font-weight: 500;
  }
}
</style>