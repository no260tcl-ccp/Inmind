<template>
  <router-view></router-view>
</template>

<script setup lang="ts">
// 原本 uni-app 的 onLaunch 等邏輯可以視情況改為 onMounted
import { onMounted } from 'vue'

onMounted(() => {
  console.log('App 啟動了')
})
</script>

<style>
/* 全域樣式 */
</style>