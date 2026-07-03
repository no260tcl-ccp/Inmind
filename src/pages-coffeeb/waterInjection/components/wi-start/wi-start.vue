<template>
  <view class="start-injecting-water">
    <view class="coffee-machine-picture">
      <view
        class="machine-diagram"
        :style="{ backgroundImage: `url(${aliyunBaseUrl}water-injection-center.png)` }"
      >
        <view class="status-icon" v-if="Number(injectionData.startStop) > 0 || isFinish">
          {{ typeObj.text }}注水
        </view>
        <view class="solution-volume">
          <view class="seconds">{{ currentTime || 0 }}</view>
          <view class="seconds">s</view>
        </view>
      </view>
    </view>
    <view class="display-water-volume">
      <view class="volume">{{ currentWater || 0 }}</view>
      <view class="volume">/</view>
      <view class="volume">{{ water }}ml</view>
    </view>
    <view class="temperature-flowrate">
      <view class="temp-flow">
        <view class="temperature">
          <view class="name">水温</view>
          <view class="sign">
            <i class="iconfont icon-a-svg9"></i>
          </view>
        </view>
        <view class="show-val">{{ injectionData.temperature }}℃</view>
      </view>
      <view class="temp-flow">
        <view class="temperature">
          <view class="name">流速</view>
          <view class="sign">
            <i class="iconfont icon-lujing-31"></i>
          </view>
        </view>
        <view class="show-val">{{ injectionData.velocity }}ml/s</view>
      </view>
    </view>
    <view class="temperature-pause">
      <view class="pause-btn terminate" v-if="!isFinish" @click="start(0)">
        <i class="iconfont icon-a-juxing565"></i>
      </view>
      <view
        class="pause-btn start"
        v-if="Number(injectionData.startStop) === 2 && !isFinish"
        @click="start(3)"
      >
        <i class="iconfont icon-bofang5"></i>
      </view>
      <view class="pause-btn" v-if="injectionData.startStop !== 2 && !isFinish" @click="start(2)">
        <i class="iconfont icon-lujing"></i>
      </view>
      <view class="pause-btn back" @click="handleBackHome" v-if="isFinish">
        <i class="iconfont icon-a-duobianxing2"></i>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { retry } from '@/utils'
import { CoffeeMachineProtocol } from '@/utils/coffeebBlueTool'
import { useToast } from 'wot-design-uni'
import { useMachineBStatusStore } from '@/store'
const aliyunBaseUrl = import.meta.env.VITE_COFFEE_BASE_URL
// 定义传入的属性
const props = defineProps({
  objData: {
    type: Object,
    required: true,
    default: () => ({}),
  },
})
const emit = defineEmits(['next'])
const toast = useToast()
const coffeeMachineProtocol = CoffeeMachineProtocol.getInstance()
const machineStatusStore = useMachineBStatusStore()
const injectionData = ref(props.objData)
const runStatus = ref(machineStatusStore.runStatus)
const cdnBaseUrl = import.meta.env.VITE_CDN_BASE_URL
// 是否完成
const isFinish = ref(false)
// 是否缺水
const isLackWater = ref(machineStatusStore.lackWater > 0)

const typeObj = computed(() => {
  switch (injectionData.value.type) {
    case 0:
      return {
        text: '中心',
        icon: 'iconfont icon-juzhong icon-color-active icon-state',
      }
    case 1:
      return {
        text: '螺旋',
        icon: 'iconfont icon-luoxuan icon-color-active icon-state',
      }
    case 2:
      return {
        text: '环绕',
        icon: 'iconfont icon-huanrao icon-color-active icon-state',
      }
    default:
      return {
        text: '',
        icon: '',
      }
  }
})
const send = async (sendType: number) => {
  // 设备同步过来的数据
  let waterHigh = injectionData.value.waterHigh
  let waterLow = injectionData.value.waterLow
  const { temperature, velocity, type, water } = injectionData.value
  // water小程序设置的值
  if (water > 0) {
    waterHigh = (water >> 8) & 0xff
    waterLow = water & 0xff
  }
  const data = [sendType, waterHigh, waterLow, temperature, Number(`3.${velocity}`) * 10, type]
  let response
  if (isLackWater.value) {
    // 2：取消注水，1：继续注水
    response = await coffeeMachineProtocol.sendLackWaterMode([1, sendType === 0 ? 2 : 1])
  } else {
    response = await coffeeMachineProtocol.sendWaterMode(data)
  }
  if (response === 'dd') {
    // 终止需要时间，先不改变状态。需要等待设备响应
    if (sendType > 0) {
      injectionData.value.startStop = sendType
    }
    // 取消注水
    if (sendType === 0) {
      uni.showLoading({ title: '取消中，请耐心等待！', mask: true })
      try {
        await retry(
          () => {
            if (runStatus.value === 0) {
              uni.redirectTo({
                url: `/pages-coffeeb/waterInjection/waterInjection?temperature=${temperature}&velocity=${velocity}&type=${type}&water=${(waterHigh << 8) | waterLow}`,
              })
            } else {
              // throw new Error('取消命令执行失败，请重新尝试')
              console.error('取消命令执行失败，请重新尝试')
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
    // 缺水情况继续注水，设备需要时间响应
    if (sendType === 3 && isLackWater.value) {
      uni.showLoading({ title: '继续注水中，请耐心等待！', mask: true })
      try {
        await retry(
          () => {
            if (isLackWater.value) {
              throw new Error('继续命令执行失败，请重新尝试')
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
const finish = async () => {
  emit('next')
}
// 返回到首页
const handleBackHome = () => {
  uni.navigateBack({ delta: 1 })
}
const water = computed(() => (injectionData.value.waterHigh << 8) | injectionData.value.waterLow)
const currentWater = computed(
  () => (injectionData.value.injectedWaterHigh << 8) | injectionData.value.injectedWaterLow,
)

const currentTime = computed(
  () => (injectionData.value.injectedTimerHigh << 8) | injectionData.value.injectedTimerLow,
)

watch(
  () => machineStatusStore.injectionData,
  (newVal) => {
    console.log('injectionData', newVal)
    // 0 终止 1 继续 2 暂停
    if (newVal.startStop > 0) {
      injectionData.value = { ...injectionData.value, ...newVal }
      injectionData.value.velocity = Number((newVal.velocity / 10).toFixed(1))
    }
  },
  { deep: true, immediate: true },
)
// 监听 machineStatusStore 中 runStatus 的变化来判断是否完成
watch(
  () => machineStatusStore.runStatus,
  (newRunStatus) => {
    runStatus.value = newRunStatus
    // 完成时
    if (newRunStatus === 0) {
      isFinish.value = true
      finish()
    }
  },
)
// 监听设备是否缺水
watch(
  () => machineStatusStore.lackWater,
  (newlackWater) => {
    console.log('lackWater', newlackWater)
    isLackWater.value = newlackWater > 0
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.start-injecting-water {
  height: 100vh;
  overflow-y: scroll;
  .coffee-machine-picture {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 40rpx;
    font-family: 'DigitalNumbers';
    .machine-diagram {
      position: relative;
      width: 750rpx;
      height: 632rpx;
      overflow: hidden;
      background-repeat: no-repeat;
      background-size: 100% 100%;
      .status-icon {
        position: relative;
        z-index: 2;
        margin-top: 80rpx;
        font-size: 32rpx;
        color: #ffffff;
        text-align: center;
      }
      .solution-volume {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        margin-top: 22rpx;
        font-size: 48rpx;
        .seconds:nth-child(1) {
          color: #ffffff;
        }
        .seconds:nth-child(2) {
          padding-left: 10rpx;
          color: #666666;
        }
      }
    }
  }
  .display-water-volume {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin-top: 37rpx;
    font-size: 64rpx;
    font-family: 'DigitalNumbers';
    .volume:nth-child(1) {
      color: #222222;
    }
    .volume:nth-child(2) {
      padding-left: 10rpx;
      color: #666666;
    }
    .volume:nth-child(3) {
      padding-left: 10rpx;
      color: #666666;
    }
  }
  .temperature-flowrate {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 38rpx;
    padding: 0 36rpx;
    margin-top: 73rpx;
    font-size: 64rpx;
    font-family: 'DigitalNumbers';
    .temp-flow {
      height: 212rpx;
      background: #f5f5f5;
      border-radius: 48rpx;
      .temperature {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        line-height: 1;
        .name {
          margin: 0 0 0 32rpx;
          font-size: 28rpx;
          color: #999999;
        }
        .sign {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 88rpx;
          height: 88rpx;
          margin: 8rpx 8rpx 0 0;
          background-color: #ffffff;
          border-radius: 44rpx;
          .icon-a-svg9,
          .icon-lujing-31 {
            color: #999999;
          }
        }
      }
    }
    .show-val {
      margin: 20rpx 0 0 32rpx;
      font-size: 64rpx;
      line-height: 1;
      color: #222222;
    }
  }
  .temperature-pause {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin-top: 104rpx;
    .pause-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 154rpx;
      height: 154rpx;
      background: #e5ebf4;
      border-radius: 50%;
      .icon-lujing {
        font-size: 54rpx;
        color: #004097;
      }
    }
    .terminate {
      margin-right: 64rpx;
      background: #eaeaea !important;
      .icon-a-juxing565 {
        font-size: 46rpx;
        color: #666666;
      }
    }
    .start {
      background: #fce9ed !important;
      .icon-bofang5 {
        font-size: 46rpx;
        color: #ff4d4f;
      }
    }
    .back {
      background: #eaeaea !important;
      .icon-a-duobianxing2 {
        font-size: 60rpx;
        color: #666666;
      }
    }
  }
}
</style>
