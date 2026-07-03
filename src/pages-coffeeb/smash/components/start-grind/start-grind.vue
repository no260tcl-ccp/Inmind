<template>
  <view class="start-injecting-water">
    <view class="coffee-machine-picture">
      <view
        class="machine-diagram"
        :style="{ backgroundImage: `url(${aliyunBaseUrl}water-injection-center.png)` }"
      >
        <view class="status-icon">
          <i class="iconfont icon-yanmozanting"></i>
        </view>
      </view>
    </view>
    <view class="display-water-volume">
      <view class="volume">{{ statusState[controlIdentification] }}</view>
    </view>
    <view class="temperature-flowrate">
      <view class="temp-flow">
        <view class="temperature">
          <view class="name">研磨度</view>
          <view class="sign">
            <i class="iconfont icon-a-svg9"></i>
          </view>
        </view>
        <view class="show-val">
          {{ grindSize }}
          <text class="unit">{{ dangweiType(grindSize) }}</text>
        </view>
      </view>
      <view class="temp-flow">
        <view class="temperature">
          <view class="name">电机转速</view>
          <view class="sign">
            <i class="iconfont icon-lujing-31"></i>
          </view>
        </view>
        <view class="show-val">
          {{ motorSpeed }}
          <text class="unit">RPM</text>
        </view>
      </view>
    </view>
    <view class="temperature-pause">
      <view
        class="pause-btn terminate"
        @click="terminateClick"
        v-if="(startStop === 1 || startStop === 2 || startStop === 3) && !isFinish"
      >
        <i class="iconfont icon-a-juxing565"></i>
      </view>
      <view class="pause-btn start" @click="startClick" v-if="startStop === 2 && !isFinish">
        <i class="iconfont icon-bofang5"></i>
      </view>
      <view
        class="pause-btn lujing"
        @click="pauseClick"
        v-if="(startStop === 1 || startStop === 3) && !isFinish"
      >
        <i class="iconfont icon-lujing"></i>
      </view>
      <view class="pause-btn back" @click="handleBackHome" v-if="startStop === 0 && isFinish">
        <i class="iconfont icon-a-duobianxing2"></i>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMachineBStatusStore } from '@/store'
import { useToast } from 'wot-design-uni'
const aliyunBaseUrl = import.meta.env.VITE_COFFEE_BASE_URL
const machineStatusStore = useMachineBStatusStore()
const runStatus = ref<number>(machineStatusStore.runStatus)
const isFinish = ref<boolean>(false)
const startStop = computed(() => machineStatusStore.grindData.startStop)
const controlIdentification = ref<number>()
const grindSize = computed(() => machineStatusStore.grindData.gear)
const motorSpeed = computed(() => machineStatusStore.grindData.speed)
const toast = useToast()
const emit = defineEmits(['changeTheGrindingState', 'nextFinish'])
watch(
  () => machineStatusStore.grindData.startStop,
  (newStartStop) => {
    controlIdentification.value = Number(newStartStop)
    if (newStartStop === 0) {
      isFinish.value = true
      nextFinish()
    }
  },
)
interface statusType {
  0: string
  1: string
  2: string
}
const statusState = ref<statusType>({
  0: '完成',
  1: '研磨中',
  2: '暂停',
})

const props = defineProps({
  Finish: {
    type: Boolean,
    default: false,
  },
})

const dangweiType = (dangwei) => {
  if (dangwei > 82) {
    return '法压冷萃'
  }

  if (dangwei > 47 && dangwei <= 82) {
    return '手冲咖啡'
  }

  if (dangwei > 23 && dangwei <= 47) {
    return '爱乐压'
  }

  if (dangwei > 0 && dangwei <= 23) {
    return '意式浓缩'
  }

  return '' // 如果 dangwei <= 0，则返回空字符串或其他默认值
}

watch(
  () => props.Finish,
  (newFinish) => {
    isFinish.value = newFinish
  },
)

const nextFinish = () => {
  emit('nextFinish')
}

// 暂停研磨
const pauseClick = () => {
  emit('changeTheGrindingState', 2)
}
// 继续研磨
const startClick = () => {
  emit('changeTheGrindingState', 3)
}

// 终止研磨
const terminateClick = () => {
  emit('changeTheGrindingState', 0)
}

// 返回到首页
const handleBackHome = () => {
  uni.navigateBack({ delta: 1 })
}

// 监听 machineStatusStore 中 runStatus 的变化来判断是否完成
// watch(
//   () => machineStatusStore.runStatus,
//   (newRunStatus) => {
//     runStatus.value = newRunStatus
//     // 完成时
//     if (newRunStatus === 0) {
//       isFinish.value = true
//       toast.success('研磨完成')
//     }
//   },
// )
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
        margin-top: 118rpx;
        text-align: center;
        .icon-yanmozanting {
          font-size: 70rpx;
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
    .volume {
      color: #222222;
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
      .unit {
        font-size: 28rpx;
        font-weight: 600;
      }
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
      background: #eaeaea !important;
      margin-right: 64rpx;
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
