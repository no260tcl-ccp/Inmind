<template>
  <wd-overlay :show="show">
    <view class="overlay-content">
      <view class="block">
        <view class="slider-box">
          <horizontal-slidert
            ref="preInfusionTimeSlider"
            :initialValue="preInfusionTime"
            sliderText="预侵泡时间"
            sliderBackgroundColor="#ffffff"
            @slider-change="handleSliderChangePreInfusionTime"
            :maxSliderValue="10"
            :minSliderValue="0"
            unitValue="s"
            :stepSize="1"
            :showValue="true"
            :isVertical="false"
          />
        </view>
        <view class="mt-5 mb-3.5 flex items-center justify-center">
          <wd-img :width="23" :height="8" src="/static/images/popup/left.png" />
          <view class="mx-2">左右拉动滑块可调整参数</view>
          <wd-img :width="23" :height="8" src="/static/images/popup/right.png" />
        </view>
        <view>
          <wd-button block type="info" plain custom-class="cancel-button" @click="handleClose">
            {{ cancelText }}
          </wd-button>
        </view>
      </view>
    </view>
  </wd-overlay>
</template>

<script lang="ts" setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  zIndex: {
    type: Number,
    default: 100,
  },
  cancelText: {
    type: String,
    default: '好的',
  },
})
const localShow = ref(props.show)
const emit = defineEmits(['close'])
const preInfusionTime = ref<number>(7)
const handleSliderChangePreInfusionTime = (value) => {
  preInfusionTime.value = value
}

watch(
  () => props.show,
  (newValue) => {
    localShow.value = newValue
  },
)
const handleClose = () => {
  emit('close')
}
</script>

<style lang="scss" scoped>
.overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: #ffffff;
  padding: 0 80rpx;
  .block {
    height: 388rpx;
    width: 100%;
    .slider-box {
      background-color: #ffffff;
      border-radius: 20rpx;
      padding: 20rpx 0;
    }
    :deep(button) {
      width: 180rpx !important;
      min-width: 180rpx !important;
      height: 76rpx !important;
      color: #004097 !important;
    }
  }
}
:deep(.cancel-button) {
  background-color: #dedede !important;
  border: 1px solid #c5c5c5 !important;
}
</style>
