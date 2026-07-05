<template>
  <view class="grinder-page">
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
    <view class="extract-container">
      <extract-content @stepChange="handleStepChange" />
    </view>
    <!-- <group-state
      :buttonTexts="[
        { text: '研磨', state: true, icon: 'grind' },
        { text: '冲煮', state: false, icon: 'brew' },
        { text: '完成', state: false, icon: 'finish' },
      ]"
    /> -->
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
// 引入子组件
import extractContent from './components/brew-content/brew-content.vue'
// import groupState from './components/group-state/group-state.vue'
const steps = ref([
  { title: '研磨', icon: '/static/images/extract/grind-title.png' },
  { title: '冲煮', icon: '/static/images/extract/brew-title.png' },
  { title: '完成', icon: '/static/images/extract/finish-title.png' },
])
const icons = [
  '/static/images/extract/grind-title.png',
  '/static/images/extract/brew-title.png',
  '/static/images/extract/finish-title.png',
]
const currentIcon = ref(icons[0])
const handleStepChange = (step) => {
  currentIcon.value = icons[step]
  console.log('当前步骤:', step)
}

onMounted(() => {
  // 页面初始化逻辑，比如拉取设备状态等
})
const handleBack = () => {
  uni.navigateBack({})
}
</script>

<style lang="scss" scoped>
.grinder-page {
  padding: 20rpx;
  background: #ffffff;
  height: 100vh;
  overflow: hidden;
  .extract-container {
    margin-top: 12vh;
    height: calc(100vh - 12vh);
    overflow: hidden;
  }
}
</style>
