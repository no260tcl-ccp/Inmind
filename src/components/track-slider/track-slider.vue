<template>
  <view class="slide-verify-container">
    <!-- 滑块主区域 -->
    <view class="slider-wrapper">
      <!-- 滑动后的背景 -->
      <view class="slider-bg-active" :style="{ width: slideWidth + 'rpx' }">
        <!-- 可拖动的圆形按钮 - 放置在激活背景内部 -->
        <view
          class="slider-button"
          :style="{ left: buttonLeft + 'rpx' }"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
        >
          <view class="arrow-icon">
            <i class="iconfont icon-a-svg10-copy"></i>
          </view>
        </view>
      </view>

      <!-- 提示文字 -->
      <view class="slider-text">
        <view v-if="!isSuccess" class="normal-text">{{ promptText }}</view>
        <view v-else class="success-text">{{ promptText }}</view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, nextTick } from 'vue'

// 定义Props和Emits
const props = defineProps<{
  modelValue: boolean
  promptText: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  slideSuccess: []
}>()

// 响应式数据
const sliderWidth = ref(580) // 290px * 2 = 580rpx (rpx转px: 1rpx = 0.5px)
const buttonLeft = ref(0)
const slideWidth = ref(0)
const isDragging = ref(false)
const isSuccess = ref(props.modelValue)
const startX = ref(0)
const startLeft = ref(0)

// 计算成功阈值
const successThreshold = ref(0)

// 监听外部modelValue变化
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== isSuccess.value) {
      isSuccess.value = newVal
      if (newVal) {
        completeSlide()
      } else {
        resetSlider()
      }
    }
  },
)

// 组件挂载后获取实际宽度
onMounted(() => {
  nextTick(() => {
    setTimeout(() => {
      // 设置成功阈值 (80%的位置)
      successThreshold.value = sliderWidth.value * 0.8

      // 如果初始状态是已通过，直接显示完成状态
      if (isSuccess.value) {
        const maxLeft = sliderWidth.value - 120
        buttonLeft.value = maxLeft
        slideWidth.value = sliderWidth.value
      }
    }, 150)
  })
})

// 重置滑块
const resetSlider = () => {
  buttonLeft.value = 0
  slideWidth.value = 0
  isSuccess.value = false
  emit('update:modelValue', false)
}

// 触摸开始
const onTouchStart = (e: TouchEvent) => {
  if (isSuccess.value) return

  e.stopPropagation()
  isDragging.value = true

  const touch = e.touches[0]
  startX.value = touch.clientX * 2
  startLeft.value = buttonLeft.value
}

// 触摸移动
const onTouchMove = (e: TouchEvent) => {
  if (!isDragging.value || isSuccess.value) return

  e.preventDefault()
  e.stopPropagation()

  const touch = e.touches[0]
  const currentX = touch.clientX * 2
  const deltaX = currentX - startX.value
  let newLeft = startLeft.value + deltaX

  // 限制滑块在激活背景区域内 (按钮宽度120rpx)
  const maxLeft = slideWidth.value > 120 ? slideWidth.value - 120 : 0
  if (newLeft < 0) newLeft = 0
  if (newLeft > maxLeft) newLeft = maxLeft

  buttonLeft.value = newLeft

  // 同时更新激活背景的宽度（基于触摸位置）
  const newWidth = Math.min(
    sliderWidth.value,
    Math.max(0, startLeft.value + deltaX + 60), // 按钮中心点到边界的距离
  )
  slideWidth.value = newWidth
}

// 触摸结束
const onTouchEnd = () => {
  if (isSuccess.value) return

  isDragging.value = false

  // 检查是否到达阈值（必须拖动到右侧）
  if (slideWidth.value >= successThreshold.value) {
    completeSlide()
  } else {
    // 未到达阈值，回弹到起点
    buttonLeft.value = 0
    slideWidth.value = 0
  }
}

// 完成滑动
const completeSlide = () => {
  isSuccess.value = true
  const maxLeft = sliderWidth.value - 120
  buttonLeft.value = maxLeft
  slideWidth.value = sliderWidth.value

  emit('update:modelValue', true)
  emit('slideSuccess')

  console.log('滑动验证成功')
}
</script>

<style lang="scss" scoped>
.slide-verify-container {
  display: flex;
  justify-content: center;
  width: 100%;
}
/* 滑块主容器 - 290px */
.slider-wrapper {
  position: relative;
  width: 580rpx; /* 290px * 2 = 580rpx */
  height: 124rpx;
  overflow: hidden;
  background: #ebf0f7;
  border-radius: 62rpx;
}
/* 滑动后的激活背景 */
.slider-bg-active {
  position: relative; /* 改为相对定位，作为按钮的容器 */
  top: 0;
  left: 0;
  height: 100%;
  overflow: visible; /* 允许按钮超出激活背景区域显示 */
  background: #004097;
  border-radius: 62rpx;
  transition: width 0.3s ease;
}
/* 可拖动的圆形按钮 */
.slider-button {
  position: absolute;
  top: 0; /* 调整位置使其居中显示 */
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 116rpx;
  height: 116rpx;
  cursor: move; /* 显示可拖动光标 */
  background: #ffffff;
  border: 4rpx solid #ebf0f7;
  border-radius: 50%;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
  transition: left 0.3s ease;
}
/* 按钮内的向右箭头 */
.arrow-icon {
  font-size: 48rpx;
  font-weight: bold;
  color: #004097;
}
/* 提示文字区域 */
.slider-text {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
/* 正常状态文字 */
.normal-text {
  font-size: 32rpx;
  font-weight: 500;
  color: #004097;
}
/* 成功状态文字 */
.success-text {
  display: flex;
  align-items: center;
  font-size: 32rpx;
  font-weight: 500;
  color: #ffffff;
}
</style>
