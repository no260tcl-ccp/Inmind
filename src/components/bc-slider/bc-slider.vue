<template>
  <div class="horizontal-slider-container">
    <div
      class="horizontal-slider"
      ref="sliderTrack"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      :style="{ width: sliderWidth, height: sliderHeight, backgroundColor: sliderBackgroundColor }"
    >
      <view class="slider-arrow" v-if="sliderValue === minSliderValue">
        可拖动调整
        <canvas
          canvas-id="arrowCanvas"
          class="arrow-canvas"
          style="width: 132px; height: 44px"
        ></canvas>
      </view>
      <div class="slider-left-text" :style="{ fontSize: textSize + 'px', color: textColor }">
        {{ sliderText }}
      </div>
      <div class="horizontal-slider-handle" :style="{ left: handlePosition + '%' }"></div>
      <div
        class="slider-fill"
        :style="{ width: handleSlideFill + '%', backgroundColor: sliderColor }"
      ></div>
      <div
        class="slider-value"
        v-if="showValue"
        :style="{ fontSize: textSize + 'px', color: textColor }"
      >
        <div v-if="proportion">1:{{ sliderValue.toFixed(1) / proportionNumber }}</div>
        <div v-if="!proportion">{{ frontDecimal }}{{ sliderValue.toFixed(0) }}</div>
        <div class="slider-value-unit" :style="{ fontSize: textSize + 'px', color: textColor }">
          {{ unitValue }}
        </div>
      </div>
    </div>
    <div class="slider-buttons" v-if="accurate">
      <button @click="decreaseValue" :disabled="sliderValue <= minSliderValue">-</button>
      <button @click="increaseValue" :disabled="sliderValue >= maxSliderValue">+</button>
    </div>
  </div>
</template>

<script>
import { t } from '@/locale'

export default {
  props: {
    proportionNumber: {
      type: Number,
      default: 2,
    },
    accurate: {
      type: Boolean,
      default: true,
    },
    proportion: {
      type: Boolean,
      default: false,
    },
    unitValue: {
      type: String,
      default: 'G',
    },
    initialValue: {
      type: Number,
      default: 0,
    },
    sliderWidth: {
      type: String,
      default: '300px',
    },
    sliderHeight: {
      type: String,
      default: '50px',
    },
    sliderColor: {
      type: String,
      default: '#1890ff',
    },
    sliderText: {
      type: String,
      default: 'Text',
    },
    textSize: {
      type: Number,
      default: 16,
    },
    textColor: {
      type: String,
      default: 'white',
    },
    sliderBackgroundColor: {
      type: String,
      default: '#e0e0e0',
    },
    transitionDuration: {
      type: Number,
      default: 0.1,
    },
    showValue: {
      type: Boolean,
      default: true,
    },
    maxSliderValue: {
      type: Number,
      default: 10,
    },
    minSliderValue: {
      type: Number,
      default: 0,
    },
    stepSize: {
      type: Number,
      default: 1,
    },
    frontDecimal: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      sliderValue: this.initialValue,
      isDragging: false,
      trackRect: null, // 存储轨道的矩形
      startX: 0,
      startY: 0,
      startValue: 0,
      opacity: 0, // 动画透明度
      increasing: true, // 动画方向
      animationTimer: null, // 保存动画的定时器
    }
  },
  computed: {
    handlePosition() {
      return (
        ((this.sliderValue - this.minSliderValue) / (this.maxSliderValue - this.minSliderValue)) *
        100
      )
    },
    handleSlideFill() {
      return (
        ((this.sliderValue - this.minSliderValue) / (this.maxSliderValue - this.minSliderValue)) *
        100
      )
    },
  },
  mounted() {
    this.getTrackRect() // 在挂载后立即获取轨道的矩形
    if (this.sliderValue === this.minSliderValue) {
      this.initCanvas() // 如果初始化值为最小值，启动动画
    }
  },
  methods: {
    initCanvas() {
      if (this.animationTimer) return // 防止重复启动动画

      const ctx = uni.createCanvasContext('arrowCanvas', this)

      const drawFrame = () => {
        ctx.clearRect(0, 0, 132, 44) // 清除画布

        // 绘制第一个箭头
        this.drawArrow(ctx, 12, 12, this.opacity)

        // 绘制第二个箭头
        this.drawArrow(ctx, 50, 12, this.opacity * 0.8)

        // 绘制第三个箭头
        this.drawArrow(ctx, 86, 12, this.opacity * 0.6)

        ctx.draw() // 提交绘制

        // 更新透明度
        if (this.increasing) {
          this.opacity += 0.05
          if (this.opacity >= 1) this.increasing = false
        } else {
          this.opacity -= 0.05
          if (this.opacity <= 0) this.increasing = true
        }

        // 使用定时器继续下一帧
        this.animationTimer = setTimeout(drawFrame, 16)
      }

      drawFrame()
    },
    drawArrow(ctx, x, y, alpha) {
      ctx.globalAlpha = alpha
      ctx.beginPath()
      ctx.moveTo(x, y) // 起点
      ctx.lineTo(x + 25.5, y) // 顶边
      ctx.lineTo(x + 34, y + 10) // 右侧
      ctx.lineTo(x + 25.5, y + 20) // 底边
      ctx.lineTo(x, y + 20) // 左侧
      ctx.lineTo(x + 8.5, y + 10) // 尾部
      ctx.closePath()

      // 填充颜色
      ctx.setFillStyle('#FFFFFF')
      ctx.fill()

      // 描边颜色
      ctx.setStrokeStyle('#19191A')
      ctx.setLineWidth(2)
      ctx.stroke()
    },
    stopAnimation() {
      if (!this.animationTimer) return // 如果动画未启动，直接退出

      clearTimeout(this.animationTimer) // 停止定时器
      this.animationTimer = null

      // 清除画布内容
      const ctx = uni.createCanvasContext('arrowCanvas', this)
      ctx.clearRect(0, 0, 132, 44) // 清除画布内容
      ctx.draw() // 提交清除
    },
    decreaseValue() {
      if (this.sliderValue > this.minSliderValue) {
        this.sliderValue -= this.stepSize
        this.$emit('slider-change', this.sliderValue)
      }
    },
    increaseValue() {
      if (this.sliderValue < this.maxSliderValue) {
        this.sliderValue += this.stepSize
        this.$emit('slider-change', this.sliderValue)
      }
    },
    onTouchStart(event) {
      this.isDragging = true
      this.startX = event.touches[0].clientX
      this.startY = event.touches[0].clientY
      this.startValue = this.sliderValue
    },
    onTouchMove(event) {
      if (this.isDragging) {
        const moveX = event.touches[0].clientX - this.startX
        const moveY = event.touches[0].clientY - this.startY
        const isHorizontal = Math.abs(moveX) > Math.abs(moveY)

        if (isHorizontal) {
          this.updateSliderValue(moveX)
        }
      }
    },
    onTouchEnd(event) {
      this.isDragging = false
    },
    updateSliderValue(moveX) {
      if (this.isDragging && this.trackRect) {
        const trackWidth = this.trackRect.width
        const valueRange = this.maxSliderValue - this.minSliderValue
        const valueChange = (moveX / trackWidth) * valueRange

        let newValue = this.startValue + valueChange

        newValue = Math.max(this.minSliderValue, Math.min(this.maxSliderValue, newValue))
        newValue = Math.round(newValue / this.stepSize) * this.stepSize

        this.sliderValue = newValue

        this.$emit('slider-change', this.sliderValue)
      }
    },
    getTrackRect() {
      const query = uni.createSelectorQuery().in(this)
      query
        .select('.horizontal-slider')
        .boundingClientRect((rect) => {
          if (rect) {
            this.trackRect = rect
          }
        })
        .exec()
    },
    logValueChanged(newVal) {
      uni.vibrateLong({
        success() {
          console.log('滑块值已更新为:', newVal)
        },
      })
    },
    setValue(newValue) {
      this.sliderValue = newValue
      // 更新 UI 或执行其他更新逻辑
    },
    setInitialValue(value) {
      this.sliderValue = value
    },
  },
  onUnload() {
    this.stopAnimation() // 页面卸载时清理动画
  },
  watch: {
    sliderValue: {
      handler(newVal) {
        console.log('h-slid - watch newVal', newVal)
        if (newVal === this.minSliderValue) {
          this.initCanvas() // 当滑块值为最小值时启动动画
          this.logValueChanged(newVal) // 关闭震动
        } else if (newVal === this.maxSliderValue) {
          this.logValueChanged(newVal) // 关闭震动
        } else {
          this.stopAnimation() // 停止动画
        }
      },
      immediate: false,
      deep: false,
    },
    initialValue: {
      handler(newVal) {
        console.log('initialValue', newVal)
        this.sliderValue = newVal // 更新 sliderValue
      },
      immediate: false, // 如果希望在组件挂载时立即执行一次
    },
  },
}
</script>

<style scoped>
.horizontal-slider-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.horizontal-slider {
  position: relative;
  overflow: hidden;
  touch-action: pan-x pan-y; /* 修改此处 */
  border: 2px solid #ffffff;
  border-radius: 10px;
  /* 其他样式保持不变 */
  box-shadow:
    rgba(0, 0, 0, 0.16) 0px 3px 6px,
    rgba(0, 0, 0, 0.23) 0px 3px 6px;
}

.horizontal-slider-handle {
  position: absolute;
  top: 50%;
  left: 0;
  z-index: 10;
  width: 10px;
  height: 100%;
  cursor: pointer;
  background-color: transparent;
  transform: translateX(-50%) translateY(-50%);
}

.slider-fill {
  position: absolute;
  top: 0;
  height: 100%;
  background-color: #1890ff;
  transition: width 0.1s linear;
}

.slider-left-text {
  position: absolute;
  top: 50%;
  left: 10px;
  z-index: 5;
  font-size: 16px;
  color: white;
  transform: translateY(-50%);
}

.slider-value {
  position: absolute;
  top: 70%;
  right: 10px;
  font-size: 16px;
  color: white;
  transform: translateY(-50%);
}

.slider-value-unit {
  position: absolute;
  right: 0;
  bottom: 95%;
  width: 100px;
  font-size: 16px;
  color: white;
  text-align: right;
}
/* 新增部分 */
.slider-buttons {
  display: flex;
  gap: 5px;
  justify-content: center;
  width: 100%; /* 让按钮宽度占满容器 */
  margin-top: 5px; /* 控制按钮与滑块之间的间距 */
}

.slider-buttons button {
  width: calc(50% - 2.5px); /* 每个按钮占据一半的宽度减去一半的间距 */
  height: 25px; /* 设置按钮的高度为15px */
  padding: 0; /* 移除默认填充 */
  margin: 0; /* 移除默认外边距 */
  font-size: 16px;
  line-height: 15px; /* 垂直居中文本 */
  color: rgb(0, 0, 0);
  text-align: center; /* 水平居中文本 */
  cursor: pointer;
  background-color: #ffffff;
  border: none;
  border-radius: 10px;
  outline: none;
  box-shadow:
    rgba(0, 0, 0, 0.16) 0px 3px 6px,
    rgba(0, 0, 0, 0.23) 0px 3px 6px;
  transition: background-color 0.2s;
}

.slider-buttons button:hover {
  background-color: #b1b1b1;
}

.slider-buttons button:disabled {
  cursor: not-allowed;
  background-color: #cccccc;
}

.slider-arrow {
  position: absolute;
  top: 50%;
  left: 50%;
  font-size: 24px; /* 调整箭头大小 */
  color: #a1a1a1; /* 调整箭头颜色，可根据需求更改 */
  transform: translate(-50%, -50%); /* 使用 translate 保证精确居中 */
}
</style>
