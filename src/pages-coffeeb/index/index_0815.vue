<template>
  <div class="page-container">
    <!-- 頂部導覽列 -->
    <van-nav-bar fixed placeholder :border="false" class="nav-transparent">
      <template #left>
        <div @click="toHome">
          <i class="iconfont icon-a-ze-arrow-leftCopy2 icon-size-22"></i>
        </div>
      </template>
      <template #right>
        <van-icon name="setting-o" size="22" @click="settingShow = true" />
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
      <div class="swiper-card mt-6 px-4">
        <div class="flex justify-between items-center font-size-4 mb-3" @click="router.push('/pages-coffeeb/myFormula/myFormula')">
          <div class="font-bold text-gray-800 text-lg">配方管理</div>
          <van-icon name="arrow" color="#999" />
        </div>

        <div class="swiper-card-content">
          <!-- 有資料時顯示輪播 -->
          <van-swipe v-if="localRecipes.length > 0" class="swiper" :loop="false" :width="280" :show-indicators="false">
            <van-swipe-item v-for="(item, index) in localRecipes.slice(0, 5)" :key="item.id" class="pr-3">
              <div class="recipe-card bg-white rounded-xl p-4 shadow-sm relative overflow-hidden" @click="goToDetail(item)">
                <!-- 裝飾性背景段數浮水印 -->
                <div class="absolute -right-4 -bottom-4 text-6xl font-black opacity-5 text-blue-900 italic">
                  {{ item.rawConfig?.accordionItems?.length || 2 }}
                </div>

                <div class="flex justify-between items-center relative z-10">
                  <div class="flex-1 pr-2">
                    <div class="name van-ellipsis font-bold text-gray-800 text-base mb-2">{{ item.name }}</div>
                    <div class="digital-numbers text-xs text-gray-500 bg-gray-50 inline-block px-2 py-1 rounded">
                      粉量: {{ item.powder }}g | 1:{{ item.ratio }} | {{ item.temp }}°C
                    </div>
                  </div>
                  <!-- 一鍵發送藍牙按鈕 -->
                  <van-button size="small" type="primary" round color="#004097" class="shadow-md" @click.stop="shareRecipeToDevice(item)">
                    分享
                  </van-button>
                </div>
              </div>
            </van-swipe-item>
          </van-swipe>

          <!-- 沒資料時顯示空狀態與創建引導 -->
          <div v-else class="empty-state bg-white rounded-xl py-6 shadow-sm">
            <van-empty image="search" description="暂无配方">
              <van-button round type="primary" color="#004097" size="small" @click="router.push('/pages-coffeeb/formula/formula')">
                <van-icon name="plus" class="mr-1" /> 点击创建
              </van-button>
            </van-empty>
          </div>
        </div>
      </div>

      <!-- 更多推薦 (前往官方雲端) -->
      <div class="hot-formula mt-5 text-center" @click="router.push('/pages-coffeeb/cloudFormula/cloudFormula')">
        <span class="desc text-blue-600 cursor-pointer text-sm font-bold bg-blue-50 px-4 py-2 rounded-full">
          更多推荐 <van-icon name="arrow" class="align-middle" />
        </span>
      </div>

      <!-- 獨立硬體快捷操作區 -->
      <div class="operate-grid mt-8 px-4">
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

    </div>

    <!-- 機器設置彈窗 -->
    <van-popup v-model:show="settingShow" position="bottom" round style="height: 30%">
      <div class="p-5">
        <div class="text-lg font-bold mb-4">机器设置</div>
        <van-cell title="外观颜色">
          <template #value>
            <van-radio-group v-model="colorValue" direction="horizontal" @change="colorConfirm">
              <van-radio name="white">白色</van-radio>
              <van-radio name="black">黑色</van-radio>
            </van-radio-group>
          </template>
        </van-cell>
      </div>
    </van-popup>
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

const settingShow = ref(false)
const colorValue = ref('white')

const homeImg = ref(homeMachineImg) // 原圖來自 ref(`${aliyunBaseUrl}home-machine.png`)
const quickBoilingImg = ref(quickBoilingMachineImg) 
const grindImg = ref(grindMachineImg) 
const waterPourImg = ref(waterPourMachineImg)


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

const colorConfirm = () => { 
  showToast({ type: 'success', message: '颜色设置成功' }) 
}

// =================================================================
// 模擬 API 加載體驗 (讀取 LocalStorage)
// =================================================================
const mockLoadRecipes = () => {
  showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  
  // 模擬 0.5秒 的網路延遲，提供與小程式原生相同的流暢加載視覺
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
              //temp: config?.accordionItems?.?.temperature || 92,
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

// 跳轉詳情頁
const goToDetail = (item: any) => {
  try {
    const params = {
      id: item.id,
      name: item.name,
      isShare: false,
      configJson: item.rawConfig
    }
    
    // 將最新資料放入快遞櫃，確保與詳情頁完美對接
    localStorage.setItem('bincoo_transit_data', JSON.stringify(params))
    router.push('/pages-coffeeb/formulaDetail/formulaDetail')
  } catch (err) {
    console.error('首页卡片跳转详情页发生错误:', err)
  }
}

// =================================================================
// 藍牙協議發送中心 (多段 0x06 協議)
// =================================================================
const shareRecipeToDevice = (recipe: Recipe) => {
  if (!bluetoothStore.connectedDevice) {
    showToast('设备未连接，请先连线咖啡机')
    return
  }
  
  try {
    const recipePkg = new Uint8Array(60)
    recipePkg = 0x5A
    recipePkg[1] = 0x06
    recipePkg[2] = 55

    const numId = typeof recipe.id === 'number' ? recipe.id : Date.now() % 100000
    recipePkg[3] = (numId >> 24) & 0xFF
    recipePkg[4] = (numId >> 16) & 0xFF
    recipePkg[5] = (numId >> 8) & 0xFF
    recipePkg[6] = numId & 0xFF

    const config = recipe.rawConfig || {}
    recipePkg[7] = recipe.ratio
    recipePkg[8] = recipe.powder
    recipePkg[9] = config.grind !== false ? 1 : 0
    recipePkg[10] = config.gear || 60
    recipePkg[11] = config.speed || 120

    const items = config.accordionItems || []
    if (items.length === 0) {
      recipePkg[12] = 2 
      const totalWater = recipe.powder * recipe.ratio
      const bloomWater = Math.min(totalWater, recipe.powder * 2)
      const mainWater = Math.max(0, totalWater - bloomWater)
      
      recipePkg[13] = bloomWater; recipePkg[14] = 33; recipePkg[15] = recipe.temp; recipePkg[16] = 1; recipePkg[17] = 30;
      recipePkg[18] = mainWater; recipePkg[19] = 33; recipePkg[20] = recipe.temp; recipePkg[21] = 1; recipePkg[22] = 0;
      for (let i = 23; i < 38; i++) recipePkg[i] = 0x00
    } else {
      const totalStages = Math.min(items.length, 5)
      recipePkg[12] = totalStages
      let offset = 13
      for (let i = 0; i < 5; i++) {
        if (i < totalStages) {
          recipePkg[offset] = items[i].water || 0
          recipePkg[offset + 1] = Number(`3.${items[i].velocity || 3}`) * 10
          recipePkg[offset + 2] = items[i].temperature || recipe.temp
          recipePkg[offset + 3] = items[i].type || 1
          recipePkg[offset + 4] = items[i].time || 0
        } else {
          recipePkg[offset] = 0x00; recipePkg[offset + 1] = 0x00; recipePkg[offset + 2] = 0x00; recipePkg[offset + 3] = 0x00; recipePkg[offset + 4] = 0x00;
        }
        offset += 5
      }
    }

    const encoder = new TextEncoder()
    const nameBuffer = encoder.encode(recipe.name)
    for (let i = 0; i < 20; i++) {
      recipePkg[38 + i] = i < nameBuffer.length ? nameBuffer[i] : 0x00
    }

    let crc = recipePkg[1] ^ recipePkg[2]
    for (let i = 3; i < 58; i++) crc ^= recipePkg[i]
    recipePkg[23] = crc
    recipePkg[24] = 0xAA

    bluetoothStore.sendData(recipePkg)
    showToast({ type: 'success', message: `《${recipe.name}》大师级配方已同步写入！` })
  } catch(e) {
    console.error('发送错误', e)
  }
}

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
</style>