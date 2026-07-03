// 引入 Pinia 的 defineStore 用於建立 store
import { defineStore } from 'pinia'
import { useHeartbeatStore } from '@/store'
import { httpGet } from '@/utils/http'

// 將 wot-design-uni 替換為 Web 專用的 UI 庫，此處以 Element Plus 為例
import { ElMessage } from 'element-plus' 

const writeCharacteristicId = '0000FFF2-0000-1000-8000-00805F9B34FB' // 寫特徵值
const readCharacteristicId = '0000FFF1-0000-1000-8000-00805F9B34FB' // 讀特徵值

// 定義 ProductInfo 介面，描述產品資訊的結構
interface ProductInfo {
  id: number // 設備ID
  status: number // 設備狀態
  product: number // 產品id
  productInformation: ProductInformation // 產品詳細資訊
  ipAddress: string | null // 設備IP地址
  isOnline: number // 運行狀態
  locationDesc: string | null // 地理位置描述
  latitude: string | null // 緯度
  longitude: string | null // 經度
  remark: string | null // 備註
  formulaLimit: string // 配方限制
  firmwareVersion: string // 韌體版本
  deviceSn: string // 設備編碼
  deviceName: string // 設備名稱
  configJson: string | null // 設備配置資訊
  createTime: number // 建立時間
  updateTime: number // 更新時間
  createBy: string // 建立者
  updateBy: string // 更新者
  lastOnlineTime: number | null // 最近上線時間
}

// 定義 ProductInformation 介面，描述產品詳細資訊的結構
interface ProductInformation {
  createTime: number // 建立時間
  updateTime: number // 更新時間
  createBy: string // 建立者
  updateBy: string // 更新者
  deleted: boolean // 是否被刪除
  id: number // 產品資訊 ID
  productName: string // 產品名稱
  productImage: string // 產品照片
  productVersion: string // 產品版本
  description: string // 產品描述
  productOther: string // 產品參數
  productCode: string // 產品型號
  remark: string // 備註
  status: number // 產品狀態
}

// 定義 Device 介面，描述藍牙設備的結構
interface Device {
  deviceId: string // 設備 ID
  name: string // 設備名稱
  RSSI: number // 訊號強度
  productInfo?: ProductInfo // 產品資訊（可選）
  state?: string // 可連接狀態
  loading?: boolean // 設備連接按鈕狀態
}

// 定義 BluetoothState 介面，描述藍牙狀態的結構
interface BluetoothState {
  connectedDevice: Device | null // 連接的設備
  discoveredDevices: Device[] // 已發現的設備列表
  connectionStatus: string // 連接狀態
  characteristicsInfo: CharacteristicInfo[] // 特徵資訊列表
  receivedData: ReceivedData | null // 接收到的資料
  listenerRegistered: boolean // 是否已註冊監聽器
  isBluetoothEnabled: boolean // 用於記錄藍牙是否開啟
}

// 定義 CharacteristicInfo 介面，描述特徵資訊的結構
interface CharacteristicInfo {
  deviceId: string // 設備 ID
  serviceUUID: string // 服務 UUID
  characteristicUUID: string // 特徵 UUID
  properties: any // 特性屬性
}

// 定義 ReceivedData 介面，描述接收到的資料的結構
export interface ReceivedData {
  deviceId: string // 設備 ID
  data: ArrayBuffer // 接收到的資料
}

// 建立藍牙 store
export const useBluetoothStore = defineStore('bluetooth', {
  state: (): BluetoothState => ({
    connectedDevice: null, // 初始時沒有連接的設備
    discoveredDevices: [], // 初始時沒有發現的設備
    connectionStatus: 'initBlue', // 初始藍牙狀態
    characteristicsInfo: [], // 初始時沒有特徵資訊
    receivedData: null, // 初始時沒有接收到的資料
    listenerRegistered: false, // 初始時沒有註冊監聽器
    isBluetoothEnabled: false, // 用於記錄藍牙是否開啟
  }),

  actions: {
    // 快取設備的產品資訊
    cachedProductInfo: {} as Record<string, ProductInfo>,
    // 儲存接收到的資料
    async storeReceivedData(payload: { deviceId: string; data: ArrayBuffer }) {
      this.receivedData = {
        deviceId: payload.deviceId,
        data: payload.data,
      }
    },

    // 設定連接的設備
    setConnectedDevice(device: Device | null) {
      // useHeartbeatStore().stopHeartbeat()
      this.connectedDevice = device
      // useHeartbeatStore().startHeartbeat(device.productInfo.id)
    },

    // 將發現的設備加入設備列表中
    addDiscoveredDevice(device: Device) {
      const existingDeviceIndex = this.discoveredDevices.findIndex(
        (d) => d.deviceId === device.deviceId,
      )
      if (existingDeviceIndex === -1) {
        this.discoveredDevices.push(device)
      } else {
        this.discoveredDevices[existingDeviceIndex].RSSI = device.RSSI
      }

      if (this.cachedProductInfo[device.name]) {
        device.productInfo = this.cachedProductInfo[device.name]
        console.log('從快取中獲取設備的產品資訊:', device.productInfo)
      } else {
        this.fetchProductInfo(device.name).then((productInfo) => {
          if (productInfo) {
            device.productInfo = productInfo
            this.cachedProductInfo[device.name] = productInfo
            console.log('從伺服器獲取設備的產品資訊:', productInfo)
          }
        })
      }
    },

    async fetchProductInfo(name: string): Promise<ProductInfo | null> {
      try {
        const productInfo = await this.getProductInfoFromServer(name)
        return productInfo
      } catch (error) {
        console.error('獲取設備資訊失敗:', error)
        return null
      }
    },
    // 從伺服器獲取設備資訊
    getProductInfoFromServer(name: string): Promise<ProductInfo> {
      return new Promise((resolve, reject) => {
        const { run: searchDeviceInstances } = useRequest<IResponseData>(() =>
          httpGet('/deviceManage/deviceManage/list', {
            deviceSn: name,
          }),
        )
        searchDeviceInstances().then(async (res) => {
          if (res.code === 200) {
            if (!res.rows[0]) {
              resolve(null)
            } else {
              const productInfo = res.rows[0]
              productInfo.productInformation = await this.getProductInformationFormServer(name)
              resolve(productInfo)
            }
          } else {
            reject(new Error('獲取設備資訊失敗'))
          }
        })
      })
    },
    // 獲取設備對應的產品資訊
    getProductInformationFormServer(name: string): Promise<ProductInformation> {
      return new Promise((resolve, reject) => {
        // BC-KFJ03-1 產品資訊透過產品編碼 BC-KFJ03 獲取
        const lastIndex = name.lastIndexOf('-')
        const result = lastIndex !== -1 ? name.substring(0, lastIndex) : name
        console.log(result)
        const { run: searchProduct } = useRequest<IResponseData>(() =>
          httpGet('/product/product/list', {
            productCode: result,
          }),
        )
        searchProduct().then((res) => {
          console.log(res, '產品資訊1')
          if (res.code === 200) {
            if (!res.rows[0]) {
              resolve(null)
            } else {
              resolve(res.rows[0])
            }
          } else {
            reject(new Error('獲取設備對應的產品資訊失敗'))
          }
        })
      })
    },
    clearDiscoveredDevices() {
      console.log('清空已發現的設備列表。')
      this.discoveredDevices = []
    },

    setConnectionStatus(status: string) {
      this.connectionStatus = status
    },

    setDevicesFound() {
      this.connectionStatus = 'devicesFound'
    },

    setCharacteristicsInfo(info: CharacteristicInfo[]) {
      this.characteristicsInfo = info || []
    },

    clearCharacteristicsInfo() {
      this.characteristicsInfo = []
    },

    setListenerRegistered(status: boolean) {
      this.listenerRegistered = status
    },

    async initBluetoothAdapter() {
      try {
        await uni.openBluetoothAdapter()
        console.log('藍牙適配器初始化成功。')
        this.setConnectionStatus('disconnected')
        this.isBluetoothEnabled = true // 初始化成功，藍牙開啟

        // 監聽藍牙適配器狀態變化
        // uni.onBluetoothAdapterStateChange((res) => {
        //   console.log('藍牙適配器狀態變化:', res)
        //   this.isBluetoothEnabled = res.available
        //   if (!res.available) {
        //     // 藍牙關閉，斷開連接
        //     if (this.connectedDevice) {
        //       this.disconnectFromDevice(this.connectedDevice.deviceId)
        //     }
        //   }
        // })
        uni.onBLEConnectionStateChange((res) => {
          // 當連接狀態發生變化時，斷開連接
          if (res.connected === false) {
            // 重置狀態111111111  11111 11111
            this.disconnectFromDevice(res.deviceId)
          }

          console.log(`設備 ${res.deviceId} 的連接狀態發生變化:`, res)
        })
      } catch (err) {
        console.error('初始化藍牙適配器失敗:', err)
        throw err
      }
    },
    async initializeDiscoveredDevices() {
      console.log('執行藍牙設備搜尋前，清空已發現的設備列表。')
      this.clearDiscoveredDevices()
    },
    async checkBluetoothAdapterState() {
      try {
        const { available } = await uni.getBluetoothAdapterState()
        if (!available) {
          console.warn('藍牙適配器不可用，請檢查設備藍牙狀態。')
          await this.initBluetoothAdapter()
        }
      } catch (err) {
        console.error('檢查藍牙適配器狀態失敗:', err)
      }
    },

    async startDiscovery(name: string) {
      console.log('執行藍牙設備搜尋')
      try {
        await uni.startBluetoothDevicesDiscovery({
          allowDuplicatesKey: true,
          interval: 1000,
        })
        console.log('開始搜尋藍牙設備11。')
        this.registerDeviceFoundListener(name)
      } catch (err) {
        console.error('開始搜尋藍牙設備失敗:', err)
      }
    },

    async stopDiscovery() {
      try {
        await uni.stopBluetoothDevicesDiscovery()
        if (this.connectedDevice) {
          this.setConnectionStatus('connected')
        } else {
          this.setConnectionStatus('disconnected')
        }
        this.clearDiscoveredDevices()
        console.log('停止搜尋藍牙設備。')
      } catch (err) {
        console.error('停止搜尋藍牙設備失敗:', err)
      }
    },

    registerDeviceFoundListener(name: string) {
      console.log('開始執行搜尋----')
      uni.onBluetoothDeviceFound((devicesResult) => {
        console.log(devicesResult.devices)
        let hasDevices = false
        devicesResult.devices.forEach((device) => {
          console.log('設備名字' + device.name)
          device.name = device.name.toUpperCase()
          if (device.deviceId && device.name && device.name.includes(name)) {
            hasDevices = true
            console.log(`發現名為${name}的新藍牙設備:`, device)
            this.addDiscoveredDevice(device)
          }
        })
        if (hasDevices) {
          this.setConnectionStatus('devicesFound')
        }
      })
      console.log('藍牙設備發現監聽器註冊成功1。')
    },

    async connectToDevice(device: Device) {
      try {
        await uni.createBLEConnection({ deviceId: device.deviceId })
        this.setConnectedDevice(device)
        this.setConnectionStatus('connected')
        // 設定 MTU 只支援安卓
        // 設定 MTU
        // uni.setBLEMTU({
        //   deviceId: device.deviceId,
        //   mtu: 512, // 設定為最大值，實際支援的 MTU 由設備決定
        //   success: (res) => {
        //     console.log('MTU 設定成功', res)
        //     // 現在可以發送更大数据量了
        //   },
        //   fail: (err) => {
        //     console.error('MTU 設定失敗', err)
        //   },
        // })
        console.log('連接藍牙設備成功。', device)

        // 連接成功後，發現服務和特徵
        await this.discoverServicesAndCharacteristics(device.deviceId)
        // 開始資料交換
        // const firstCharacteristic = this.characteristicsInfo[3]
        const index = this.characteristicsInfo.findIndex(
          (item) => item.characteristicUUID === readCharacteristicId,
        )
        const firstCharacteristic = this.characteristicsInfo[index]
        if (firstCharacteristic) {
          await this.startDataExchange(
            device.deviceId,
            firstCharacteristic.serviceUUID,
            firstCharacteristic.characteristicUUID,
          )
        }
        // 設備心跳開啟
        useHeartbeatStore().startHeartbeat(device.productInfo.id)
      } catch (err) {
        console.error('連接藍牙設備失敗:', err)
        this.setConnectionStatus('disconnected')
        // 直接斷開手機藍牙連接，此時設備狀態未釋放
        // if (err?.errCode === -1) {
        //   await uni.closeBLEConnection({ deviceId: device.deviceId })
        // }
        throw err
      }
    },

    async discoverServicesAndCharacteristics(deviceId: string) {
      try {
        // 獲取設備的服務
        const { services } = await uni.getBLEDeviceServices({ deviceId })
        console.log('設備服務:', services)

        // 遍歷服務並獲取特徵
        for (const service of services) {
          const { characteristics } = await uni.getBLEDeviceCharacteristics({
            deviceId,
            serviceId: service.uuid,
          })
          console.log(`服務 ${service.uuid} 的特徵:`, characteristics)

          // 將服務和特徵儲存到 characteristicsInfo 中
          characteristics.forEach((char) => {
            this.characteristicsInfo.push({
              deviceId,
              serviceUUID: service.uuid,
              characteristicUUID: char.uuid,
              properties: char,
            })
          })
        }
      } catch (err) {
        console.error('發現服務和特徵失敗:', err)
        throw err
      }
    },
    async disconnectFromDevice(deviceId: string) {
      try {
        await uni.closeBLEConnection({ deviceId })
        // 清空連接的設備
        this.setConnectedDevice(null)
        // 清空特徵資訊
        this.clearCharacteristicsInfo()
        // 重置連接狀態
        this.setConnectionStatus('disconnected')
        // 清空已發現的設備列表
        this.clearDiscoveredDevices()
        // 清空接收到的資料
        this.receivedData = null
        // 重置監聽器狀態
        this.setListenerRegistered(false)
        // 設備心跳關閉
        useHeartbeatStore().stopHeartbeat()
        console.log('斷開藍牙設備成功，狀態已重置。')
      } catch (err) {
        // await uni.closeBLEConnection({ deviceId })
        // 清空連接的設備
        this.setConnectedDevice(null)
        // 清空特徵資訊
        this.clearCharacteristicsInfo()
        // 重置連接狀態
        this.setConnectionStatus('disconnected')
        // 清空已發現的設備列表
        this.clearDiscoveredDevices()
        // 清空接收到的資料
        this.receivedData = null
        // 重置監聽器狀態
        this.setListenerRegistered(false)
        // 設備心跳關閉
        useHeartbeatStore().stopHeartbeat()
        console.error('斷開藍牙設備失敗:', err)
        throw err
      }
    },

    async startDataExchange(deviceId: string, serviceUUID: string, characteristicUUID: string) {
      console.log('開始資料交換，設備 ID:', deviceId)
      try {
        if (!this.listenerRegistered) {
          uni.onBLECharacteristicValueChange((res) => {
            console.log(`收到特徵值變化通知:`, res)

            const receivedData: ReceivedData = {
              deviceId: res.deviceId,
              // @ts-ignore
              data: res.value, // 接收的 ArrayBuffer
            }
            this.storeReceivedData(receivedData)
            // 呼叫 onDataReceived 的回調
            if (this.dataReceivedCallback) {
              this.dataReceivedCallback(receivedData)
            }
          })
          this.setListenerRegistered(true)
        }

        await uni.notifyBLECharacteristicValueChange({
          state: true,
          deviceId,
          serviceId: serviceUUID,
          characteristicId: characteristicUUID,
        })

        console.log('藍牙資料交換已開始。')
      } catch (err) {
        console.error('藍牙資料交換失敗:', err)
        throw err
      }
    },

    // 發送資料到藍牙設備
    async sendData(data: ArrayBuffer) {
      try {
        // 檢查是否已連接設備
        const deviceId = this.connectedDevice?.deviceId
        if (!deviceId) {
          throw new Error('沒有連接的設備')
        }
        // 獲取特徵資訊
        console.log('特徵資訊：', this.characteristicsInfo)
        // 舊版使用特徵資訊2 新版藍牙使用特徵資訊4
        // const characteristic = this.characteristicsInfo[4]
        const index = this.characteristicsInfo.findIndex(
          (item) => item.characteristicUUID === writeCharacteristicId,
        )
        const characteristic = this.characteristicsInfo[index]
        if (!characteristic) {
          throw new Error('未找到特徵資訊')
        }
        console.log(characteristic, 'characteristic')
        // 發送資料到藍牙特徵
        await uni.writeBLECharacteristicValue({
          deviceId,
          serviceId: characteristic.serviceUUID,
          characteristicId: characteristic.characteristicUUID,
          // @ts-ignore
          value: data, // 直接傳遞 ArrayBuffer
          writeType: 'write', // 根據需要設定寫入類型
          success: () => console.log('藍牙特徵發送成功'),
          fail: (err) => console.error('發送資料失敗1:', err),
        })
      } catch (err) {
        console.error('發送資料失敗2:', err)
      }
    },
    // 新增 dataReceivedCallback 用於保存回調
    dataReceivedCallback: null as ((receivedData: ReceivedData) => void) | null,
    onDataReceived(callback: (receivedData: ReceivedData) => void) {
      // 設定接收回調
      this.dataReceivedCallback = callback
      if (!this.listenerRegistered) {
        console.log('監聽器未註冊，註冊監聽器...')
        uni.onBLECharacteristicValueChange((res) => {
          const receivedData: ReceivedData = {
            deviceId: res.deviceId,
            // @ts-ignore
            data: res.value, // 接收的 ArrayBuffer
          }
          this.storeReceivedData(receivedData)
          if (this.dataReceivedCallback) {
            this.dataReceivedCallback(receivedData)
          }
        })
        this.setListenerRegistered(true)
        console.log('藍牙資料接收監聽器已註冊。')
      } else {
        console.warn('監聽器已經註冊，無需再次註冊。')
      }
    },
    // 取消註冊資料接收回調
    offDataReceived() {
      if (this.listenerRegistered) {
        // 移除回調函式
        this.dataReceivedCallback = null
        // 設定監聽器為未註冊狀態
        this.setListenerRegistered(false)
        // 註銷藍牙特徵值變化監聽器
        // uni.offBLEConnectionStateChange()
        console.log('藍牙資料接收監聽器已移除。')
      } else {
        console.warn('沒有已註冊的監聽器。')
      }
    },
  },
})