// stores/heartbeat.js
import { defineStore } from 'pinia'
import { httpPost } from '@/utils/http'
import { useBluetoothStore } from '@/store'
export const useHeartbeatStore = defineStore('heartbeat', {
  state: () => ({
    intervalId: null, // 定时器 ID
    isRunning: false, // 心跳状态
    intervalTime: 60 * 1000, // 默认心跳间隔时间（60秒）
  }),

  actions: {
    // 启动心跳机制
    startHeartbeat(id) {
      if (this.isRunning) {
        console.warn('当前心跳机制已经在运行了.')
        return
      }

      this.isRunning = true
      this.sendHeartbeat(id)
      this.intervalId = setInterval(() => {
        this.sendHeartbeat(id)
      }, this.intervalTime)

      console.log('心跳机制已启动.')
    },

    // 停止心跳机制
    stopHeartbeat() {
      if (this.intervalId) {
        clearInterval(this.intervalId)
        this.intervalId = null
      }

      this.isRunning = false
      console.log('心跳已停止.')
    },

    // 发送心跳包
    async sendHeartbeat(id) {
      try {
        const bluetoothStore = useBluetoothStore()
        // 只有蓝牙连接时才发送心跳
        if (bluetoothStore.connectionStatus !== 'connected') {
          console.log('蓝牙断开,停止心跳发送.')
          return
        }
        // const response = await axios.post('/api/heartbeat')
        const { run } = useRequest<IResponseData>(() =>
          httpPost('/deviceManage/deviceManage/heart', {
            id,
          }),
        )
        run().then((res) => {
          console.log('心跳发送成功:', res)
        })
      } catch (error) {
        console.error('心跳发送失败:', error)
      }
    },
  },
})
