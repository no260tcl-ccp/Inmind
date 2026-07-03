<template>
  <view class="phase-item" v-for="item in phaseData" :key="item.name">
    <PhaseSlidert
      :enterIcon="item.enterIcon"
      :stageName="item.name"
      :currentCapacity="item.currentCapacity"
      :targetCapacity="item.targetCapacity"
      :temperature="item.temperature"
      :flowVelocity="item.flowVelocity"
      :totalTime="item.totalTime"
      :includingTime="item.includingTime"
      @slider-change="handleSliderChangeWater"
      :maxSliderValue="item.targetCapacity"
      :minSliderValue="0"
      unitValue="ml"
      :stepSize="1"
      :showValue="true"
      sliderHeight="86rpx"
      :numberSize="12"
    />
  </view>
</template>
<script lang="ts" setup>
import { ref, toRefs } from 'vue'
import PhaseSlidert from '../phase-slidert/phase-slidert.vue'

// 定义phaseData数组元素的类型
interface PhaseItem {
  name: string
  [key: string]: any // 允许其他属性
}

const props = defineProps({
  phaseData: {
    type: Array as () => PhaseItem[],
    default: () => [],
  },
})

const { phaseData } = toRefs(props)
const handleSliderChangeWater = (value) => {
  console.log('Water value:', value)
}
</script>
<style lang="scss" scoped>
.phase-item {
  margin-bottom: 44rpx;
}
</style>
