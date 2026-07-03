<template>
  <div>
    <!-- 弹出层 -->
    <wd-overlay :show="showUpdate">
      <view class="wrapper">
        <view
          class="block"
          :style="{
            backgroundImage: `url(${cdnBaseUrl}/41ffc687468a3b0ef26f7edfdd0de12b82f2db391876e75623dce52203bc5ccd.png)`,
          }"
        >
          <view class="flex justify-center mt-3">
            <wd-img :width="43" :height="45" :src="objData.icon" />
          </view>
          <view class="flex justify-center mt-8" v-if="checkUpdateStatus">
            升级固件中,请勿退出小程序
          </view>
          <view class="flex justify-center mt-8" v-else>
            正在验证固件版本:{{ checkCountStatus }}/{{ checkCountStatus }}
          </view>
          <view class="flex justify-center mt-4">
            <wd-progress :percentage="updateProgress" color="#004097" />
          </view>
          <view class="flex justify-center mt-4">
            <wd-button
              type="info"
              plain
              custom-class="cancel-button"
              :disabled="currentUpdate <= 0"
              @click="stopUpdate"
            >
              终止升级
            </wd-button>
          </view>
        </view>
      </view>
    </wd-overlay>
    <bc-confirm
      :show="isTips"
      :objData="objData"
      @close="closeTips"
      cancelText="暂不"
      confirmText="立即升级"
      @success="confirm"
    ></bc-confirm>
    <bc-confirm
      :show="operateTips"
      :objData="operateObjData"
      :isCancel="false"
      @success="operateTips = false"
    ></bc-confirm>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useToast } from 'wot-design-uni'
import { useDevicVersionStore } from '@/store'

const props = defineProps<{
  cdnBaseUrl: string
  cloudVersion: string
  coffeeMachineProtocol: any
}>()

const emit = defineEmits(['updateComplete', 'updateFailed'])

const deviceVersionStore = useDevicVersionStore()
const totast = useToast()

// 更新相关
const showUpdate = ref(false)
const currentUpdate = ref(0) // 当前进度值
const currentTotal = ref(0) // 总进度值
const checkUpdateStatus = ref<boolean>(true)
const checkCountStatus = ref<number>(0)
const objData = ref({
  icon: '/static/images/popup/version.png',
  content: '固件升级',
  tips: '',
})
const isTips = ref<boolean>(false)
const operateObjData = ref({
  icon: '/static/images/popup/version.png',
  content: '升级成功',
  tips: '',
})
const operateTips = ref<boolean>(false)

// 升级进度
const updateProgress = computed({
  get: () =>
    currentTotal.value ? Math.round((currentUpdate.value / currentTotal.value) * 100) : 0,
  set: (val) => {
    console.log('进度值被修改:', val)
  },
})

let isUpdating = false // 标志是否正在更新

const confirm = async () => {
  // 用户点击了确认，执行更新操作
  isTips.value = false
  showUpdate.value = true
  await updateGuJian()
}

// 判断是否有更新 如果有更新弹出更新提示框
const checkUpdate = async () => {
  console.log('查询当前设备信息' + props.cloudVersion)
  try {
    // 检查版本是否有更新
    const res = await props.coffeeMachineProtocol.queryVersion()
    if (res == 'dd') {
      // 查询指令发送成功
    }
    // 模拟延时 1 秒再获取当前设备版本号
    const version = await new Promise((resolve) => {
      setTimeout(async () => {
        const version = deviceVersionStore.$state.version // 直接获取版本号
        console.log('当前软件版本号：' + version)
        resolve(version) // 返回版本号
      }, 1000) // 延时 1 秒
    })
    const trimmedVersion = (version as string).slice(0, -1)
    if (props.cloudVersion != trimmedVersion) {
      // 弹出更新提示框
      isTips.value = true
      objData.value.content = '固件升级'
      objData.value.tips =
        '服务器检查到有新版本' + props.cloudVersion + '是否进行升级!当前设备版本:' + trimmedVersion
    }
  } catch (error) {
    console.error('检查版本失败:', error)
  }
}

// 强制停止升级
const stopUpdate = async () => {
  console.log('停止升级')
  isUpdating = false // 停止升级
  // 关闭遮层
  showUpdate.value = false
  // 没有进度时延时5秒，设备在做升级准备
  await new Promise((resolve) => setTimeout(resolve, currentUpdate.value > 0 ? 1000 : 5000)) // 延时开始发送
  currentUpdate.value = 0
  currentTotal.value = 0
  // 发送失败指令给硬件设备 TODO 发送升级失败指令
  const res = await props.coffeeMachineProtocol.SendUpdateDeviceStatusFail()
  console.log('终止升级返回数据:' + res)
}

// 升级固件逻辑
const updateGuJian = async () => {
  // 1.启动升级请求:使用0xB1命令码，向设备发送升级总帧数开始升级请求。
  // 2.分包传输数据:设备确认成功后，延时3S后使用0xB2命令码持续发送后续固件数据包，每个
  // 数据包都要包含完整的校验。
  isUpdating = true // 开始升级
  wx.setKeepScreenOn({
    keepScreenOn: true, // 设置为 true，屏幕常亮
  })
  try {
    await downFileUpdateData()
    console.log('执行升级逻辑 先发送总数据')
  } catch (error) {
    console.error('升级固件失败:', error)
    totast.error({ msg: '固件下载失败, 请重试！', duration: 4000 })
    await stopUpdate()
    emit('updateFailed', error)
  }
}

const downFileUpdateData = () => {
  return new Promise((resolve, reject) => {
    // 首先下载bin文件
    wx.downloadFile({
      url: `https://cdn.bincoocoffee.cn/device/update/` + props.cloudVersion + '.bin',
      success(res) {
        if (res.statusCode === 200) {
          console.log(props.cloudVersion + '下载成功：', res.tempFilePath)
          processBinFile(res.tempFilePath) // 处理 .bin 文件
          resolve(res.tempFilePath)
        } else {
          console.error('下载失败，状态码：', res.statusCode)
          reject(new Error(`下载失败，状态码：${res.statusCode}`))
          // 关闭遮层
          showUpdate.value = false
        }
      },
      fail(err) {
        console.error('下载失败：', err)
        reject(err)
        // 关闭遮层
        showUpdate.value = false
      },
    })
  })
}

// 处理BIN文件
const processBinFile = (filePath) => {
  return new Promise((resolve, reject) => {
    wx.getFileSystemManager().readFile({
      filePath,
      success(res) {
        const binData = res.data // ArrayBuffer 数据
        parseAndSendBinData(binData)
        resolve(binData)
      },
      fail(err) {
        console.error('读取文件失败：', err)
        reject(err)
        // 关闭遮层
        showUpdate.value = false
      },
    })
  })
}

// 处理data数据
const parseAndSendBinData = async (data) => {
  const chunkSize = 128 // 每次发送128字节
  const totalBytes = data.byteLength // 数据总长度
  const totalFrames = Math.ceil(totalBytes / chunkSize) // 计算总帧数
  // 赋值给总进度值
  currentTotal.value = totalFrames
  console.log('总帧数-----' + totalFrames)
  // 拆分为高8位和低8位
  const highByte = (totalFrames >> 8) & 0xff // 高8位
  const lowByte = totalFrames & 0xff // 低8位

  // 构造 number 数组
  const dataTotal: number[] = [highByte, lowByte]
  // 发送请求指令
  let res
  let retryCount = 0
  const maxRetries = 3
  while (retryCount < maxRetries) {
    res = await props.coffeeMachineProtocol.sendUpgradeStatus(dataTotal)
    if (res == 'dd') {
      break
    }
    retryCount++
    console.log(`发送升级状态请求失败，重试第 ${retryCount} 次`)
  }

  if (res == 'dd') {
    // 已经准备好更新 开始启用发送更新数据
    checkUpdateStatus.value = true
    console.log('已经准备好更新 开始启用发送更新数据')
    await new Promise((resolve) => setTimeout(resolve, 10000)) // 延时10秒开始发送
    console.log('--开始进行发送数据--')
    // 分包发送
    await sendDataChunks(data, chunkSize)
  } else {
    totast.error({ msg: '固件升级失败, 请重试！', duration: 4000 })
    await stopUpdate()
  }
}

// 逐个发送数据包（每次发送128字节）
const sendDataChunks = async (data, chunkSize) => {
  const totalBytes = data.byteLength // 数据总长度
  const totalFrames = Math.ceil(totalBytes / chunkSize) // 计算总帧数

  for (let i = 0; i < totalFrames; i++) {
    if (!isUpdating) {
      console.log('升级被终止，中断数据发送')
      break // 退出循环，停止发送
    }

    const start = i * chunkSize
    const end = Math.min(start + chunkSize, totalBytes)
    let chunk = new Uint8Array(data.slice(start, end)) // 将 ArrayBuffer 转换为 Uint8Array
    // 计算当前帧的序号
    const frameNumber = i + 1
    const highByte = (frameNumber >> 8) & 0xff // 帧序号高8位
    const lowByte = frameNumber & 0xff // 帧序号低8位
    // 如果是最后一帧并且数据不足128字节，补齐0
    if (chunk.length < chunkSize) {
      const padding = new Uint8Array(chunkSize - chunk.length) // 创建补齐的零数组
      // 创建一个新的 Uint8Array，长度为 chunkSize，并将原数据与补齐的数据合并
      const paddedChunk = new Uint8Array(chunkSize)
      paddedChunk.set(chunk) // 复制原数据
      paddedChunk.set(padding, chunk.length) // 补齐数据

      // 将补齐后的数据用于发送
      chunk = paddedChunk
    }
    // 将 Uint8Array 转换为常规数组 [1, 5, 6, 2] 格式
    // 在数据包前面添加帧序号（高8位和低8位）
    const chunkArray = [highByte, lowByte, ...Array.from(chunk)]
    // 转换为十六进制格式
    const hexArray = chunkArray.map((byte) => byte.toString(16).padStart(2, '0'))
    currentUpdate.value = i + 1 // 赋值进度
    console.log(`发送第 ${i + 1} 个包，总包数：${totalFrames}`)
    console.log('当前数据包（十六进制）：', hexArray.join(' ')) // 输出十六进制数组

    // 发送当前数据包
    let res
    let retryCount = 0
    const maxRetries = 3
    while (retryCount < maxRetries) {
      res = await props.coffeeMachineProtocol.sendUpgradeData(chunkArray)
      if (res == 'dd') {
        break
      }
      retryCount++
      console.log(`发送第 ${i + 1} 个数据包失败，重试第 ${retryCount} 次`)
    }

    console.log('发送响应:', res)
    // 判断是否最后一帧 发送完成最后一帧 等待设备确认
    // 更新进度
    currentUpdate.value = frameNumber

    // **如果是最后一帧，等待设备确认**
    if (frameNumber === totalFrames) {
      console.log('发送完成，等待设备确认...')
      await waitForDeviceConfirmation()
    } else {
      // 如果不是最后一帧，等待设备确认
      if (res !== 'dd') {
        totast.error({ msg: '固件升级失败, 请终止升级，重试！', duration: 4000 })
        // await stopUpdate()
        break
      } else {
        // 延时100ms再发送下一个包
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }
  }
}

// 检查版本是否升级完成
const waitForDeviceConfirmation = async () => {
  // 检查是否升级完成
  checkUpdateStatus.value = false
  checkCountStatus.value = 0
  return new Promise((resolve, reject) => {
    let checkCount = 0
    const maxChecks = 10 // 最多检查10次（10秒）

    const checkInterval = setInterval(async () => {
      checkCount++
      checkCountStatus.value = checkCount
      console.log(`检查设备升级状态（第${checkCount}次）...`)
      try {
        const res = await props.coffeeMachineProtocol.queryVersion()
        console.log(res, '检查版本返回信息')
        // 从 store 获取当前设备版本
        const version = deviceVersionStore.$state.version
        console.log('设备当前版本:', version)

        const trimmedVersion = (version as string).slice(0, -1) // 去掉最后一个字符
        console.log('设备当前版本(去尾):', trimmedVersion)
        console.log('云端版本:', props.cloudVersion)

        if (trimmedVersion === props.cloudVersion) {
          // 设备版本号与云端一致，说明升级完成
          clearInterval(checkInterval)
          console.log('固件升级完成 ✅')
          // totast.success('固件升级完成')
          operateTips.value = true
          operateObjData.value.content = '升级成功'
          operateObjData.value.tips = `当前版本：${trimmedVersion}`
          showUpdate.value = false // 关闭进度条
          // 升级完成后设备关机，重置运行状态
          deviceVersionStore.resetRunStatus()
          emit('updateComplete')
          resolve(true)
        } else if (checkCount >= maxChecks) {
          // 超过最大检查次数，判定升级失败
          clearInterval(checkInterval)
          console.error('升级失败 ❌ 设备未更新到最新版本')
          // totast.error('固件升级失败!')
          operateTips.value = true
          operateObjData.value.content = '升级失败 ❌ 设备未更新到最新版本，请重试！'
          operateObjData.value.tips = `当前版本：${trimmedVersion}`
          showUpdate.value = false // 关闭进度条
          emit('updateFailed', new Error('升级失败，设备未更新到最新版本'))
          reject(new Error('升级失败，设备未更新到最新版本'))
        }
      } catch (error) {
        console.error('检查设备升级状态失败:', error)
        if (checkCount >= maxChecks) {
          clearInterval(checkInterval)
          operateTips.value = true
          operateObjData.value.content = '升级失败 ❌ 检查状态时出错，请重试！'
          operateObjData.value.tips = `当前版本：${deviceVersionStore.$state.version.slice(0, -1)}`
          showUpdate.value = false // 关闭进度条
          emit('updateFailed', error)
          reject(error)
        }
      }
    }, 3000) // 每秒检查一次
  })
}

const closeTips = () => {
  isTips.value = false
  deviceVersionStore.setCheckVersion(false)
}

// 暴露 checkUpdate 方法给父组件调用
defineExpose({ checkUpdate })
</script>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
