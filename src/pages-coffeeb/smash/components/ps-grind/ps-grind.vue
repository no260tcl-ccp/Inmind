<template>
  <view class="ps-grind-container">
    <wd-toast />
    <!-- 研磨度 -->
    <horizontal-slidert
      :isVertical="false"
      :isHorizontal="true"
      :initialValue="grindData.gear"
      sliderText="研磨度"
      @slider-change="handleSliderChangeWater"
      :maxSliderValue="120"
      :minSliderValue="1"
      :unitValue="unitValue"
      sliderHeight="132px"
      :stepSize="1"
      :showValue="true"
      :numberSize="40"
    />
    <view class="dividing-line"></view>
    <!-- 电机转速 -->
    <horizontal-slidert
      :isVertical="false"
      :isHorizontal="true"
      :initialValue="grindData.speed"
      sliderText="电机转速"
      @slider-change="handleSliderChangeTemperature"
      :maxSliderValue="120"
      :minSliderValue="60"
      unitValue="RPM"
      sliderHeight="132px"
      :stepSize="1"
      :showValue="true"
      :numberSize="40"
    />
    <view class="start-btn">
      <view class="start" @click="startClick">
        <i class="iconfont icon-bofang5"></i>
      </view>
    </view>
  </view>
  <CustomPopup
    :show="grindShow"
    :showClose="true"
    position="center"
    backgroundColor="rgba(255, 255, 255, 0)"
    maskBackgroundColor="rgba(0, 0, 0, 0.5)"
    borderRadius="0rpx"
    :closeButton="closeButtonStyle"
    @close="handleClose"
  >
    <AddbeanTips @nextStep="nextStep"></AddbeanTips>
  </CustomPopup>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMachineBStatusStore } from '@/store'
import { useToast } from 'wot-design-uni'
import AddbeanTips from '../addbean-tips/addbean-tips.vue'
import CustomPopup from '../../../components/custom-popup/custom-popup.vue'
const machineStatusStore = useMachineBStatusStore()
const toast = useToast()
const emit = defineEmits(['nextStepBegins'])
const closeButtonStyle = ref({
  backgroundColor: '#FFFFFF',
  top: '60rpx',
  right: '30rpx',
})
const state = reactive({
  grindData: {
    gear: 60,
    speed: 120,
    startStop: 0,
  },
})
const { grindData } = toRefs(state)
const handleSliderChangeWater = (value: number) => {
  grindData.value.gear = value
}

const handleSliderChangeTemperature = (value: number) => {
  grindData.value.speed = value
}

const grindShow = ref<boolean>(false)
// 点击打开弹窗
const startClick = () => {
  saveGrindingParameters()
}
// 关闭弹窗
const handleClose = () => {
  grindShow.value = false
}

// 下一步
const nextStep = () => {
  grindShow.value = false
  emit('nextStepBegins', { type: 1, gear: grindData.value.gear, speed: grindData.value.speed })
}

// 接收缓存的数据值
watch(
  () => machineStatusStore.grindData,
  (newCache) => {
    if (newCache) {
      grindData.value.gear = newCache.gear
      grindData.value.speed = newCache.speed
      grindData.value.startStop = newCache.startStop
    }
  },
  { deep: true, immediate: true },
)
const saveDataCache = async () => {
  interface UpdategrindDataType {
    gear: number
    speed: number
    startStop: number
  }
  const updategrindDataData = ref<UpdategrindDataType>()
  updategrindDataData.value = Object.assign({}, grindData.value)
  machineStatusStore.updateGrindCache(updategrindDataData.value)
}

const unitValue = computed(() => {
  if (grindData.value.gear > 82) {
    return '法压冷萃'
  }
  if (grindData.value.gear > 47 && grindData.value.gear <= 82) {
    return '手冲咖啡'
  }
  if (grindData.value.gear > 23 && grindData.value.gear <= 47) {
    return '爱乐压'
  }
  if (grindData.value.gear > 0 && grindData.value.gear <= 23) {
    return '意式浓缩'
  }
  return '未知类型'
})

onMounted(async () => {
  await machineStatusStore.getGrindingParameters()
})

onUnmounted(() => saveDataCache())

const saveGrindingParameters = async () => {
  const { gear, speed } = grindData.value
  const res = await machineStatusStore.saveGrindingParameters(gear, speed)
  if (res.code === 200) {
    grindShow.value = true
  } else {
    toast.error({ msg: res.msg || '接口调用失败', zIndex: 1000 })
  }
}
</script>

<style lang="scss" scoped>
.dividing-line {
  height: 21px;
}
.ps-grind-container {
  padding: 20rpx 36rpx;
}
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
.start-btn {
  position: fixed;
  left: 0;
  bottom: 60px;
  width: 100%;
  display: flex;
  justify-content: center;
  .start {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 154rpx;
    height: 154rpx;
    background: #fce9ed;
    border-radius: 50%;
    .icon-bofang5 {
      font-size: 54rpx;
      color: #e51f4d;
    }
  }
}
</style>
