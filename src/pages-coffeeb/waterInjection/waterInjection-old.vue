<template>
  <view class="grinder-page">
    <view class="machine-container">
      <waterSetting
        v-if="stateArr[0].state && !isFinish"
        :objData="waterSettingData"
        @start="startWater"
      />
      <waterState v-else :objData="waterSettingData" @next="handleFinish" />
    </view>
    <group-state :buttonTexts="stateArr" />
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
// 引入子组件
import waterSetting from './components/water-setting/water-setting.vue'
import waterState from './components/water-state/water-state.vue'
import groupState from '../components/group-state/group-state.vue'
import { useMachineBStatusStore } from '@/store'
const machineStatusStore = useMachineBStatusStore()
onLoad((options) => {
  if (options) {
    waterSettingData.value.water = Number(options.water)
    waterSettingData.value.temperature = Number(options.temperature)
    waterSettingData.value.velocity = Number(options.velocity)
    waterSettingData.value.type = Number(options.type)
  }
})
const isFinish = ref(false)
const waterSettingData = ref({
  water: 0,
  temperature: 0,
  velocity: 0,
  type: 0,
  startStop: 0,
})
// 处理按钮点击的逻辑
const startWater = (data: {
  water: number
  temperature: number
  velocity: number
  type: number
  startStop: number
}) => {
  waterSettingData.value = { ...waterSettingData.value, ...data }
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
  { text: '设置', state: true, icon: 'setting' },
  { text: '注水', state: false, icon: 'water' },
  { text: '完成', state: false, icon: 'finish' },
])
watch(
  () => machineStatusStore.runStatus,
  (newRunStatus) => {
    if (newRunStatus === 2) {
      startWater({
        water: 0,
        temperature: 0,
        velocity: 0,
        type: 0,
        startStop: 0,
      })
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
