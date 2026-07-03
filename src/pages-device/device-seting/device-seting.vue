<route lang="json5">
{
  style: {
    navigationBarTitleText: '修改设备名称',
    navigationBarBackgroundColor: '#ffffff',
    disableScroll: true,
  },
}
</route>
<template>
  <view class="device-information">
    <input
      type="text"
      :value="deviceName"
      maxlength="10"
      placeholder="请输入设备名称（最多10个字）"
      class="device-name"
      @input="handleInput"
    />
    <input
      type="text"
      :value="desc"
      maxlength="14"
      placeholder="请输入设备备注（最多14个字）"
      class="device-desc"
      @input="handleDescInput"
    />
    <view class="save" @click="save">保存</view>
    <my-loading :loading="loading"></my-loading>
  </view>
</template>

<script lang="ts" setup>
import { useBluetoothStore } from '@/store'
import { httpPut } from '@/utils/http'
import { useToast } from 'wot-design-uni'
const toast = useToast()
const bluetoothStore = useBluetoothStore()
const deviceName = ref(bluetoothStore.connectedDevice.productInfo.deviceName)
const desc = ref('')
const loading = ref(false)
const device = bluetoothStore.connectedDevice
// 初始化
onMounted(async () => {
  await nextTick()
  desc.value = getDesc.value
})
const getDesc = computed(() => {
  let descValue = '咖啡如诗，每一杯皆是艺术~'
  const { configJson } = device.productInfo
  if (configJson) {
    const config = JSON.parse(configJson)
    if (Object.prototype.hasOwnProperty.call(config, 'desc')) {
      descValue = config.desc
    }
  }
  return descValue
})

const handleInput = (e) => {
  deviceName.value = e.detail.value
}

const handleDescInput = (e) => {
  desc.value = e.detail.value
}

const save = () => {
  loading.value = true // 开启加载状态
  device.productInfo.deviceName = deviceName.value
  const { configJson } = device.productInfo
  if (configJson) {
    const config = JSON.parse(configJson)
    config.desc = desc.value
    device.productInfo.configJson = JSON.stringify(config)
  } else {
    device.productInfo.configJson = JSON.stringify({ desc: desc.value })
  }
  const { run } = useRequest<IResponseData>(() =>
    httpPut('/deviceManage/deviceManage', { ...device.productInfo }),
  )
  run().then((res) => {
    loading.value = false
    if (res.code === 200) {
      bluetoothStore.setConnectedDevice(device)
      toast.success('保存成功')
      uni.navigateBack({ delta: 1 })
    } else {
      toast.error(res.msg)
    }
  })
}
</script>

<style lang="scss" scoped>
.device-information {
  padding: 14px 18px 0 18px;
  .device-name {
    height: 52px;
    padding: 0 12px;
    margin-bottom: 10px;
    font-size: 14px;
    color: #222222;
    background-color: #ffffff;
    border-radius: 10px;
  }
  .device-desc {
    height: 52px;
    padding: 0 12px;
    margin-bottom: 27px;
    font-size: 14px;
    color: #222222;
    background-color: #ffffff;
    border-radius: 10px;
  }
  .save {
    height: 46px;
    font-size: 14px;
    line-height: 46px;
    color: #ffffff;
    text-align: center;
    background: #004097;
    border-radius: 25px;
  }
}
</style>
