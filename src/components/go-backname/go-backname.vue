<template>
  <!-- 标题组件 -->
  <view class="page-return">
    <view class="arrow" @click="backPage">
      <i class="iconfont icon-a-ze-arrow-leftCopy2"></i>
    </view>
    <view class="module-title">
      {{ title }}
    </view>
    <view class="action"></view>
  </view>
</template>
<script setup>
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  width: {
    type: Number,
    default: 23,
  },
  height: {
    type: Number,
    default: 23,
  },
})
const backPage = () => {
  uni.navigateBack()
}
</script>
<style lang="scss" scoped>
.page-return {
  position: sticky;
  top: 0;
  left: 0;
  z-index: 999;
  display: flex;
  justify-content: flex-start;
  height: 88rpx;
  padding-top: 92rpx;
  background: #ffffff;
}
.page-return .arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120rpx;
  font-size: 40rpx;
  color: #666666;
  .icon-a-ze-arrow-leftCopy2 {
    font-size: 40rpx;
  }
}
.page-return .module-title {
  box-sizing: border-box;
  width: 440rpx;
  padding-left: 70rpx;
  overflow: hidden;
  line-height: 90rpx;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 28rpx;
}
.page-return .action {
  width: 180rpx;
}
</style>
