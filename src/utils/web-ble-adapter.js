// src/utils/web-ble-adapter.js
/* eslint-disable no-unused-vars */
/* eslint-disable no-async-promise-executor */

// 1. 定義服務與特徵值 UUID (根據您的 blue.ts 與 PDF)
// 這裡保留定義方便日後維護，雖暫時未使用但建議保留
const SERVICE_UUID = "0000fff0-0000-1000-8000-00805f9b34fb"; 
const WRITE_CHAR_UUID = "0000fff2-0000-1000-8000-00805f9b34fb";
const READ_CHAR_UUID = "0000fff1-0000-1000-8000-00805f9b34fb";

// 2. 緩存變數
let webDevice = null;       // 當前連接的設備
let webServer = null;       // GATT Server
let charCache = new Map();  // 特徵值緩存
let notifyCallback = null;  // 數據接收回調
let connectionStateChangeCallback = null; // 連接狀態監聽回調

// --- 模擬 API 實作 ---

// 模擬初始化
export const mockOpenBluetoothAdapter = () => {
  return new Promise((resolve, reject) => {
    if (navigator.bluetooth) {
      console.log("[WebBLE] 瀏覽器支援 Web Bluetooth");
      resolve({ errMsg: "openBluetoothAdapter:ok" });
    } else {
      reject({ errMsg: "openBluetoothAdapter:fail", code: 10001 });
    }
  });
};

// 模擬獲取狀態
export const mockGetBluetoothAdapterState = () => {
  return Promise.resolve({ available: true, discovering: false });
};

// 模擬開始搜尋
export const mockStartBluetoothDevicesDiscovery = (options) => {
  console.log("[WebBLE] 呼叫了開始搜尋 (等待用戶點擊連接按鈕)...", options);
  return Promise.resolve({ errMsg: "startBluetoothDevicesDiscovery:ok" });
};

// 模擬停止搜尋
export const mockStopBluetoothDevicesDiscovery = () => {
  return Promise.resolve({ errMsg: "stopBluetoothDevicesDiscovery:ok" });
};

// 模擬監聽設備發現
export const mockOnBluetoothDeviceFound = (cb) => {
  // Web版無法主動掃描，此回調不執行，但在這裡定義以防報錯
  console.log("[WebBLE] 註冊了設備發現監聽 (Web版不觸發此回調)");
};

// 【核心】模擬建立連接
// 修正：使用 IIFE 封裝 async 邏輯以符合 Promise 規範
export const mockCreateBLEConnection = ({ deviceId }) => {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        console.log(`[WebBLE] 請求連接... (DeviceID: ${deviceId})`);
        
        // 觸發瀏覽器原生選擇視窗
        const device = await navigator.bluetooth.requestDevice({
          filters: [{ namePrefix: "BC" }, { namePrefix: "Bincoo" }],
          optionalServices: [SERVICE_UUID]
        });

        console.log("[WebBLE] 用戶選中了:", device.name);
        webDevice = device;

        device.addEventListener('gattserverdisconnected', onDisconnected);

        const server = await device.gatt.connect();
        webServer = server;
        console.log("[WebBLE] GATT 連接成功");
        
        resolve({ errMsg: "createBLEConnection:ok" });
      } catch (e) {
        console.error("[WebBLE] 連接失敗:", e);
        reject({ errMsg: "createBLEConnection:fail", errCode: 10003 });
      }
    })();
  });
};

// 斷開連接處理
const onDisconnected = () => {
  console.log("[WebBLE] 設備已斷開");
  webDevice = null;
  webServer = null;
  charCache.clear();
  
  if (connectionStateChangeCallback) {
    connectionStateChangeCallback({ deviceId: "", connected: false });
  }
};

// 模擬斷開連接 API
export const mockCloseBLEConnection = () => {
  if (webDevice && webDevice.gatt.connected) {
    webDevice.gatt.disconnect();
  }
  return Promise.resolve({ errMsg: "closeBLEConnection:ok" });
};

// 模擬監聽連接狀態變化
export const mockOnBLEConnectionStateChange = (cb) => {
  connectionStateChangeCallback = cb;
};

// 模擬獲取服務
export const mockGetBLEDeviceServices = ({ deviceId }) => {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        if (!webServer) throw new Error("無連接");
        const services = await webServer.getPrimaryServices();
        const uniServices = services.map(s => ({ uuid: s.uuid, isPrimary: s.isPrimary }));
        resolve({ services: uniServices, errMsg: "getBLEDeviceServices:ok" });
      } catch (e) {
        reject({ errMsg: e.message, errCode: 10004 });
      }
    })();
  });
};

// 模擬獲取特徵值
export const mockGetBLEDeviceCharacteristics = ({ deviceId, serviceId }) => {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        if (!webServer) throw new Error("無連接");
        const service = await webServer.getPrimaryService(serviceId);
        const chars = await service.getCharacteristics();
        
        const uniChars = chars.map(c => {
          charCache.set(c.uuid.toLowerCase(), c); // 緩存特徵值
          return {
            uuid: c.uuid,
            properties: {
              read: c.properties.read,
              write: c.properties.write,
              notify: c.properties.notify,
              indicate: c.properties.indicate
            }
          };
        });
        resolve({ characteristics: uniChars, errMsg: "getBLEDeviceCharacteristics:ok" });
      } catch (e) {
        reject({ errMsg: e.message, errCode: 10005 });
      }
    })();
  });
};

// 模擬啟用通知
export const mockNotifyBLECharacteristicValueChange = ({ characteristicId, state }) => {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const char = charCache.get(characteristicId.toLowerCase());
        if (!char) throw new Error("找無特徵值");
        
        if (state) {
          await char.startNotifications();
          char.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
        } else {
          await char.stopNotifications();
          char.removeEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
        }
        resolve({ errMsg: "notifyBLECharacteristicValueChange:ok" });
      } catch (e) {
        reject({ errMsg: e.message, errCode: 10006 });
      }
    })();
  });
};

const handleCharacteristicValueChanged = (event) => {
  const value = event.target.value.buffer;
  if (notifyCallback) {
    notifyCallback({
      //deviceId: webDevice ? webDevice.id : "",
      //serviceId: event.target.service.uuid,
      //characteristicId: event.target.uuid,
      //value: value
	  // 🌟 關鍵修改：不要用 event.target 裡的亂碼 ID，直接強制塞入我們指定的 ID！
      deviceId: 'web-device', 
      serviceId: event.target.service.uuid,
      characteristicId: event.target.uuid,
      value: value
    });
  }
};

export const mockOnBLECharacteristicValueChange = (cb) => {
  notifyCallback = cb;
};

// 模擬寫入數據
export const mockWriteBLECharacteristicValue = ({ characteristicId, value }) => {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const char = charCache.get(characteristicId.toLowerCase());
        if (!char) throw new Error("找無特徵值");
        await char.writeValue(value);
        resolve({ errMsg: "writeBLECharacteristicValue:ok" });
      } catch (e) {
        console.error("寫入失敗", e);
        reject({ errMsg: e.message, errCode: 10007 });
      }
    })();
  });
};

export const mockSetBLEMTU = () => {
  return Promise.resolve({ errMsg: "setBLEMTU:ok" });
};