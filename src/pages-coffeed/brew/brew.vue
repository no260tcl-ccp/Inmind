

<template>
  <view class="p-2.5 bg-white h-screen overflow-hidden">
    
    <wd-navbar safeAreaInsetTop left-arrow fixed :bordered="false" @click-left="handleBack">
      <template #left>
        <wd-icon name="thin-arrow-left" size="17px"></wd-icon>
      </template>
      <template #title>
        <view class="flex items-center justify-center h-10">
          <wd-img :width="23" :height="23" :src="currentIcon" />
        </view>
      </template>
    </wd-navbar>

    <view class="mt-[12vh] h-[calc(100vh-12vh)] overflow-hidden">
      <extract-content @stepChange="handleStepChange" />
    </view>
    
    </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue' // 補上遺漏的 ref
// 引入子組件
import extractContent from './components/brew-content/brew-content.vue'
//import groupState from './components/group-state/group-state.vue'
import groupState from './components/brew-content/group-state.vue'

const steps = ref([
  { title: '研磨', icon: '/static/images/extract/grind-title.png' },
  { title: '沖煮', icon: '/static/images/extract/brew-title.png' },
  { title: '完成', icon: '/static/images/extract/finish-title.png' },
])

const icons = [
  '/static/images/extract/grind-title.png',
  '/static/images/extract/brew-title.png',
  '/static/images/extract/finish-title.png',
]

const currentIcon = ref(icons[0])

const handleStepChange = (step: number) => {
  currentIcon.value = icons[step]
  console.log('當前步驟:', step)
}

onMounted(() => {
  // 頁面初始化邏輯，比如拉取設備狀態等
})

const handleBack = () => {
  uni.navigateBack({})
}
</script>

<style scoped>
/* 所有 SCSS 已被 Tailwind Utility Classes 取代。
  我們實現了零自定義樣式 (Zero Custom CSS)！
*/
</style>