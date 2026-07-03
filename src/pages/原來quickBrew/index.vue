<template>
  <div class="page-container">
    <div class="header-card">
      <div class="device-info">
        <h2 class="title">Bincoo 智慧手沖</h2>
        <div class="status-badge" :class="blueStore.connectedDevice ? 'connected' : ''">
          {{ blueStore.connectedDevice ? '已連線' : '未連線' }}
        </div>
      </div>
      <div class="machine-status">
        <p>狀態: <strong>{{ machineBStore.runStatusString }}</strong></p>
        <p class="last-msg">最新消息: {{ lastRxMsg }}</p>
      </div>
    </div>

    <div class="control-panel">
      <h3 class="panel-title">快速沖煮參數 (ID:0)</h3>
      
      <div class="control-item">
        <div class="label">咖啡豆量 ({{ beanAmount }}g)</div>
        <input type="range" min="10" max="30" v-model="beanAmount" class="slider" />
      </div>

      <div class="control-item">
        <div class="label">沖煮水溫 ({{ temperature }}°C)</div>
        <input type="range" min="80" max="100" v-model="temperature" class="slider" />
      </div>

      <div class="control-item">
        <div class="label">研磨粗細度 ({{ grindLevel }})</div>
        <div class="stepper">
          <button @click="grindLevel > 1 && grindLevel--">-</button>
          <span>{{ grindLevel }}</span>
          <button @click="grindLevel < 80 && grindLevel++">+</button>
        </div>
      </div>
    </div>

    <div class="action-area">
      <button class="btn-step" @click="step1_WriteRecipe">
        1️⃣ 寫入配方 (ID:0)
      </button>
      <button class="btn-step" @click="step2_StartBrew">
        2️⃣ 啟動沖煮 (ID:0)
      </button>
      
      <div class="divider">--- 或 ---</div>

      <button class="btn-start-brew" @click="oneClickBrew" :disabled="isBusy">
        ☕ 一鍵完整沖煮
      </button>
    </div>

    <details class="debug-panel" open>
      <summary>🛠️ 硬體單項測試 (已知正常)</summary>
      <div class="btn-row" style="margin-top: 10px;">
        <button class="btn-test danger" @click="manualGrind(1)">⚙️ 研磨</button>
        <button class="btn-test outline" @click="manualGrind(0)">停磨</button>
        <button class="btn-test info" @click="testWater(1)">💦 出水</button>
        <button class="btn-test outline" @click="testWater(0)">停水</button>
      </div>
    </details>

    <div class="debug-console">
      <div class="console-header">通訊日誌 (TX/RX) <span @click="logs=[]" style="float:right;cursor:pointer">清空</span></div>
      <div class="console-body" ref="logBox">
        <div v-for="(log, idx) in logs" :key="idx" class="log-item" :class="log.type">
          <span class="tag">[{{ log.tag }}]</span> <span class="msg">{{ log.msg }}</span>
        </div>
      </div>
    </div>

    <button class="btn-back" @click="goBack">返回</button>
  </div>
</template>

<script setup>
/* eslint-disable */
import { ref, watch, nextTick } from 'vue'
import { useBluetoothStore } from '@/store/blue.js' 
import { useMachineBStatusStore } from '@/store/coffeebStatus'

const blueStore = useBluetoothStore()
const machineBStore = useMachineBStatusStore()

const logs = ref([])
const logBox = ref(null)
const isBusy = ref(false)
const lastRxMsg = ref('等待指令...')

// 參數
const beanAmount = ref(15)
const temperature = ref(92)
const grindLevel = ref(40)
const ratio = ref(15)

// === 日誌與 Hex 工具 ===
const addLog = (tag, msg, type = 'info') => {
  logs.value.push({ tag, msg, type })
  nextTick(() => { if (logBox.value) logBox.value.scrollTop = logBox.value.scrollHeight })
}
const buf2hex = (buffer) => [...new Uint8Array(buffer)].map(x => x.toString(16).padStart(2, '0').toUpperCase()).join(' ')

// 監聽 RX
watch(() => blueStore.receivedData, (newVal) => {
  if (newVal && newVal.data) {
    const hex = buf2hex(newVal.data)
    const view = new DataView(newVal.data)
    
    // 判斷指令回應
    if (view.byteLength >= 4 && view.getUint8(0) === 0x5A) {
      const cmd = view.getUint8(1)
      const status = view.getUint8(3) // Data 的第一個字節通常是狀態
      
      if (status === 0xDD) {
        lastRxMsg.value = `指令 ${cmd.toString(16)} 執行成功 (DD)`
        addLog('RX', `指令 ${cmd.toString(16)} 成功 (DD)`, 'success')
      } else if (status === 0xFF) {
        lastRxMsg.value = `指令 ${cmd.toString(16)} 失敗 (FF)`
        addLog('RX', `指令 ${cmd.toString(16)} 失敗 (FF) - 參數錯誤`, 'error')
      } else {
        addLog('RX', hex, 'success')
      }
    }
  }
})

// === 發送指令 ===
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const sendCommand = async (cmd, dataBytes = []) => {
  const totalLen = 5 + dataBytes.length
  const buffer = new ArrayBuffer(totalLen)
  const view = new DataView(buffer)

  view.setUint8(0, 0x5A); view.setUint8(1, cmd); view.setUint8(2, dataBytes.length);
  let checksum = cmd ^ dataBytes.length
  for (let i = 0; i < dataBytes.length; i++) {
    view.setUint8(3 + i, dataBytes[i])
    checksum ^= dataBytes[i]
  }
  view.setUint8(3 + dataBytes.length, checksum); view.setUint8(4 + dataBytes.length, 0xAA);

  addLog('TX', buf2hex(buffer), 'tx')
  await blueStore.sendData(buffer)
}

// ==========================================
// 核心修正：使用 ID 0 + 保守參數
// ==========================================

// 步驟 1: 寫入配方
const step1_WriteRecipe = async () => {
  addLog('STEP', '正在寫入配方 (ID:0)...')
  
  // 喚醒
  await sendCommand(0x00, [0x00])
  await sleep(200)

  let recipeData = []
  // Data0-3: 配方 ID = 0 (00 00 00 00)
  recipeData.push(0, 0, 0, 0)
  
  // Data4-8: 基本參數
  // 粉水比(15), 豆重, 研磨開(1), 檔位, 轉速(保守值10)
  recipeData.push(parseInt(ratio.value), parseInt(beanAmount.value), 1, parseInt(grindLevel.value), 10)
  
  // Data9: 沖煮段數 = 1 (先測單段，最簡單)
  recipeData.push(1)

  // Data10-14: 第 0 段參數 (單純出水)
  // 水量(50ml), 流速(10 - 保守), 溫度, 方式(0), 停留(0)
  recipeData.push(50, 10, parseInt(temperature.value), 0, 0)

  // 補齊剩餘 4 段 (每段5bytes * 4 = 20個0)
  for(let i=0; i<20; i++) recipeData.push(0)

  // 配方名稱 (20 Bytes)
  let nameStr = "TEST"
  for(let i=0; i<20; i++) recipeData.push(i < nameStr.length ? nameStr.charCodeAt(i) : 0)

  // 發送 0x06
  await sendCommand(0x06, recipeData)
}

// 步驟 2: 啟動沖煮
const step2_StartBrew = async () => {
  addLog('STEP', '發送啟動指令 (ID:0)...')
  
  // CMD 0x04
  // Data0: 01 (開啟)
  // Data1: 00 (研磨階段 - 從頭開始)
  // Data2-5: ID = 0 (00 00 00 00)
  // Data6: 段數 = 1
  // Data7-9: 00 00 00
  await sendCommand(0x04, [0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00])
}

// 一鍵執行 (合併上述兩步)
const oneClickBrew = async () => {
  if (isBusy.value) return
  isBusy.value = true
  try {
    await step1_WriteRecipe()
    addLog('WAIT', '等待寫入存檔 (1秒)...')
    await sleep(1000) // 給機器一點時間消化配方
    await step2_StartBrew()
  } catch(e) {
    addLog('ERR', e.message, 'error')
  } finally {
    isBusy.value = false
  }
}

// 硬體測試
const manualGrind = (isStart) => sendCommand(0x02, isStart ? [0x01, 0x05, 0x14] : [0x00, 0x00, 0x00])
const testWater = (isStart) => sendCommand(0x03, isStart ? [0x01, 0x00, 50, 92, 10, 0x00, 0x00, 0x00] : [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])

const goBack = () => {
  if (blueStore.connectedDevice) blueStore.disconnectFromDevice(blueStore.connectedDevice.deviceId)
  uni.navigateTo({ url: '/pages/index/index' })
}
</script>

<style scoped>
.page-container { padding: 15px; background: #f5f7fa; min-height: 100vh; font-family: sans-serif; }
.header-card { background: white; padding: 15px; border-radius: 12px; margin-bottom: 20px; border-left: 5px solid #007aff;}
.device-info { display: flex; justify-content: space-between; align-items: center; }
.title { font-size: 18px; font-weight: bold; margin: 0; }
.status-badge { font-size: 12px; padding: 2px 8px; background: #eee; border-radius: 10px; }
.status-badge.connected { background: #d4edda; color: #155724; }
.machine-status { margin-top: 10px; font-size: 14px; color: #555; }
.last-msg { font-size: 12px; color: #e6a23c; }

.control-panel { background: white; padding: 15px; border-radius: 12px; margin-bottom: 20px; }
.panel-title { font-size: 14px; font-weight: bold; margin-bottom: 15px; }
.control-item { margin-bottom: 15px; }
.label { font-size: 14px; font-weight: 600; margin-bottom: 5px; }
.slider { width: 100%; }
.stepper { display: flex; gap: 10px; }
.stepper button { width: 40px; height: 30px; }

.action-area { margin-bottom: 20px; text-align: center; }
.btn-step { width: 100%; padding: 12px; margin-bottom: 10px; background: #ff9500; color: white; border: none; border-radius: 8px; font-weight: bold; }
.divider { margin: 10px 0; color: #999; font-size: 12px; }
.btn-start-brew { width: 100%; padding: 15px; background: #34c759; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; }
.btn-start-brew:disabled { background: #ccc; }

.debug-panel { margin-bottom: 20px; background: #fff; padding: 10px; border-radius: 8px; }
.btn-row { display: flex; gap: 5px; }
.btn-test { flex: 1; padding: 8px; border: none; border-radius: 4px; color: white; font-size: 12px; }
.danger { background: #ff3b30; } .info { background: #007aff; } .outline { background: #fff; border: 1px solid #ccc; color: #333; }

.debug-console { background: #222; color: #0f0; padding: 10px; border-radius: 8px; font-family: monospace; font-size: 12px; height: 150px; display: flex; flex-direction: column; }
.console-header { border-bottom: 1px solid #444; padding-bottom: 5px; margin-bottom: 5px; color: #fff; }
.console-body { overflow-y: auto; flex: 1; }
.log-item { margin-bottom: 2px; }
.tx .tag { color: #00bfff; } .success .tag { color: #00ff00; } .error .tag { color: #ff0000; }

.btn-back { width: 100%; padding: 10px; background: transparent; border: 1px solid #ccc; border-radius: 20px; }
</style>