<template>
  <div class="page-container">
    
    <div class="app-view" v-if="false">
      <div class="header">
        <span class="title">搜尋附近的咖啡機...</span>
        <div class="loading-spinner"></div>
      </div>
      
      <div class="device-list" style="overflow-y: auto;">
        <div v-if="blueStore.discoveredDevices.length === 0" class="empty-tip">
          暫未發現設備，請確保設備已開機
        </div>

        <div 
          v-for="device in blueStore.discoveredDevices" 
          :key="device.deviceId" 
          class="device-item"
          @click="handleAppConnect(device)"
        >
          <div class="device-info">
            <span class="device-name">{{ device.name || '未知設備' }}</span>
            <span class="device-id">ID: {{ device.deviceId }}</span>
          </div>
          <div class="device-signal">
            <span class="rssi">訊號: {{ device.RSSI }}</span>
            <button class="btn-connect-sm">連接</button>
          </div>
        </div>
      </div>
    </div>

    <div class="web-view">
      <div class="hero-section">
        <div class="icon-wrapper">
          <span class="pulse-icon">📡</span>
        </div>
        
        <h2 class="web-title">連接您的 Bincoo 咖啡機</h2>
        
        <p class="web-guide">
          由於瀏覽器安全限制，請點擊下方按鈕，<br>
          並在彈出的視窗中選擇 <strong>"BC-KJF..."</strong> 開頭的設備。
        </p>

        <button 
          class="btn-web-main" 
          @click="handleWebConnect"
          :disabled="isConnecting"
        >
          <span v-if="!isConnecting">🔍 點擊搜尋並連接設備</span>
          <span v-else>正在連接中...</span>
        </button>

        <div v-if="statusMsg" class="status-message" :class="statusType">
          {{ statusMsg }}
        </div>
      </div>

      <div class="footer-link">
        <span class="link-text">無法連接？查看幫助指南</span>
      </div>
    </div>

  </div>
</template>

<script setup>
/* eslint-disable */
import { ref } from 'vue'

// 【關鍵修正】直接指向 blue.js，繞過 index 的解析問題
import { useBluetoothStore } from '@/store/blue.js' 

const blueStore = useBluetoothStore()

const isConnecting = ref(false)
const statusMsg = ref('')
const statusType = ref('info') 

// === 邏輯 A: APP 環境 ===
const handleAppConnect = async (device) => {
  try {
    uni.showLoading({ title: '連接中...' })
    await blueStore.connectToDevice(device)
    uni.hideLoading()
    navigateToControlPage()
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '連接失敗', icon: 'none' })
  }
}

// === 邏輯 B: Web 環境 ===
const handleWebConnect = async () => {
  isConnecting.value = true
  statusMsg.value = '請在瀏覽器彈窗中選擇設備...'
  statusType.value = 'info'

  try {
    const dummyDevice = {
      deviceId: "WEB_Bluetooth_ID", 
      name: "Bincoo Web Device", 
      RSSI: -100,
      productInfo: { id: 0 } 
    }

    await blueStore.connectToDevice(dummyDevice)
    
    statusMsg.value = '✅ 連接成功！正在進入系統...'
    statusType.value = 'success'
    
    setTimeout(() => {
      navigateToControlPage()
    }, 1500)

  } catch (error) {
  
    // === 新增這一行來除錯 ===
    alert("除錯訊息: " + error.message); 
    
    console.error("Web 连接错误:", error)
    isConnecting.value = false
    
    if (error.message && (error.message.includes('cancelled') || error.message.includes('User'))) {
      statusMsg.value = '已取消連接'
      statusType.value = 'info'
    } else {
      statusMsg.value = '❌ 連接失敗，請確認藍牙已開啟並重試'
      statusType.value = 'error'
    }
  }
}

const navigateToControlPage = () => {
  uni.navigateTo({ url: '/pages/quickBrew/index' }) 
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
.app-view { padding: 10px; }
.header { padding: 15px 0; text-align: center; }
.title { font-size: 16px; color: #333; font-weight: bold; }
.device-list { height: 80vh; }
.empty-tip { text-align: center; color: #999; margin-top: 50px; }
.device-item {
  background: white; padding: 15px; margin-bottom: 10px;
  border-radius: 8px; display: flex; justify-content: space-between;
  align-items: center; box-shadow: 0 1px 5px rgba(0,0,0,0.05);
}
.device-name { font-size: 15px; font-weight: bold; display: block; }
.device-id { font-size: 12px; color: #999; }
.rssi { font-size: 12px; color: #666; margin-right: 10px; }
.btn-connect-sm {
  font-size: 12px; background-color: #007aff; color: white;
  padding: 5px 15px; border-radius: 15px; border: none;
}
.web-view {
  display: flex; flex-direction: column; justify-content: center;
  align-items: center; height: 100vh; padding: 40px 20px;
  box-sizing: border-box; background: white;
}
.hero-section { text-align: center; max-width: 500px; width: 100%; }
.icon-wrapper { font-size: 64px; margin-bottom: 30px; animation: pulse 2s infinite ease-in-out; }
.web-title { font-size: 24px; color: #2c3e50; margin-bottom: 16px; font-weight: 700; }
.web-guide {
  font-size: 16px; color: #606266; line-height: 1.6; margin-bottom: 40px;
  background-color: #f0f9eb; padding: 15px; border-radius: 8px; border: 1px solid #e1f3d8;
}
.btn-web-main {
  width: 100%; height: 54px; line-height: 54px;
  background: linear-gradient(135deg, #007aff, #0056b3); color: white;
  font-size: 18px; font-weight: 600; border-radius: 27px; border: none;
  box-shadow: 0 8px 20px rgba(0, 122, 255, 0.3); cursor: pointer; transition: transform 0.1s;
}
.btn-web-main:active { transform: scale(0.98); }
.btn-web-main:disabled { background: #a0cfff; cursor: not-allowed; }
.status-message { margin-top: 24px; padding: 10px; border-radius: 6px; font-size: 14px; }
.status-message.info { color: #909399; }
.status-message.success { color: #67c23a; background-color: #f0f9eb; }
.status-message.error { color: #f56c6c; background-color: #fef0f0; }
.footer-link { margin-top: auto; padding-top: 30px; }
.link-text { color: #909399; font-size: 14px; text-decoration: underline; cursor: pointer; }
@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}
</style>