<template>
  <van-popup
    v-model:show="settingShowLocal"
    @closed="close()"
    position="left"
    style="width: 275px; height: 100%; overflow: hidden;"
    :safe-area-inset-bottom="true"
    :z-index="999"
  >
    <div
      class="overflow-hidden flex main-container"
      :style="{ paddingTop: topPadding + 'px', width: '100%', height: '100%' }"
    >
      <div class="w-full flex flex-col">
        <div class="flex-1">
          <div
            class="mr-4 ml-4 flex justify-between items-center pb-4 cursor-pointer"
            @click="navigateTo('/pages-device/device-seting/device-seting')"
          >
            <div>
              <div class="text-3.5 text-black min-h-8 font-size-5 font-500">
                {{
                  bluetoothStore.connectedDevice
                    ? bluetoothStore.connectedDevice.productInfo.deviceName
                    : '全自动咖啡机'
                }}
              </div>
              <div class="text-3 mt-1 tips">{{ getDesc }}</div>
            </div>
          </div>
          <div>
            <div class="divider mx-4 my-2"></div>
            <van-cell-group :border="false">
              <van-cell title="节能模式" center>
                <template #icon>
                  <div class="flex items-center h-full set-icon mr-2">
                    <i class="iconfont icon-a-qietu33"></i>
                  </div>
                </template>
                <template #right-icon>
                  <van-switch v-model="modeChecked" :before-change="standbySwitch" size="22px" />
                </template>
              </van-cell>

              <van-cell title="时间同步" center>
                <template #icon>
                  <div class="flex items-center h-full set-icon mr-2">
                    <i class="iconfont icon-tongbu"></i>
                  </div>
                </template>
                <template #right-icon>
                  <div class="synchronize-time cursor-pointer" @click="handleSynchronizeTime">同步</div>
                </template>
              </van-cell>

              <van-cell title="自动跳转" center>
                <template #icon>
                  <div class="flex items-center h-full set-icon mr-2">
                    <i class="iconfont icon-a-qietu32-2"></i>
                  </div>
                </template>
                <template #right-icon>
                  <van-switch v-model="autoJump" size="22px" :before-change="autoJumpBeforeChange" />
                </template>
              </van-cell>
            </van-cell-group>
            <div class="boxs-automatic mt-2">
              <div class="automatic">
                <i class="iconfont icon-a-lianhe1"></i>
                开启后，机器工作时自动跳转至对应界面
              </div>
            </div>
          </div>
          <div class="mt-4">
            <div class="divider mx-4 my-2"></div>
            <van-cell-group :border="false">
              <van-cell title="设备消息" is-link @click="navigateTo('/pages-coffeeb/message/message')">
                <template #icon>
                  <div class="flex items-center h-full set-icon mr-2">
                    <i class="iconfont icon-a-ziyuan40"></i>
                  </div>
                </template>
                <template #right-icon>
                  <div v-if="hasAlarm" class="badge">1</div>
                </template>
              </van-cell>
              <van-cell title="用户手册" is-link @click="navigateTo('/pages-coffeeb/instructions/instructions')">
                <template #icon>
                  <div class="flex items-center h-full set-icon mr-2">
                    <i class="iconfont icon-yonghushouce"></i>
                  </div>
                </template>
              </van-cell>
              <van-cell title="机器信息" is-link @click="navigateTo('/pages-coffeeb/info/info')">
                <template #icon>
                  <div class="flex items-center h-full set-icon mr-2">
                    <i class="iconfont icon-jiqixinxi"></i>
                  </div>
                </template>
              </van-cell>
            </van-cell-group>
            <div class="divider mx-4 my-2"></div>
          </div>
        </div>
        <div class="disconnect" @click="showBlueConfirm">
          <div class="btn cursor-pointer">断开连接</div>
        </div>
      </div>
    </div>
  </van-popup>

  <van-dialog
    v-model:show="isTips"
    title="提示"
    :message="objData.content"
    show-cancel-button
    @confirm="confirm"
    :z-index="1000"
  />
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useMachineBStatusStore, useBluetoothStore, useDevicVersionStore } from '@/store'
import { CoffeeMachineProtocol } from '@/utils/coffeebBlueTool'
import { updateTitle } from '@/utils/title'
import { retry } from '@/utils'
// 🌟 引入 Vant 的 Toast 替換小程式的 useToast
import { showToast } from 'vant'

const machineStatusStore = useMachineBStatusStore()
const bluetoothStore = useBluetoothStore()
const deviceVersionStore = useDevicVersionStore()
const coffeeMachineProtocol = CoffeeMachineProtocol.getInstance()

const ddChecked = ref<boolean>(machineStatusStore.lightStatus === 1)
const autoJump = ref<boolean>(deviceVersionStore.autoJump)
const onOff = ref<boolean>(machineStatusStore.mode === 1)
const emit = defineEmits(['closeShow'])
const machineStatus = ref(machineStatusStore.modeString)
const modeChecked = ref<boolean>(machineStatus.value === '节能模式')
const runType = ref<number>(machineStatusStore.runStatus)

const objData = ref({ icon: '', content: '是否确定蓝牙断开连接？', tips: '' })
const isTips = ref<boolean>(false)
const confirmType = ref<number>(1)

const getDesc = computed(() => {
  let descValue = '咖啡如诗，每一杯皆是艺术~'
  const configJson = bluetoothStore.connectedDevice?.productInfo?.configJson
  if (configJson) {
    try {
      const config = JSON.parse(configJson)
      if (config.desc) descValue = config.desc
    } catch (e) {}
  }
  return descValue
})

const showBlueConfirm = () => {
  objData.value.content = '是否确定蓝牙断开连接？'
  confirmType.value = 1
  isTips.value = true
}

const confirm = async () => {
  isTips.value = false
  if (confirmType.value === 1) {
    disconnect()
  } else if (confirmType.value === 2) {
    try {
      const currentValue = machineStatus.value
      await retry(() => handleStandbySwitch(currentValue), 3, 500)
      if (switchResolve) switchResolve(true)
    } catch (error) {
      showToast({ type: 'fail', message: '命令执行失败' })
      if (switchResolve) switchResolve(false)
    } finally {
      switchResolve = null
    }
  }
}

let switchResolve: ((value: boolean) => void) | null = null

// 🌟 Vant 的 Switch 攔截器必須回傳 Promise
const standbySwitch = (newValue: boolean) => {
  return new Promise<boolean>((resolve) => {
    if ((machineStatus.value === '空闲模式' || machineStatus.value === '节能模式') && runType.value === 0) {
      confirmType.value = 2
      objData.value.content = machineStatus.value === '节能模式' ? '是否退出节能模式' : '是否进入节能模式'
      isTips.value = true
      switchResolve = resolve
    } else {
      showToast({ type: 'fail', message: '请在设备空闲状态下执行此命令' })
      resolve(false)
    }
  })
}

const autoJumpBeforeChange = (newValue: boolean) => {
  return new Promise<boolean>((resolve) => {
    deviceVersionStore.setAutoJump(newValue)
    resolve(true)
  })
}

const getCurrentDateTime = () => {
  const now = new Date()
  return {
    year: now.getFullYear(),
    month: String(now.getMonth() + 1).padStart(2, '0'),
    day: String(now.getDate()).padStart(2, '0'),
    hour: String(now.getHours()).padStart(2, '0'),
    minute: String(now.getMinutes()).padStart(2, '0'),
    second: String(now.getSeconds()).padStart(2, '0'),
  }
}

const handleSynchronizeTime = async () => {
  try {
    const { year, month, day, hour, minute, second } = getCurrentDateTime()
    const yearShort = year.toString().slice(-2)
    const data: number[] = [
      parseInt(yearShort, 10), parseInt(month, 10), parseInt(day, 10),
      parseInt(hour, 10), parseInt(minute, 10), parseInt(second, 10),
    ]
    const response = await coffeeMachineProtocol.synchronizeTime(data)
    if (response === 'dd') {
      try { navigator.vibrate && navigator.vibrate(200) } catch (e) {}
      showToast({ type: 'success', message: '命令执行成功' })
    } else {
      throw new Error('命令执行失败')
    }
  } catch (error) {
    showToast({ type: 'fail', message: '命令执行失败，请重新尝试' })
  }
}

const handleStandbySwitch = async (currentValue: string) => {
  try {
    const response = await coffeeMachineProtocol.standbyMode(currentValue === '节能模式' ? 0 : 1)
    if (response === 'dd') {
      try { navigator.vibrate && navigator.vibrate(200) } catch (e) {}
      showToast({ type: 'success', message: '命令执行成功' })
    } else {
      throw new Error('执行失败')
    }
  } catch (error) {
    throw new Error('执行失败')
  }
}

watch(() => machineStatusStore.mode, (newMode) => { onOff.value = newMode >= 1 && newMode <= 5 }, { immediate: true })
watch(() => machineStatusStore.lightStatus, (newMode) => { ddChecked.value = !!newMode }, { immediate: true })
watch(() => machineStatusStore.modeString, (newMode) => {
  machineStatus.value = newMode
  modeChecked.value = newMode === '节能模式'
}, { immediate: true })
watch(() => machineStatusStore.runStatus, (status) => { runType.value = status }, { immediate: true })

const props = defineProps({ settingShow: { type: Boolean, required: true }, hasAlarm: { type: Boolean, default: false } })
const settingShowLocal = ref(props.settingShow)
watch(() => props.settingShow, (newValue) => { settingShowLocal.value = newValue })

const close = () => { emit('closeShow') }

onMounted(() => { updateTitle('tabbar.mine') })

// 🌟 安全獲取頂部安全距離 (避開 Web 環境不支援的 API)
let topPadding = 20
try {
  const sys = window.uni ? window.uni.getSystemInfoSync() : null
  if (sys && sys.osName === 'ios') {
    topPadding = (sys.safeAreaInsets?.top || 0) + 10
  } else if (sys && sys.osName === 'android') {
    topPadding = sys.statusBarHeight || 20
  }
} catch (e) {
  topPadding = 20
}

const disconnect = () => {
  showToast({ type: 'loading', message: '断开连接中...', duration: 0 })
  setTimeout(() => {
    // 關閉 Toast (Vant 4)
    showToast({ message: '', duration: 1 })
    if (bluetoothStore.connectedDevice) {
      bluetoothStore.disconnectFromDevice(bluetoothStore.connectedDevice.deviceId)
    }
    isTips.value = false
    uni.switchTab({ url: '/pages/index/index' })
  }, 1000)
}

const navigateTo = (url: string) => { uni.navigateTo({ url }) }
</script>

<style lang="scss" scoped>
:root {
  --top-padding: v-bind(topPadding) px;
  background-color: #ffffff;
}
.main-container {
  height: calc(100vh - var(--top-padding));
  .set-icon {
    .iconfont { font-size: 19px; }
  }
  .disconnect {
    position: absolute;
    bottom: 60px;
    display: flex;
    justify-content: center;
    width: 100%;
    .btn {
      box-sizing: border-box;
      width: 243px;
      height: 42px;
      font-size: 14px;
      line-height: 42px;
      color: #e51f4d;
      text-align: center;
      background: rgba(229, 31, 77, 0.1);
      border: 1px solid rgba(229, 31, 77, 0.1);
      border-radius: 21px;
    }
  }
}

.tips { color: #999999; }
.divider { border-top: 1px solid #f5f5f5; }
.badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 18px;
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
  background: #e51f4d;
  border-radius: 15px;
}
.synchronize-time {
  width: 55px;
  height: 26px;
  font-size: 12px;
  line-height: 26px;
  color: #004097;
  text-align: center;
  background: #d3e0f1;
  border-radius: 13px;
}
.boxs-automatic {
  padding: 0 15px;
  .icon-a-lianhe1 {
    margin-right: 6px;
    font-size: 12px;
    color: #666;
  }
}
.automatic {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 30px;
  padding: 0 10px;
  font-size: 12px;
  color: #666666;
  background: #f5f5f5;
  border-radius: 6px;
}
</style>