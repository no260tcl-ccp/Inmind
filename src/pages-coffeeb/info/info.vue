<route lang="json5">
{
  style: {
    navigationBarTitleText: '机器信息',
  },
}
</route>
<template>
  <view style="height: 100vh; background: white">
    <wd-status-tip
      image="network"
      v-if="!bluetoothStore.connectedDevice"
      tip="该页面暂时无法访问"
    />
    <view v-else>
      <view class="page-container">
        <view class="page-content">
          <view class="flex flex-col items-center justify-center mb-6">
            <wd-img
              :width="230"
              :height="230"
              :src="deviceImg(bluetoothStore.connectedDevice)"
              @click="isTips = true"
            />
            <!-- <view class="page-content-title">{{ bluetoothStore.connectedDevice.productInfo.machineName }}</view> -->
            <!-- <view class="page-content-tips">固件版本：{{ deviceVersionStore.$state.version }}</view> -->
            <view class="page-content-title">
              {{
                bluetoothStore.connectedDevice
                  ? bluetoothStore.connectedDevice.productInfo.deviceName
                  : '全自动咖啡机'
              }}
            </view>
            <!-- <view class="page-content-tips" v-if="version">固件版本：{{ version || '--' }}</view>
            <view class="page-content-tips" v-else>
              固件版本：无法获取到设备版本
              <wd-button type="error" size="small" class="mr-2" @click="isTips = true">
                恢复到初始版本
              </wd-button>
            </view> -->
          </view>
          <view class="base-info">
            <wd-row>
              <wd-col :span="12">
                <view class="flex items-center">
                  <view class="mr-3">
                    <!-- <i class="iconfont bc-icon-water-source icon-size-34"></i> -->
                    <wd-img :width="34" :height="34" src="/static/images/user/water-source.png" />
                  </view>
                  <view>
                    <view class="info-title title-color">水源</view>
                    <view class="info-desc">外接水源</view>
                  </view>
                </view>
              </wd-col>
              <wd-col :span="12">
                <view class="flex items-center">
                  <view class="mr-3">
                    <!-- <i class="iconfont bc-icon-voltage icon-size-34"></i> -->
                    <wd-img :width="34" :height="34" src="/static/images/user/voltage.png" />
                  </view>
                  <view>
                    <view class="info-title title-color">电压</view>
                    <view class="info-desc">220V</view>
                  </view>
                </view>
              </wd-col>
            </wd-row>
            <wd-row>
              <wd-col :span="24">
                <view class="flex items-center mt-6">
                  <view class="mr-3">
                    <!-- <i class="iconfont bc-icon-serial-number icon-size-34"></i> -->
                    <wd-img :width="34" :height="34" src="/static/images/user/serial-number.png" />
                  </view>
                  <view>
                    <view class="info-title title-color">序列号</view>
                    <view class="info-desc">
                      {{
                        bluetoothStore.connectedDevice
                          ? bluetoothStore.connectedDevice.productInfo.deviceSn
                          : '--'
                      }}
                    </view>
                  </view>
                </view>
              </wd-col>
            </wd-row>
            <wd-row>
              <wd-col :span="24">
                <view class="flex items-center mt-6">
                  <view class="mr-3">
                    <!-- <i class="iconfont bc-icon-device-id icon-size-34"></i> -->
                    <wd-img :width="34" :height="34" src="/static/images/user/device-id.png" />
                  </view>
                  <view>
                    <view class="info-title title-color">硬件编号</view>
                    <view class="info-desc">
                      {{
                        bluetoothStore.connectedDevice
                          ? bluetoothStore.connectedDevice.deviceId
                          : '--'
                      }}
                    </view>
                  </view>
                </view>
              </wd-col>
            </wd-row>
            <wd-row>
              <wd-col :span="12">
                <view class="flex items-center mt-6">
                  <view class="mr-3">
                    <!-- <i class="iconfont bc-icon-device-id icon-size-34"></i> -->
                    <wd-img :width="34" :height="34" src="/static/images/user/device-id.png" />
                  </view>
                  <view>
                    <view class="info-title title-color">固件版本</view>
                    <view class="info-desc">
                      V{{ castrateVersionNumber ? castrateVersionNumber : '--' }}
                    </view>
                  </view>
                </view>
              </wd-col>
              <wd-col :span="12">
                <view
                  class="new-version"
                  @click="newVersionFound"
                  v-if="cloudVersion !== castrateVersionNumber"
                >
                  <view class="info-title version-color mb-reduce-12">发现新版本：</view>
                  <view class="info-desc version-color">
                    V{{ cloudVersion ? cloudVersion : '' }}
                    <i class="iconfont icon-a-ze-arrow-leftCopy2-copy-copy"></i>
                  </view>
                </view>
              </wd-col>
            </wd-row>
          </view>
        </view>
      </view>
    </view>
    <wd-toast />
    <bc-confirm :show="isTips">
      <template #main>
        <view class="text-center">恢复到初始版本</view>
        <view class="text-center">此操作将恢复到初始版本，请谨慎操作！</view>
        <input
          :value="verificationCode"
          placeholder="请输入校验码，请询问客服获取"
          placeholder-class="input-placeholder"
          class="verification-code"
          @input="bindInputVerificationCode"
        />
      </template>
      <template #footer>
        <view class="w-full flex">
          <wd-button type="info" plain block @click="isTips = false">取消</wd-button>
          <wd-button block type="error" custom-class="cancel-button" @click="confirm">
            确定
          </wd-button>
        </view>
      </template>
    </bc-confirm>
  </view>
  <new-version
    v-if="cloudVersion"
    ref="newVersionPage"
    :is-tips="versionPopup"
    @close="versionPopup = false"
    @openUpdate="versionPopup = true"
  />
</template>

<script lang="ts" setup>
import { useBluetoothStore, useDevicVersionStore } from '@/store'
import { deviceImg } from '@/utils'
import { useMessage, useToast } from 'wot-design-uni'
import { CoffeeMachineProtocol } from '@/utils/coffeebBlueTool'
import newVersion from './new-version.vue'
const bluetoothStore = useBluetoothStore()
const deviceVersionStore = useDevicVersionStore()
const coffeeMachineProtocol = CoffeeMachineProtocol.getInstance()
// 服务器版本号
const cloudVersion = ref(
  bluetoothStore.connectedDevice.productInfo.productInformation.productVersion.trim(),
)
const toast = useToast()
const version = ref(deviceVersionStore.version)
// 阉割过的版本号
const castrateVersionNumber = computed(() => version.value?.split('-')[2].slice(1))
const objData = ref({
  icon: '',
  content: '是否确定恢复到初始版本？',
  tips: '',
})

const verificationCode = ref(null)
const fixedVerificationCode = ref('mZ8pF3nR9q')
const bindInputVerificationCode = (e) => {
  verificationCode.value = e.detail.value
}
const confirm = async () => {
  if (!verificationCode.value) {
    toast.error('请输入校验码！')
    return
  }
  if (verificationCode.value !== fixedVerificationCode.value) {
    toast.error('校验码错误，请重新输入！')
    return
  }
  const reuslt = await coffeeMachineProtocol.SendRestoreVersion()
  console.log('恢复到初始版本返回结果', reuslt)
  if (reuslt === 'dd') {
    isTips.value = false
    toast.success('命令执行成功')
  } else {
    toast.error('命令执行失败，请重新尝试！')
  }
}
const isTips = ref<boolean>(false)

// 发现新版本
const versionPopup = ref<any>(false)
const newVersionPage = ref()
const newVersionFound = () => {
  versionPopup.value = true
  nextTick(() => {
    if (newVersionPage.value) {
      newVersionPage.value.openPopupFunction()
    }
  })
}

defineExpose({
  newVersionFound,
})
</script>
<style lang="scss" scoped>
.page-container {
  height: 100vh;
  background: #f7f7f7;
  .page-content {
    padding: 24rpx 48rpx 0 48rpx;
    font-size: 32rpx;
    .page-content-title {
      font-size: 48rpx;
      font-weight: 500;
      line-height: 72rpx;
      color: #222222;
    }
    .page-content-tips {
      font-size: 24rpx;
      line-height: 42rpx;
      color: #666666;
      text-align: center;
    }
    .base-info {
      padding: 48rpx 36rpx;
      font-weight: 500;
      background: #ffffff;
      border-radius: 20rpx;
    }
    .statistics-tilte {
      margin-top: 28rpx;
      margin-bottom: 24rpx;
      font-family: PingFang SC;
      font-size: 28rpx;
      font-weight: 500;
      color: #666666;
    }
    .statistics-info {
      padding: 48rpx 36rpx;
      background: #ffffff;
      border-radius: 20rpx;
    }
    .info-title {
      // margin-bottom: 12rpx;
      font-size: 28rpx;
      font-weight: normal;
    }
    .info-desc {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      justify-content: center;
    }
    .version-color {
      font-size: 24rpx;
      color: #004097;
    }
  }
  .new-version {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    margin-top: 68rpx;
  }
}
.text-center {
  margin-bottom: 24rpx;
  font-size: 26rpx;
  text-align: center;
}
.input-placeholder {
  font-size: 26rpx;
  color: #999999;
}
.verification-code {
  height: 72rpx;
  padding: 0 24rpx;
  margin-top: 24rpx;
  font-size: 26rpx;
  color: #222222;
  border: 1rpx solid #dcdcdc;
  border-radius: 20rpx;
}
</style>
