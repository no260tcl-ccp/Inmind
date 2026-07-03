<route lang="json5">
{
  style: {
    navigationBarTitleText: '沖煮完成',
    navigationStyle: 'custom',
  },
}
</route>

<template>
  <view class="h-screen bg-white">
    <go-back :titleUrl="titleUrl"></go-back>
    
    <view class="mt-[31px] text-[32px] text-center text-gray-900">沖煮完成</view>
    
    <view class="mt-3 text-sm text-center text-gray-900">開始享受您的咖啡吧~</view>
    
    <view class="flex items-center justify-center mt-[73px]">
      <wd-img
        :width="257"
        :height="226"
        src="https://bincoo.oss-cn-beijing.aliyuncs.com/update/2025/10/14/game-over.png"
      ></wd-img>
    </view>
    
    <view class="flex items-center justify-center mt-[74px]">
      <view class="flex items-center justify-center w-[210px] h-[52px] text-base text-white transition-opacity cursor-pointer bg-success rounded-2xl hover:opacity-80">
        <i class="inline-block mr-1.5 iconfont icon-fanhui"></i>
        返回
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const titleUrl = ref('https://bincoo.oss-cn-beijing.aliyuncs.com/update/2025/10/14/water.png')
</script>

<style scoped>
/* 所有 SCSS 已被 Tailwind Utility Classes 取代。
   我們實現了零自定義樣式 (Zero Custom CSS)！
*/
</style>