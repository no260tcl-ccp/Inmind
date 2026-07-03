<template>
  <view style="margin-top: 15vh">
    <wd-row>
      <wd-col :span="12">
        <wd-row>
          <wd-col>
            <view class="deviceListClass" :class="{ active: isSwitchOn }" @click="toggleSwitch">
              <view class="iconClass">
                <view class="i-carbon:color-switch text-2xl"></view>
              </view>
              <view class="textClass">
                <text class="text-1xl text-black">设备正常</text>
              </view>
            </view>
          </wd-col>
        </wd-row>
        <wd-row>
          <wd-col>
            <view class="deviceListClass" @click="testChong">
              <view class="iconClass">
                <view class="i-carbon:warning-other text-2xl"></view>
              </view>
              <view class="textClass">
                <text class="text-1xl text-black">清空配方</text>
              </view>
            </view>
          </wd-col>
        </wd-row>
      </wd-col>
      <wd-col :span="12">
        <view class="deviceListClass" style="height: 22vh" @click="tarFormula">
          <view class="iconClass">
            <view class="i-carbon:settings text-2xl"></view>
          </view>
          <view class="textClass">
            <text class="text-1xl text-black">配方I/O</text>
          </view>
        </view>
      </wd-col>
      <wd-col :span="24">
        <view class="deviceListClass" style="height: 22vh" @click="tarMyFormula">
          <view class="iconClass">
            <view class="i-carbon:user-sponsor text-2xl"></view>
          </view>
          <view class="textClass">
            <text class="text-1xl text-black">我的配方</text>
          </view>
        </view>
      </wd-col>
    </wd-row>
    <wd-message-box />
    <my-loading :loading="loadingStatus" />
  </view>
</template>

<script lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useToast, useMessage } from 'wot-design-uni'
import { sendStringData } from '@/utils/coffeebBlueTool'
import { useBluetoothStore } from '@/store'
import { httpDelete } from '@/utils/http'
import { useUserStore } from '@/store'
// 使用 useUserStore
const userStore = useUserStore()

export default {
  props: {
    isSwitchOn: {
      type: Boolean,
      required: true,
    },
  },
  setup() {
    const toast = useToast()
    const message = useMessage()
    const loadingStatus = ref<boolean>(false)
    const bluetoothStore = useBluetoothStore()

    // 数据接收处理函数
    const handleDataReceived = (receivedData) => {
      console.log('接收到的数据:', receivedData)

      if (!receivedData || receivedData.byteLength === 0) {
        console.error('接收到的 ArrayBuffer 为空')
        return
      }

      const uint8Array = new Uint8Array(receivedData.data)
      console.log('接收到的 Uint8Array:', uint8Array)

      // 使用自定义的解码函数来替代 TextDecoder
      const decodedString = utf8ArrayToString(uint8Array)
      console.log('解码后的字符串:', decodedString)
      if (decodedString === 'D0') {
        toast.success('清空机器配方成功') //TODO 应该加上提示 是否清空  清空完成后清理所有我的配方
      }
    }

    // 组件挂载时注册监听器
    onMounted(() => {
      bluetoothStore.onDataReceived(handleDataReceived)
    })

    // 组件卸载时注销监听器
    onBeforeUnmount(() => {
      bluetoothStore.offDataReceived()
    })

    // 开关方法
    const toggleSwitch = () => {
      // 先检查当前开关机状态在选择执行开机还是关机
    }

    // 发送数据方法
    const testChong = () => {
      console.log('清空配方')
      message
        .confirm({
          msg: '是否清空所有配方',
          title: '提示',
        })
        .then(() => {
          console.log('点击了确定按钮')
          delectFormula()
        })
        .catch(() => {
          console.log('点击了取消按钮')
        })
    }

    //删除数据方法
    const delectFormula = async () => {
      //删除掉服务器上面的配方
      const dataToSend = 'D kkkk'

      // 发送删除请求
      const { run } = useRequest<IResponseData>(() =>
        httpDelete('/app-api/wxApp/recipe/deleteAll', {
          userId: userStore.userInfo.id,
        }),
      )

      run().then((res) => {
        console.log(res)
      })

      try {
        loadingStatus.value = true // 设置加载状态
        await sendStringData(dataToSend)
        toast.success('冲泡指令发送成功') // 成功提示
      } catch (error) {
        console.error('冲泡指令发送失败:', error)
        toast.error('冲泡指令发送失败') // 失败提示
      } finally {
        loadingStatus.value = false // 重置加载状态
      }
    }

    const tarFormula = () => {
      console.log('跳转配方')
      uni.navigateTo({
        url: '/pages-coffeeb/formula/formula',
      })
    }

    const tarMyFormula = () => {
      uni.navigateTo({
        url: '/pages-coffeeb/myFormula/myFormula',
      })
    }

    // 手动实现 UTF-8 解码函数
    function utf8ArrayToString(array) {
      let str = ''
      let i = 0
      while (i < array.length) {
        let byte1 = array[i++]
        if (byte1 <= 0x7f) {
          str += String.fromCharCode(byte1)
        } else if (byte1 <= 0xdf) {
          let byte2 = array[i++]
          str += String.fromCharCode(((byte1 & 0x1f) << 6) | (byte2 & 0x3f))
        } else if (byte1 <= 0xef) {
          let byte2 = array[i++]
          let byte3 = array[i++]
          str += String.fromCharCode(
            ((byte1 & 0x0f) << 12) | ((byte2 & 0x3f) << 6) | (byte3 & 0x3f),
          )
        } else {
          let byte2 = array[i++]
          let byte3 = array[i++]
          let byte4 = array[i++]
          let codePoint =
            ((byte1 & 0x07) << 18) | ((byte2 & 0x3f) << 12) | ((byte3 & 0x3f) << 6) | (byte4 & 0x3f)
          codePoint -= 0x10000
          str += String.fromCharCode(0xd800 + (codePoint >> 10), 0xdc00 + (codePoint & 0x3ff))
        }
      }
      return str
    }

    return {
      loadingStatus,
      toggleSwitch,
      testChong,
      tarFormula,
      tarMyFormula,
    }
  },
}
</script>

<style scoped lang="scss">
:root {
  --primary-color: royalblue;
}

.deviceListClass {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  height: 10vh;
  padding: 5px;
  margin: 5px;
  margin-right: 15px;
  margin-left: 15px;
  background-color: white;
  border-radius: 10px;
  box-shadow:
    rgba(0, 0, 0, 0.16) 0px 3px 6px,
    rgba(0, 0, 0, 0.23) 0px 3px 6px;
}
.iconClass {
  position: absolute;
  top: 5px;
  left: 5px;
}
.textClass {
  position: absolute;
  right: 5px;
  bottom: 5px;
}

.active {
  background-color: #fa4350;
}
</style>
