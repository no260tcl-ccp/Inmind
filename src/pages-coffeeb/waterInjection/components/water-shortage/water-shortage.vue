<template>
  <wd-popup
    v-model="show"
    custom-style="borderRadius:23px 23px 0 0;background:none;"
    position="bottom"
    @close="handleClose"
  >
    <view class="water-shortage">
      <view class="avatar">
        <wd-img :width="77" :height="77" :src="avatarIcon" alt="avatar" />
      </view>
      <view class="tips1">缺水，请加水</view>
      <view class="tips2">加水后点【继续】继续当前进程，点击【终止】则终止当前进程</view>
      <view class="btn-list">
        <view class="terminate" @click="start(0)">终止</view>
        <view class="continue" @click="start(3)">继续</view>
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

const injectionData = ref(props.objData)
const isLackWater = ref(machineStatusStore.lackWater > 0)
const aliyunBaseUrl = import.meta.env.VITE_COFFEE_BASE_URL
const avatarIcon = ref<string>(`${aliyunBaseUrl}avatar-icon.png`)

const { show, objData } = toRefs(props)

const emit = defineEmits(['close'])
const handleClose = () => {
  emit('close')
}

const send = async (sendType: number) => {
  // 设备同步过来的数据
  let waterHigh = injectionData.value.waterHigh
  let waterLow = injectionData.value.waterLow
  const { temperature, velocity, type, water } = injectionData.value
  // water小程序设置的值
  if (water > 0) {
    waterHigh = (water >> 8) & 0xff
    waterLow = water & 0xff
  }
  const data = [sendType, waterHigh, waterLow, temperature, Number(`3.${velocity}`) * 10, type]
  let response
  if (isLackWater.value) {
    // 2：取消注水，1：继续注水
    response = await coffeeMachineProtocol.sendLackWaterMode([1, sendType === 0 ? 2 : 1])
  } else {
    response = await coffeeMachineProtocol.sendWaterMode(data)
  }
  if (response === 'dd') {
    // 终止需要时间，先不改变状态。需要等待设备响应
    if (sendType > 0) {
      injectionData.value.startStop = sendType
    }
    // 取消注水
    if (sendType === 0) {
      uni.showLoading({ title: '取消中，请耐心等待！', mask: true })
      try {
        await retry(
          () => {
            if (runStatus.value === 0) {
              uni.redirectTo({
                url: `/pages-coffeeb/waterInjection/waterInjection?temperature=${temperature}&velocity=${velocity}&type=${type}&water=${(waterHigh << 8) | waterLow}`,
              })
            } else {
              throw new Error('取消命令执行失败，请重新尝试')
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
    // 缺水情况继续注水，设备需要时间响应
    if (sendType === 3 && isLackWater.value) {
      uni.showLoading({ title: '继续注水中，请耐心等待！', mask: true })
      try {
        await retry(
          () => {
            if (isLackWater.value) {
              throw new Error('继续命令执行失败，请重新尝试')
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
    handleClose() // 关闭弹窗
  } else {
    throw new Error('命令执行失败，请重新尝试')
  }
}
const start = async (type) => {
  uni.showLoading({ title: '发送中...', mask: true })
  try {
    await retry(() => send(type), 3, 500)
  } catch (error) {
    toast.error(error.message)
  } finally {
    uni.hideLoading()
  }
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
