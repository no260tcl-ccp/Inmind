<template>
  <view class="no-data-container">
    <wd-img v-if="icon" :width="width" :height="height" :src="icon" />
    <view class="message-box">
      <slot name="message">
        <p class="no-data-text">{{ message }}</p>
      </slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps({
  message: {
    type: String,
    default: '暂无数据',
  },
  width: {
    type: Number,
    default: 124,
  },
  height: {
    type: Number,
    default: 100,
  },
  icon: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
.no-data-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* padding: 40rpx; */
  text-align: center;
  color: #999;
}
.message-box {
  margin-top: 44rpx;
}

.no-data-text {
  font-size: 32rpx;
  color: #222222;
}
</style>
