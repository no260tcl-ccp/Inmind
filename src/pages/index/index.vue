<template>
  <div class="px-4 page-container page-background" :style="{ backgroundImage: `url(${cdnBaseUrl}/45977c8b9e56dc0d76fecd629f076c30fbbb4b6fe2f7c77bf6f94e8cb6429d86.png)` }">
    <van-nav-bar :border="false" style="background-color: transparent">
      <template #left>
        <van-image width="28" height="28" round :src="userStore.userInfo && (userStore.userInfo.avatar || `${cdnBaseUrl}/21e18276be915687c187ed90027221e1d3664836daa87986b54c8dab44aa5da0.png`)" @click="toMy()" />
      </template>
    </van-nav-bar>

    <div class="scroll-Y">
      <van-swipe class="swiper" :loop="true" :show-indicators="!!bluetoothStore.connectedDevice" :autoplay="0">
        <van-swipe-item class="swiper-item" v-for="(item, index) in deviceList" :key="index">
          <div class="devcie" @click="onClick(item)">
            <div class="devcie-header">
              <div class="devcie-header-left">
                <div class="device-name-text">{{ item.productInfo?.deviceName || '未知设备' }}</div>
                <div class="device-sn-text">SN: {{ item.productInfo?.deviceSn || '---' }}</div>
              </div>
              <div class="devcie-header-right">
                <van-tag round :type="connectionStatus === 'connected' ? 'success' : 'default'">
                  {{ connectionStatus === 'connected' ? '已连接' : '未连接' }}
                </van-tag>
              </div>
            </div>
            <div class="flex items-center justify-center mt-6">
              <van-image width="180" height="160" :src="item.img" />
            </div>
          </div>
        </van-swipe-item>
      </van-swipe>

      <div class="btn-box">
        <van-button round block type="primary" class="custom-button" @click="toSearch">添加新设备</van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
//這是 src\pages\index\index.vue
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { useUserStore, useBluetoothStore, useMachineBStatusStore } from '@/store'

import {
  mockOpenBluetoothAdapter, mockStartBluetoothDevicesDiscovery, mockCreateBLEConnection,
  mockGetBLEDeviceServices, mockGetBLEDeviceCharacteristics, mockNotifyBLECharacteristicValueChange,
  mockOnBLECharacteristicValueChange // 🌟 新增這一行：引入監聽大腦！
} from '@/utils/web-ble-adapter'

const router = useRouter()
const userStore = useUserStore()
const bluetoothStore = useBluetoothStore()
const machineStatusStore = useMachineBStatusStore()
const cdnBaseUrl = import.meta.env.VITE_CDN_BASE_URL || 'https://cdn.bincoocoffee.cn'
const topPadding = ref(44)

//const deviceList = ref([
//  { status: 0, img: 'https://cdn.bincoocoffee.cn/home-machine.png', productInfo: { deviceName: 'Bincoo 咖啡机 04', deviceSn: 'BC-2026-04', id: 'web-device' } }
//])

import inmindImg from '@/static/images/ext/inmind-v.png' // 假設你的 @ 別名指向 src 目錄

const deviceList = ref([
  { 
    status: 0, 
    img: inmindImg, // 使用引入的變數
    productInfo: { deviceName: 'Bincoo 咖啡机 04', deviceSn: 'BC-2026-04', id: 'web-device' } 
  }
])

const connectionStatus = computed(() => bluetoothStore.connectionStatus)

const onClick = async (item: any) => {
  if (!navigator.bluetooth) { showToast('瀏覽器不支援藍牙'); return }

  try {
    await mockOpenBluetoothAdapter()
    await mockStartBluetoothDevicesDiscovery()
    showLoadingToast({ message: '正在连线机器...', forbidClick: true, duration: 0 })
    await mockCreateBLEConnection({ deviceId: 'web-device' })
    await mockGetBLEDeviceServices({ deviceId: 'web-device' })

    const serviceId = '0000fff0-0000-1000-8000-00805f9b34fb'
    await mockGetBLEDeviceCharacteristics({ deviceId: 'web-device', serviceId: serviceId })
    await mockNotifyBLECharacteristicValueChange({ deviceId: 'web-device', serviceId: serviceId, characteristicId: '0000fff1-0000-1000-8000-00805f9b34fb', state: true })
    // ==========================================
    // 🌟 動畫驅動引擎：攔截並解析機器的即時狀態！
    // ==========================================
    mockOnBLECharacteristicValueChange((res) => {
      const buffer = new Uint8Array(res.value);
      
      // 防呆：確認是合法的通訊協議封包 (開頭必須是 0x5A)
      if (buffer[0] !== 0x5A) return;

      const CMD = buffer[1]; // 讀取命令碼

      // 🎯 解析 1：機器狀態切換 (CMD: 0xCC)
      if (CMD === 0xCC) {
        // 根據協議，Data2 (陣列第 5 位) 是工作狀態
        const workState = buffer[5]; 
        console.log(`[狀態同步] 機器回報狀態碼: ${workState}`);

        // TODO: 將狀態寫入 Vue Store，讓動畫元件 (如 grind.vue) 產生反應！
        // (請根據您的 store 變數名稱修改，例如：)
        // machineStatusStore.status = workState; 

        switch (workState) {
          case 0: console.log('✅ 機器閒置 / 完成'); break;
          case 1: console.log('⚙️ 動畫觸發：開始研磨！'); break;
          case 2: console.log('♨️ 動畫觸發：悶蒸中...'); break;
          case 3: console.log('💧 動畫觸發：注水中...'); break;
        }
      }

      // 🎯 解析 2：即時水量進度 (CMD: 0x03)
      if (CMD === 0x03) {
        // 根據協議，Data6 (高8位) 和 Data7 (低8位) 是即時流量
        const flowHigh = buffer[9];  // 3 + 6 = 9
        const flowLow = buffer[10];  // 3 + 7 = 10
        
        // 將兩個 8 位元合併成一個完整的數字
        const currentWater = (flowHigh << 8) | flowLow; 
        console.log(`[水量同步] 當前已注水: ${currentWater} ml`);

        // TODO: 將即時水量寫入 Store，讓網頁的水杯動畫上升！
        // machineStatusStore.currentWater = currentWater;
      }
    });
    // ==========================================
    closeToast()
    showToast({ type: 'success', message: '连线成功！' })

    bluetoothStore.connectionStatus = 'connected'
    bluetoothStore.connectedDevice = { ...item, deviceId: 'web-device' }

    // ==========================================
    // 🌟 終極代理大腦：自動修復長度、重算 Checksum、強行發射啟動指令！
    // ==========================================
    bluetoothStore.sendData = (buffer: any) => {
      let finalBuffer = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : new Uint8Array(buffer.buffer || buffer);
      
      // 確保是合法協議封包 (開頭為 0x5A)
      if (finalBuffer[0] === 0x5A) {
        const CMD = finalBuffer[1];
        let LEN = finalBuffer[2];

        // 陷阱修復 1：配方長度不足 55 Bytes，強制補齊 20 Bytes 的 0x00！
        if (CMD === 0x06 && LEN === 35) {
          console.log("[WebBLE] 🛠️ 發現配方長度不足，自動擴展至 55 Bytes...");
          const padded = new Uint8Array(60); // STX(1)+CMD(1)+LEN(1)+DATA(55)+CRC(1)+ETX(1) = 60
          padded.set(finalBuffer.subarray(0, 38), 0); // 複製前面 38 bytes
          padded[2] = 55; // 0x37
          padded[59] = 0xAA; // ETX
          finalBuffer = padded;
          LEN = 55;
        }

        // 陷阱修復 2：完美重算 Checksum (CMD ^ LEN ^ DATA...)
        let crc = CMD ^ LEN;
        for (let i = 0; i < LEN; i++) crc ^= finalBuffer[3 + i];
        finalBuffer[finalBuffer.length - 2] = crc;
        console.log(`[WebBLE] 🛠️ Checksum 已校準為: 0x${crc.toString(16)}`);

        return new Promise((resolve, reject) => {
          uni.writeBLECharacteristicValue({
            deviceId: 'web-device', serviceId: '0000fff0-0000-1000-8000-00805f9b34fb',
            characteristicId: '0000fff2-0000-1000-8000-00805f9b34fb', value: finalBuffer.buffer
          }).then((res: any) => {
            console.log(`✅ 指令 0x${CMD.toString(16)} 發射成功！`);

            // 陷阱修復 3：發送完配方後，啟動「霸王硬上弓」，自動強送 0x04 啟動指令！
            if (CMD === 0x06) {
              console.log("[WebBLE] 🚀 配方已送達！1.5秒後強行喚醒馬達...");
              setTimeout(() => {
                const startPkg = new Uint8Array(15);
                startPkg[0] = 0x5A; startPkg[1] = 0x04; startPkg[2] = 0x0A; // CMD 04, Len 10
                startPkg[3] = 0x01; // Data0: 01 开启 (最關鍵的一擊)
                startPkg[4] = 0x00; // Data1: 00 研磨中
                startPkg.set(finalBuffer.subarray(3, 7), 5); // Data2-5: 偷取剛剛的配方 ID
                startPkg[9] = finalBuffer[12] || 0x01; // Data6: 冲煮段数
                startPkg[10] = 0x00; startPkg[11] = 0x00; startPkg[12] = 0x00; // 倒數、分、秒
                
                let startCrc = startPkg[1] ^ startPkg[2];
                for(let i=3; i<13; i++) startCrc ^= startPkg[i];
                startPkg[13] = startCrc; startPkg[14] = 0xAA;

                console.log("🔥 正在發射 0x04 啟動指令:", startPkg);
                uni.writeBLECharacteristicValue({
                  deviceId: 'web-device', serviceId: '0000fff0-0000-1000-8000-00805f9b34fb',
                  characteristicId: '0000fff2-0000-1000-8000-00805f9b34fb', value: startPkg.buffer
                });
              }, 1500);
            }
            resolve('dd'); 
          }).catch(reject)
        })
      }
    }
    // ==========================================

    router.push('/pages-coffeeb/index/index')
  } catch (error: any) {
    closeToast(); showToast('连线失败，请重试')
  }
}
const toSearch = () => { showToast('请直接点击上方咖啡机进行连线') }
const toMy = () => { router.push('/pages/my/index') }
onMounted(() => { console.log('設備列表頁載入，準備連線') })
</script>

<style lang="scss" scoped>
.page-container { height: 100vh; background: #f7f7f7; overflow: hidden; }
.scroll-Y { display: flex; flex-direction: column; align-items: center; justify-content: center; height: calc(100vh - 100px); }
.devcie { background: white; padding: 20px; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); width: 300px; cursor: pointer; .device-name-text { font-size: 18px; font-weight: bold; color: #333; } .device-sn-text { color: #999; font-size: 12px; margin-top: 5px; } }
.btn-box { margin-top: 40px; width: 80%; }
</style>