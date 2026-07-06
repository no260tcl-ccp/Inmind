/* eslint-disable no-undef */
//import './style.css'
import { createApp as createClientApp, h } from 'vue' 
import * as Pinia from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router/index' 
import i18n from './locale'

// 🌟 1. 引入 Vant 核心與它的全域 CSS 樣式
import Vant from 'vant';
import 'vant/lib/index.css';

// ==================================================================
// 1. 初始化 uni 全域變數與小程式專屬函式
// ==================================================================
if (typeof window !== 'undefined' && !window.uni) {
  window.uni = {}
}

// 🌟 [新增] 補上 getCurrentPages 替身，避免小程式路由 API 報錯
if (typeof window !== 'undefined') {
  window.getCurrentPages = () => {
    console.log('[System] 觸發了 getCurrentPages 替身');
    return [
      { route: window.location.pathname || '/' } 
    ];
  };
}

// ==================================================================
// 2. 注入 Web Bluetooth 適配器
// ==================================================================
import {
  mockOpenBluetoothAdapter,
  mockGetBluetoothAdapterState,
  mockStartBluetoothDevicesDiscovery,
  mockStopBluetoothDevicesDiscovery,
  mockOnBluetoothDeviceFound,
  mockCreateBLEConnection,
  mockCloseBLEConnection,
  mockOnBLEConnectionStateChange,
  mockGetBLEDeviceServices,
  mockGetBLEDeviceCharacteristics,
  mockNotifyBLECharacteristicValueChange,
  mockOnBLECharacteristicValueChange,
  mockWriteBLECharacteristicValue,
  mockSetBLEMTU
} from '@/utils/web-ble-adapter.js'

console.log('%c [System] 正在注入 Web Bluetooth 適配器...', 'color: #42b983; font-weight: bold;')

uni.openBluetoothAdapter = mockOpenBluetoothAdapter
uni.getBluetoothAdapterState = mockGetBluetoothAdapterState
uni.startBluetoothDevicesDiscovery = mockStartBluetoothDevicesDiscovery
uni.stopBluetoothDevicesDiscovery = mockStopBluetoothDevicesDiscovery
uni.onBluetoothDeviceFound = mockOnBluetoothDeviceFound
uni.createBLEConnection = mockCreateBLEConnection
uni.closeBLEConnection = mockCloseBLEConnection
uni.onBLEConnectionStateChange = mockOnBLEConnectionStateChange
uni.getBLEDeviceServices = mockGetBLEDeviceServices
uni.getBLEDeviceCharacteristics = mockGetBLEDeviceCharacteristics
uni.notifyBLECharacteristicValueChange = mockNotifyBLECharacteristicValueChange
uni.onBLECharacteristicValueChange = mockOnBLECharacteristicValueChange
uni.writeBLECharacteristicValue = mockWriteBLECharacteristicValue
uni.setBLEMTU = mockSetBLEMTU

uni.getStorageSync = (key) => localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : null
uni.setStorageSync = (key, data) => localStorage.setItem(key, JSON.stringify(data))
uni.showLoading = ({ title }) => console.log(`[Loading] ${title}`)
uni.hideLoading = () => console.log('[Loading] Hide')
uni.showToast = ({ title }) => alert(title)

// 🌟 補上取得系統資訊的「網頁版」替身
uni.getSystemInfoSync = () => {
  console.log('[System] 觸發了 uni.getSystemInfoSync 替身')
  return {
    windowWidth: window.innerWidth || 375,   
    windowHeight: window.innerHeight || 667, 
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    statusBarHeight: 0,                      
    safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
    platform: 'web',
    osName: 'web'
  }
}

// 🌟 補上取得帳號資訊的「網頁版」替身
uni.getAccountInfoSync = () => {
  console.log('[System] 觸發了 uni.getAccountInfoSync 替身')
  return {
    miniProgram: {
      appId: 'web-appid-mock',
      envVersion: 'develop', // 👈 原本是 'release'，請改成 'develop'
      version: '1.0.0'
    },
    plugin: {}
  }
}

// 🌟 聰明的跳轉攔截器
//uni.navigateTo = ({ url }) => {
//  console.log(`[Navigate] 攔截到跳轉請求: ${url}`)
//  if (url.includes('/ui-test')) {
//    if (router) {
//      router.push(url).catch(() => {})
//    }
//  } else {
//    console.log('[Router] 這是舊版路徑，觸發 CustomEvent 交給 MyWorkingCoffee 處理')
//    window.dispatchEvent(new CustomEvent('route-change', { detail: { url } }))
//  }
//}

// 🌟 更新版的跳轉攔截器
uni.navigateTo = ({ url }) => {
  console.log(`[Navigate] 攔截到跳轉請求: ${url}`)
  
  // 檢查這是不是我們要處理的頁面 (包含 /pages-coffee 或 /ui-test)
  if (url.includes('/pages-coffee') || url.includes('/ui-test')) {
    if (router) {
      console.log('[Router] 正在透過 Vue Router 跳轉至 Web 頁面')
      router.push(url).catch((err) => {
        console.error('[Router] 跳轉失敗，請確認 router/index.ts 是否有定義此路徑:', err)
      })
    }
  } else {
    // 真正的舊版小程式路徑才交給 CustomEvent
    console.log('[Router] 觸發 CustomEvent 交給外層容器處理')
    window.dispatchEvent(new CustomEvent('route-change', { detail: { url } }))
  }
}

console.log('%c [System] Web Bluetooth 適配器注入完成。', 'color: #42b983; font-weight: bold;')

// ==================================================================
// 3. 建立 Vue 實體與註冊元件
// ==================================================================
const app = createClientApp(App)

app.use(i18n) // add 2026-07-06

// 🌟 2. 讓 Vue 徹底裝備 Vant
app.use(Vant);

// 解決 uni-app 最基礎的原生標籤 (這些保留，因為太多地方用了，手動改太慢)
app.component('view', { setup(props, { slots }) { return () => h('div', slots.default?.()) } })
app.component('text', { setup(props, { slots }) { return () => h('span', slots.default?.()) } })
app.component('image', { props: ['src'], setup(props) { return () => h('img', { src: props.src, style: 'max-width: 100%;' }) } })

// 強制略過魔法 (保留)
app.component('bc-confirm', { setup() { return () => h('div', { style: 'display: none;' }) } })
window.dangweiType = (val) => val || '';
app.config.globalProperties.dangweiType = (val) => val || '';

// 🌟 3. 略過多國語言翻譯報錯：給一個全域的假 $t 函式
app.config.globalProperties.$t = (key) => key;

// ==================================================================
// 4. 掛載 Pinia, Router 與 App
// ==================================================================
const store = Pinia.createPinia()

store.use(
  createPersistedState({
    storage: {
      getItem: uni.getStorageSync,
      setItem: uni.setStorageSync,
    },
  })
)

app.use(store)
app.use(router)

if (typeof window !== 'undefined') {
  console.log('[System] 強制掛載 Vue App...')
  app.mount('#app')
}

export function createApp() {
  return {
    app,
    Pinia,
  }
}