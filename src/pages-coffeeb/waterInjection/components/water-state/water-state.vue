<template>
  <view class="grind-state">
    <view class="flex justify-center grind-header">
      <wd-img
        mode="heightFix"
        :src="`${cdnBaseUrl}/9c2622add4e56520b0d7dc3b280baa85f77ca623b4bc43d151c82a3769629ec3.png`"
      />
      <i v-if="isFinish" class="iconfont icon-a-qietu184 icon-color icon-state"></i>
      <i v-if="isLackWater" class="iconfont icon-a-lujingbiankuang icon-color icon-state"></i>
      <i v-else :class="typeObj.icon"></i>
    </view>
    <view class="flex justify-center state-text" v-if="isFinish">注水完成</view>
    <view class="flex justify-center state-text" v-else-if="isLackWater">设备缺水</view>
    <view class="flex justify-center state-text" v-else>
      {{ injectionData.startStop === 2 ? '暂停中' : '注水中' }}
    </view>
    <view
      class="flex justify-center text-center state-tips"
      v-if="Number(injectionData.startStop) > 0 || isFinish"
    >
      {{ typeObj.text }}注水
    </view>
    <view class="flex justify-center text-center state-tips" v-if="isLackWater">
      加水后点击【继续】则继续注水 若不加水点【返回】取消注水
    </view>
    <view class="grind-box" v-else>
      <wd-row :gutter="14">
        <wd-col :span="8">
          <view class="flex flex-col justify-center items-center grind-item">
            <view class="grind-item-top">
              <view>{{ currentWater || 0 }}</view>
              <view class="water">/{{ water }}</view>
            </view>
            <view class="grind-item-bottom">注水量 (ml)</view>
          </view>
        </wd-col>
        <wd-col :span="8">
          <view class="flex flex-col justify-center items-center grind-item">
            <view class="grind-item-top">{{ injectionData.temperature }}</view>
            <view class="grind-item-bottom">水温 (℃)</view>
          </view>
        </wd-col>
        <wd-col :span="8">
          <view class="flex flex-col justify-center items-center grind-item">
            <view class="grind-item-top">{{ injectionData.velocity }}</view>
            <view class="grind-item-bottom">流速 (ml/s)</view>
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
        v-if="
          (Number(injectionData.startStop) === 1 || Number(injectionData.startStop) === 3) &&
          !isLackWater
        "
        custom-class="custom-btn"
        size="large"
        @click="start(2)"
      >
        <view class="btn-box">
          <wd-img :width="16" :height="16" :src="`/static/images/extract/stop.png`" />
          <text class="ml-1">暂停</text>
        </view>
      </wd-button>
      <wd-row :gutter="12" v-if="isLackWater || Number(injectionData.startStop) === 2">
        <wd-col :span="8">
          <wd-button
            block
            type="info"
            size="large"
            @click="start(0)"
            custom-class="custom-btn-info"
          >
            <view class="btn-box">
              <wd-img :width="16" :height="16" :src="`/static/images/extract/back.png`" />
              <text class="ml-1">返回</text>
            </view>
          </wd-button>
        </wd-col>
        <wd-col :span="16">
          <wd-button block type="error" size="large" custom-class="custom-btn" @click="start(3)">
            <view class="btn-box">
              <wd-img :width="16" :height="16" :src="`/static/images/extract/water-active.png`" />
              <text class="ml-1">继续</text>
            </view>
          </wd-button>
        </wd-col>
      </wd-row>
    </view>
  </view>
  <wd-toast />
</template>
<script setup lang="ts">
import { defineProps } from 'vue'
import { retry } from '@/utils'
import { CoffeeMachineProtocol } from '@/utils/coffeebBlueTool'
import { useToast } from 'wot-design-uni'
import { useMachineBStatusStore } from '@/store'

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
  if (response == 'dd') {
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
const toHome = () => {
  uni.reLaunch({
    url: '/pages-coffeeb/index/index',
  })
}
const water = computed(() => (injectionData.value.waterHigh << 8) | injectionData.value.waterLow)
const currentWater = computed(
  () => (injectionData.value.injectedWaterHigh << 8) | injectionData.value.injectedWaterLow,
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

<style lang="scss" scoped>
.grind-header {
  position: relative;
  height: 600rpx;
  .icon-state {
    position: absolute;
    top: 170rpx;
    font-size: 64rpx;
  }
}
.state-text {
  margin-top: 10rpx;
  margin-bottom: 8rpx;
  font-size: 64rpx;
  color: #222222;
}
.state-tips {
  margin: 0rpx 44rpx 54rpx 44rpx;
  font-size: 32rpx;
  color: #787d83;
}
.grind-box {
  .grind-item {
    background: #e7e7e7;
    border: 4rpx solid #e7e7e7;
    border-radius: 32rpx;
    .grind-item-top {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 124rpx;
      font-size: 64rpx;
      background: #ffffff;
      border-radius: 32rpx;
      .water {
        height: 84rpx;
        font-size: 28rpx;
        line-height: 110rpx;
        color: #999999;
      }
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
}
:deep(.custom-btn) {
  height: 110rpx !important;
  font-size: 32rpx !important;
  border-radius: 32rpx !important;
}
:deep(.custom-btn-info) {
  height: 110rpx !important;
  font-size: 32rpx !important;
  color: #666666 !important;
  background: #dfdfdf !important;
  border: 1px solid #dfdfdf;
  border-radius: 32rpx !important;
}
.icon-color {
  color: #5c5c5c !important;
}
.icon-color-active {
  color: #ffffff !important;
}
</style>
