<template>
  <div id="app">
    <!-- 添加 LINE 外部瀏覽器提示組件 -->
    <LineExternalBrowserPrompt />
    
    <!-- 你的原有內容 -->
    <router-view />
  </div>
</template>

<script setup lang="ts">
import LineExternalBrowserPrompt from '@/components/LineExternalBrowserPrompt.vue'
// 原本 uni-app 的 onLaunch 等邏輯可以視情況改為 onMounted
import { onMounted } from 'vue'

onMounted(() => {
  console.log('App 啟動了')
})
</script>

<style>
/* 全域樣式 */
</style>