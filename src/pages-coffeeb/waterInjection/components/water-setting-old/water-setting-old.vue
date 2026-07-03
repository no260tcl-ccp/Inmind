<template>
  <view>
    <wd-toast />
    <!-- 水量 -->
    <horizontal-slidert
      :isVertical="false"
      :isHorizontal="true"
      :initialValue="water"
      sliderText="水量"
      @slider-change="handleSliderChangeWater"
      :maxSliderValue="240"
      :minSliderValue="0"
      unitValue="ml"
      :stepSize="1"
      :showValue="true"
      :numberSize="20"
    />
    <view class="mt-3"></view>
    <!-- 水温 -->
    <horizontal-slidert
      :isVertical="false"
      :isHorizontal="true"
      :initialValue="temperature"
      sliderText="水温"
      @slider-change="handleSliderChangeTemperature"
      :maxSliderValue="95"
      :minSliderValue="40"
      unitValue="°C"
      :stepSize="1"
      :showValue="true"
      :numberSize="20"
    />
    <view class="mt-3"></view>
    <horizontal-slidert
      :isVertical="false"
      :isHorizontal="true"
      :initialValue="velocity"
      sliderText="流速"
      frontDecimal="3."
      @slider-change="handleSliderChangeVelocity"
      :maxSliderValue="5"
      :minSliderValue="0"
      unitValue="ml/s"
      :stepSize="1"
      :showValue="true"
      :numberSize="20"
    />
    <view class="mt-3"></view>
    <view class="type-box">
      <wd-row :gutter="14">
        <wd-col :span="8" v-for="(item, index) in typeList" :key="index">
          <view
            class="flex justify-center items-center flex-col type-item"
            :class="{ active: type === item.value }"
            @click="type = item.value"
          >
            <!-- <wd-img
              :width="30"
              :height="30"
              :src="type === item.value ? item.activeImg : item.inactiveImg"
            /> -->
            <i
              :class="{
                [item.icon]: true,
                'color-004097': type === item.value,
                'color-#666666': type !== item.value,
              }"
            ></i>

            <text class="mt-1">{{ item.label }}</text>
          </view>
        </wd-col>
      </wd-row>
    </view>
    <view class="mt-5">
      <wd-button block size="large" type="error" @click="start">
        <view class="btn-box">
          <wd-img :width="16" :height="16" :src="`/static/images/extract/water-active.png`" />
          <text class="ml-1">开始</text>
        </view>
      </wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'wot-design-uni'
import { t } from '@/locale/index'
// 蓝牙Pinna
import { useBluetoothStore, useDevicVersionStore, useMachineBStatusStore } from '@/store'
import { CoffeeMachineProtocol } from '@/utils/coffeebBlueTool'
import { retry } from '@/utils'

const emit = defineEmits(['start'])

const props = defineProps({
  objData: {
    type: Object,
    required: true,
    default: () => ({}),
  },
})
watch(
  () => props.objData,
  (newVal) => {
    if (newVal.water) {
      water.value = newVal.water
    }
    if (newVal.temperature) {
      temperature.value = newVal.temperature
    }
    if (newVal.velocity) {
      velocity.value = newVal.velocity
    }
    if (newVal.type) {
      type.value = newVal.type
    }
  },
  { deep: true, immediate: true },
)
const typeList = [
  {
    value: 0,
    label: '中心',
    icon: 'iconfont icon-size-22 icon-juzhong',
  },
  {
    value: 1,
    label: '螺旋',
    icon: 'iconfont icon-size-22 icon-luoxuan',
  },
  {
    value: 2,
    label: '环绕',
    icon: 'iconfont icon-size-22 icon-huanrao',
  },
]
const bluetoothStore = useBluetoothStore()
const coffeeMachineProtocol = CoffeeMachineProtocol.getInstance()
const deviceVersionStore = useDevicVersionStore()
const machineStatusStore = useMachineBStatusStore()
const machineStatus = ref(machineStatusStore.modeString) // 机器状态
const runStatus = ref<number>(machineStatusStore.runStatus) // 运行状态

const water = ref<number>(100)

const temperature = ref<number>(92)

const velocity = ref<number>(1)

const type = ref<number>(0)
// 轻提示
const toast = useToast()

// 保存配方参数
const send = async () => {
  // 校验数据
  // if (preInfusionVolume.value === 0) {
  //   toast.error('预侵泡水量不能为0')
  //   return
  // }
  // if (extractionVolume.value === 0) {
  //   toast.error('萃取水量不能为0')
  //   return
  // }

  // 拆分 water 的值为两个字节
  const waterHigh = (water.value >> 8) & 0xff // 高位字节
  const waterLow = water.value & 0xff // 低位字节
  const data = [
    1,
    waterHigh,
    waterLow,
    temperature.value,
    Number(`3.${velocity.value}`) * 10,
    type.value,
  ]
  console.log('发送的数据：', data)
  const response = await coffeeMachineProtocol.sendWaterMode(data)
  if (response == 'dd') {
    emit('start', {
      water: water.value,
      temperature: temperature.value,
      velocity: velocity.value,
      type: type.value,
      startStop: 0,
    })
  } else {
    throw new Error('命令执行失败，请重新尝试')
  }
}

const start = async () => {
  if (runStatus.value !== 0) {
    toast.error({ msg: '设备当前正在运行，请先停止当前任务', zIndex: 1000 })
    return
  }
  uni.showLoading({ title: '发送中...', mask: true })
  try {
    await retry(() => send(), 3, 500)
  } catch (error) {
    console.log(error, '设置命令执行失败')
    toast.error(error.message)
  } finally {
    uni.hideLoading()
  }
}
const handleSliderChangeWater = (value: number) => {
  water.value = value
}

const handleSliderChangeTemperature = (value: number) => {
  temperature.value = value
}

const handleSliderChangeVelocity = (value: number) => {
  velocity.value = value
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

onMounted(() => {})
</script>

<style lang="scss" scoped>
.tips {
  margin-top: 32rpx;
  font-size: 28rpx;
  color: #e51f4d;
  text-align: center;
}
.btn-box {
  display: flex;
  align-items: center;
  justify-content: center;
}
.type-box {
  .type-item {
    height: 146rpx;
    font-size: 28rpx;
    background-color: #f5f5f5;
    border: 1px solid #f5f5f5;
    border-radius: 16rpx;
  }
  .active {
    color: #004097;
    background-color: #e5ecf5;
    border: 1px solid rgba(0, 64, 151, 0.1);
  }
}
.icon-size-22 {
  font-size: 44rpx !important;
}
</style>
