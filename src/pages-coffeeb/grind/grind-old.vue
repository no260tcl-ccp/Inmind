<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '研磨',
    disableScroll: true,
  },
}
</route>
<template>
  <view class="grinder-page">
    <view class="machine-container">
      <grindSetting
        v-if="stateArr[0].state && !isFinish"
        :objData="grindData"
        @start="handleGrind"
      />
      <grindState v-else :objData="grindData" @next="handleFinish" />
    </view>
    <group-state :buttonTexts="stateArr" />
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
// 引入子组件
import grindSetting from './components/grind-setting/grind-setting.vue'
import grindState from './components/grind-state/grind-state.vue'
import groupState from '../components/group-state/group-state.vue'
import { useMachineBStatusStore } from '@/store'
const machineStatusStore = useMachineBStatusStore()

onLoad((options) => {
  if (options) {
    grindData.value.speed = Number(options.speed)
    grindData.value.gear = Number(options.gear)
  }
})
const isFinish = ref(false)
const grindData = ref({
  speed: 0,
  gear: 0,
  startStop: 0,
})
// 处理按钮点击的逻辑
const handleGrind = (data: { speed: number; gear: number; startStop: number }) => {
  grindData.value = { ...grindData.value, ...data }
  stateArr.value[0].state = false
  stateArr.value[1].state = true
}
const handleFinish = () => {
  // 目前在第一个步骤，不能直接完成， 终止的时候和完成的状态是一致的，通过当前步骤状态判断
  if (stateArr.value[0].state) {
    isFinish.value = false
    return
  }
  isFinish.value = true
  stateArr.value.forEach((item) => {
    item.state = true
  })
  console.log('标记完成')
}
const stateArr = ref([
  { text: '准备', state: true, icon: 'setting' },
  { text: '研磨', state: false, icon: 'grind' },
  { text: '完成', state: false, icon: 'finish' },
])
watch(
  () => machineStatusStore.runStatus,
  (newRunStatus) => {
    if (newRunStatus === 1) {
      handleGrind({ speed: 0, gear: 0, startStop: 0 })
    }
  },
  { immediate: true },
)
onMounted(() => {
  // 页面初始化逻辑，比如拉取设备状态等
})
const handleBack = () => {
  uni.navigateBack({})
}
</script>

<style lang="scss" scoped>
.grinder-page {
  padding: 20rpx 44rpx;
  background: #ffffff;
  height: 100vh;
  overflow: hidden;
  .machine-container {
    height: calc(100vh - 180rpx);
    overflow: auto;
    overflow-x: hidden;
  }
}
</style>
