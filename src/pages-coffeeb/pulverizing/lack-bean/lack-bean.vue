<template>
  <wd-popup
    v-model="show"
    custom-style="borderRadius:23px 23px 0 0;background:none;"
    position="bottom"
    :z-index="999"
    @close="handleClose"
  >
    <view class="water-shortage">
      <view class="avatar">
        <wd-img :width="77" :height="77" :src="avatarIcon" alt="avatar" />
      </view>
      <view class="tips1">缺咖啡豆</view>
      <view class="tips2">加入咖啡豆后点【继续】继续研磨，点击【终止】则终止研磨</view>
      <view class="btn-list">
        <view class="terminate" @click="handleTerminate(0)">终止</view>
        <view class="continue" @click="handleContinue(3)">继续</view>
      </view>
    </view>
  </wd-popup>
</template>
<script lang="ts" setup>
import { ref, toRefs } from 'vue'
import { retry } from '@/utils'
import { useToast } from 'wot-design-uni'
import { useMachineBStatusStore } from '@/store'
import { CoffeeMachineProtocol } from '@/utils/coffeebBlueTool'
const machineStatusStore = useMachineBStatusStore()
const coffeeMachineProtocol = CoffeeMachineProtocol.getInstance()
const toast = useToast()
const runStatus = ref(machineStatusStore.runStatus)
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  objData: {
    type: Object,
    required: true,
    default: () => ({}),
  },
})

const aliyunBaseUrl = import.meta.env.VITE_COFFEE_BASE_URL
const avatarIcon = ref<string>(`${aliyunBaseUrl}avatar-icon.png`)

const { show, objData } = toRefs(props)

const emit = defineEmits(['close', 'terminate', 'continue'])
const handleClose = () => {
  emit('close')
}
const handleTerminate = async (type: number) => {
  emit('terminate', type)
}
const handleContinue = async (type: number) => {
  emit('continue', type)
}
</script>
<style scoped lang="scss">
.water-shortage {
  height: 100%;
  padding-bottom: 2rpx;
  background-color: #ffffff;
  border-radius: 16rpx 16rpx 0 0;
  .avatar {
    display: flex;
    justify-content: center;
    padding-top: 42rpx;
  }
  .tips1 {
    margin-top: 42rpx;
    font-size: 36rpx;
    color: #222222;
    text-align: center;
  }
  .tips2 {
    padding: 0 80rpx;
    margin-top: 48rpx;
    font-size: 28rpx;
    color: #666666;
    text-align: center;
  }
  .btn-list {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 52rpx 0 122rpx 0;
    .terminate {
      box-sizing: border-box;
      width: 280rpx;
      height: 92rpx;
      margin-right: 26rpx;
      line-height: 92rpx;
      color: #666666;
      text-align: center;
      background: #f5f5f5;
      border: 2rpx solid #dfdfdf;
      border-radius: 46rpx;
    }
    .continue {
      box-sizing: border-box;
      width: 280rpx;
      height: 92rpx;
      line-height: 92rpx;
      color: #ffffff;
      text-align: center;
      background: #004097;
      border-radius: 46rpx;
    }
  }
}
</style>
