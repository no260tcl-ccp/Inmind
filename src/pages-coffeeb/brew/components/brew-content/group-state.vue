<template>
  <view
    class="button-container"
    :class="allStatesActive ? 'all-active' : ''"
    :style="containerStyles"
  >
    <view
      v-for="(item, index) in buttonTexts"
      :key="index"
      :class="['button-item', item.state ? 'active' : 'inactive']"
      :style="getButtonStyles(index)"
    >
      <view v-if="showIcon" class="icon">
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
      <text>{{ item.text }}</text>
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
      { text: '冲煮', state: true },
    ],
  },
  showIcon: {
    type: Boolean,
    default: true,
  },
})

// 判断是否所有按钮 state 都为 true
const allStatesActive = computed(() => {
  return props.buttonTexts.every((item) => item.state)
})

// 计算容器样式
const containerStyles = computed(() => {
  return {
    '--button-count': props.buttonTexts.length,
  }
})

// 获取最后一个激活按钮的索引
const getLastActiveIndex = computed(() => {
  for (let i = props.buttonTexts.length - 1; i >= 0; i--) {
    if (props.buttonTexts[i].state) {
      return i
    }
  }
  return -1
})

// 计算每个按钮的样式
const getButtonStyles = (index) => {
  const isFirst = index === 0
  const isLastActive = index === getLastActiveIndex.value
  const isActive = props.buttonTexts[index].state

  let borderRadius = '0px'
  if (isFirst) {
    borderRadius = '68rpx 0 0 68rpx'
  }
  if (isLastActive && isActive) {
    borderRadius = isFirst ? '68rpx' : `0 68rpx 68rpx 0`
  }

  return {
    borderRadius,
  }
}
</script>

<style scoped>
.button-container {
  display: grid;
  grid-template-columns: repeat(var(--button-count), 1fr);
  border-radius: 68rpx;
  overflow: hidden;
  background-color: #f5f5f5;
}

.button-item {
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

/* 活动状态样式 */
.button-item.active {
  background-color: #999999;
  color: white;
}

/* 非活动状态样式 */
.button-item.inactive {
  background-color: transparent;
  color: #999999;
}

/* 所有按钮都激活时的样式 */
.all-active {
  background-color: #e6f5ee;
}

.all-active .button-item.active {
  background-color: transparent;
  color: #25ae69;
}

.icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 8rpx;
}

.text {
  font-size: 28rpx;
  font-weight: 500;
}
</style>
