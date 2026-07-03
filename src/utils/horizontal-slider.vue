<template>
  <div class="horizontal-slider-container">
    <div class="horizontal-slider-wrapper" :class="{ 'flex-col': isHorizontal }">
      <button
        @click="decreaseValue"
        class="vertical-button"
        v-if="isVertical"
        :style="{
          height: sliderHeight,
          fontSize: textSize + 'px',
          backgroundColor: hexToRgba(sliderColor, 0.1),
          color: textColor,
        }"
        :disabled="sliderValue <= minSliderValue"
      >
        <wd-icon name="decrease" size="16px" style="opacity: 1" :color="textColor"></wd-icon>
      </button>
      <div
        class="horizontal-slider-border"
        :style="{
          borderColor: borderColor,
          borderWidth: borderSize,
          marginLeft: leftMargin ? '10px' : '0px',
        }"
      >
        <div
          class="horizontal-slider"
          ref="sliderTrack"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
          :style="{
            width: sliderWidth,
            height: sliderHeight,
            backgroundColor: sliderBackgroundColor,
          }"
        >
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
            :class="{ 'flex-col': proportion }"
            v-if="showValue"
            :style="{ fontSize: numberSize + 'px', color: textColor }"
          >
            <div v-if="proportion" :style="{ fontSize: numberSize + 'px' }">
              1:{{ sliderValue.toFixed(1) / proportionNumber }}
            </div>
            <div :style="numericalWidth" v-if="!proportion">
              {{ frontDecimal }}{{ Number(sliderValue).toFixed(0) }}
            </div>
            <div class="slider-value-unit" :style="{ color: textColor }">
              {{ unitValue }}
            </div>
          </div>
        </div>
      </div>
      <button
        @click="increaseValue"
        class="vertical-button"
        v-if="isVertical"
        :style="{
          height: sliderHeight,
          fontSize: textSize + 'px',
          backgroundColor: hexToRgba(sliderColor, 0.1),
          color: textColor,
        }"
        :disabled="sliderValue >= maxSliderValue"
      >
        <wd-icon name="add" size="16px" :color="textColor"></wd-icon>
      </button>
      <div class="slider-buttons" v-if="isHorizontal">
        <button
          @click="decreaseValue"
          class="horizonta-button"
          :style="{
            fontSize: textSize + 'px',
            backgroundColor: hexToRgba(sliderColor, 0.1),
            color: textColor,
          }"
          :disabled="sliderValue <= minSliderValue"
        >
          <wd-icon name="decrease" size="16px" style="opacity: 1" :color="textColor"></wd-icon>
        </button>
        <button
          @click="increaseValue"
          class="horizonta-button"
          :style="{
            fontSize: textSize + 'px',
            backgroundColor: hexToRgba(sliderColor, 0.1),
            color: textColor,
          }"
          :disabled="sliderValue >= maxSliderValue"
        >
          <wd-icon name="add" size="16px" :color="textColor"></wd-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { t } from '@/locale'
import { hexToRgba, dragProgressAdjustVibration } from '@/utils'
export default {
  props: {
    proportionNumber: {
      type: Number,
      default: 2,
    },
    accurate: {
      type: Boolean,
      default: false,
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
      default: 'auto',
    },
    sliderHeight: {
      type: String,
      default: '164rpx',
    },
    sliderColor: {
      type: String,
      default: '#004097',
    },
    sliderText: {
      type: String,
      default: 'Text',
    },
    textSize: {
      type: Number,
      default: 14,
    },
    textColor: {
      type: String,
      default: '#004097',
    },
    sliderBackgroundColor: {
      type: String,
      default: '#ffffff',
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
    borderColor: {
      type: String,
      default: '#ebf0f7',
    },
    borderSize: {
      type: String,
      default: '1px',
    },
    isVertical: {
      type: Boolean,
      default: true,
    },
    isHorizontal: {
      type: Boolean,
      default: false,
    },
    numberSize: {
      type: Number,
      default: 32,
    },
    numericalWidth: {
      type: Object,
      default: () => ({}),
    },
    leftMargin: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      // sliderValue:
      //   this.initialValue > this.maxSliderValue ? this.maxSliderValue : this.initialValue,
      sliderValue: this.initialValue,
      isDragging: false,
      trackRect: null, // 儲存軌道的矩形
      startX: 0,
      startY: 0,
      startValue: 0,
      opacity: 0, // 動畫透明度
      increasing: true, // 動畫方向
      animationTimer: null, // 保存動畫的定時器
      hexToRgba,
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
    this.getTrackRect() // 在掛載後立即獲取軌道的矩形
    // if (this.sliderValue === this.minSliderValue) {
    //   this.initCanvas() // 如果初始化值為最小值，啟動動畫
    // }
  },
  methods: {
    initCanvas() {
      if (this.animationTimer) return // 防止重複啟動動畫

      const ctx = uni.createCanvasContext('arrowCanvas', this)

      const drawFrame = () => {
        ctx.clearRect(0, 0, 132, 44) // 清除畫布

        // 繪製第一個箭頭
        this.drawArrow(ctx, 12, 12, this.opacity)

        // 繪製第二個箭頭
        this.drawArrow(ctx, 50, 12, this.opacity * 0.8)

        // 繪製第三個箭頭
        this.drawArrow(ctx, 86, 12, this.opacity * 0.6)

        ctx.draw() // 提交繪製

        // 更新透明度
        if (this.increasing) {
          this.opacity += 0.05
          if (this.opacity >= 1) this.increasing = false
        } else {
          this.opacity -= 0.05
          if (this.opacity <= 0) this.increasing = true
        }

        // 使用定時器繼續下一幀
        this.animationTimer = setTimeout(drawFrame, 16)
      }

      drawFrame()
    },
    drawArrow(ctx, x, y, alpha) {
      ctx.globalAlpha = alpha
      ctx.beginPath()
      ctx.moveTo(x, y) // 起點
      ctx.lineTo(x + 25.5, y) // 頂邊
      ctx.lineTo(x + 34, y + 10) // 右側
      ctx.lineTo(x + 25.5, y + 20) // 底邊
      ctx.lineTo(x, y + 20) // 左側
      ctx.lineTo(x + 8.5, y + 10) // 尾部
      ctx.closePath()

      // 填充顏色
      ctx.setFillStyle('#FFFFFF')
      ctx.fill()

      // 描邊顏色
      ctx.setStrokeStyle('#19191A')
      ctx.setLineWidth(2)
      ctx.stroke()
    },
    stopAnimation() {
      if (!this.animationTimer) return // 如果動畫未啟動，直接退出

      clearTimeout(this.animationTimer) // 停止定時器
      this.animationTimer = null

      // 清除畫布內容
      const ctx = uni.createCanvasContext('arrowCanvas', this)
      ctx.clearRect(0, 0, 132, 44) // 清除畫布內容
      ctx.draw() // 提交清除
    },
    decreaseValue() {
      if (this.sliderValue > this.minSliderValue) {
        this.sliderValue -= this.stepSize
        dragProgressAdjustVibration(100)
        this.$emit('slider-change', this.sliderValue)
      }
    },
    increaseValue() {
      if (this.sliderValue < this.maxSliderValue) {
        this.sliderValue += this.stepSize
        dragProgressAdjustVibration(100)
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

        dragProgressAdjustVibration(100)

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
          console.log('滑塊值已更新為:', newVal)
        },
      })
    },
    setValue(newValue) {
      this.sliderValue = newValue
      // 更新 UI 或執行其他更新邏輯
    },
    setInitialValue(value) {
      this.sliderValue = value
    },
  },
  onUnload() {
    this.stopAnimation() // 頁面卸載時清理動畫
  },
  watch: {
    sliderValue: {
      handler(newVal) {
        console.log('h-slid - watch newVal', newVal)
        if (newVal === this.minSliderValue) {
          // this.initCanvas() // 當滑塊值為最小值時啟動動畫
          this.logValueChanged(newVal) // 關閉震動
        } else if (newVal === this.maxSliderValue) {
          this.logValueChanged(newVal) // 關閉震動
        } else {
          this.stopAnimation() // 停止動畫
        }
      },
      immediate: false,
      deep: false,
    },
    initialValue: {
      handler(newVal) {
        // console.log('initialValue', newVal)
        this.sliderValue = newVal // 更新 sliderValue
      },
      immediate: false, // 如果希望在組件掛載時立即執行一次
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
.horizontal-slider-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}
.vertical-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  border-radius: 9px;
}
.horizontal-slider-border {
  box-sizing: border-box;
  flex: 1;
  width: 100%;
  padding: 2px;
  margin-right: 10px;
  margin-left: 10px;
  border: 1px solid #ffffff;
  border-radius: 9px;
}
.horizontal-slider {
  position: relative;
  overflow: hidden;
  touch-action: pan-x pan-y; /* 修改此處 */
  border-radius: 9px;
  /* 其他樣式保持不變 */
  /* box-shadow:
    rgba(0, 0, 0, 0.16) 0px 3px 6px,
    rgba(0, 0, 0, 0.23) 0px 3px 6px;
  */
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
  opacity: 0.1;
  transition: width 0.1s linear;
}

.slider-left-text {
  position: absolute;
  top: 18px;
  left: 10px;
  z-index: 5;
  font-size: 14px;
  color: white;
  transform: translateY(-50%);
}

.slider-value {
  position: absolute;
  /* top: 75%; */
  right: 10px;
  bottom: 0;
  /* transform: translateY(-50%);
  */
  display: flex;
  font-family: 'DigitalNumbers';
  font-size: 14px;
  color: white;
}

.slider-value-unit {
  /* position: absolute; */
  right: 0;
  bottom: 95%;
  display: contents;
  /* width: 100px; */
  font-size: 14px;
  color: white;
  text-align: right;
}
/* 新增部分 */
.slider-buttons {
  display: flex;
  justify-content: space-between;
  width: 100%; /* 讓按鈕寬度佔滿容器 */
  margin-top: 16rpx;
  /* 控制按鈕與滑塊之間的間距 */
}

.horizonta-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 140rpx;
  height: 60rpx;
  margin: 0;
  border-radius: 30rpx;
}

.slider-arrow {
  position: absolute;
  top: 50%;
  left: 50%;
  font-size: 24px; /* 調整箭頭大小 */
  color: #a1a1a1;
  /* 調整箭頭顏色，可根據需求更改 */
  transform: translate(-50%, -50%); /* 使用 translate 保證精確居中 */
}
</style>