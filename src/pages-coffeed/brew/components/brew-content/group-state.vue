<template>
  <view
    class="grid overflow-hidden transition-colors duration-300 rounded-pill"
    :class="allStatesActive ? 'bg-success-light' : 'bg-gray-50'"
    :style="{ gridTemplateColumns: `repeat(${buttonTexts.length}, minmax(0, 1fr))` }"
  >
    <view
      v-for="(item, index) in buttonTexts"
      :key="index"
      class="flex items-center justify-center h-[50px] transition-colors duration-300"
      :class="getButtonClasses(index)"
    >
      <view v-if="showIcon" class="w-4 h-4 mr-1">
        <wd-img
          :width="16"
          :height="16"
          v-if="allStatesActive"
          :src="`/static/images/extract/${item.icon}-finish.png`"
        />
        <wd-img
          :width="16"
          v-else-if="item.state"
          :height="16"
          :src="`/static/images/extract/${item.icon}-active.png`"
        />
        <wd-img :width="16" v-else :height="16" :src="`/static/images/extract/${item.icon}.png`" />
      </view>
      
      <text class="text-sm font-medium">{{ item.text }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  buttonTexts: {
    type: Array,
    default: () => [
      { text: '研磨', state: false },
      { text: '完成', state: false },
      { text: '沖煮', state: true },
    ],
  },
  showIcon: {
    type: Boolean,
    default: true,
  },
})

// 判斷是否所有按鈕 state 都為 true
const allStatesActive = computed(() => {
  return props.buttonTexts.every((item) => item.state)
})

// 獲取最後一個啟動按鈕的索引
const getLastActiveIndex = computed(() => {
  for (let i = props.buttonTexts.length - 1; i >= 0; i--) {
    if (props.buttonTexts[i].state) {
      return i
    }
  }
  return -1
})

// 計算每個按鈕的 Tailwind class (取代原先的 getButtonStyles)
const getButtonClasses = (index) => {
  const isFirst = index === 0
  const isLastActive = index === getLastActiveIndex.value
  const isActive = props.buttonTexts[index].state

  const classes = []

  // 1. 處理圓角邏輯 (對應 tailwind.config.js 中的 rounded-pill)
  if (isFirst && isLastActive && isActive) {
    classes.push('rounded-pill')
  } else if (isFirst) {
    classes.push('rounded-l-pill')
  } else if (isLastActive && isActive) {
    classes.push('rounded-r-pill')
  }

  // 2. 處理狀態顏色邏輯
  if (isActive) {
    if (allStatesActive.value) {
      // 全部啟動時：透明背景，品牌成功綠色文字
      classes.push('bg-transparent text-success')
    } else {
      // 部分啟動時：灰色背景，白色文字
      classes.push('bg-gray-500 text-white')
    }
  } else {
    // 未啟動時：透明背景，灰色文字
    classes.push('bg-transparent text-gray-500')
  }

  return classes.join(' ')
}
</script>

<style scoped>
/* 所有樣式皆已成功轉換為 Tailwind CSS Utility Classes。
   零自定義 CSS，乾淨俐落！ */
</style>