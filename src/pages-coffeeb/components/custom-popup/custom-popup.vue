<template>
  <!-- 遮罩层 -->
  <view v-if="show" class="popup-mask" :style="maskStyle" @tap="handleMaskClick">
    <!-- 弹窗内容 -->
    <view
      class="popup-content"
      :class="[position, customClass]"
      :style="contentStyle"
      @tap.stop="stopPropagation"
    >
      <!-- 头部插槽 -->
      <view v-if="$slots.header" class="popup-header">
        <slot name="header"></slot>
      </view>

      <!-- 默认插槽 - 主要内容 -->
      <view class="popup-body">
        <slot></slot>
      </view>

      <!-- 操作按钮插槽 -->
      <view v-if="$slots.actions" class="popup-actions">
        <slot name="actions"></slot>
      </view>

      <!-- 关闭按钮 -->
      <view v-if="showClose" class="popup-close" :style="closeButtonStyle" @tap="handleClose">
        <i class="iconfont icon-a-juxing207"></i>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

// 定义 props
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  position: {
    type: String,
    default: 'center',
  },
  backgroundColor: {
    type: String,
    default: '#ffffff',
  },
  maskBackgroundColor: {
    type: String,
    default: 'rgba(0, 0, 0, 0.5)',
  },
  width: {
    type: String,
    default: '600rpx',
  },
  height: {
    type: String,
    default: '400rpx',
  },
  borderRadius: {
    type: String,
    default: '16rpx',
  },
  showClose: {
    type: Boolean,
    default: false,
  },
  maskClosable: {
    type: Boolean,
    default: true,
  },
  customClass: {
    type: String,
    default: '',
  },
  customStyle: {
    type: Object,
    default: () => ({}),
  },
  closeButton: {
    type: Object,
    default: () => ({}),
  },
})
const {
  show,
  position,
  backgroundColor,
  maskBackgroundColor,
  width,
  height,
  borderRadius,
  showClose,
  maskClosable,
  customClass,
  customStyle,
  closeButton,
} = toRefs(props)
const emit = defineEmits(['update:show', 'close'])

// 遮罩样式
const maskStyle = computed(() => {
  return {
    backgroundColor: props.maskBackgroundColor,
  }
})

// 内容区域样式
const contentStyle = computed(() => {
  const baseStyle = {
    backgroundColor: props.backgroundColor,
    borderRadius: props.borderRadius,
    ...props.customStyle,
  }

  // 根据位置设置宽高
  if (['left', 'right'].includes(props.position)) {
    baseStyle.width = props.width
  }
  if (['top', 'bottom'].includes(props.position)) {
    baseStyle.height = props.height
  }

  return baseStyle
})

// 关闭按钮
const closeButtonStyle = computed(() => {
  return closeButton.value
})

// 阻止事件冒泡
const stopPropagation = (e) => {
  // 什么都不做，只是阻止冒泡
}

// 点击遮罩
const handleMaskClick = () => {
  if (props.maskClosable) {
    handleClose()
  }
}

// 关闭弹窗
const handleClose = () => {
  emit('update:show', false)
  emit('close')
}
</script>

<style lang="scss" scoped>
.popup-mask {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.popup-content {
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: transparent;
}
/* 位置样式 */
.popup-content.center {
  max-width: 80%;
  max-height: 80%;
  margin: auto;
}

.popup-content.top {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  border-radius: 0 0 16rpx 16rpx;
}

.popup-content.bottom {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  border-radius: 16rpx 16rpx 0 0;
}

.popup-content.left {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  border-radius: 0 16rpx 16rpx 0;
}

.popup-content.right {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  border-radius: 16rpx 0 0 16rpx;
}
/* 其他样式保持不变 */
.popup-header {
  padding: 32rpx 32rpx 0;
  padding-bottom: 24rpx;
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  border-bottom: 2rpx solid #f0f0f0;
}

.popup-body {
  flex: 1;
  padding: 32rpx;
  overflow: auto;
}

.popup-actions {
  display: flex;
  gap: 20rpx;
  justify-content: flex-end;
  padding: 0 32rpx 32rpx;
}

.popup-close {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 66rpx;
  height: 66rpx;
  font-size: 32rpx;
  color: #666;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  .icon-a-juxing207 {
    font-size: 32rpx;
    color: #004097;
  }
}
</style>
