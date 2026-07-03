<template>
  <view class="px-2.5 pb-2.5 mb-2.5">
    
    <view class="flex bg-gray-100 rounded-3xl py-[18px] px-5 mb-[18px] text-sm text-gray-600">
      <view>
        <view>注水量</view>
        <view class="mt-1 text-lg font-medium leading-[27px] text-gray-900">
          {{ (formulaData.powderWaterRatio * formulaData.beanPowderAmount).toFixed(0) }} ml
        </view>
      </view>
      
      <view class="flex-1 text-center">
        <view>豆粉量</view>
        <view class="mt-1 text-lg font-medium leading-[27px] text-gray-900">
          {{ formulaData.beanPowderAmount }} g
        </view>
      </view>
      
      <view>
        <view>粉水比</view>
        <view class="mt-1 text-lg font-medium leading-[27px] text-gray-900">
          {{ `1:${formulaData.powderWaterRatio}` }}
        </view>
      </view>
    </view>

    <view v-for="(item, index) in finishItems" :key="index">
      
      <view class="flex items-baseline justify-between h-[27px] mb-[7px] leading-[27px]">
        <view class="text-base">{{ item.title }}</view>
        <view class="text-sm text-gray-600" v-if="item.description">{{ item.description }}</view>
      </view>
      
      <view class="flex items-center justify-between p-[11px] mb-[18px] rounded-lg bg-brand-light text-brand">
        <view class="flex items-center">
          <wd-img :width="26" :height="26" :src="item.icon" />
          <text class="ml-1">{{ item.volume }}</text>
        </view>
        <view>{{ item.time }}</view>
      </view>
      
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
//import { dangweiType } from '@/utils/index'
const cdnBaseUrl = import.meta.env.VITE_CDN_BASE_URL
const props = defineProps({
  formulaData: {
    type: Object,
    required: true,
  },
})

// 動態生成 finishItems
const finishItems = computed(() => {
  const {
    grindGear,
    grindSwitch,
    brewSegmentCount,
    // 解構所有沖煮段相關資料
    ...segmentData
  } = props.formulaData
  
  const baseItems = [
    {
      description: '',
      title: '研磨',
      time: grindSwitch === 1 ? '開' : '關',
      volume: `${grindGear} ${dangweiType(grindGear)}`,
      icon: '/static/images/extract/grind-finish1.png',
    },
  ]

  const segmentItems = []
  const segmentTitles = ['悶蒸', '第一段', '第二段', '第三段', '第四段']
  const segmentIcons = [
    '/static/images/extract/center.png',
    '/static/images/extract/spiral.png',
    '/static/images/extract/surround.png',
  ]

  for (let i = 0; i < Math.min(brewSegmentCount, 5); i++) {
    const waterAmount = segmentData[`segment${i}WaterAmount`]
    const flowRate = segmentData[`segment${i}FlowRate`]
    const temperature = segmentData[`segment${i}Temperature`]
    const residenceTime = segmentData[`segment${i}ResidenceTime`]

    segmentItems.push({
      description: `${flowRate}ml/s | ${temperature}°C`,
      title: segmentTitles[i],
      time: `${residenceTime}s`,
      volume: `${waterAmount}ml`,
      icon: segmentIcons[segmentData[`segment${i}WaterType`]],
    })
  }

  return [...baseItems, ...segmentItems]
})
</script>

<style scoped>
/* 所有 SCSS 已被 Tailwind Utility Classes 取代。
  我們實現了零自定義樣式 (Zero Custom CSS)！
*/
</style>