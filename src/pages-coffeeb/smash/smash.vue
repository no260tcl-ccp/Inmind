<template>
  <view class="grinder-page">
    <view class="machine-container">
      <psGrind
        :objData="waterSettingData"
        @nextStepBegins="nextStepBegins"
        v-if="startStop === 0"
      />
      <start-grind
        v-else
        @changeTheGrindingState="changeTheGrindingState"
        @nextFinish="handleNextFinish"
        :Finish="isFinish"
      />
    </view>
  </view>
  <lackBean
    :show="missingBeanBooleanValue"
    @terminate="changeTheGrindingState"
    @continue="changeTheGrindingState"
  />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
// 引入子组件
import psGrind from './components/ps-grind/ps-grind.vue'
import startGrind from './components/start-grind/start-grind.vue'
import lackBean from './components/lack-bean/lack-bean.vue'
import { retry } from '@/utils'
import { CoffeeMachineProtocol } from '@/utils/coffeebBlueTool'
import { useMachineBStatusStore } from '@/store'
import { useToast } from 'wot-design-uni'
const coffeeMachineProtocol = CoffeeMachineProtocol.getInstance()
const machineStatusStore = useMachineBStatusStore()
const toast = useToast()
const machineStatus = ref(machineStatusStore.modeString) // 机器状态
const runStatus = ref<number>(machineStatusStore.runStatus) // 运行状态
const startStop = ref(machineStatusStore.grindData.startStop)
const missingBeanBooleanValue = ref(false) // 缺豆状态
const isFinish = ref(false)

watch(
  () => machineStatusStore.grindData.startStop,
  (newStatus) => {
    if (newStatus === 4) {
      missingBeanBooleanValue.value = true
    } else {
      missingBeanBooleanValue.value = false
    }
  },
  { immediate: true },
)

const waterSettingData = ref({
  type: 1,
  gear: 80,
  speed: 120,
})
// 点击下一步开始研磨咖啡
const nextStepBegins = (data: { type: number; gear: number; speed: number }) => {
  waterSettingData.value = { ...data }
  start(waterSettingData.value.type)
}

// 暂停研磨---继续研磨---终止研磨
const changeTheGrindingState = (type: number) => {
  if (missingBeanBooleanValue.value) {
    // 这个是缺豆的情况弹窗操作关闭
    missingBeanBooleanValue.value = false
  }
  waterSettingData.value.type = type
  start(waterSettingData.value.type)
}

// 点击下一步发送指令
const start = async (type: number) => {
  uni.showLoading({ title: '发送中...', mask: true })
  try {
    await retry(() => send(type), 3, 500)
  } catch (error) {
    console.log(error, '设置命令执行失败')
    toast.error(error.message)
  } finally {
    uni.hideLoading()
  }
}

// 点击下一步参数

const send = async (type: number) => {
  const { gear, speed } = waterSettingData.value
  const data = [type, gear, speed]
  const response = await coffeeMachineProtocol.sendGrindMode(data)
  if (response === 'dd') {
    // 终止需要时间，先不改变状态。需要等待设备响应
    if (type > 0) {
      startStop.value = type
    }
    // 取消研磨
    if (type === 0) {
      uni.showLoading({ title: '取消中，请耐心等待！', mask: true })
      try {
        await retry(
          () => {
            if (runStatus.value === 0) {
              isFinish.value = true
            } else {
              // throw new Error('取消命令执行失败，请重新尝试')
              console.error('取消命令执行失败，请重新尝试')
            }
          },
          12,
          500,
        )
      } catch (error) {
        toast.error(error.message)
      } finally {
        uni.hideLoading()
      }
    }
  } else {
    throw new Error('命令执行失败，请重新尝试')
  }
}

watch(
  () => machineStatusStore.runStatus,
  (newStatus) => {
    runStatus.value = newStatus
  },
  { immediate: true },
)
watch(
  () => machineStatusStore.modeString,
  (newMode) => {
    machineStatus.value = newMode
  },
  { immediate: true },
)
const handleBack = () => {
  uni.navigateBack({})
}

const handleNextFinish = () => {
  toast.success('研磨完成')
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
