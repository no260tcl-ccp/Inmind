<template>
  <!-- 标题组件 -->
  <view class="page-return">
    <view class="arrow" @click="backPage">
      <i class="iconfont icon-a-ze-arrow-leftCopy2"></i>
    </view>
    <view class="icon-logo">
      <wd-img :width="width" :height="height" :src="props.titleUrl"></wd-img>
    </view>
    <view class="action"></view>
  </view>
</template>
<script setup>
const props = defineProps({
  titleUrl: {
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
.page-return .icon-logo {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
}
.page-return .action {
  width: 120rpx;
}
</style>
