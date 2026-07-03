<template>
  <div class="page-container">
    <van-nav-bar
      fixed
      placeholder
      :border="false"
      :title="formulaTitle"
      left-arrow
      @click-left="handleBack"
    >
      <template #left>
        <i class="iconfont icon-a-ze-arrow-leftCopy2 icon-size-22"></i>
      </template>
    </van-nav-bar>

    <div class="coffee-machine">
      <div
        class="machine-diagram"
        :style="{ backgroundImage: `url(${aliyunBaseUrl}coffee-machine.png)` }"
      >
        <div class="status-icon">
          <i class="iconfont icon-yanmozanting" v-if="!showSteps"></i>
          <template v-else>
            <i :class="headWaterInjectionMode" v-if="!showFinish"></i>
            <i class="iconfont icon-a-qietu184" v-else></i>
          </template>
        </div>
        <div class="solution-volume" v-if="showSteps">
          <div class="volume">{{ injectionVolume }}<span style="font-size: 16px">ml</span></div>
          <div class="state-text">{{ stateText }}</div>
        </div>

        <div class="cup">
          <div class="coffee-liquid" :style="{ height: cupFillHeight + '%' }">
            <div class="bubble bubble-1"></div>
            <div class="bubble bubble-2"></div>
            <div class="bubble bubble-3"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="scroll-Y mt-4" style="overflow-y: auto;">
      <div class="mr-3 ml-3">
        <div class="grind mt-4" v-if="grind && deviceStatus === 1">
          <div class="grind-top">
            <div class="title"><i class="iconfont icon-a-juxing574 mr-2"></i>研磨</div>
            <div class="loading" v-if="deviceStatus === 1 && deviceMode === 1 && !isPause">
              <img :src="`${aliyunBaseUrl}loading.gif`" style="width: 20px; height: 20px" />
            </div>
          </div>
          <div class="grind-content">
            <div class="grind-item">
              <div class="number">{{ gear }}</div>
              <div class="name">档位({{ dangweiType }})</div>
            </div>
            <div class="grind-item">
              <div class="number">{{ speed }}</div>
              <div class="name">转速(RPM)</div>
            </div>
            <div class="grind-item">
              <div class="number">{{ legumes }}</div>
              <div class="name">咖啡豆(g)</div>
            </div>
          </div>
        </div>

        <div class="water-injection mt-4" v-if="accordionItems.length > 0">
          <div class="water-injection-top">
            <div class="title"><i class="iconfont icon-a-juxing574 mr-2"></i>注水</div>
          </div>
          <div class="water-injection-content">
            <div class="steps-container">
              <div class="step-item" v-for="(item, index) in accordionItems" :key="index">
                <div class="step-line" v-if="index !== accordionItems.length - 1" :class="[deviceData?.paragraph > index ? 'active-line' : '']"></div>
                <div class="step-icon" :class="[deviceData?.paragraph >= index ? 'active' : '']">
                  {{ index === 0 ? '焖' : index }}
                </div>
                <div class="step-content" :class="[deviceData?.paragraph >= index ? 'active-text' : '']">
                  {{ item.paragraph }}
                  <span v-if="deviceData?.paragraph === index && !showFinish">(进行中)</span>
                  <span v-if="deviceData?.paragraph > index || showFinish">(已完成)</span>
                </div>
              </div>
            </div>

            <div class="step-details mt-4" v-if="deviceData?.paragraph !== -1">
              <div class="step-details-item mb-4">
                <div class="item-name">当前水量</div>
                <div class="item-value">
                  <span style="font-size: 24px; font-weight: 600;">{{ deviceData?.water || 0 }}</span>/{{ currentStepData?.water || 0 }}ml
                </div>
              </div>
              <div class="step-details-item mb-4">
                <div class="item-name">当前流速</div>
                <div class="item-value">
                  <span style="font-size: 24px; font-weight: 600;">3.{{ deviceData?.velocity || 0 }}</span>/3.{{ currentStepData?.velocity || 0 }}ml/s
                </div>
              </div>
              <div class="step-details-item mb-4">
                <div class="item-name">当前水温</div>
                <div class="item-value">
                  <span style="font-size: 24px; font-weight: 600;">{{ deviceData?.temperature || 0 }}</span>/{{ currentStepData?.temperature || 0 }}℃
                </div>
              </div>
              <div class="step-details-item mb-4">
                <div class="item-name">驻留时间</div>
                <div class="item-value">
                  <span style="font-size: 24px; font-weight: 600;">{{ deviceData?.time || 0 }}</span>/{{ currentStepData?.time || 0 }}S
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="footer fixed bottom-5 left-0 right-0 px-5 bg-white py-2">
      <div v-if="formulaTitle !== '冲煮完成'">
        <div style="display: flex; justify-content: space-between; width: 100%;">
          <div style="flex: 1; margin-right: 10px;" v-if="!isPause">
            <van-button block round color="#eaeaea" style="color: #666" @click="terminationShow = true">
              <i class="iconfont icon-a-juxing565 mr-1"></i> 提前结束
            </van-button>
          </div>
          <div style="flex: 1; margin-right: 10px;" v-if="isPause">
            <van-button block round color="#eaeaea" style="color: #666" @click="terminationShow = true">
              <i class="iconfont icon-a-juxing565 mr-1"></i> 结束冲煮
            </van-button>
          </div>

          <div style="flex: 1;">
            <van-button block round type="primary" @click="pause" v-if="!isPause">
              <i class="iconfont icon-yanmozanting mr-1"></i> 暂停
            </van-button>
            <van-button block round type="primary" @click="play" v-if="isPause">
              <i class="iconfont icon-bofang2 mr-1"></i> 继续
            </van-button>
          </div>
        </div>
      </div>
      <div v-else>
        <van-button block round type="primary" @click="handleBack">完成</van-button>
      </div>
    </div>

    <van-dialog 
      v-model:show="terminationShow" 
      title="提示" 
      message="是否提前结束冲煮？" 
      show-cancel-button 
      confirm-button-color="#004097" 
      @confirm="terminationConfirm" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'

import { useMachineBStatusStore } from '@/store/coffeebStatus'
import { useBluetoothStore } from '@/store/blue'
import { CoffeeMachineProtocol } from '@/utils/coffeebBlueTool'
import { httpGet } from '@/utils/http'
import { retry } from '@/utils/index'
import { useRequest } from '@/hooks/useRequest'

// ⚠️ 已經徹底刪除 import default.json，防止 Vite 當機

const router = useRouter()
const route = useRoute()
const bluetoothStore = useBluetoothStore()
const machineStatusStore = useMachineBStatusStore()

const coffeeMachineProtocol = CoffeeMachineProtocol?.getInstance ? CoffeeMachineProtocol.getInstance() : null
const aliyunBaseUrl = import.meta.env.VITE_COFFEE_BASE_URL || '/'

const id = ref<string>('')
const deviceId = ref<any>(null)
const windowWidth = ref(375)

const legumes = ref(15)
const proportion = ref(30)
const totalWaterVolume = ref(225)
const gear = ref(60)
const speed = ref(120)
const grind = ref(true)
const accordionItems = ref<any[]>([])

const showSteps = ref(true)
const showFinish = ref(false)
const isPause = ref(false)
const injectionVolume = ref(0)
const cupFillHeight = ref(0)

const terminationShow = ref(false)

const deviceStatus = computed(() => machineStatusStore.runStatus)
const deviceMode = computed(() => machineStatusStore.mode)
const deviceData = computed(() => machineStatusStore.brewData)

const stateText = computed(() => {
  if (showFinish.value) return '冲煮完成'
  if (isPause.value) return '已暂停'
  if (deviceData.value?.paragraph === 0) return '焖蒸中'
  if (deviceData.value?.paragraph > 0) return `第${deviceData.value?.paragraph}段注水中`
  return '准备中'
})

const formulaTitle = computed(() => {
  if (showFinish.value) return '冲煮完成'
  if (deviceStatus.value === 1 && deviceMode.value === 1) return '研磨中'
  if (deviceStatus.value === 1 && deviceMode.value === 2) return '注水中'
  return '设备准备中'
})

const currentStepData = computed(() => {
  const idx = deviceData.value?.paragraph
  if (idx !== undefined && idx >= 0 && idx < accordionItems.value.length) {
    return accordionItems.value[idx]
  }
  return {}
})

const headWaterInjectionMode = computed(() => {
  const type = currentStepData.value?.type
  if (type === 0) return 'iconfont icon-juzhong'
  if (type === 1) return 'iconfont icon-luoxuan'
  if (type === 2) return 'iconfont icon-huanrao'
  return 'iconfont icon-juzhong'
})

const dangweiType = computed(() => {
  const dangwei = gear.value
  if (dangwei > 82) return '法压冷萃'
  if (dangwei > 47 && dangwei <= 82) return '手冲咖啡'
  if (dangwei > 23 && dangwei <= 47) return '爱乐压'
  if (dangwei > 0 && dangwei <= 23) return '意式浓缩'
  return ''
})

let animationInterval: any = null
const startAnimation = () => {
  stopAnimation()
  animationInterval = setInterval(() => {
    // 動畫邏輯保留
  }, 1000)
}

const stopAnimation = () => {
  if (animationInterval) {
    clearInterval(animationInterval)
    animationInterval = null
  }
}

// 🌟 修正後的配方載入：不再依賴本地 JSON，直接給假資料防呆
const getThecipeForQuickCooking = async () => {
  try {
    if (!id.value || id.value === '0') {
      console.log('進入測試模式，注入模擬配方資料')
      // 提供完美的模擬注水階段資料
      accordionItems.value = [
        { paragraph: '1', water: 50, velocity: 30, temperature: 92, time: 10, type: 0 },
        { paragraph: '2', water: 150, velocity: 40, temperature: 92, time: 20, type: 1 }
      ]
      gear.value = 60
      grind.value = true
      legumes.value = 15
      proportion.value = 30
      speed.value = 120
      return
    }

    const { run } = useRequest<any>(() => httpGet(`/repice/repice/${id.value}`))
    const res = await run()
    if (res && res.code === 200 && res.data) {
      const result = res.data
      const configJson = JSON.parse(result.configJson)
      accordionItems.value = configJson.accordionItems || []
      gear.value = configJson.gear
      grind.value = configJson.grind
      legumes.value = configJson.legumes
      proportion.value = configJson.proportion
      speed.value = configJson.speed
    }
  } catch (error) {
    console.warn('載入配方失敗')
  }
}

watch(() => machineStatusStore.runStatus, (newStatus) => {
  if (newStatus === 0 && deviceData.value?.paragraph !== -1) {
    showFinish.value = true
    isPause.value = false
    stopAnimation()
  } else if (newStatus === 1) {
    isPause.value = false
  } else if (newStatus === 2 || newStatus === 3 || newStatus === 4 || newStatus === 5) {
    isPause.value = true
  }
}, { immediate: true })

watch(() => machineStatusStore.brewData?.water, (newWater) => {
  if (newWater === undefined) return
  injectionVolume.value = newWater
  const totalVolume = accordionItems.value.reduce((acc, item) => acc + item.water, 0) || 200
  let total = 0
  const currentIndex = deviceData.value?.paragraph || 0
  for (let i = 0; i < currentIndex; i++) {
    total += accordionItems.value[i]?.water || 0
  }
  total += newWater
  cupFillHeight.value = totalVolume > 0 ? (total / totalVolume) * 100 : 0
}, { immediate: true })

const pause = async () => {
  if (!coffeeMachineProtocol) return
  try {
    await retry(async () => {
      const res = await coffeeMachineProtocol.pauseOrResumeOrStopBrewing(1)
      if (res === 'dd') {
        isPause.value = true
        stopAnimation()
      } else {
        throw new Error('失败')
      }
    }, 3, 500)
  } catch (err) {
    showToast({ type: 'fail', message: '发送失败' })
  }
}

const play = async () => {
  if (!coffeeMachineProtocol) return
  try {
    await retry(async () => {
      const res = await coffeeMachineProtocol.pauseOrResumeOrStopBrewing(2)
      if (res === 'dd') {
        isPause.value = false
        startAnimation()
      } else {
        throw new Error('失败')
      }
    }, 3, 500)
  } catch (err) {
    showToast({ type: 'fail', message: '发送失败' })
  }
}

const terminationConfirm = async () => {
  terminationShow.value = false
  if (!coffeeMachineProtocol) {
    router.push('/pages-coffeeb/index/index')
    return
  }
  showLoadingToast({ message: '发送中...', forbidClick: true, duration: 0 })
  try {
    await retry(async () => {
      const res = await coffeeMachineProtocol.pauseOrResumeOrStopBrewing(3)
      if (res === 'dd') {
        localStorage.removeItem('id')
        router.push('/pages-coffeeb/index/index')
      } else {
        throw new Error('失败')
      }
    }, 3, 500)
  } catch (err) {
    showToast({ type: 'fail', message: '发送失败' })
  } finally {
    closeToast()
  }
}

const handleBack = () => {
  if (formulaTitle.value === '冲煮完成') {
    localStorage.removeItem('id')
    router.push('/pages-coffeeb/index/index')
  } else {
    router.replace('/pages-coffeeb/index/index')
  }
}

// 🌟 網頁版模擬沖煮函數
const simulateBrewing = () => {
  console.log('啟動網頁模擬沖煮模式...')
  
  machineStatusStore.runStatus = 2
  machineStatusStore.brewData = { paragraph: 1, water: 0, velocity: 30, temperature: 92, time: 0 }
  showFinish.value = false
  isPause.value = false

  let currentWater = 0
  const totalWater = accordionItems.value.reduce((acc, item) => acc + item.water, 0) || 200

  const timer = setInterval(() => {
    if (isPause.value) return 
    
    currentWater += 2
    if (machineStatusStore.brewData) {
      machineStatusStore.brewData.water = currentWater
      machineStatusStore.brewData.time += 1
    }

    if (currentWater >= totalWater) {
      clearInterval(timer)
      machineStatusStore.runStatus = 0 
    }
  }, 200)
}

onMounted(() => {
  id.value = (route.query.id as string) || localStorage.getItem('id') || ''
  windowWidth.value = window.innerWidth
  getThecipeForQuickCooking()

  if (bluetoothStore.connectionStatus === 'connected') {
    deviceId.value = bluetoothStore.connectedDevice?.productInfo?.id
  } else {
    // 🛑 把下面這行「註解掉」或「刪掉」，就不會自動跑動畫了！
    //setTimeout(simulateBrewing, 1000)
  }
})

onBeforeUnmount(() => {
  stopAnimation()
})
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: #f6f8fb;
}

.coffee-machine {
  position: relative;
  display: flex;
  justify-content: center;
  height: 300px;
  background: linear-gradient(180deg, #d2e4f6 0%, #f6f8fa 100%);
  
  .machine-diagram {
    position: relative;
    width: 200px;
    height: 300px;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    
    .status-icon {
      position: absolute;
      top: 60px;
      left: 50%;
      transform: translateX(-50%);
      
      .iconfont {
        font-size: 32px;
        color: #004097;
      }
    }

    .solution-volume {
      position: absolute;
      top: 100px;
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
      
      .volume {
        font-size: 24px;
        font-family: 'DigitalNumbers', sans-serif;
        color: #004097;
      }
      .state-text {
        font-size: 12px;
        color: #666;
      }
    }

    .cup {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 50px;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 0 0 20px 20px;
      overflow: hidden;

      .coffee-liquid {
        position: absolute;
        bottom: 0;
        width: 100%;
        background: linear-gradient(180deg, #8b5a2b 0%, #5c3a21 100%);
        transition: height 0.5s ease;
      }
    }
  }
}

.scroll-Y {
  height: calc(100vh - 400px);
}

.grind, .water-injection {
  background: white;
  border-radius: 12px;
  padding: 16px;
  
  .title {
    font-size: 16px;
    font-weight: bold;
    color: #222;
  }
}

.grind-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.grind-content {
  display: flex;
  justify-content: space-around;
  margin-top: 16px;
  
  .grind-item {
    text-align: center;
    .number {
      font-size: 24px;
      font-family: 'DigitalNumbers';
      color: #004097;
    }
    .name {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
    }
  }
}

.steps-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  
  .step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    flex: 1;

    .step-line {
      position: absolute;
      top: 12px;
      left: 50%;
      width: 100%;
      height: 2px;
      background-color: #eee;
      z-index: 1;
    }
    .active-line {
      background-color: #004097;
    }

    .step-icon {
      position: relative;
      z-index: 2;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: #eee;
      color: #999;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 12px;
    }
    .active {
      background-color: #004097;
      color: white;
    }

    .step-content {
      font-size: 10px;
      color: #999;
      margin-top: 8px;
      text-align: center;
    }
    .active-text {
      color: #004097;
    }
  }
}

.step-details {
  background: #f9fbfd;
  border-radius: 8px;
  padding: 16px;
  
  .step-details-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .item-name {
      font-size: 14px;
      color: #666;
    }
    .item-value {
      font-size: 14px;
      color: #222;
      font-family: 'DigitalNumbers';
    }
  }
}

.footer {
  border-top: 1px solid #eee;
}
</style>