<template>
  <view class="add-bean-tips">
    <view class="show-quick" :style="bgStyle">
      <view class="tips1">请加入咖啡豆</view>
      <view class="tips2">请将咖啡豆倒入机器上方的豆槽中 倒入后点【下一步】开始研磨</view>
    </view>
    <view class="close">
      <view class="btn-start" @click="handleStart">下一步</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'wot-design-uni'
const aliyunBaseUrl = import.meta.env.VITE_COFFEE_BASE_URL
const addBeanTipsImg = ref<string>(`${aliyunBaseUrl}add-bean-tips.png`)
const bgStyle = computed(() => ({
  'background-image': `url('${addBeanTipsImg.value}')`,
}))
const closeImg = ref<string>(`${aliyunBaseUrl}close-quick.png`)
const emit = defineEmits(['nextStep'])
const handleStart = async () => {
  emit('nextStep')
}
</script>

<style lang="scss" scoped>
.add-bean-tips {
  height: 100%;
  .show-quick {
    width: 590rpx;
    height: 630rpx;
    background-size: 100% 100%;
    .tips1 {
      padding-top: 52rpx;
      font-size: 36rpx;
      color: #ffffff;
      text-align: center;
    }
    .tips2 {
      box-sizing: border-box;
      padding: 0 80rpx;
      margin-top: 20rpx;
      font-size: 28rpx;
      line-height: 46rpx;
      color: rgba(255, 255, 255, 0.6);
      text-align: center;
    }
  }

  .close {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 50rpx;
    .btn-start {
      width: 570rpx;
      height: 92rpx;
      font-size: 28rpx;
      line-height: 92rpx;
      color: #004097;
      text-align: center;
      background: #ffffff;
      border-radius: 50rpx;
    }
  }
}
</style>
