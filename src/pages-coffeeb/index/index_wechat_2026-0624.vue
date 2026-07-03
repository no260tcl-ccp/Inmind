<route lang="json5">
{
  style: {
    navigationBarTitleText: '设备管理',
    navigationStyle: 'custom',
  },
}
</route>

<template>
  <view class="page-container">
    <!-- <view class="font-size-3.5 flex ml-3" @click="toSetting()" style="padding-top: 6.5vh">
      <view><i class="iconfont icon-shezhi icon-size-20"></i></view>
      <view class="ml-1">设置</view>
    </view> -->
    <wd-navbar
      safeAreaInsetTop
      fixed
      placeholder
      custom-style="background-color: transparent"
      :bordered="false"
    >
      <template #left>
        <view @click="toHome()" v-if="!settingShow">
          <i class="iconfont icon-a-ze-arrow-leftCopy2 icon-size-22"></i>
        </view>
      </template>
    </wd-navbar>
    <view class="page-content">
      <view class="flex flex-col items-center justify-center mb-6">
        <wd-img :width="279" :height="253" :src="homeImg" />
        <!-- <view class="page-content-title">{{ bluetoothStore.connectedDevice.productInfo.machineName }}</view> -->
        <view class="page-content-title">
          {{
            bluetoothStore.connectedDevice
              ? bluetoothStore.connectedDevice.productInfo.deviceName
              : '全自动咖啡机'
          }}
        </view>
        <view
          class="state-box flex items-center justify-center"
          :style="{ color: runStateObj.color }"
          @click="toState()"
        >
          <view calss="state-img">
            <i class="iconfont icon-size" :class="runStateObj.icon"></i>
          </view>
          <view class="state-tips">
            <text>{{ runStateObj.text }}</text>
            <text v-if="runStateObj.isJump" class="jump-text">查看详情</text>
          </view>
        </view>
      </view>
      <view class="swiper-card">
        <view
          class="flex justify-between items-center font-size-4"
          @click="toFormula('/pages-coffeeb/myFormula/myFormula')"
        >
          <view>配方管理</view>
          <i class="iconfont icon-a-ze-arrow-leftCopy2-copy-copy ml-1"></i>
        </view>
        <view
          class="swiper-card-content"
          :style="{ marginBottom: dataList.length > 0 ? '0' : '30rpx' }"
        >
          <swiper
            v-if="dataList.length > 0"
            class="swiper"
            :next-margin="dataList.length > 1 ? '80rpx' : ''"
            circular
            :indicator-dots="false"
            :autoplay="false"
          >
            <swiper-item v-for="(item, index) in dataList" :key="index">
              <view class="swiper-item flex" @click.stop="itemClick(item, index)">
                <view class="flex justify-center items-center">
                  <view class="img-box">
                    <wd-img :width="78" :height="78" :src="item.configJson.bgUrl" />
                    <view class="img-num" :style="{ color: item.configJson.textColor }">
                      {{
                        item.configJson.accordionItems ? item.configJson.accordionItems.length : ''
                      }}
                    </view>
                  </view>
                </view>
                <view class="flex flex-col justify-center pl-3 pr-3 font-size-3 content-box">
                  <view class="name ellipsis">{{ item.name }}</view>
                  <view class="digital-numbers">
                    粉水比：
                    {{
                      item.configJson.proportion
                        ? `1:${item.configJson.proportion.toFixed(1) / 2}`
                        : '-'
                    }}
                    {{
                      item.configJson.proportion
                        ? (item.configJson.proportion / 2) * item.configJson.legumes + 'ml'
                        : '-'
                    }}
                  </view>
                  <view class="digital-numbers">
                    咖啡粉：{{ item.configJson.legumes ? `${item.configJson.legumes}g` : '-' }}
                  </view>
                </view>
              </view>
            </swiper-item>
          </swiper>

          <view v-else class="title-color h-20 flex items-center font-size-3 justify-center">
            <bc-status-tip icon="/static/images/common/no-data.png" :width="65" :height="53">
              <template #message>
                <p class="desc-color -mt-3 flex items-center justify-center icon-size-14">
                  <view>暂无配方,</view>
                  <view
                    @click="addFormula"
                    class="primary-color flex items-center justify-center ml-1"
                  >
                    <i class="iconfont icon-a-lujing180"></i>
                    <view class="ml-1">点击创建</view>
                  </view>
                </p>
              </template>
            </bc-status-tip>
          </view>
        </view>
      </view>
      <view class="hot-formula" @click="toFormula('/pages-coffeeb/cloudFormula/cloudFormula')">
        <view class="desc">更多推荐</view>
      </view>
      <wd-row :gutter="16">
        <wd-col :span="8">
          <view class="operate" @click="toGrind()">
            <view>
              <wd-img :width="49" :height="49" :src="`${aliyunBaseUrl}quickBoiling.png`" />
            </view>
            <view class="operate-name">快速冲煮</view>
          </view>
        </wd-col>
        <wd-col :span="8">
          <view class="operate" @click="smashClick()">
            <view>
              <wd-img :width="49" :height="49" :src="`${aliyunBaseUrl}grinding.png`" />
            </view>
            <view class="operate-name">研磨</view>
          </view>
        </wd-col>
        <wd-col :span="8">
          <view class="operate" @click="toWaterInjection()">
            <view>
              <wd-img :width="49" :height="49" :src="`${aliyunBaseUrl}waterInjection.png`" />
            </view>
            <view class="operate-name">注水</view>
          </view>
        </wd-col>
      </wd-row>
      <view @click="toSetting()" class="setting-card" v-if="getDeviceBrand() === 'redmi'">
        <view class="setting">
          <view class="flex">
            <i class="iconfont icon-shezhi icon-size-20"></i>
            <text class="ml-1">设置</text>
          </view>
          <view class="flex items-center justify-center">
            <view v-if="hasAlarm" class="badge">1</view>
            <i class="iconfont icon-a-ze-arrow-leftCopy2-copy-copy ml-1"></i>
          </view>
        </view>
      </view>
      <view
        v-else
        @click="toSetting()"
        class="setting-card1 flex justify-between items-center font-size-3.5"
      >
        <view class="flex">
          <i class="iconfont icon-shezhi icon-size-20"></i>
          <text class="ml-1">设置</text>
        </view>
        <view class="flex items-center justify-center">
          <view v-if="hasAlarm" class="badge">1</view>
          <i class="iconfont icon-a-ze-arrow-leftCopy2-copy-copy ml-1"></i>
        </view>
      </view>
    </view>
    <!-- 设置 -->
    <SettingPopup
      :settingShow="settingShow"
      @closeShow="settingShow = false"
      :hasAlarm="hasAlarm"
    />
    <!-- 设备颜色选择-->
    <bc-confirm
      :show="isColorTips"
      :objData="objColorData"
      :isCancel="false"
      @close="isColorTips = false"
      @success="colorConfirm"
    >
      <template #header>
        <view>请选择设备的颜色</view>
      </template>
      <template #main>
        <wd-radio-group shape="dot" checked-color="#004097" inline v-model="colorValue">
          <wd-radio :value="1">黑色</wd-radio>
          <wd-radio :value="2">白色</wd-radio>
        </wd-radio-group>
      </template>
    </bc-confirm>
    <!--固件升级-->
    <!-- <new-version
      v-if="cloudVersion"
      ref="newVersionPage"
      :is-tips="versionPopup"
      @close="versionPopup = false"
      @openUpdate="versionPopup = true"
    /> -->
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import {
  useBluetoothStore,
  useMachineBStatusStore,
  useDevicVersionStore,
  useUserStore,
} from '@/store' // 设备状态
import { useMessage, useToast } from 'wot-design-uni'
import { t } from '@/locale/index'
import SettingPopup from './setting-popup.vue'
import newVersion from '../info/new-version.vue'
import { httpGet, httpPut } from '@/utils/http'
import { getDomain, convertIntStrToNumber } from '@/utils'
import { CoffeeMachineProtocol } from '@/utils/coffeebBlueTool'
import { useRunStatusWatcher } from '@/hooks/useRunStatusWatcher'
const coffeeMachineProtocol = CoffeeMachineProtocol.getInstance()
const bluetoothStore = useBluetoothStore()
const machineStatusStore = useMachineBStatusStore()
const deviceVersionStore = useDevicVersionStore()
const totast = useToast()
const message = useMessage()
const versionPopup = ref(false)
// xr-frame 暂时关闭3D模型
const xrFrameStatus = ref(false)
const width = ref(300)
const height = ref(300)
const renderWidth = ref(300)
const renderHeight = ref(300)
const loaded = ref(false) // 加载状态

// 定义响应式数据状态
const machineStatus = ref(machineStatusStore.modeString) // 机器状态
const hasAlarm = ref(machineStatusStore.hasAlarm)
const runStatus = ref<number>(machineStatusStore.runStatus)
const injectionStop = ref(machineStatusStore.injectionData.startStop)
const grindStop = ref(machineStatusStore.grindData.startStop)
const brewStop = ref(machineStatusStore.brewData.startStop)
const cdnBaseUrl = import.meta.env.VITE_CDN_BASE_URL
const aliyunBaseUrl = import.meta.env.VITE_COFFEE_BASE_URL
console.log(import.meta.env.VITE_COFFEE_BASE_URL, '环境变量')
const formulaBgList = [
  {
    url: `${cdnBaseUrl}/a4fe367f3bf4c0ab36b4b932689d57bb3456610c1daa287e66aa44268a528373.png`,
    color: '#F5ABBD',
  },
  {
    url: `${cdnBaseUrl}/753a976ec38d2c7c62784cfb711880923b4b2bd9a926c8a92f7ef539e946db3b.png`,
    color: '#A1B9D9',
  },
  {
    url: `${cdnBaseUrl}/7af32880c9244e35fa97b89de490fbd2beb6c6221ae1f58e07c2ed79ed1a71b1.png`,
    color: '#99CEB3',
  },
  {
    url: `${cdnBaseUrl}/ce2564f7e0e213f415624a2a8001d4d3a8b9a85743e23b7db308b73a37a8e16f.png`,
    color: '#D9C1A1',
  },
]
// 服务器版本号
const cloudVersion = ref(
  bluetoothStore.connectedDevice.productInfo.productInformation.productVersion.trim(),
)
const version = ref(deviceVersionStore.version)

// 自动跳转
const autoJump = ref(deviceVersionStore.autoJump)
// 定义 runType 对应的页面路径映射
const RUN_TYPE_TO_PAGE = {
  1: 'pages-coffeeb/smash/smash',
  2: 'pages-coffeeb/waterInjection/waterInjection',
  3: 'pages-coffeeb/pulverizing/pulverizing',
}
const { toPage } = useRunStatusWatcher(
  () => machineStatusStore.runStatus,
  autoJump,
  RUN_TYPE_TO_PAGE,
)
// 是否检查版本更新状态
const checkVersion = ref(deviceVersionStore.checkVersion)
const homeImg = computed(() => {
  // productImage中有二种图片类型，1：黑色，2：白色，每种类型有两张图片一张设备图片，一张设备主页展示图片
  // const domain = getDomain()
  const domain = '' // 改为绝对路径了
  if (!bluetoothStore.connectedDevice) {
    return ''
  }
  const { productInformation, configJson } = bluetoothStore.connectedDevice.productInfo
  if (!productInformation?.productImage) {
    return ''
  }
  let imgs = []
  try {
    imgs = productInformation.productImage.split(',')
    if (imgs.length === 0) {
      return ''
    }
  } catch (error) {
    console.log(error, productInformation.productImage)
    return ''
  }
  // 默认返回第一张图
  let result = domain + imgs[1]
  if (configJson && typeof configJson === 'string') {
    try {
      const config = JSON.parse(configJson)
      if (config.colorType === 1) {
        result = domain + imgs[1]
      } else if (config.colorType === 2 && imgs.length > 2) {
        result = domain + imgs[3]
      }
    } catch (error) {
      console.log(error, configJson)
    }
  }
  return result
})
// 根据 runStatus 的值计算 runStateObj
// const runStateObj = computed(() => {
//   // 节能模式下机器不能运行
//   if (machineStatus.value === '节能模式') {
//     return {
//       text: '节能模式',
//       color: '#25AE69',
//       icon: 'icon-jienengmoshi',
//       isJump: false,
//     }
//   } else if (machineStatus.value === '维修模式') {
//     return {
//       text: '机器维护',
//       color: '#E51F4D',
//       icon: 'icon-a-qietu206',
//       isJump: false,
//     }
//   } else if (injectionStop.value === 2) {
//     return {
//       text: '注水暂停',
//       color: '#E51F4D',
//       icon: 'icon-zhushuizhong',
//       isJump: true,
//     }
//   } else if (grindStop.value === 2) {
//     return {
//       text: '研磨暂停',
//       color: '#E51F4D',
//       icon: 'icon-a-qietu204',
//       isJump: true,
//     }
//   } else if (brewStop.value === 2) {
//     return {
//       text: '冲煮暂停',
//       color: '#E51F4D',
//       icon: 'icon-a-qietu206-2',
//       isJump: true,
//     }
//   } else {
//     switch (runStatus.value) {
//       case 1:
//         return {
//           text: '研磨中',
//           color: '#004097',
//           icon: 'icon-a-qietu204',
//           isJump: true,
//         }
//       case 2:
//         return {
//           text: '注水中',
//           color: '#004097',
//           icon: 'icon-zhushuizhong',
//           isJump: true,
//         }
//       case 3:
//         return {
//           text: '冲煮中',
//           color: '#004097',
//           icon: 'icon-a-qietu206-2',
//           isJump: true,
//         }
//       default:
//         return {
//           text: '空闲中',
//           color: '#666666',
//           icon: 'icon-kongxianzhong',
//           isJump: false,
//         } // 默认状态，当没有匹配的 case 时返回
//     }
//   }
// })
const colorValue = ref(1)
const objColorData = ref({
  icon: '',
  content: '',
  tips: '',
})
const isColorTips = ref<boolean>(false)
const colorConfirm = () => {
  if (colorValue.value) {
    const device = bluetoothStore.connectedDevice
    if (device.productInfo.configJson) {
      const config = JSON.parse(device.productInfo.configJson)
      config.colorType = colorValue.value
      device.productInfo.configJson = JSON.stringify(config)
    } else {
      device.productInfo.configJson = JSON.stringify({
        colorType: colorValue.value,
      })
    }
    const { run } = useRequest<IResponseData>(() =>
      httpPut('/deviceManage/deviceManage', { ...device.productInfo }),
    )
    run().then((res) => {
      if (res.code === 200) {
        bluetoothStore.setConnectedDevice(device)
        totast.success('设置成功')
        isColorTips.value = false
      } else {
        totast.error(res.msg)
        // 此处totast好像会关闭confirm，所以需要重新打开，原因待确定
        isColorTips.value = true
      }
    })
  } else {
    totast.error('请选择设备颜色')
    isColorTips.value = true
  }
}
// 初始化设备颜色
const showInitColor = computed(() => {
  const { configJson } = bluetoothStore.connectedDevice.productInfo
  if (!configJson) {
    return true
  }
  try {
    const config = JSON.parse(configJson)
    return !Object.prototype.hasOwnProperty.call(config, 'colorType')
  } catch (error) {
    return false
  }
})
const runStateObj = computed(() => {
  // 状态配置映射表
  const statusConfig = {
    energySavingMode: {
      text: '节能模式',
      color: '#25AE69',
      icon: 'icon-jienengmoshi',
      isJump: false,
    },
    maintenanceMode: { text: '机器维护', color: '#E51F4D', icon: 'icon-a-qietu206', isJump: false },
    injectionStop: { text: '注水暂停', color: '#E51F4D', icon: 'icon-zhushuizhong', isJump: true },
    grindStop: { text: '研磨暂停', color: '#E51F4D', icon: 'icon-a-qietu204', isJump: true },
    brewStop: { text: '冲煮暂停', color: '#E51F4D', icon: 'icon-a-qietu206-2', isJump: true },
    runStatus: {
      1: { text: '研磨中', color: '#004097', icon: 'icon-a-qietu204', isJump: true },
      2: { text: '注水中', color: '#004097', icon: 'icon-zhushuizhong', isJump: true },
      3: { text: '冲煮中', color: '#004097', icon: 'icon-a-qietu206-2', isJump: true },
    },
    default: { text: '空闲中', color: '#666666', icon: 'icon-kongxianzhong', isJump: false },
  }

  // 按优先级顺序检查状态
  if (machineStatus.value === '节能模式') return statusConfig.energySavingMode
  if (machineStatus.value === '维修模式') return statusConfig.maintenanceMode
  if (injectionStop.value === 2) return statusConfig.injectionStop
  if (grindStop.value === 2) return statusConfig.grindStop
  if (brewStop.value === 2) return statusConfig.brewStop
  return statusConfig.runStatus[runStatus.value] || statusConfig.default
})

// 组件挂载时的逻辑
const newVersionPage = ref()
const upgradePopupfunction = async () => {
  await coffeeMachineProtocol.queryVersion()
  const version = await new Promise((resolve) => {
    setTimeout(async () => {
      const version = deviceVersionStore.$state.version.split('-')[2] // 直接获取版本号
      resolve(version) // 返回版本号
    }, 1000) // 延时 1 秒
  })
  const trimmedVersion = (version as string).slice(1, -1)
  // 检查版本更新
  nextTick(() => {
    if (checkVersion.value && trimmedVersion !== cloudVersion.value) {
      versionPopup.value = true
      if (newVersionPage.value) {
        newVersionPage.value.openPopupFunction()
      }
    }
  })
}
onMounted(async () => {
  coffeeMachineProtocol.listenForResponses()
  xrShow()
  // 初始化设备颜色
  isColorTips.value = showInitColor.value
  getMyFormula(1, 5)
  upgradePopupfunction()
})
// 组件卸载时注销监听器
onBeforeUnmount(() => {
  coffeeMachineProtocol.stopListeningForResponses()
  // bluetoothStore.offDataReceived()
})
onShow(() => {
  // 获取我的配方前5条
  getMyFormula(1, 5)
})
const xrShow = () => {
  // 获取设备窗口信息
  width.value = uni.getWindowInfo().windowWidth
  console.log('width', width.value)
  height.value = uni.getWindowInfo().windowHeight
  const dpi = uni.getWindowInfo().pixelRatio
  console.log('dpi', dpi)

  // 计算渲染尺寸
  renderWidth.value = width.value * dpi
  renderHeight.value = 300 * dpi

  // 判断是否开启模型显示
  if (width.value <= 375) {
    xrFrameStatus.value = false
  }
}
// 监听 machineStatusStore 中 runStatus 的变化
watch(
  () => machineStatusStore.runStatus,
  (newRunStatus) => {
    console.log('watch machineStatusStore.runStatus ----状态变化' + newRunStatus)
    runStatus.value = newRunStatus
  },
  { immediate: true },
)
// 监听 machineStatusStore 中 mode 的变化
watch(
  () => machineStatusStore.modeString,
  (newMode) => {
    console.log('watch machineStatusStore.modeString ----状态变化' + newMode)
    machineStatus.value = newMode
    // 判断状态 进入相关页面 萃取中 反冲洗 除垢 手动萃取
  },
  { immediate: true },
)

// 监听 machineStatusStore 中 hasAlarm 的变化
watch(
  () => machineStatusStore.hasAlarm,
  (newAlarmStatus) => {
    console.log('watch machineStatusStore.hasAlarm ---是否有警报：', newAlarmStatus)
    hasAlarm.value = newAlarmStatus
  },
  { immediate: true },
)
// 监听蓝牙状态变化
watch(
  () => bluetoothStore.connectionStatus,
  (newStatus) => {
    if (newStatus === 'disconnected') {
      console.log('蓝牙断开连接 返回首页')
      uni.switchTab({
        url: '/pages/index/index',
      })
    }
  },
  { immediate: true },
) // immediate: true 确保在挂载时立即检查状态
watch(
  () => machineStatusStore.injectionData,
  (newVal) => {
    console.log('注入数据变化', newVal)
    injectionStop.value = newVal.startStop
  },
  { deep: true, immediate: true },
)
watch(
  () => machineStatusStore.grindData,
  (newVal) => {
    grindStop.value = newVal.startStop
  },
  { deep: true, immediate: true },
)
watch(
  () => machineStatusStore.brewData,
  (newVal) => {
    brewStop.value = newVal.startStop
  },
  { deep: true, immediate: true },
)
watch(
  () => deviceVersionStore.autoJump,
  (newVal) => {
    autoJump.value = newVal
  },
  { immediate: true },
)
// 设置
const settingShow = ref(false)
const toSetting = () => {
  settingShow.value = true
}
const toFormula = (url) => {
  uni.navigateTo({
    url,
  })
}
const toGrind = () => {
  uni.navigateTo({
    url: '/pages-coffeeb/grind/grind',
  })
}
const smashClick = () => {
  uni.navigateTo({
    url: '/pages-coffeeb/smash/smash',
  })
}
const toWaterInjection = () => {
  uni.navigateTo({
    url: '/pages-coffeeb/waterInjection/waterInjection',
  })
}
const userStore = useUserStore()
const userInfo = userStore.userInfo
const dataList = ref([])
const recipeiDCollection = ref([]) // 配方id集合
const getMyFormula = (pageNo, pageSize) => {
  const params = {
    pageNum: pageNo,
    pageSize,
    userId: userInfo.id,
    deviceId: bluetoothStore.connectedDevice.productInfo.id,
  }
  const { run } = useRequest<IResponseData>(() => httpGet('/repice/repice/list', params))
  run().then((res) => {
    res.rows.forEach((el) => {
      el.configJson = JSON.parse(el.configJson)
      const index = Math.floor(Math.random() * formulaBgList.length)
      el.configJson.bgUrl = formulaBgList[index].url
      el.configJson.textColor = formulaBgList[index].color
    })
    dataList.value = convertIntStrToNumber(res.rows)
    recipeiDCollection.value = res.rows.map((el) => el.id)
    clearRecipeiDCollection(recipeiDCollection.value)
  })
}

// 清空存储的id
const clearRecipeiDCollection = async (arr) => {
  const bluetoothStore = useBluetoothStore()
  const device = bluetoothStore.connectedDevice
  if (device.productInfo.configJson) {
    const config = JSON.parse(device.productInfo.configJson)
    if (config.formulaId && (arr.length === 0 || !arr.includes(config.formulaId))) {
      await machineStatusStore.delQuickCookingRecipe()
    }
  }
}

const toState = () => {
  // uni.navigateTo({
  //   url: '/pages-coffeeb/brew/brew',
  // })
  toPage(runStatus.value)
}
const itemClick = (item, index) => {
  // 构建参数对象
  const params = {
    ...item.configJson,
    avatar: item.avatar,
    createTime: item.createTime,
    deviceId: item.deviceId,
    id: item.id,
    isEdit: true,
    name: item.name,
    userId: item.userId,
    sort: item.sort,
    sharedToDevice: item.sharedToDevice,
  }

  // 将参数对象转换为 URL 参数字符串
  const queryParams = encodeURIComponent(JSON.stringify(params))

  // 使用 uni.navigateTo 发起页面跳转
  uni.navigateTo({
    url: `/pages-coffeeb/formulaDetail/formulaDetail?data=${queryParams}`,
  })
}
const addFormula = () => {
  uni.navigateTo({
    url: '/pages-coffeeb/formula/formula',
  })
}
const toHome = () => {
  uni.switchTab({
    url: '/pages/index/index',
  })
}

const getDeviceBrand = () => {
  try {
    const systemInfo = wx.getSystemInfoSync()
    const deviceModel = systemInfo.brand.toLowerCase()
    const list = ['redmi', '红米', 'poco', 'black shark', 'xiaomi', 'mi', '小米', '24090ra29c']
    // 匹配主流厂商关键词
    if (list.includes(deviceModel)) {
      return 'redmi' // 红米/小米统一标识
    } else {
      return 'others' // 其他厂商
    }
  } catch (error) {
    return 'others'
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  height: 100vh;
  .page-content {
    padding: 0rpx 48rpx 48rpx 48rpx;
    .page-content-title {
      font-size: 48rpx;
      font-weight: 500;
      line-height: 72rpx;
      color: #222222;
      font-family: 'DigitalNumbers';
    }
    .page-content-tips {
      font-size: 24rpx;
      line-height: 42rpx;
      color: #666666;
      text-align: center;
    }
    .state-box {
      height: 36rpx;
      margin-top: 20rpx;
      font-size: 24rpx;
      .icon-size {
        font-size: 24rpx !important;
      }
      .state-tips {
        margin-left: 12rpx;
        line-height: 36rpx;
        .jump-text {
          margin-left: 12rpx;
          text-decoration: underline;
        }
      }
    }
    .operate {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      // width: 200rpx;
      height: 216rpx;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 20rpx;
      .operate-name {
        height: 48rpx;
        margin-top: 12rpx;
        font-size: 28rpx;
        // font-weight: 600;
        line-height: 48rpx;
        color: #222222;
        text-align: center;
      }
      .operate-tips {
        height: 36rpx;
        font-size: 24rpx;
        line-height: 36rpx;
        color: #666666;
      }
    }
    .swiper-card {
      max-height: 302rpx;
      padding: 30rpx;
      margin-top: 32rpx;
      background: #ffffff;
      border-radius: 20rpx 20rpx 0 0;
      .swiper-card-content {
        margin-top: 30rpx;
        .swiper {
          height: 166rpx;
        }

        .swiper-item {
          height: 166rpx;
          .img-box {
            position: relative;
            max-height: 78px;
            .img-num {
              position: absolute;
              right: 8rpx;
              bottom: -24rpx;
              font-family: Roboto;
              font-size: 60px;
              font-weight: 600;
              color: #f5abbd;
              letter-spacing: -0.04em;
            }
            .blue {
              color: #a1b9d9;
            }
          }
          .content-box {
            min-width: 320rpx;
            line-height: 42rpx;
            color: #999999;
            .digital-numbers {
              font-family: 'DigitalNumbers';
            }
            .name {
              height: 42rpx;
              margin-bottom: 10rpx;
              font-family: PingFang SC;
              font-size: 28rpx;
              line-height: 42rpx;
              color: #222222;
            }
          }
        }
      }
    }
    .hot-formula {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 82rpx;
      margin-bottom: 24rpx;
      background: #e5ebf4;
      border-radius: 0 0 20rpx 20rpx;
      .desc {
        font-size: 24rpx;
        color: #004097;
      }
    }
    .setting-card {
      width: 100%;
      margin-top: 24rpx;
      position: fixed;
      bottom: 24px;
      left: 0;
      padding: 0 24px;
      box-sizing: border-box;
      .setting {
        background: #ffffff;
        border-radius: 20rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-direction: row;
        height: 51px;
        padding: 0 15px;
        box-sizing: border-box;
      }
    }
    .setting-card1 {
      padding: 30rpx;
      margin-top: 24rpx;
      background: #ffffff;
      border-radius: 20rpx;
    }
  }
  .badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40rpx;
    height: 36rpx;
    margin-top: 6rpx;
    font-size: 24rpx;
    font-weight: 600;
    color: #ffffff;
    background: #e51f4d;
    border-radius: 30rpx;
  }
}
</style>
