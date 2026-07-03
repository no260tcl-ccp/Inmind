<template>
  <view class="extract-finish">
    <view class="extract-info">
      <view>
        <view>注水量</view>
        <view class="num">
          {{ (formulaData.powderWaterRatio * formulaData.beanPowderAmount).toFixed(0) }} ml
        </view>
      </view>
      <view class="flex-1 text-center">
        <view>豆粉量</view>
        <view class="num">{{ formulaData.beanPowderAmount }} g</view>
      </view>
      <view>
        <view>粉水比</view>
        <view class="num">{{ `1:${formulaData.powderWaterRatio}` }}</view>
      </view>
    </view>
    <view v-for="(item, index) in finishItems" :key="index" class="finish-item">
      <view class="header">
        <view class="title">{{ item.title }}</view>
        <view class="description" v-if="item.description">{{ item.description }}</view>
      </view>
      <view class="param">
        <view class="flex items-center">
          <wd-img :width="26" :height="26" :src="item.icon" />
          <text>{{ item.volume }}</text>
        </view>
        <view>{{ item.time }}</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { dangweiType } from '@/utils'
const cdnBaseUrl = import.meta.env.VITE_CDN_BASE_URL
const props = defineProps({
  formulaData: {
    type: Object,
    required: true,
  },
})

// const finishItems = [
//   {
//     description: '',
//     title: '研磨',
//     time: '开',
//     volume: `70 ${dangweiType(70)}`,
//     icon: '/static/images/extract/spiral.png',
//   },
//   {
//     description: '3.5ml/s | 93°C',
//     title: '焖蒸',
//     time: '12s',
//     volume: '35ml',
//     icon: '/static/images/extract/center.png',
//   },
//   {
//     description: '3.5ml/s | 93°C',
//     title: '第一段',
//     time: '12s',
//     volume: '35ml',
//     icon: '/static/images/extract/center.png',
//   },
//   {
//     description: '3.5ml/s | 93°C',
//     title: '第二段',
//     time: '12s',
//     volume: '35ml',
//     icon: '/static/images/extract/spiral.png',
//   },
//   {
//     description: '3.5ml/s | 93°C',
//     title: '第三段',
//     time: '12s',
//     volume: '35ml',
//     icon: '/static/images/extract/spiral.png',
//   },
//   {
//     description: '3.5ml/s | 93°C',
//     title: '第四段',
//     time: '12s',
//     volume: '35ml',
//     icon: '/static/images/extract/surround.png',
//   },
// ]
// 动态生成 finishItems
const finishItems = computed(() => {
  const {
    grindGear,
    grindSwitch,
    brewSegmentCount,
    // 解构所有冲煮段相关数据
    ...segmentData
  } = props.formulaData
  const baseItems = [
    {
      description: '',
      title: '研磨',
      time: grindSwitch === 1 ? '开' : '关',
      volume: `${grindGear} ${dangweiType(grindGear)}`,
      icon: '/static/images/extract/grind-finish1.png',
    },
  ]

  const segmentItems = []
  const segmentTitles = ['焖蒸', '第一段', '第二段', '第三段', '第四段']
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

<style lang="scss" scoped>
.extract-finish {
  padding: 0rpx 20rpx 20rpx 20rpx;
  margin-bottom: 20rpx;
  .extract-info {
    display: flex;
    background: #f3f3f3;
    border-radius: 40rpx;
    padding: 36rpx 40rpx;
    margin-bottom: 36rpx;
    font-size: 28rpx;
    color: #666666;
    .num {
      font-size: 36rpx;
      font-weight: 500;
      color: #222222;
      margin-top: 8rpx;
      line-height: 54rpx;
    }
  }
  .finish-item {
    .header {
      display: flex;
      justify-content: space-between;
      line-height: 54rpx;
      height: 54rpx;
      margin-bottom: 14rpx;
      align-items: baseline;
      .title {
        font-size: 32rpx;
      }
      .description {
        font-size: 28rpx;
        color: #666;
      }
    }

    .param {
      border-radius: 12px;
      background: #e5ecf5;
      color: #004097;
      margin-bottom: 36rpx;
      display: flex;
      align-items: center;
      padding: 22rpx;
      justify-content: space-between;
    }
  }
}
</style>
