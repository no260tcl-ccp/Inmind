<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '注水',
    navigationBarBackgroundColor: '#ffffff',
    disableScroll: true,
  },
}
</route>
<template>
  <view class="grinder-page">
    <view class="machine-container">
      <waterSetting
        v-if="stateArr[0].state && !isFinish"
        :objData="waterSettingData"
        @start="startWater"
      />
      <wiStart v-else :objData="waterSettingData" @next="handleFinish" />
      <waterShortage :show="isLackWater" :objData="waterSettingData" @close="closeWatherShortage" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useToast } from 'wot-design-uni'
// 引入子组件
import waterSetting from './components/water-setting/water-setting.vue'
import wiStart from './components/wi-start/wi-start.vue'
import waterShortage from './components/water-shortage/water-shortage.vue'
import { useMachineBStatusStore } from '@/store'
const toast = useToast()
const machineStatusStore = useMachineBStatusStore()
// 是否缺水
const isLackWater = ref(machineStatusStore.lackWater > 0)

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
  toast.success('注水完成')
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

// 监听设备是否缺水
watch(
  () => machineStatusStore.lackWater,
  (newlackWater) => {
    console.log('lackWater', newlackWater)
    isLackWater.value = newlackWater > 0
  },
  { immediate: true },
)

const closeWatherShortage = () => {
  isLackWater.value = false
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
  height: 100vh;
  overflow: hidden;
  background: #ffffff;
  .machine-container {
    overflow: auto;
    overflow-x: hidden;
  }
}
</style>
