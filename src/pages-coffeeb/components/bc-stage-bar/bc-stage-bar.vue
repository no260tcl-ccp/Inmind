<template>
  <view class="stage-container">
    <view
      class="stage"
      v-for="(stage, index) in stages"
      :style="{ width: `${barWidth}%` }"
      :key="index"
    >
      <view class="volume-bar">
        <span
          class="volume-bar-fill"
          :style="{ height: `${stage.water / scale}px`, width: '100%' }"
        ></span>
        <div class="volume-text" :style="{ bottom: `${stage.water / scale + 6}px` }">
          {{ stage.water }}ml
        </div>
      </view>
      <view class="pressure">
        <!-- <wd-img
          :width="17"
          v-if="stage.type === 0"
          :height="17"
          src="/static/images/formula/center2.png"
        />
        <wd-img
          :width="17"
          v-else-if="stage.type === 1"
          :height="17"
          src="/static/images/formula/spiral2.png"
        />
        <wd-img :width="17" v-else :height="17" src="/static/images/formula/surround2.png" /> -->
        <i v-if="stage.type === 0" class="iconfont icon-juzhong"></i>
        <i v-else-if="stage.type === 1" class="iconfont icon-luoxuan"></i>
        <i v-else class="iconfont icon-huanrao"></i>
        <view class="ml-1.5">{{ stage.temperature }}℃</view>
      </view>
      <view class="stage-name">
        {{ stage.paragraph }}
        <text class="ml-1.5">{{ stage.time }}s</text>
      </view>
      <view class="stage-velocity">3.{{ stage.velocity }}ml/s</view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  stages: {
    type: Array,
    required: true,
  },
})
// 计算柱子宽度
const barWidth = computed(() => {
  const totalWidth = 100 // 假设容器总宽度为100%，可按需调整
  // return totalWidth / props.stages.length
  return totalWidth / props.stages.length
})
const scale = computed(() => {
  const maxWater = Math.max(...props.stages.map((stage) => stage.water))
  return maxWater / 150
})
</script>

<style scoped>
.stage-container {
  display: flex;
  justify-content: space-around;
  padding: 0 40rpx;
  font-family: 'DigitalNumbers';
}
.stage {
  width: 30%;
  padding: 20rpx 12rpx;
  text-align: center;
}
.volume-bar {
  position: relative;
  height: 340rpx;
  margin-bottom: 20rpx;
}
.volume-bar-fill {
  position: absolute;
  bottom: 0;
  display: block;
  max-height: 300rpx;
  background: #004097;
  border-radius: 20rpx;
  opacity: 0.1;
}
.volume-text {
  position: absolute;
  left: 50%;
  z-index: 1;
  margin: 0;
  font-size: 28rpx;
  color: #004097;
  transform: translateX(-50%);
}
.pressure {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20rpx;
  font-size: 26rpx;
}
.stage-name {
  margin-top: 20rpx;
  font-size: 26rpx;
  color: #004097;
}
.stage-velocity {
  margin-top: 20rpx;
  font-size: 24rpx;
  line-height: 36rpx;
  color: #222222;
}
.iconfont {
  font-size: 13px;
}
</style>
