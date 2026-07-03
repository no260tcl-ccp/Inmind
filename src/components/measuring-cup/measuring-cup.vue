<template>
  <!-- 
    配置示例参数
    <measuring-cup
        ref="measuringCupRef"
        v-model="currentWater"
        :initial-water="30"
        :max-water="600"
        :step="10"
        :major-scales="[50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550]"
        :minor-scales="[50, 150, 250, 350, 450, 550]"
        @water-change="onWaterChange"
      /> -->
  <view class="measuring-cup-container">
    <!-- 左侧刻度 -->
    <view class="scale scale-left">
      <view
        v-for="scale in majorScales"
        :key="scale"
        class="scale-line"
        :style="getScaleStyle(scale)"
      >
        <!-- 刻度值 -->
        <text
          class="scale-text"
          :style="{ color: scaleValueColor }"
          v-if="!minorScales.includes(scale)"
        >
          {{ scale }}
        </text>
        <!-- 长刻度线 -->
        <view class="scale-line-long" :style="{ background: graduationMark }"></view>
      </view>
    </view>

    <!-- 量杯主体 -->
    <view class="cup-container">
      <!-- 杯体 -->
      <view
        class="cup-body"
        :style="{ borderColor: measuringToolFrame }"
        @touchstart="startDrag"
        @touchmove="onDrag"
        @touchend="endDrag"
      >
        <!-- 水位 -->
        <view class="water-level" :style="waterStyle"></view>
      </view>

      <!-- 水量显示 -->
      <view class="water-info">
        <text class="drag-info" :style="{ color: resultColor }" v-if="dragAmount">
          {{ dragInfo }}
        </text>
        <view class="total-info">
          <view class="total-number" :style="{ color: resultColor }">
            {{ displayWater }}
            <text class="total-unit">{{ unit }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 右侧刻度 -->
    <view class="scale scale-right">
      <view
        v-for="scale in majorScales"
        :key="scale"
        class="scale-line"
        :style="getScaleStyle(scale)"
      >
        <!-- 长刻度线 -->
        <view class="scale-line-long" :style="{ background: graduationMark }"></view>
        <!-- 刻度值 -->
        <text
          class="scale-text"
          :style="{ color: scaleValueColor }"
          v-if="!minorScales.includes(scale)"
        >
          {{ scale }}
        </text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { dragProgressAdjustVibration } from '@/utils'
const props = defineProps({
  // 添加 modelValue 属性用于 v-model 双向绑定
  modelValue: {
    type: Number,
    default: 0,
  },
  // 最大水量（对应368px高度）
  maxWater: {
    type: Number,
    default: 368,
  },
  // 移除 initialWater 属性，使用 modelValue 替代
  // 步长（点击按钮增减量）
  step: {
    type: Number,
    default: 10,
  },
  // 大刻度显示值
  majorScales: {
    type: Array,
    default: () => [50, 100, 150, 200, 250, 300],
  },
  // 不显示的刻度
  minorScales: {
    type: Array,
    default: () => [75, 125, 175, 225, 275],
  },

  // 拖动量展示
  dragAmount: {
    type: Boolean,
    default: false,
  },

  // 边框显示颜色
  measuringToolFrame: {
    type: String,
    default: 'rgba(0, 64, 151, 0.08)',
  },
  // 刻度线颜色
  graduationMark: {
    type: String,
    default: '#EBF0F7',
  },
  // 刻度值颜色
  scaleValueColor: {
    type: String,
    default: 'rgba(0, 64, 151, 0.4)',
  },
  // 填充颜色
  fillColor: {
    type: String,
    default: 'rgba(0, 64, 151, 0.1)',
  },
  // 单位
  unit: {
    type: String,
    default: 'ml',
  },
  // 结果颜色
  resultColor: {
    type: String,
    default: '#004097',
  },
})

// 定义 update:modelValue 事件用于 v-model 双向绑定
const emit = defineEmits(['update:modelValue', 'water-change'])

// 当前水量 - 使用 computed 属性来处理 modelValue
const waterAmount = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
    emit('water-change', value)
  },
})

// 拖动水量
const dragWater = ref(0)
// 是否正在拖动
const isDragging = ref(false)
// 开始拖动的位置
const startY = ref(0)
// 开始拖动时的水量
const startWater = ref(0)

// 显示的总水量（考虑拖动）
const displayWater = computed(() => {
  return Math.max(0, Math.min(props.maxWater, waterAmount.value + dragWater.value))
})

// 拖动信息显示
const dragInfo = computed(() => {
  if (!isDragging.value || dragWater.value === 0) return ''
  const sign = dragWater.value > 0 ? '+' : ''
  return `${sign}${dragWater.value}`
})

// 水位样式
const waterStyle = computed(() => {
  const height = (displayWater.value / props.maxWater) * 368
  return {
    height: `${height}px`,
    backgroundColor: props.fillColor,
  }
})

// 获取刻度样式
const getScaleStyle = (scaleValue) => {
  const top = 368 - (scaleValue / props.maxWater) * 368
  return {
    top: `${top}px`,
  }
}

// 增加水量
const increaseWater = () => {
  dragProgressAdjustVibration(100)
  const newAmount = Math.min(props.maxWater, waterAmount.value + props.step)
  waterAmount.value = newAmount
}

// 减少水量
const decreaseWater = () => {
  dragProgressAdjustVibration(100)
  const newAmount = Math.max(0, waterAmount.value - props.step)
  waterAmount.value = newAmount
}

// 开始拖动
const startDrag = (e) => {
  isDragging.value = true
  startY.value = e.touches[0].clientY
  startWater.value = waterAmount.value
  dragWater.value = 0
}

// 拖动中
const onDrag = (e) => {
  dragProgressAdjustVibration(100)
  if (!isDragging.value) return

  const currentY = e.touches[0].clientY
  const deltaY = startY.value - currentY // 向上拖动为正

  // 计算水量变化（每像素对应的水量）
  const pixelToWater = props.maxWater / 368
  let waterChange = Math.round(deltaY * pixelToWater)

  // 限制范围
  const newTotal = startWater.value + waterChange
  if (newTotal < 0) {
    waterChange = -startWater.value
  } else if (newTotal > props.maxWater) {
    waterChange = props.maxWater - startWater.value
  }

  dragWater.value = waterChange
}

// 结束拖动
const endDrag = () => {
  if (!isDragging.value) return

  isDragging.value = false
  const newWaterAmount = Math.max(0, Math.min(props.maxWater, waterAmount.value + dragWater.value))
  waterAmount.value = newWaterAmount
  dragWater.value = 0
}

// 移除 onMounted 中的初始化，因为现在使用 v-model 控制初始值

defineExpose({
  increaseWater,
  decreaseWater,
  // 添加一个直接设置水量的方法
  setWaterAmount: (amount) => {
    waterAmount.value = Math.max(0, Math.min(props.maxWater, amount))
  },
})
</script>

<style lang="scss" scoped>
/* 样式部分保持不变 */
.measuring-cup-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 210px;
  height: 368px;
  user-select: none;

  .cup-container {
    position: relative;
    width: 163px;
    height: 368px;

    .cup-body {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      cursor: pointer;
      background-color: rgba(255, 255, 255, 0.9);
      border: 2px solid rgba(0, 64, 151, 0.1);
      border-radius: 9px;

      .water-level {
        position: absolute;
        right: 5.5px;
        bottom: 0;
        left: 5.5px;
        width: calc(100% - 11px);
        border-radius: 15px 15px 0 0;
        transition: height 0.3s ease;
      }
    }

    .water-info {
      position: absolute;
      right: 0;
      bottom: 14px;
      left: 0;
      text-align: center;
      pointer-events: none;

      .drag-info {
        display: block;
        margin-bottom: 30px;
        font-size: 14px;
        color: #004097;
      }

      .total-info {
        display: flex;
        align-items: baseline;
        justify-content: center;

        .total-number {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          font-weight: bold;
          color: #004097;
          .total-unit {
            margin-top: 26rpx;
            margin-left: 4px;
            font-size: 18px;
            color: #004 097;
          }
        }
      }
    }
  }

  .scale {
    position: absolute;
    top: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 41px;
    height: 100%;

    &.scale-left {
      left: -17px;

      .scale-line {
        display: flex;
        align-items: center;
        justify-content: flex-end;

        .scale-line-long {
          width: 6px;
          height: 2px;
          background: #ebf0f7;
        }

        .scale-text {
          margin-right: 4px;
          margin-left: 4px;
          font-size: 11px;
          font-weight: bold;
          color: rgba(0, 64, 151, 0.4);
        }
      }
    }

    &.scale-right {
      right: -22px;

      .scale-line {
        display: flex;
        align-items: center;
        justify-content: flex-start;

        .scale-line-long {
          width: 6px;
          height: 2px;
          background: #ebf0f7;
        }

        .scale-text {
          margin-right: 4px;
          margin-left: 4px;
          font-size: 11px;
          font-weight: bold;
          color: rgba(0, 64, 151, 0.4);
        }
      }
    }

    .scale-line {
      position: absolute;
      display: flex;
      align-items: center;
      width: 100%;
      height: 1px;
    }
  }
}
</style>
