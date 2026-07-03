<template>
  <view class="extract-content">
    <view class="extract-machine">
      <view class="extract-info" v-if="!showFinish">
        <view class="extract-left">
          <text class="extract-name">
            <text>{{ brewData.type === 0 ? '研磨中' : '冲煮中' }}</text>
            <text v-if="brewData.type === 1" class="time">
              {{
                `${brewData.brewTimerLow < 10 ? 0 : ''}${brewData.brewTimerHigh} : ${brewData.brewTimerLow < 10 ? 0 : ''}${brewData.brewTimerLow}`
              }}
            </text>
          </text>
          <text class="extract-sn">{{ formulaData.name }}</text>
        </view>
        <view class="extract-right">
          <view class="extract-status" v-if="brewData.type === 0" @click="start(0)">
            <i class="iconfont icon-lujing"></i>
            <text>终止</text>
          </view>
          <view v-else>
            <view
              class="extract-status"
              v-if="brewData.startStop === 1 || brewData.startStop === 3"
              @click="start(2)"
            >
              <i class="iconfont icon-lujing"></i>
              <text>暂停</text>
            </view>
            <view v-else-if="brewData.startStop === 2" class="extract-btn-box">
              <view @click="stopShow = true" class="mr-6 flex flex-col items-center color-#666666">
                <i class="iconfont icon-a-juxing207 mb-1"></i>
                <text>终止</text>
              </view>
              <view @click="start(3)" class="color-#E51F4D flex flex-col items-center">
                <i class="iconfont icon-a-qietu205 mb-1"></i>
                <text>继续</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="extract-state" v-if="!showFinish">
        <view class="extract-params" v-if="showParams">
          <view
            v-for="(item, index) in paramItems"
            :key="index"
            class="param-item"
            :style="getBackgroundStyle(item.image)"
          >
            <text class="param-label">{{ item.label }}</text>
            <text class="mt-2">
              <text class="font-size-6">{{ item.value }}</text>
              {{ item.unit || '' }}
            </text>
          </view>
        </view>
        <view class="extract-step" v-if="showSteps">
          <wd-steps :active="1" space="95px" vertical align-center>
            <wd-step v-for="(step, index) in steps" :key="index" :title="step.title">
              <template #icon>
                <view>
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
                <view class="ml-2 w-30 font-size-4 font-600" :class="step.class">
                  {{ step.title }}
                </view>
              </template>
              <template #description>
                <view class="mt-1 mb-4 ml-2 w-30 font-size-3.5" :class="step.class">
                  {{ step.description }}
                </view>
              </template>
            </wd-step>
          </wd-steps>
        </view>
        <view class="extract-display">
          <image
            class="extract-img"
            :src="`${cdnBaseUrl}/e9f9631b39bd9be3b4dc7cb9c546bbba03d334df555b1da50ebe205afdb41f76.png`"
            mode="widthFix"
          />
          <i
            v-if="brewData.type === 0"
            class="iconfont icon-yanmozanting icon-color icon-state"
          ></i>
          <view v-else class="circle-state">
            <wd-circle
              v-if="currentResidenceTime > 0"
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
              <view class="circle-box">
                <wd-circle
                  :size="81"
                  :clockwise="false"
                  layerColor="#313131"
                  custom-class="custom-circle1"
                  color="#6f6f6f"
                  :strokeWidth="12"
                  v-model="currentWaterPercent"
                ></wd-circle>
                <view class="circle-text">
                  <text class="current-water">{{ currentStepWater }}ml</text>

                  <text class="test-text">\</text>

                  <text>{{ currentStepTotalWater }}ml</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      <extract-finish v-else :formulaData="formulaData" />
    </view>
    <view class="extract-group">
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
<script lang="ts">
//這是 src\pages-coffeeb\brew\components\brew-content\brew-content.vue 
export default {
  options: {
    styleIsolation: 'shared',
    virtualHost: true,
  },
}
</script>
<script setup lang="ts">
// eslint-disable-next-line import/first
import extractFinish from './brew-finish.vue'
// eslint-disable-next-line import/first
import groupState from './group-state.vue'
// eslint-disable-next-line import/first
import { useToast } from 'wot-design-uni'
// eslint-disable-next-line import/first
import { useMachineBStatusStore } from '@/store'
// eslint-disable-next-line import/first
import { CoffeeMachineProtocol } from '@/utils/coffeebBlueTool'
// eslint-disable-next-line import/first
import { dangweiType, retry, formatSeconds } from '@/utils'
// eslint-disable-next-line import/first
import { httpGet } from '@/utils/http'

const cdnBaseUrl = import.meta.env.VITE_CDN_BASE_URL
const emit = defineEmits(['stepChange'])
const toast = useToast()
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
  content: '确认终止冲煮',
  tips: '终止后将提前结束本次冲煮',
}
const paramItems = computed(() => [
  {
    label: '研磨档位',
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

// const steps = [
//   {
//     description: '3.5ml/s 35ml',
//     title: '焖蒸',
//     icon: '/static/images/extract/spiral-active.png',
//     class: 'active',
//   },
//   {
//     description: '3.5ml/s 35ml',
//     title: '第一段',
//     icon: '/static/images/extract/center-active.png',
//     class: 'active',
//   },
//   {
//     description: '3.5ml/s 35ml',
//     title: '第二段',
//     icon: '/static/images/extract/center.png',
//     class: '',
//   },
//   {
//     description: '3.5ml/s 35ml',
//     title: '第三段',
//     icon: '/static/images/extract/spiral.png',
//     class: '',
//   },
//   {
//     description: '3.5ml/s 35ml',
//     title: '第四段',
//     icon: '/static/images/extract/surround.png',
//     class: '',
//   },
// ]
const steps = ref([])
const currentStep = computed({
  get: () => (brewData.value.brewStep / formulaData.value.brewSegmentCount) * 100,
  set: (val) => {
    // 这里如果组件支持双向绑定，可以处理回传的值
    console.log('进度值被修改:', val)
  },
})
// 计算当前驻留时间百分比
const currentResidenceTimePercent = computed(() => {
  if (totalResidenceTime.value === 0) return 0
  return (currentResidenceTime.value / totalResidenceTime.value) * 100
})
// 计算当前水量百分比
const currentWaterPercent = computed(() => {
  if (currentStepTotalWater.value === 0) return 0
  return (currentStepWater.value / currentStepTotalWater.value) * 100
})

// 定义图标映射
const iconMap = {
  0: 'center',
  1: 'spiral',
  2: 'surround',
}

// 根据 formulaData 生成 steps
const generateSteps = () => {
  const newSteps = []
  // 处理闷蒸步骤
  if (formulaData.value.segment0WaterAmount > 0) {
    newSteps.push({
      description: `${formulaData.value.segment0FlowRate}ml/s ${formulaData.value.segment0WaterAmount}ml`,
      title: '焖蒸',
      icon: iconMap[formulaData.value.segment0WaterType],
      class: 'active',
    })
  }
  // 处理后续冲煮步骤
  for (let i = 1; i <= formulaData.value.brewSegmentCount; i++) {
    const waterAmount = formulaData.value[`segment${i}WaterAmount`]
    const flowRate = formulaData.value[`segment${i}FlowRate`]
    const type = formulaData.value[`segment${i}WaterType`]
    if (waterAmount > 0) {
      newSteps.push({
        description: `${flowRate}ml/s ${waterAmount}ml`,
        title: `第${i}段`,
        icon: iconMap[type],
        class: i <= brewData.value.brewStep ? 'active' : '',
      })
    }
  }
  steps.value = newSteps
  console.log('steps', steps.value)
}

const getBackgroundStyle = (imageName: string) => ({
  backgroundImage: `url(${cdnBaseUrl}/${imageName})`,
})
const start = async (type) => {
  uni.showLoading({ title: '发送中...', mask: true })
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
    brewData.value.type,
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
  if (response === 'dd') {
    // 终止需要时间，先不改变状态。需要等待设备响应
    if (sendType > 0) {
      brewData.value.startStop = sendType
    }
    // 取消冲煮
    if (sendType === 0) {
      uni.showLoading({ title: '取消中，请耐心等待！', mask: true })
      try {
        await retry(
          () => {
            if (runStatus.value === 0) {
              uni.reLaunch({
                url: '/pages-coffeeb/index/index',
              })
            } else {
              throw new Error('取消命令执行失败，请重新尝试')
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
    throw new Error('命令执行失败，请重新尝试')
  }
}
const stopExtract = () => {
  stopShow.value = false
  start(0)
}
const formulaInit = () => {
  // 初始化 steps
  generateSteps()
  // 获取按钮数据
  if (buttonTexts.value.length === 0) {
    // 是否有研磨
    if (formulaData.value.grindSwitch === 0) {
      buttonTexts.value = [
        { text: '冲煮', state: true, icon: 'brew' },
        { text: '完成', state: false, icon: 'finish' },
      ]
    } else {
      buttonTexts.value = [
        { text: '研磨', state: true, icon: 'grind' },
        { text: '冲煮', state: false, icon: 'brew' },
        { text: '完成', state: false, icon: 'finish' },
      ]
    }
  }
}
// 获取配方数据
watch(
  () => machineStatusStore.formulaData,
  (newVal) => {
    console.log('formulaDatatest1', newVal)
    // formulaData.value = { ...newVal }
    // 如果冲煮是从小程序开启的，则从服务器获取
    const id = uni.getStorageSync('id')
    if (id) {
      const { run } = useRequest<IResponseData>(() => httpGet(`/repice/repice/${id}`))
      run().then((res) => {
        if (res.code === 200) {
          const item = res.data
          item.configJson = JSON.parse(item.configJson)
          formulaData.value.id = item.id
          formulaData.value.grindGear = item.configJson.gear
          formulaData.value.grindSwitch = item.configJson.grind ? 1 : 0
          formulaData.value.grindSpeed = item.configJson.speed
          formulaData.value.beanPowderAmount = item.configJson.legumes
          formulaData.value.powderWaterRatio = item.configJson.proportion / 2
          // 处理冲泡阶段数据
          item.configJson.accordionItems.forEach((segment, index) => {
            const segmentPrefix = `segment${index}`
            formulaData.value[`${segmentPrefix}WaterAmount`] = segment.water
            formulaData.value[`${segmentPrefix}FlowRate`] = `3.${segment.velocity}`
            formulaData.value[`${segmentPrefix}Temperature`] = segment.temperature
            formulaData.value[`${segmentPrefix}ResidenceTime`] = segment.time
            formulaData.value[`${segmentPrefix}WaterType`] = segment.type
          })
          formulaData.value.brewSegmentCount = item.configJson.accordionItems.length
          formulaData.value.name = item.name
        } else {
          toast.error(res.msg)
        }
        formulaInit()
      })
      console.log('formulaDatatest', formulaData.value)
    } else {
      // 从设备开启的，使用设备上报的配方数据
      console.log('formulaDatatest1', newVal)
      formulaData.value = { ...newVal }
      formulaInit()
    }
  },
  { deep: true, immediate: true },
)
// 获取冲泡数据
watch(
  () => machineStatusStore.brewData,
  (newVal) => {
    console.log('brewData', newVal)
    brewData.value = { ...newVal }
    generateSteps()
    timeLeft.value = (newVal.brewTimerHigh << 8) | newVal.brewTimerLow // 合并高8位和低8位
    console.log('newVal.brewTimerHigh', newVal.brewTimerHigh)
    console.log('newVal.brewTimerLow', newVal.brewTimerLow)
    console.log('newVal.timeLeft', timeLeft.value)
    currentStepWater.value = (newVal.injectedWaterHigh << 8) | newVal.injectedWaterLow

    currentResidenceTime.value = newVal.brewTime
    // 根据当前段获取总驻留时间
    const currentStep = newVal.brewStep
    totalResidenceTime.value = formulaData.value[`segment${currentStep}ResidenceTime`] || 0
    currentStepTotalWater.value = formulaData.value[`segment${currentStep}WaterAmount`] || 0
    // 清除之前的定时器
    if (interval.value) clearInterval(interval.value)

    // 启动新的定时器更新倒计时
    if (totalResidenceTime.value > 0) {
      interval.value = setInterval(() => {
        if (currentResidenceTime.value > 0) {
          currentResidenceTime.value--
        } else {
          clearInterval(interval.value!)
        }
      }, 1000)
    }

    // 研磨和注水步骤完成时，显示参数
    if (brewData.value.type === 1) {
      showParams.value = false
      showSteps.value = true
      // 有研磨的需要选中第二步
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
    console.log('runStatustest', newRunStatus)
    runStatus.value = newRunStatus
    // 完成时
    if (newRunStatus === 0) {
      uni.setStorageSync('id', '')
      showFinish.value = true
      // 完成时，按钮状态改变
      if (buttonTexts.value.length > 2) {
        buttonTexts.value[2].state = true
      } else {
        buttonTexts.value[1].state = true
      }
      emit('stepChange', 2)
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
.extract-content {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 12vh);
  overflow: hidden;
  .extract-machine {
    flex: 1;
    overflow-x: hidden;
    overflow-y: auto;
  }
  .extract-group {
    height: 160rpx;
  }
}
.extract-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 32rpx;
  margin-bottom: 72rpx;
  .extract-left {
    display: flex;
    flex-direction: column;
    .extract-name {
      font-size: 54rpx;
      font-weight: bold;
      .time {
        margin-left: 20rpx;
        font-size: 36rpx;
      }
    }
    .extract-sn {
      margin-top: 12rpx;
      font-size: 28rpx;
      color: #999;
    }
  }
  .extract-right {
    max-width: 168rpx;
    .extract-status {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 128rpx;
      height: 128rpx;
      font-size: 32rpx;
      color: #ffffff;
      background-color: #004097;
      border-radius: 32rpx;
    }
    .extract-btn-box {
      display: flex;
      font-size: 28rpx;
      color: #666666;
    }
  }
}
.extract-state {
  display: flex;
  margin-bottom: 20rpx;
  // padding: 20rpx;
  border-radius: 12rpx;
  .extract-params {
    flex: 1;
    .param-item {
      display: flex;
      flex-direction: column;
      justify-content: center;
      width: 280rpx;
      height: 180rpx;
      padding-left: 30rpx;
      margin-bottom: 54rpx;
      margin-left: 12rpx;
      background-repeat: no-repeat;
      background-position: center;
      background-size: cover;
      .param-label {
        color: #666;
      }
    }
  }
  .extract-step {
    flex: 1;
    margin-left: 12rpx;
    .active {
      color: #004097;
    }
    :deep(.custom-img) {
      margin-top: 24rpx !important;
    }
  }
  .extract-display {
    position: relative;
    display: flex;
    justify-content: center;
    width: 388rpx;
    margin-bottom: 30rpx;
    margin-left: 30rpx;
    .extract-img {
      width: 388rpx;
    }
    .icon-state {
      position: absolute;
      top: 100rpx;
      font-size: 64rpx;
      color: #5c5c5c !important;
    }
    .circle-state {
      position: absolute;
      top: 78rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 126rpx;
      height: 126rpx;
      font-size: 44rpx;
      font-weight: 600;
      color: #ffffff;
      :deep(.custom-circle) {
        .wd-circle__text {
          font-weight: 600;
          color: #ffffff;
        }
      }
      .circle-box {
        position: relative;
        width: 162rpx;
        height: 162rpx;
        .circle-text {
          position: absolute;
          top: 50%;
          left: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 32rpx;
          font-weight: 600;
          color: #666666;
          transform: translate(-50%, -50%);
          .current-water {
            color: #ffffff;
          }
          .test-text {
            line-height: 14rpx;
            transform: rotateX(70deg);
          }
        }
      }
    }
  }
}
</style>
