<template>
  <view class="flex flex-col h-[calc(100vh-12vh)] overflow-hidden">
    
    <view class="flex-1 overflow-x-hidden overflow-y-auto">
      
      <view class="flex items-center justify-between pl-4 mb-9" v-if="!showFinish">
        <view class="flex flex-col">
          <text class="text-[27px] font-bold">
            <text>{{ brewData.type === 0 ? '研磨中' : '沖煮中' }}</text>
            <text v-if="brewData.type === 1" class="ml-2.5 text-lg font-normal">
              {{ formatSeconds(timeLeft) }}
            </text>
          </text>
          <text class="mt-1.5 text-sm text-gray-500">{{ formulaData.name }}</text>
        </view>

        <view class="max-w-[84px]">
          <view 
            class="flex flex-col items-center justify-center w-16 h-16 text-base text-white bg-brand rounded-2xl cursor-pointer hover:bg-brand-hover transition-colors" 
            v-if="brewData.type === 0" 
            @click="start(0)"
          >
            <i class="iconfont icon-lujing"></i>
            <text>終止</text>
          </view>
          
          <view v-else>
            <view
              class="flex flex-col items-center justify-center w-16 h-16 text-base text-white bg-brand rounded-2xl cursor-pointer hover:bg-brand-hover transition-colors"
              v-if="brewData.startStop === 1 || brewData.startStop === 3"
              @click="start(2)"
            >
              <i class="iconfont icon-lujing"></i>
              <text>暫停</text>
            </view>
            <view v-else-if="brewData.startStop === 2" class="flex text-sm text-gray-600">
              <view @click="stopShow = true" class="mr-4 flex flex-col items-center cursor-pointer hover:opacity-80">
                <i class="iconfont icon-a-juxing207 mb-1"></i>
                <text>終止</text>
              </view>
              <view @click="start(3)" class="flex flex-col items-center text-danger cursor-pointer hover:opacity-80">
                <i class="iconfont icon-a-qietu205 mb-1"></i>
                <text>繼續</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="flex mb-2.5 rounded-lg" v-if="!showFinish">
        
        <view class="flex-1" v-if="showParams">
          <view
            v-for="(item, index) in paramItems"
            :key="index"
            class="flex flex-col justify-center w-[140px] h-[90px] pl-[15px] mb-[27px] ml-1.5 bg-no-repeat bg-center bg-cover"
            :style="getBackgroundStyle(item.image)"
          >
            <text class="text-gray-600">{{ item.label }}</text>
            <text class="mt-1 text-gray-900">
              <text class="text-2xl font-medium">{{ item.value }}</text>
              {{ item.unit || '' }}
            </text>
          </view>
        </view>

        <view class="flex-1 ml-1.5" v-if="showSteps">
          <wd-steps :active="1" space="95px" vertical align-center>
            <wd-step v-for="(step, index) in steps" :key="index" :title="step.title">
              <template #icon>
                <view class="custom-icon-wrapper">
                  <wd-img
                    v-if="step.class"
                    custom-class="custom-img"
                    :width="26"
                    :height="26"
                    :src="`/static/images/extract/${step.icon}-active.png`"
                  />
                  <wd-img
                    v-else
                    custom-class="custom-img"
                    :width="26"
                    :height="26"
                    :src="`/static/images/extract/${step.icon}.png`"
                  />
                </view>
              </template>
              <template #title>
                <view 
                  class="ml-2 w-30 text-base font-semibold" 
                  :class="step.class === 'active' ? 'text-brand' : 'text-gray-900'"
                >
                  {{ step.title }}
                </view>
              </template>
              <template #description>
                <view 
                  class="mt-1 mb-4 ml-2 w-30 text-sm" 
                  :class="step.class === 'active' ? 'text-brand' : 'text-gray-600'"
                >
                  {{ step.description }}
                </view>
              </template>
            </wd-step>
          </wd-steps>
        </view>

        <view class="relative flex justify-center w-[194px] mb-[15px] ml-[15px]">
          <image
            class="w-[194px]"
            :src="`${cdnBaseUrl}/e9f9631b39bd9be3b4dc7cb9c546bbba03d334df555b1da50ebe205afdb41f76.png`"
            mode="widthFix"
          />
          <i
            v-if="brewData.type === 0"
            class="iconfont icon-yanmozanting absolute top-[50px] text-[32px] text-gray-700"
          ></i>
          
          <view v-else class="absolute top-[39px] flex items-center justify-center w-[63px] h-[63px] text-[22px] font-semibold text-white circle-state-wrapper">
            <wd-circle
              v-if="currentResidenceTime > 0 && brewData.brewStep !== 0"
              :size="81"
              :clockwise="false"
              layerColor="#313131"
              custom-class="custom-circle"
              color="#6f6f6f"
              :strokeWidth="12"
              v-model="currentResidenceTimePercent"
              :text="`${currentResidenceTime}s`"
            ></wd-circle>
            <view v-else>
              <view class="relative w-[81px] h-[81px]">
                <wd-circle
                  :size="81"
                  :clockwise="false"
                  layerColor="#313131"
                  custom-class="custom-circle1"
                  color="#6f6f6f"
                  :strokeWidth="12"
                  v-model="currentStep"
                ></wd-circle>
                <view class="absolute top-1/2 left-1/2 flex flex-col items-center justify-center text-base font-semibold text-gray-600 -translate-x-1/2 -translate-y-1/2">
                  <text class="text-white">{{ currentStepWater }}ml</text>
                  <text class="leading-[7px] [transform:rotateX(70deg)]">\</text>
                  <text>{{ currentStepTotalWater }}ml</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <extract-finish v-else :formulaData="formulaData" />
    </view>
    
    <view class="h-20 shrink-0">
      <group-state :buttonTexts="buttonTexts" />
    </view>

    <bc-confirm
      :show="stopShow"
      :objData="objStopData"
      @close="stopShow = false"
      @success="stopExtract"
    ></bc-confirm>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import extractFinish from './brew-finish.vue'
import groupState from './group-state.vue'

//import { useToast } from 'wot-design-uni'
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css' // 引入提示框樣式

import { useMachineBStatusStore } from '@/store'
import { CoffeeMachineProtocol } from '@/utils/coffeedBlueTool'
import { dangweiType, retry, formatSeconds } from '@/utils/index'

const cdnBaseUrl = import.meta.env.VITE_CDN_BASE_URL
const emit = defineEmits(['stepChange'])

//const toast = useToast()
// 建立一個假的 toast 物件來橋接舊程式碼，這樣您就不必去改下面好幾處的 toast.error()
const toast = {
  error: (msg: string) => ElMessage.error(msg),
  success: (msg: string) => ElMessage.success(msg)
}

const coffeeMachineProtocol = CoffeeMachineProtocol.getInstance()
const machineStatusStore = useMachineBStatusStore()

const formulaData = ref(machineStatusStore.formulaData)
const brewData = ref(machineStatusStore.brewData)
const runStatus = ref(machineStatusStore.runStatus)
const showParams = ref(true)
const showSteps = ref(false)
const showFinish = ref(false)
const buttonTexts = ref([])
const stopShow = ref(false)
const timeLeft = ref(0)
const currentStepWater = ref(0)
const currentStepTotalWater = ref(0)
const currentResidenceTime = ref(0)
const totalResidenceTime = ref(0)
const interval = ref(null)

const objStopData = {
  icon: '/static/images/popup/stop1.png',
  content: '確認終止沖煮',
  tips: '終止後將提前結束本次沖煮',
}

const paramItems = computed(() => [
  {
    label: '研磨檔位',
    value: formulaData.value.grindGear,
    unit: `${dangweiType(formulaData.value.grindGear)}`,
    image: '5eb077c26d17763b7ce24d53ef66af5eea07b1fe6832f247b82cd5afd28c228e.png',
  },
  {
    label: '粉水比',
    value: `1:${formulaData.value.powderWaterRatio}`,
    image: '98a3754407df384d56e11651e8e20fc88a10d18568b8f0882a5e645b9e2b18e1.png',
  },
  {
    label: '注水量',
    value: (formulaData.value.powderWaterRatio * formulaData.value.beanPowderAmount).toFixed(0),
    unit: 'ml',
    image: '9edef84354ce9d2dc0ecc5faba90ca52601dca50364b5f54a30e534b32ee4128.png',
  },
  {
    label: '豆粉量',
    value: formulaData.value.beanPowderAmount,
    unit: 'g',
    image: '3fe954872e3f5e20617d7bacef3a062da41c8ab32a9920f8d2048d749e5a91c1.png',
  },
])

const steps = ref([])
const currentStep = computed({
  get: () => (brewData.value.brewStep / formulaData.value.brewSegmentCount) * 100,
  set: (val) => {
    console.log('進度值被修改:', val)
  },
})

const currentResidenceTimePercent = computed(() => {
  if (totalResidenceTime.value === 0) return 0
  return (currentResidenceTime.value / totalResidenceTime.value) * 100
})

const iconMap = {
  0: 'center',
  1: 'spiral',
  2: 'surround',
}

const generateSteps = () => {
  const newSteps = []
  if (formulaData.value.segment0WaterAmount > 0) {
    newSteps.push({
      description: `${formulaData.value.segment0FlowRate}ml/s ${formulaData.value.segment0WaterAmount}ml`,
      title: '悶蒸',
      icon: iconMap[0],
      class: 'active',
    })
  }
  for (let i = 1; i <= formulaData.value.brewSegmentCount; i++) {
    const waterAmount = formulaData.value[`segment${i}WaterAmount`]
    const flowRate = formulaData.value[`segment${i}FlowRate`]
    const type = formulaData.value[`segment${i}WaterType`]
    if (waterAmount > 0) {
      newSteps.push({
        description: `${flowRate}ml/s ${waterAmount}ml`,
        title: `第${i}段`,
        icon: iconMap[i],
        class: i <= brewData.value.brewStep ? 'active' : '',
      })
    }
  }
  steps.value = newSteps
}

const getBackgroundStyle = (imageName: string) => ({
  backgroundImage: `url(${cdnBaseUrl}/${imageName})`,
})

const start = async (type) => {
  uni.showLoading({ title: '發送中...', mask: true })
  try {
    await retry(() => send(type), 3, 500)
  } catch (error) {
    toast.error(error.message)
  } finally {
    uni.hideLoading()
  }
}

const send = async (sendType: number) => {
  const { id, brewSegmentCount } = formulaData.value
  const data = [
    sendType,
    (id >> 24) & 0xff,
    (id >> 16) & 0xff,
    (id >> 8) & 0xff,
    id & 0xff,
    brewSegmentCount,
    0,
    0,
    0,
  ]
  const response = await coffeeMachineProtocol.sendBrewMode(data)
  if (response == 'dd') {
    if (sendType > 0) {
      brewData.value.startStop = sendType
    }
    if (sendType === 0) {
      uni.showLoading({ title: '取消中，請耐心等待！', mask: true })
      try {
        await retry(
          () => {
            if (runStatus.value === 0) {
              uni.reLaunch({
                url: '/pages-coffeed/index/index',
              })
            } else {
              throw new Error('取消命令執行失敗，請重新嘗試')
            }
          },
          12,
          500,
        )
      } catch (error) {
        toast.error(error.message)
      } finally {
        uni.hideLoading()
      }
    }
  } else {
    throw new Error('命令執行失敗，請重新嘗試')
  }
}

const stopExtract = () => {
  stopShow.value = false
  start(0)
}

watch(
  () => machineStatusStore.formulaData,
  (newVal) => {
    formulaData.value = { ...newVal }
    generateSteps()
    if (buttonTexts.value.length === 0) {
      if (formulaData.value.grindSwitch === 0) {
        buttonTexts.value = [
          { text: '沖煮', state: true, icon: 'brew' },
          { text: '完成', state: false, icon: 'finish' },
        ]
      } else {
        buttonTexts.value = [
          { text: '研磨', state: true, icon: 'grind' },
          { text: '沖煮', state: false, icon: 'brew' },
          { text: '完成', state: false, icon: 'finish' },
        ]
      }
    }
  },
  { deep: true, immediate: true },
)

watch(
  () => machineStatusStore.brewData,
  (newVal) => {
    brewData.value = { ...newVal }
    timeLeft.value = (newVal.brewTimerHigh << 8) | newVal.brewTimerLow
    currentStepWater.value = (newVal.injectedWaterHigh << 8) | newVal.injectedWaterLow
    currentResidenceTime.value = newVal.brewTime

    const currentStep = newVal.brewStep
    totalResidenceTime.value = formulaData.value[`segment${currentStep}ResidenceTime`] || 0
    currentStepTotalWater.value = formulaData.value[`segment${currentStep}WaterAmount`] || 0
    
    if (interval.value) clearInterval(interval.value)

    if (totalResidenceTime.value > 0) {
      interval.value = setInterval(() => {
        if (currentResidenceTime.value > 0) {
          currentResidenceTime.value--
        } else {
          clearInterval(interval.value!)
        }
      }, 1000)
    }

    if (brewData.value.type === 1) {
      showParams.value = false
      showSteps.value = true
      if (buttonTexts.value.length > 2) {
        buttonTexts.value[1].state = true
      }
      emit('stepChange', 1)
    } else {
      showParams.value = true
      showSteps.value = false
      emit('stepChange', 0)
    }
  },
  { deep: true, immediate: true },
)

watch(
  () => machineStatusStore.runStatus,
  (newRunStatus) => {
    runStatus.value = newRunStatus
    if (newRunStatus === 0) {
      showFinish.value = true
      emit('stepChange', formulaData.value.grindSwitch === 0 ? 1 : 2)
    }
  },
)

onUnmounted(() => {
  if (interval.value) {
    clearInterval(interval.value)
  }
})
</script>

<style lang="scss" scoped>
/* 將 Tailwind 無法覆蓋的 UI 庫內部組件深層樣式保留在此 */
.custom-icon-wrapper {
  :deep(.custom-img) {
    margin-top: 12px !important;
  }
}

.circle-state-wrapper {
  :deep(.custom-circle) {
    .wd-circle__text {
      font-weight: 600;
      color: #ffffff;
    }
  }
}
</style>