<template>
  <!-- 悬浮按钮组件 -->
  <view
    class="floating-button"
    :style="buttonStyle"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @click="handleClick"
    :class="{ 'floating-button--dragging': isDragging }"
  >
    <!-- 插槽用于自定义图标内容 -->
    <slot name="icon">
      <!-- 默认图标 -->
      <view class="default-icon" v-if="!customIcon">
        <text class="icon-text">+</text>
      </view>
    </slot>

    <!-- 自定义图标组件 -->
    <view class="custom-icon" v-if="customIcon">
      <image v-if="iconType === 'image'" :src="customIcon" mode="aspectFit" class="icon-image" />
      <text v-else-if="iconType === 'text'" class="icon-text-custom">{{ customIcon }}</text>
      <uni-icons
        v-else-if="iconType === 'uniicons'"
        :type="customIcon"
        :size="iconSize"
        :color="iconColor"
      />
      <i v-else-if="iconType === 'iconfont'" :class="['iconfont', customIcon]"></i>
    </view>

    <!-- 拖动提示（可选） -->
    <view v-if="showDragHint && isDragging" class="drag-hint">拖动中...</view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

// 组件属性
const props = defineProps({
  // 初始位置 - 底部右侧
  initialPosition: {
    type: Object,
    default: () => ({
      x: 30, // 距离右侧距离(rpx)
      y: 30, // 距离底部距离(rpx)
    }),
  },
  // 按钮大小
  size: {
    type: [String, Number],
    default: 100,
  },
  // 顶部header高度（rpx）
  headerHeight: {
    type: [String, Number],
    default: 88,
  },
  // 是否自动贴边
  autoSnap: {
    type: Boolean,
    default: true,
  },
  // 吸附边距
  snapMargin: {
    type: Number,
    default: 20,
  },
  // z-index
  zIndex: {
    type: Number,
    default: 9999,
  },
  // 自定义背景颜色
  bgColor: {
    type: String,
    default: '#4CAF50',
  },
  // 自定义图标（支持多种类型）
  icon: {
    type: [String, Object],
    default: null,
  },
  // 图标类型：'image' | 'text' | 'uniicons'
  iconType: {
    type: String,
    default: 'text',
    validator: (value) => ['image', 'text', 'uniicons', 'iconfont'].includes(value),
  },
  // 图标大小（仅对uniicons有效）
  iconSize: {
    type: [String, Number],
    default: 24,
  },
  // 图标颜色
  iconColor: {
    type: String,
    default: '#FFFFFF',
  },
  // 是否显示边框
  border: {
    type: Boolean,
    default: false,
  },
  // 边框颜色
  borderColor: {
    type: String,
    default: '#FFFFFF',
  },
  // 边框宽度
  borderWidth: {
    type: Number,
    default: 2,
  },
  // 阴影效果
  shadow: {
    type: Boolean,
    default: true,
  },
  // 是否显示拖动提示
  showDragHint: {
    type: Boolean,
    default: false,
  },
  // 点击防抖时间（毫秒）
  debounceTime: {
    type: Number,
    default: 300,
  },
  // 是否启用拖拽
  draggable: {
    type: Boolean,
    default: true,
  },
})

// 定义事件
const emit = defineEmits([
  'click', // 点击事件
  'drag-start', // 开始拖动
  'drag-move', // 拖动中
  'drag-end', // 结束拖动
  'position-change', // 位置变化
])

// 响应式数据
const buttonPosition = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const startX = ref(0)
const startY = ref(0)
const startLeft = ref(0)
const startTop = ref(0)
const windowWidth = ref(0)
const windowHeight = ref(0)
const buttonSizePx = ref(0)
const headerHeightPx = ref(0)
const canClick = ref(true)
const customIcon = ref(props.icon)

// 监听icon变化
watch(
  () => props.icon,
  (newVal) => {
    customIcon.value = newVal
  },
  { immediate: true },
)

console.log(props.bgColor, '看下背景颜色~~~~~')

// 计算按钮样式
const buttonStyle = computed(() => {
  const style = {
    width: `${props.size}rpx`,
    height: `${props.size}rpx`,
    left: `${buttonPosition.value.x}rpx`,
    top: `${buttonPosition.value.y}rpx`,
    'z-index': props.zIndex,
    'background-color': props.bgColor,
  }

  // 添加边框
  if (props.border) {
    style.border = `${props.borderWidth}rpx solid ${props.borderColor}`
  }

  // 添加阴影
  if (props.shadow) {
    style['box-shadow'] = '0 4rpx 12rpx rgba(0, 0, 0, 0.15)'
  }

  // 添加圆角
  style['border-radius'] = '50%'

  return style
})

// 初始化函数
const init = () => {
  const systemInfo = uni.getSystemInfoSync()
  windowWidth.value = systemInfo.windowWidth
  windowHeight.value = systemInfo.windowHeight

  // 将rpx转换为px
  const scale = windowWidth.value / 750
  buttonSizePx.value = props.size * scale
  headerHeightPx.value = props.headerHeight * scale

  // 设置初始位置
  setInitialPosition()
}

// 设置初始位置
const setInitialPosition = () => {
  const scale = windowWidth.value / 750

  // 计算初始位置（从右侧和底部计算）
  const initialX = windowWidth.value - props.initialPosition.x * scale - buttonSizePx.value
  const initialY = windowHeight.value - props.initialPosition.y * scale - buttonSizePx.value

  // 确保在header下方
  const safeY = Math.max(initialY, headerHeightPx.value)

  // 转换为rpx存储
  buttonPosition.value = {
    x: initialX / scale,
    y: safeY / scale,
  }
}

// 触摸开始
const handleTouchStart = (e) => {
  if (!props.draggable) return

  const touch = e.touches[0]
  startX.value = touch.clientX
  startY.value = touch.clientY
  startLeft.value = buttonPosition.value.x
  startTop.value = buttonPosition.value.y
  isDragging.value = true

  emit('drag-start', {
    x: buttonPosition.value.x,
    y: buttonPosition.value.y,
  })
}

// 触摸移动
const handleTouchMove = (e) => {
  if (!props.draggable || !isDragging.value) return

  const touch = e.touches[0]
  const scale = windowWidth.value / 750
  const deltaX = touch.clientX - startX.value
  const deltaY = touch.clientY - startY.value

  // 计算新位置（px）
  let newX = startLeft.value * scale + deltaX
  let newY = startTop.value * scale + deltaY

  // 限制在屏幕范围内（水平方向）
  newX = Math.max(0, Math.min(newX, windowWidth.value - buttonSizePx.value))

  // 限制不能超过顶部header（垂直方向）
  newY = Math.max(headerHeightPx.value, Math.min(newY, windowHeight.value - buttonSizePx.value))

  // 转换为rpx
  buttonPosition.value = {
    x: newX / scale,
    y: newY / scale,
  }

  // 触发拖动事件
  emit('drag-move', {
    x: buttonPosition.value.x,
    y: buttonPosition.value.y,
    deltaX,
    deltaY,
  })

  // 阻止页面滚动
  e.preventDefault()
}

// 触摸结束
const handleTouchEnd = () => {
  if (!props.draggable) return

  isDragging.value = false

  // 自动贴边
  if (props.autoSnap) {
    autoSnapToEdge()
  }

  // 触发结束事件
  emit('drag-end', {
    x: buttonPosition.value.x,
    y: buttonPosition.value.y,
  })

  // 触发位置变化事件
  emit('position-change', buttonPosition.value)
}

// 自动贴边到最近边缘
const autoSnapToEdge = () => {
  const scale = windowWidth.value / 750
  const currentX = buttonPosition.value.x * scale
  const centerX = windowWidth.value / 2

  // 判断靠近哪一侧
  if (currentX < centerX) {
    // 靠近左侧
    buttonPosition.value.x = props.snapMargin
  } else {
    // 靠近右侧
    buttonPosition.value.x = windowWidth.value / scale - props.size - props.snapMargin
  }
}

// 点击事件（带防抖）
const handleClick = () => {
  if (!canClick.value || isDragging.value) return

  // 防抖处理
  canClick.value = false
  emit('click')

  setTimeout(() => {
    canClick.value = true
  }, props.debounceTime)
}

// 重置位置方法
const resetPosition = () => {
  setInitialPosition()
}

// 移动到指定位置方法（rpx单位）
const moveToPosition = (x, y) => {
  const scale = windowWidth.value / 750

  // 限制在安全区域内
  const safeX = Math.max(0, Math.min(x, windowWidth.value / scale - props.size))
  const safeY = Math.max(props.headerHeight, Math.min(y, windowHeight.value / scale - props.size))

  buttonPosition.value = {
    x: safeX,
    y: safeY,
  }

  // 触发位置变化事件
  emit('position-change', buttonPosition.value)
}

// 显示/隐藏方法
const showButton = () => {
  // 这里可以使用动画类名
  console.log('显示按钮')
}

const hideButton = () => {
  // 这里可以使用动画类名
  console.log('隐藏按钮')
}

// 暴露方法给父组件
defineExpose({
  resetPosition,
  moveToPosition,
  showButton,
  hideButton,
  getCurrentPosition: () => buttonPosition.value,
})

// 生命周期
onMounted(() => {
  init()

  // 监听窗口变化
  uni.onWindowResize((res) => {
    if (res.size) {
      windowWidth.value = res.size.windowWidth
      windowHeight.value = res.size.windowHeight
      // 重新计算位置
      const scale = windowWidth.value / 750
      buttonSizePx.value = props.size * scale
      headerHeightPx.value = props.headerHeight * scale

      // 确保按钮在安全区域内
      const currentX = buttonPosition.value.x * scale
      const currentY = buttonPosition.value.y * scale

      if (currentX > windowWidth.value - buttonSizePx.value) {
        buttonPosition.value.x = windowWidth.value / scale - props.size - props.snapMargin
      }

      if (currentY > windowHeight.value - buttonSizePx.value) {
        buttonPosition.value.y = windowHeight.value / scale - props.size - props.snapMargin
      }

      if (currentY < headerHeightPx.value) {
        buttonPosition.value.y = props.headerHeight + props.snapMargin
      }
    }
  })
})
</script>

<style lang="scss" scoped>
.iconfont {
  font-size: 40rpx;
  color: v-bind('props.iconColor');
}
.floating-button {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: none;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    opacity 0.3s ease;
}

.floating-button--dragging {
  opacity: 0.8;
  transform: scale(1.1);
}

.default-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.icon-text {
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
}

.icon-text-custom {
  font-size: 32rpx;
  font-weight: bold;
  color: v-bind('props.iconColor');
}

.icon-image {
  width: 60%;
  height: 60%;
}

.drag-hint {
  position: absolute;
  top: -60rpx;
  left: 50%;
  z-index: 10000;
  padding: 8rpx 16rpx;
  font-size: 24rpx;
  color: white;
  white-space: nowrap;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 20rpx;
  transform: translateX(-50%);
}
/* 点击效果 */
.floating-button:active {
  transform: scale(0.95);
}
</style>
