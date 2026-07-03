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
        <van-icon name="minus" size="16px" :color="textColor" />
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
          <div class="slider-fill" :style="{ width: handleSlideFill + '%', backgroundColor: sliderColor }"></div>
          
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
        <van-icon name="plus" size="16px" :color="textColor" />
      </button>

      <div class="slider-buttons" v-if="isHorizontal">
        <button
          @click="decreaseValue"
          class="horizonta-button"
          :style="{ fontSize: textSize + 'px', backgroundColor: hexToRgba(sliderColor, 0.1), color: textColor }"
          :disabled="sliderValue <= minSliderValue"
        >
          <van-icon name="minus" size="16px" :color="textColor" />
        </button>
        <button
          @click="increaseValue"
          class="horizonta-button"
          :style="{ fontSize: textSize + 'px', backgroundColor: hexToRgba(sliderColor, 0.1), color: textColor }"
          :disabled="sliderValue >= maxSliderValue"
        >
          <van-icon name="plus" size="16px" :color="textColor" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { hexToRgba, dragProgressAdjustVibration } from '@/utils'

const props = defineProps({
  proportionNumber: { type: Number, default: 2 },
  accurate: { type: Boolean, default: false },
  proportion: { type: Boolean, default: false },
  unitValue: { type: String, default: 'G' },
  initialValue: { type: Number, default: 0 },
  sliderWidth: { type: String, default: 'auto' },
  // 🌟🌟🌟 把下面這行的 '164rpx' 改成 '60px' 🌟🌟🌟
  sliderHeight: { type: String, default: '60px' },
  sliderColor: { type: String, default: '#004097' },
  sliderText: { type: String, default: 'Text' },
  textSize: { type: Number, default: 14 },
  textColor: { type: String, default: '#004097' },
  sliderBackgroundColor: { type: String, default: '#ffffff' },
  showValue: { type: Boolean, default: true },
  maxSliderValue: { type: Number, default: 10 },
  minSliderValue: { type: Number, default: 0 },
  stepSize: { type: Number, default: 1 },
  frontDecimal: { type: String, default: '' },
  borderColor: { type: String, default: '#ebf0f7' },
  borderSize: { type: String, default: '1px' },
  isVertical: { type: Boolean, default: true },
  isHorizontal: { type: Boolean, default: false },
  numberSize: { type: Number, default: 32 },
  numericalWidth: { type: Object, default: () => ({}) },
  leftMargin: { type: Boolean, default: true },
})

const emit = defineEmits(['slider-change'])

const sliderValue = ref(props.initialValue)
const isDragging = ref(false)
const startX = ref(0)
const startY = ref(0)
const startValue = ref(0)
const sliderTrack = ref<HTMLElement | null>(null)
const trackRect = ref<DOMRect | null>(null)

const handlePosition = computed(() => {
  return ((sliderValue.value - props.minSliderValue) / (props.maxSliderValue - props.minSliderValue)) * 100
})
const handleSlideFill = computed(() => handlePosition.value)

const safeVibrate = () => {
  try {
    if (typeof dragProgressAdjustVibration === 'function') dragProgressAdjustVibration(100)
    else if (navigator.vibrate) navigator.vibrate(50)
  } catch (e) {}
}

const decreaseValue = () => {
  if (sliderValue.value > props.minSliderValue) {
    sliderValue.value -= props.stepSize
    safeVibrate()
    emit('slider-change', sliderValue.value)
  }
}

const increaseValue = () => {
  if (sliderValue.value < props.maxSliderValue) {
    sliderValue.value += props.stepSize
    safeVibrate()
    emit('slider-change', sliderValue.value)
  }
}

const getTrackRect = () => {
  if (sliderTrack.value) {
    trackRect.value = sliderTrack.value.getBoundingClientRect()
  }
}

const onTouchStart = (event: TouchEvent) => {
  isDragging.value = true
  startX.value = event.touches[0].clientX
  startY.value = event.touches[0].clientY
  startValue.value = sliderValue.value
  getTrackRect()
}

const onTouchMove = (event: TouchEvent) => {
  if (!isDragging.value || !trackRect.value) return
  const moveX = event.touches[0].clientX - startX.value
  const moveY = event.touches[0].clientY - startY.value
  
  if (Math.abs(moveX) > Math.abs(moveY)) {
    event.preventDefault() // 防止滾動
    const trackWidth = trackRect.value.width
    const valueRange = props.maxSliderValue - props.minSliderValue
    let newValue = startValue.value + (moveX / trackWidth) * valueRange

    newValue = Math.max(props.minSliderValue, Math.min(props.maxSliderValue, newValue))
    newValue = Math.round(newValue / props.stepSize) * props.stepSize

    if (sliderValue.value !== newValue) {
      sliderValue.value = newValue
      safeVibrate()
      emit('slider-change', sliderValue.value)
    }
  }
}

const onTouchEnd = () => { isDragging.value = false }

onMounted(() => { getTrackRect() })

watch(() => props.initialValue, (newVal) => { sliderValue.value = newVal })
</script>

<style scoped>
/* 樣式保持原樣，僅微調以符合網頁標準 */
.horizontal-slider-container { position: relative; display: flex; flex-direction: column; align-items: center; }
.horizontal-slider-wrapper { position: relative; display: flex; align-items: center; width: 100%; }
.vertical-button { display: flex; align-items: center; justify-content: center; width: 30px; border-radius: 9px; border: none; cursor: pointer; }
.horizontal-slider-border { box-sizing: border-box; flex: 1; width: 100%; padding: 2px; margin: 0 10px; border-style: solid; border-radius: 9px; }
.horizontal-slider { position: relative; overflow: hidden; touch-action: none; border-radius: 9px; }
.horizontal-slider-handle { position: absolute; top: 50%; left: 0; z-index: 10; width: 10px; height: 100%; cursor: pointer; background-color: transparent; transform: translateX(-50%) translateY(-50%); }
.slider-fill { position: absolute; top: 0; height: 100%; opacity: 0.1; transition: width 0.1s linear; }
.slider-left-text { position: absolute; top: 18px; left: 10px; z-index: 5; font-size: 14px; transform: translateY(-50%); }
.slider-value { position: absolute; right: 10px; bottom: 0; display: flex; font-family: 'DigitalNumbers'; font-size: 14px; }
.slider-value-unit { display: contents; font-size: 14px; text-align: right; }
.slider-buttons { display: flex; justify-content: space-between; width: 100%; margin-top: 16px; }
.horizonta-button { display: flex; align-items: center; justify-content: center; width: 70px; height: 30px; margin: 0; border-radius: 15px; border: none; cursor: pointer; }
</style>