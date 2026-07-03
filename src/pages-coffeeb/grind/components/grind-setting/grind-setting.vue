<template>
  <view>
    <wd-toast />
    <view class="mt-3">
      <horizontal-slidert
        ref="gearSlider"
        :initialValue="gear"
        sliderText="档位"
        @slider-change="handleSliderChangeGear"
        :maxSliderValue="80"
        :minSliderValue="1"
        :unitValue="dangweiType"
        :stepSize="1"
        :showValue="true"
      />
    </view>
    <view class="mt-3">
      <horizontal-slidert
        ref="speedSlider"
        :initialValue="speed"
        sliderText="研磨转速"
        @slider-change="handleSliderChangeSpeed"
        :maxSliderValue="160"
        :minSliderValue="120"
        unitValue="RPM"
        :stepSize="10"
        :showValue="true"
      />
    </view>
    <view class="mt-5">
      <wd-button block size="large" type="error" @click="start">
        <view class="btn-box">
          <wd-img :width="16" :height="16" :src="`/static/images/extract/grind-active.png`" />
          <text class="ml-1">开始</text>
        </view>
      </wd-button>
      <view class="tips">请将适量咖啡豆倒入上方豆槽</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'wot-design-uni'

const emit = defineEmits(['start'])
const props = defineProps({
  objData: {
    type: Object,
    required: true,
    default: () => ({}),
  },
})
watch(
  () => props.objData,
  (newVal) => {
    if (newVal.gear) {
      gear.value = newVal.gear
    }
    if (newVal.speed) {
      speed.value = newVal.speed
    }
  },
  { deep: true, immediate: true },
)

// 档位
const gear = ref<number>(70)
// 转速
const speed = ref<number>(160)
// 轻提示
const toast = useToast()

const start = async () => {
  emit('start', { gear: gear.value, speed: speed.value, startStop: 0 })
}
const handleSliderChangeGear = (value: number) => {
  gear.value = value
}

const handleSliderChangeSpeed = (value: number) => {
  speed.value = value
}
const dangweiType = computed(() => {
  const dangwei = gear.value

  if (dangwei > 65) {
    return '法压冷萃'
  }

  if (dangwei > 30 && dangwei <= 65) {
    return '手冲咖啡'
  }

  if (dangwei > 15 && dangwei <= 30) {
    return '爱乐压'
  }

  if (dangwei > 0 && dangwei <= 15) {
    return '意式浓缩'
  }

  return '' // 如果 dangwei <= 0，则返回空字符串或其他默认值
})
onMounted(() => {})
</script>

<style lang="scss" scoped>
.tips {
  margin-top: 32rpx;
  font-size: 28rpx;
  color: #e51f4d;
  text-align: center;
}
.btn-box {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
