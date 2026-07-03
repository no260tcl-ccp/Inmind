<template>
  <wd-action-sheet v-model="localShow" @click-modal="handleClose">
    <view class="bc-share">
      <view class="header">
        <view class="title">
          <view>分享至</view>
          <view class="title-color font-size-3 mt-1">{{ objData.name }}</view>
        </view>
        <view class="close" @click="handleClose">
          <wd-img :width="30" :height="30" src="/static/images/user/close.png" />
        </view>
      </view>
      <view class="main">
        <view class="item" v-if="isShareToCoffeeMachine" @click="shareToCoffeeMachine">
          <wd-img
            :width="50"
            :height="50"
            src="
https://bincoo.oss-cn-beijing.aliyuncs.com/update/common/share-device.png"
          />
          <view class="text">咖啡机</view>
        </view>
        <view class="item" @click="shareToWeChat">
          <wd-img
            :width="50"
            :height="50"
            src="
https://bincoo.oss-cn-beijing.aliyuncs.com/update/common/share-weixin.png"
          />
          <view class="text">微信好友</view>
        </view>
        <view class="item" @click="shareQuickBoil" v-if="quicklyBoilingBoolean">
          <wd-img
            :width="50"
            :height="50"
            src="
https://bincoo.oss-cn-beijing.aliyuncs.com/update/common/quick-boil.png"
          />
          <view class="text">快速冲煮</view>
        </view>
        <view class="item" @click="generateImage" v-if="generateImageBoolean">
          <wd-img
            :width="50"
            :height="50"
            src="
https://bincoo.oss-cn-beijing.aliyuncs.com/update/common/share-img.png"
          />
          <view class="text">生成图片</view>
        </view>
      </view>
    </view>
  </wd-action-sheet>
  <wd-toast />
</template>

<script lang="ts" setup>
import { useMachineStatusStore, useMachineBStatusStore } from '@/store'
import { useBluetoothStore } from '@/store/blue'
import { useToast } from 'wot-design-uni'
const bluetoothStore = useBluetoothStore()
const deviceProductCode =
  bluetoothStore.connectedDevice?.productInfo?.productInformation?.productCode || ''

// 根据设备型号选择对应的状态存储
let machineStatusStore
if (deviceProductCode.includes('KFJ03')) {
  machineStatusStore = useMachineStatusStore()
} else if (deviceProductCode.includes('KFJ08')) {
  machineStatusStore = useMachineBStatusStore()
} else {
  machineStatusStore = useMachineStatusStore() // 默认store
}

const machineStatus = ref(machineStatusStore.modeString) // 机器状态
const totast = useToast()
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  isShareToCoffeeMachine: {
    type: Boolean,
    default: true,
  },
  quicklyBoilingBoolean: {
    type: Boolean,
    default: true,
  },
  generateImageBoolean: {
    type: Boolean,
    default: true,
  },
  objData: {
    type: Object,
    default: () => ({}),
  },
})
const localShow = ref(props.show)
watch(
  () => props.show,
  (newValue) => {
    localShow.value = newValue
  },
)
watch(
  () => machineStatusStore.modeString,
  (newMode) => {
    machineStatus.value = newMode
  },
  { immediate: true },
)
const emit = defineEmits(['close', 'shareToCoffeeMachine', 'quickBoiling'])
const handleClose = () => {
  emit('close')
}

const shareToCoffeeMachine = () => {
  if (machineStatus.value === '关机模式') {
    totast.error('当前关机模式, 请先开机')
  } else {
    // 处理分享到咖啡机的逻辑
    emit('shareToCoffeeMachine', props.objData)
  }
}

const shareToWeChat = () => {
  // 处理分享到微信好友的逻辑
  toShare(props.objData)
}

const shareQuickBoil = () => {
  // 处理分享到快速冲煮的逻辑
  if (machineStatus.value === '关机模式') {
    totast.error('当前关机模式, 请先开机')
  } else {
    // 处理分享到咖啡机的逻辑
    console.log('分享到快速冲煮', props.objData)
    emit('quickBoiling')
  }
}

const generateImage = () => {
  // 处理生成图片的逻辑
  toShare(props.objData)
}
const toShare = (item) => {
  const params = {
    ...item.configJson,
    avatar: item.avatar,
    createTime: item.createTime,
    deviceId: item.deviceId,
    id: item.id,
    name: item.name,
    userId: item.userId,
    isEdit: false,
    sort: item.sort,
    sharedToDevice: item.sharedToDevice,
  }

  // 将参数对象转换为 URL 参数字符串
  const queryParams = Object.keys(params)
    .map((key) => {
      if (key === 'accordionItems') {
        return `${key}=${encodeURIComponent(JSON.stringify(params[key]))}`
      } else {
        return `${key}=${encodeURIComponent(params[key])}`
      }
    })
    .join('&')
  // 使用 uni.navigateTo 发起页面跳转
  uni.navigateTo({
    url: `/pages-seting/shareImg/shareImg?${queryParams}`,
  })
}
</script>

<style lang="scss" scoped>
.bc-share {
  margin: 36rpx;
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 48rpx;
  }
  .main {
    display: flex;
    .item {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100rpx;
      margin-right: 66rpx;
      .text {
        width: 100%;
        margin-top: 12rpx;
        font-size: 24rpx;
        text-align: center;
      }
    }
  }
}
</style>
