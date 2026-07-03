<route lang="json">
{
  "style": {
    "navigationBarTitleText": "%index.device%",
    "disableScroll": true
  }
}
</route>

<template>
  <view class="pt-2 px-4 page-container">
    <!-- 搜索设备标题栏 -->
    <!-- <wd-notice-bar
        :text="$t('add.search')"
        :scrollable="false"
        color="#34D19D"
        background-color="#f0f9eb"
      >
        <template #prefix>
          <wd-loading :size="20" />
        </template>
      </wd-notice-bar> -->
    <view
      class="flex justify-center justify-between items-center p-3"
      v-if="discoveredDevices.length > 0 && discoveredDevices[0].productInfo"
    >
      <view>
        <view class="font-size-6">
          找到{{ isBluetoothEnabled ? discoveredDevices.length : 0 }}台设备
        </view>
        <view class="mt-3 font-size-3 tips-color">请选择您要连接的设备</view>
      </view>
      <view>
        <wd-img
          :width="34"
          :height="34"
          @click="refreshDevices()"
          :class="{ 'rotate-icon': isRotating }"
          src="/static/images/find/refresh.png"
        ></wd-img>
      </view>
    </view>
    <view class="flex flex-col p-3" v-else>
      <view>
        <view class="font-size-6">查找设备中...</view>
        <view class="mt-3 font-size-3 tips-color">
          正在搜索附近设备，请确保设备处于开机状态，如果长时间未搜索到设备，请检查是否开启微信定位
        </view>
      </view>
      <view class="flex justify-center items-center mt-7">
        <!-- <wd-img
          :width="285"
          :height="285"
          src="https://cdnshop.bincoocoffee.cn/aa68025e1907216538d9cc0e4f05da0c8950d055cce4bffbe84c1ea7cfecb929.png"
        ></wd-img> -->
        <c-svga
          ref="cSvgaRef"
          width="285px"
          height="285px"
          canvasId="addCanvas"
          :src="`${cdnBaseUrl}/79fcc0fba57e9aba342b8ae317d524213e91fda0d1a02deeb4b8b6f860636db9.svga`"
          :loops="0"
          :auto-play="true"
        ></c-svga>
      </view>
      <view class="flex justify-center items-center w-full mt-5">
        <wd-button type="info" custom-class="cancel-button" block plain @click="cancelSearch()">
          取消查找
        </wd-button>
      </view>
    </view>
    <!-- 设备列表 -->
    <!-- <scroll-view scroll-y="true" class="scroll-Y">
        <view class="pt-2">
          <swiper class="swiper" circular :indicator-dots="true" :autoplay="false">
            <swiper-item>
              <view class="swiper-item">
                <view class="flex justify-center items-center">
                  <view class="devcie m-2">
                    <view class="p-5 flex flex-col flex-justify-between devcie-header">
                      <view class="devcie-header-left">
                        <wd-text text="测试数据"></wd-text>
                      </view>
                      <view class="devcie-header-right mt-2 flex items-center">
                        <wd-text text="CSDFSDFSDF"></wd-text>
                        <view class="divider"></view>
                        <view class="flex items-center justify-center">
                          <view class="flex items-center justify-center">
                            <i class="iconfont icon-signal-tower-line icon-size-12"></i>
                            <view class="ml-1 line-height-3.5 h-4">信号强</view>
                          </view>
                        </view>
                      </view>
                    </view>
                    <view class="mt-2 flex justify-center items-center">
                      <wd-img
                        :width="245"
                        :height="245"
                        src="https://cdnshop.bincoocoffee.cn/5a7912d35f47713b2ffed87b0b498781cf13954f053769aa5dfd1da98f46a747.png"
                      ></wd-img>
                    </view>
                    <view class="mt-7 mb-5 flex justify-center items-center">
                      <wd-button type="primary" custom-class="custom-button">
                        {{ $t('add.connect') }}
                        <view class="i-carbon:triangle-right-solid font-size-3 mb-0.5"></view>
                      </wd-button>
                    </view>
                  </view>
                </view>
              </view>
            </swiper-item>
            <swiper-item>
              <view class="swiper-item">
                <view class="flex justify-center items-center">
                  <view class="devcie m-2">
                    <view class="p-5 flex flex-col flex-justify-between devcie-header">
                      <view class="devcie-header-left">
                        <wd-text text="测试数据"></wd-text>
                      </view>
                      <view class="devcie-header-right mt-2 flex items-center">
                        <wd-text text="CSDFSDFSDF"></wd-text>
                        <view class="divider"></view>
                        <view class="flex items-center justify-center">
                          <view class="flex items-center justify-center">
                            <i class="iconfont icon-signal-tower-line icon-size-12"></i>
                            <view class="ml-1 line-height-3.5 h-4">信号强</view>
                          </view>
                        </view>
                      </view>
                    </view>
                    <view class="mt-2 flex justify-center items-center">
                      <wd-img
                        :width="245"
                        :height="245"
                        src="https://cdnshop.bincoocoffee.cn/5a7912d35f47713b2ffed87b0b498781cf13954f053769aa5dfd1da98f46a747.png"
                      ></wd-img>
                    </view>
                    <view class="mt-7 mb-5 flex justify-center items-center">
                      <wd-button type="primary" custom-class="custom-button">
                        {{ $t('add.connect') }}
                        <view class="i-carbon:triangle-right-solid font-size-3 mb-0.5"></view>
                      </wd-button>
                    </view>
                  </view>
                </view>
              </view>
            </swiper-item>
          </swiper>
        </view>
      </scroll-view> -->
    <scroll-view scroll-y="true" class="scroll-Y">
      <view v-if="discoveredDevices.length > 0 && discoveredDevices[0].productInfo" class="pt-2">
        <swiper
          class="swiper"
          :key="discoveredDevices.length"
          circular
          :indicator-dots="true"
          :next-margin="discoveredDevices.length > 1 ? '80rpx' : ''"
          :autoplay="false"
        >
          <view v-for="(device, index) in discoveredDevices" :key="index">
            <swiper-item>
              <view class="swiper-item">
                <view class="flex justify-center items-center">
                  <view class="devcie">
                    <view
                      class="p-5 flex flex-col flex-justify-between devcie-header"
                      v-if="device.productInfo"
                    >
                      <view class="devcie-header-left">
                        <wd-text :text="device.productInfo.deviceName"></wd-text>
                      </view>
                      <view class="devcie-header-right mt-2 flex items-center">
                        <wd-text :text="device.productInfo.deviceSn"></wd-text>
                        <view class="divider"></view>
                        <view
                          :class="getColorClass(device.RSSI)"
                          class="flex items-center justify-center"
                        >
                          <i
                            class="iconfont icon-signal-tower-line icon-size-12"
                            :class="getColorClass(device.RSSI)"
                          ></i>
                          <view class="ml-1 line-height-3.5 h-4">
                            信号{{ device.RSSI > -90 ? '强' : '弱' }}
                          </view>
                        </view>
                      </view>
                    </view>
                    <view class="flex w-full justify-center items-center" v-else>
                      <wd-skeleton
                        theme="text"
                        :custom-style="{ width: '100%', marginTop: '20px' }"
                      />
                    </view>
                    <view class="mt-2 flex justify-center items-center" v-if="device.productInfo">
                      <image
                        :src="deviceImg(device)"
                        mode="scaleToFill"
                        class="device-image"
                      ></image>
                    </view>
                    <view class="flex w-full justify-center items-center" v-else>
                      <wd-skeleton
                        :row-col="[{ width: '245px', height: '245px' }]"
                        :custom-style="{ marginTop: '20px' }"
                      />
                    </view>
                    <view
                      class="mt-7 mb-5 flex justify-center flex-col items-center"
                      v-if="device.productInfo"
                    >
                      <wd-button
                        :type="device.state"
                        custom-class="custom-button"
                        @click="connect(device)"
                        v-if="device.state === 'primary'"
                        :loading="device.loading"
                        loading-color="#004097"
                      >
                        <view
                          v-if="device.state === 'primary'"
                          class="flex items-center justify-center"
                        >
                          <view>
                            {{ device.loading ? '连接中' : '连接设备' }}
                          </view>
                          <view v-if="!device.loading" class="ml-0.5">
                            <wd-icon name="caret-right-small" color="#ffffff" size="16px"></wd-icon>
                          </view>
                        </view>
                      </wd-button>
                      <wd-button v-else :type="device.state" custom-class="custom-button">
                        <view
                          v-if="device.state === 'success'"
                          class="flex items-center justify-center"
                        >
                          <view class="mr-0.5">
                            <wd-icon name="check1" color="#ffffff" size="16px"></wd-icon>
                          </view>
                          <view>连接成功</view>
                        </view>
                        <view
                          v-if="device.state === 'error'"
                          class="flex items-center justify-center"
                        >
                          <view class="mr-0.5">
                            <wd-icon name="close" color="#ffffff" size="16px"></wd-icon>
                          </view>
                          <view>连接失败</view>
                        </view>
                      </wd-button>
                      <view class="error-tips" v-if="device.state === 'error'">
                        请检查设备是否在附近，且已正确连接电源
                      </view>
                    </view>
                    <view class="flex w-full justify-center items-center" v-else>
                      <wd-skeleton
                        theme="text"
                        :custom-style="{ width: '100%', marginTop: '20px' }"
                      />
                    </view>
                  </view>
                </view>
              </view>
            </swiper-item>
          </view>
        </swiper>
      </view>
    </scroll-view>
    <!-- <scroll-view scroll-y="true" class="scroll-Y">
        <view v-if="isBluetoothEnabled" class="pt-2">
          <view v-for="(device, index) in discoveredDevices" :key="index">
            <wd-transition :show="true" name="fade-left">
              <wd-card :title="device.name">
                <view>
                  <wd-row>
                    <wd-col :span="6">
                      <image
                        v-if="device.productInfo"
                        :src="deviceImg"
                        mode="scaleToFill"
                        class="avatarClass"
                      ></image>
                      <wd-skeleton v-else theme="image" />
                    </wd-col>
                    <wd-col :span="18" class="text-right">
                      <view class="textClass">
                        <wd-text
                          v-if="device.productInfo"
                          size="22px"
                          :text="device.productInfo.deviceName"
                        ></wd-text>
                        <br />
                        <wd-text
                          v-if="device.productInfo"
                          :text="device.productInfo.productInformation.productCode"
                        ></wd-text>
                        <wd-skeleton v-else theme="text" />
                      </view>
                    </wd-col>
                  </wd-row>
                </view>
                <template #footer>
                  <view>
                    <wd-button size="small" plain disabled style="margin-right: 8px">
                      <view :class="getIconClass(device.RSSI)"></view>
                    </wd-button>
                    <wd-button size="small" icon="link" type="success" @click="connect(device)">
                      {{ $t('add.connect') }}
                    </wd-button>
                  </view>
                </template>
              </wd-card>
            </wd-transition>
          </view>
        </view>
      </scroll-view> -->
  </view>
</template>

<script lang="ts" setup>
import { useBluetoothStore, useDevicVersionStore, useMachineEStatusStore } from '@/store'
import { updateTitle } from '@/utils/title'
import { useToast } from 'wot-design-uni'
import { t } from '@/locale/index'
import cSvga from '../components/c-svga/components/c-svga/c-svga.vue'
import { getDomain, deviceImg } from '@/utils'
import { httpPut } from '@/utils/http'
const cdnBaseUrl = import.meta.env.VITE_CDN_BASE_URL
const bluetoothStore = useBluetoothStore() // 获取 store 实例
// 蓝牙数据
const isBluetoothEnabled = ref<boolean>(false) // 蓝牙是否已启用
const discoveredDevices = ref(bluetoothStore.discoveredDevices) // 使用响应式引用
const totast = useToast()
const isRotating = ref(false)
const cSvgaRef = ref()
const deviceVersionStore = useDevicVersionStore()
watch(
  () => bluetoothStore.discoveredDevices,
  (newValue) => {
    newValue.forEach((item) => {
      if (!Object.prototype.hasOwnProperty.call(item, 'state')) {
        item.state = 'primary'
      }
      if (!Object.prototype.hasOwnProperty.call(item, 'loading')) {
        item.loading = false
      }
    })
    // console.log('newValue', newValue)
    discoveredDevices.value = [...newValue]
  },
  { deep: true, immediate: true },
)
onLoad(() => {})
// 初始化
onReady(() => {
  searchDevice()
  updateTitle('index.device')
})
const searchDevice = async () => {
  await nextTick()
  // 开始动画
  cSvgaRef.value && cSvgaRef.value.call('startAnimation')
  // 搜索蓝牙设备 根据产品名称过滤
  isBluetoothEnabled.value = true
  await bluetoothStore.startDiscovery('BC-')
}
const connect = (device) => {
  device.loading = true
  device.isConnected = false
  // 连接设备 TODO 查询数据库设备实例 将用户id更新至设备实例
  bluetoothStore
    .connectToDevice(device)
    .then(async () => {
      // totast.success(t('totast.error.ljcg'))
      // 清除之前设备的萃取设置
      deviceVersionStore.resetSettingData()
      // 开启版本检测
      deviceVersionStore.setCheckVersion(true)
      // // 更新设备信息, 版本信息可能是缓存中取的，不是最新版本
      // try {
      //   const productInfo = await bluetoothStore.fetchProductInfo(device.name)
      //   if (productInfo) {
      //     device.productInfo = productInfo
      //     bluetoothStore.setConnectedDevice(device)
      //     bluetoothStore.cachedProductInfo[device.name] = productInfo
      //   }
      // } catch (error) {
      //   console.log('更新设备缓存信息:' + error)
      // }
      // 上报设备位置信息
      try {
        // 获取当前位置
        const location = await getCurrentLocation()
        console.log('当前位置:', location)
        console.log(device, '连接设备跳转')
        await reportDeviceLocation(device.productInfo, location)
        device.loading = false
        device.state = 'success'
        setTimeout(() => {
          // 根据设备名称跳转对应设备页
          const productCode = device.productInfo.productInformation.productCode
          switch (productCode) {
            case 'BC-KFJ08':
              uni.redirectTo({
                url: '/pages-coffeeb/index/index',
              })
              break
            case 'BC-PO01':
              uni.redirectTo({
                url: '/pages-coffeec/index/index',
              })
              break
            case 'BC-SCC01':
              uni.redirectTo({
                url: '/pages-coffeee/index/index',
              })
              break
            case 'BC-SCH01':
              uni.redirectTo({
                url: '/pages-coffeed/index/index',
              })
              break
            case 'BC-KFJ07':
              uni.redirectTo({
                url: '/pages-coffeef/index/index',
              })
              break
            case 'BC-YSKFJ03':
              uni.redirectTo({
                url: '/pages-coffeeh/index/index',
              })
              break
            case 'BC-PO04':
              uni.redirectTo({
                url: '/pages-coffeei/index/index',
              })
              break
            default:
              uni.redirectTo({
                url: '/pages-coffeea/index/index',
              })
              break
          }
        }, 500)
      } catch (error) {
        device.loading = false
        device.state = 'error'
        console.error('上报设备位置信息:' + error)
      }
    })
    .catch((error) => {
      device.loading = false
      device.state = 'error'
      console.log(error, 'test')
      totast.error('连接失败，请刷新重新试！')
      // totast.error(error.errMsg)
    })
}

// 手冲称模块存储基础基础信息
const machineEStatusStore = useMachineEStatusStore()
const storeSccDeviceInfo = (device) => {
  machineEStatusStore.setBluetoothData(device)
}

// 获取当前位置
const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    uni.getLocation({
      type: 'gcj02', // 或 'wgs84'
      isHighAccuracy: true, // 是否需要高精度定位
      success: (res) => resolve({ latitude: res.latitude, longitude: res.longitude }),
      fail: (err) => {
        console.log(err, '获取定位失败')
        // totast.error('请开启定位权限')
        reject(new Error('获取定位失败'))
      },
    })
  })
}
// 上报设备位置到服务器
const reportDeviceLocation = (productInfo, location) => {
  productInfo.latitude = location.latitude
  productInfo.longitude = location.longitude
  const { run } = useRequest<IResponseData>(() =>
    httpPut('/deviceManage/deviceManage', { ...productInfo }),
  )
  run().then((res) => {
    console.log('位置上报', res)
  })
}
// 根据信号强度返回不同颜色
const getColorClass = (RSSI: number) => {
  if (RSSI > -90) {
    return 'text-green'
  } else {
    return 'text-red'
  }
}

// 离开页面停止搜索 以及初始化
onUnload(() => {
  stopDiscovery()
  // 清除动画
  cSvgaRef.value.call('clear')
})
onHide(() => {
  stopDiscovery()
  // 清除动画
  cSvgaRef.value.call('clear')
})
onShow(() => {
  // 登录页面返回时 启动蓝牙搜索
  refreshDevices()
})
const stopDiscovery = () => {
  bluetoothStore.stopDiscovery()
  // 暂停动画
  cSvgaRef.value.call('stopAnimation')
}
const refreshDevices = async () => {
  isRotating.value = true
  try {
    await stopDiscovery()
    await searchDevice()
    isRotating.value = false
  } catch (error) {
    isRotating.value = false
  }
}
const cancelSearch = () => {
  uni.reLaunch({ url: '/pages/index/index' })
}
</script>

<style lang="scss" scoped>
.page-container {
  background-color: rgb(247 247 247);
  .swiper {
    height: 1050rpx;
  }
  .swiper-item {
    height: 1050rpx;
  }
  .devcie {
    width: 562rpx;
    height: 100%;
    min-height: 876rpx;
    margin-top: 48rpx;
    background-color: #ffffff;
    border-radius: 20rpx;
    .devcie-header {
      .devcie-header-left {
        :deep(.wd-text) {
          font-size: 40rpx !important;
          font-weight: 600 !important;
          color: #222222 !important;
        }
      }
      .devcie-header-right {
        // color: #25ae69;
        font-size: 24rpx;
      }
    }
    :deep(.custom-button) {
      width: 466rpx !important;
      height: 92rpx !important;
    }
    .divider {
      display: inline-block;
      width: 2rpx;
      height: 26rpx;
      margin: 0 24rpx;
      background-color: #e2e2e2;
    }
    .device-image {
      width: 490rpx;
      height: 490rpx;
    }
  }
  .indicator {
    .banner-indicator-box {
      position: relative;
      height: 20rpx;
      background: #d4d4d4;
      border-radius: 15rpx;
      .indicator-item {
        position: absolute;
        width: 40rpx;
        height: 20rpx;
        background: #2d99a1;
        border-radius: 15rpx;
        transition: all 0.3s;
      }
    }
  }
  :deep(.cancel-button) {
    width: 524rpx !important;
    height: 92rpx !important;
    border-color: #dedede !important;
  }
  .error-tips {
    margin-top: 16rpx;
    font-size: 22rpx;
    color: #e51f4d;
  }
}
.title {
  justify-content: space-between;
}
.title-tip {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.25);
}
.avatarClass {
  width: 80px;
  height: 80px;
  border-radius: 10px;
}
.textClass {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  height: 80px;
}
.scroll-Y {
  height: 90vh;
}
.rotate-icon {
  transition: transform 1s ease-in-out;
  transform: rotate(360deg);
}
.test {
  /* 其他样式 */
  animation: slideRight 2s infinite alternate; /* 持续时间2秒，无限循环，alternate会在动画结束时反向播放 */
}
@keyframes slideRight {
  0% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(20px); /* 你可以根据需要调整这个值 */
  }
  100% {
    transform: translateX(0);
  }
}
</style>
