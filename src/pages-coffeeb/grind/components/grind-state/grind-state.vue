<template>
  <view class="grind-state">
    <view class="flex justify-center grind-header">
      <wd-img
        mode="heightFix"
        :src="`${cdnBaseUrl}/9c2622add4e56520b0d7dc3b280baa85f77ca623b4bc43d151c82a3769629ec3.png`"
      />
      <i v-if="isFinish" class="iconfont icon-a-qietu184 icon-color icon-state"></i>
      <i v-else class="iconfont icon-yanmozanting icon-color icon-state"></i>
    </view>
    <view class="flex justify-center state-text" v-if="isFinish">研磨完成</view>
    <view class="flex justify-center state-text" v-else>
      {{ stateText[Number(grindData.startStop)] }}
    </view>
    <view
      class="flex justify-center text-center state-tips"
      v-if="Number(grindData.startStop) === 0"
    >
      请将适量咖啡豆倒入机器上方的豆槽中，倒入后点【下一步】开始研磨
    </view>
    <view class="grind-box" v-else>
      <wd-row :gutter="14">
        <wd-col :span="12">
          <view class="flex flex-col justify-center items-center grind-item">
            <view class="grind-item-top">{{ grindData.gear }}</view>
            <view class="grind-item-bottom">研磨度</view>
          </view>
        </wd-col>
        <wd-col :span="12">
          <view class="flex flex-col justify-center items-center grind-item">
            <view class="grind-item-top">{{ grindData.speed }}</view>
            <view class="grind-item-bottom">电机转速 (RPM)</view>
          </view>
        </wd-col>
      </wd-row>
    </view>
    <view class="mt-7" v-if="isFinish">
      <wd-button block @click="toHome" size="large" type="info" custom-class="custom-btn-info">
        <wd-img :width="16" :height="16" :src="`/static/images/extract/grind-active.png`" />
        <text class="ml-1">主页</text>
      </wd-button>
    </view>
    <view class="mt-7" v-else>
      <wd-button
        block
        type="error"
        custom-class="custom-btn"
        @click="grindStart()"
        size="large"
        v-if="Number(grindData.startStop) === 0"
      >
        <view class="btn-box">
          <wd-img :width="16" :height="16" :src="`/static/images/extract/grind-active.png`" />
          <text class="ml-1">下一步</text>
        </view>
      </wd-button>
      <wd-button
        block
        v-else-if="Number(grindData.startStop) === 1 || Number(grindData.startStop) === 3"
        custom-class="custom-btn"
        size="large"
        @click="start(2)"
      >
        <view class="btn-box">
          <wd-img :width="16" :height="16" :src="`/static/images/extract/stop.png`" />
          <text class="ml-1">暂停</text>
        </view>
      </wd-button>
      <wd-row :gutter="12" v-else-if="Number(grindData.startStop) === 2">
        <wd-col :span="8">
          <wd-button
            block
            type="info"
            size="large"
            @click="start(0)"
            custom-class="custom-btn-info"
          >
            取消研磨
          </wd-button>
        </wd-col>
        <wd-col :span="16">
          <wd-button block type="error" size="large" custom-class="custom-btn" @click="start(3)">
            <view class="btn-box">
              <wd-img :width="16" :height="16" :src="`/static/images/extract/grind-active.png`" />
              <text class="ml-1">继续</text>
            </view>
          </wd-button>
        </wd-col>
      </wd-row>
    </view>
    <wd-toast />
  </view>
</template>
<script lang="ts">
// 组件中无法覆盖组件库样式: https://wot-design-uni.netlify.app/guide/common-problems.html
export default {
  options: {
    styleIsolation: 'shared',
    virtualHost: true,
  },
}
</script>
<script setup lang="ts">
import { defineProps } from 'vue'
import { retry } from '@/utils'
import { CoffeeMachineProtocol } from '@/utils/coffeebBlueTool'
import { useToast } from 'wot-design-uni'
import { useMachineBStatusStore } from '@/store'

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
const grindData = ref(props.objData)
const runStatus = ref(machineStatusStore.runStatus)
const cdnBaseUrl = import.meta.env.VITE_CDN_BASE_URL
const isFinish = ref(false)
const stateText = {
  0: '请加入咖啡豆',
  1: '研磨中',
  2: '研磨暂停',
}
const send = async (type: number) => {
  const { gear, speed } = grindData.value
  const data = [type, gear, speed]
  const response = await coffeeMachineProtocol.sendGrindMode(data)
  console.log('datatest', data)
  if (response === 'dd') {
    // 终止需要时间，先不改变状态。需要等待设备响应
    if (type > 0) {
      grindData.value.startStop = type
    }
    // 取消研磨
    if (type === 0) {
      uni.showLoading({ title: '取消中，请耐心等待！', mask: true })
      try {
        await retry(
          () => {
            if (runStatus.value === 0) {
              uni.redirectTo({ url: `/pages-coffeeb/grind/grind?gear=${gear}&speed=${speed}` })
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
const grindStart = () => {
  if (runStatus.value !== 0) {
    toast.error({ msg: '设备当前正在运行，请先停止当前任务', zIndex: 1000000 })
  } else {
    start(1)
  }
}
const finish = async () => {
  emit('next')
}
const toHome = () => {
  uni.reLaunch({
    url: '/pages-coffeeb/index/index',
  })
}
watch(
  () => machineStatusStore.grindData,
  (newVal) => {
    console.log('grindData', newVal)
    // 当研磨开启时，更新数据
    if (newVal.startStop > 0) {
      grindData.value = { ...grindData.value, ...newVal }
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
</script>

<style lang="scss" scoped>
.grind-header {
  height: 600rpx;
  position: relative;
  .icon-state {
    position: absolute;
    font-size: 64rpx;
    top: 170rpx;
  }
}
.state-text {
  margin-top: 10rpx;
  font-size: 64rpx;
  color: #222222;
  margin-bottom: 38rpx;
}
.state-tips {
  color: #787d83;
  font-size: 32rpx;
  margin: 0rpx 44rpx 66rpx 44rpx;
}
.grind-box {
  .grind-item {
    background: #e7e7e7;
    border-radius: 32rpx;
    border: 4rpx solid #e7e7e7;
    .grind-item-top {
      background: #ffffff;
      width: 100%;
      height: 124rpx;
      border-radius: 32rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 64rpx;
    }
    .grind-item-bottom {
      padding: 12rpx 0;
    }
  }
}
.btn-box {
  display: flex;
  align-items: center;
  justify-content: center;
}
:deep(.custom-btn) {
  height: 110rpx !important;
  border-radius: 32rpx !important;
  font-size: 32rpx !important;
}
:deep(.custom-btn-info) {
  height: 110rpx !important;
  border-radius: 32rpx !important;
  background: #dfdfdf !important;
  color: #666666 !important;
  border: 1px solid #dfdfdf;
  font-size: 32rpx !important;
}
.icon-color {
  color: #5c5c5c !important;
}
</style>
