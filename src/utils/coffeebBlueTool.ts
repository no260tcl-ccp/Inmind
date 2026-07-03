import { useBluetoothStore, useMachineBStatusStore, useDevicVersionStore } from '@/store'
import { computed } from 'vue'

// 🌟 將小程式的 useToast 替換為 Vant 的 showToast，避免 inject 報錯
import { showToast } from 'vant'

const START_BYTE = 0x5a
const END_BYTE = 0xaa
const MAX_FRAME_SIZE = 250

// 🌟 將 Store 的呼叫放進函數內，確保在 setup() 階段才執行
export const useConnectionStatus = () => {
  const bluetoothStore = useBluetoothStore()
  const connectionStatus = computed(() => bluetoothStore.connectionStatus)
  return connectionStatus
}

export class CoffeeMachineProtocol {
  private static instance: CoffeeMachineProtocol

  // 🌟 使用 getter 延遲實例化 Store，這是拆除 inject() 炸彈的關鍵！
  private get bluetoothStore() {
    return useBluetoothStore()
  }
  private get machineStatusStore() {
    return useMachineBStatusStore()
  }
  private get deviceVersionStore() {
    return useDevicVersionStore()
  }

  private constructor() {
    // 私有构造函数，禁止外部直接实例化
  }

  public static getInstance(): CoffeeMachineProtocol {
    if (!CoffeeMachineProtocol.instance) {
      CoffeeMachineProtocol.instance = new CoffeeMachineProtocol()
    }
    return CoffeeMachineProtocol.instance
  }

  private static calculateChecksum(commandCode: number, data: number[]): number {
    let checksum = commandCode
    checksum ^= data.length // Add data length to checksum calculation
    for (const byte of data) {
      checksum ^= byte
    }
    return checksum
  }

  private static createMessage(commandCode: number, data: number[]): number[] {
    const checksum = CoffeeMachineProtocol.calculateChecksum(commandCode, data)

    const messageLength = 1 + 1 + 1 + data.length + 1 + 1

    const message = new Array(messageLength)
    message[0] = START_BYTE
    message[1] = commandCode
    message[2] = data.length
    for (let i = 0; i < data.length; i++) {
      message[3 + i] = data[i]
    }
    message[3 + data.length] = checksum
    message[messageLength - 1] = END_BYTE

    return message
  }

  private responsePromise: Promise<string> | null = null
  private responseResolve: ((response: string) => void) | null = null

  private setResponsePromise(): void {
    this.responsePromise = new Promise((resolve) => {
      this.responseResolve = resolve
    })
  }

  public async sendCommand(commandCode: number, data: number[]): Promise<string> {
    const connectionStatus = this.bluetoothStore.connectionStatus
    if (connectionStatus !== 'connected') {
      // 🌟 使用 Vant 的 showToast
      showToast({ type: 'fail', message: '蓝牙连接已断开，请重新连接' })
      return Promise.reject(new Error('Bluetooth disconnected'))
    }
    // 调试输出：显示数据的长度
    console.warn(data, '准备发送数据，数据长度:', data.length)

    const message = CoffeeMachineProtocol.createMessage(commandCode, data)
    // 将消息转换为十六进制格式并打印
    const hexMessage = Array.from(new Uint8Array(message)) // 转换为数组
      .map((byte) => byte.toString(16).padStart(2, '0')) // 转为十六进制并补齐两位
      .join(' ') // 以空格分隔
    console.warn('发送单帧消息（十六进制）:', hexMessage) // 输出十六进制消息
    
    // 🌟 透過 getter 呼叫 store
    await this.bluetoothStore.sendData(new Uint8Array(message).buffer)
    this.setResponsePromise()
    return this.responsePromise as Promise<string>
  }

  private receivedDataBuffer: number[] = []
  private expectedPacketLength: number | null = null

  private async handleResponse(response: Uint8Array): Promise<void> {
    this.updateReceivedDataBuffer(response)

    if (!this.isValidPacket()) {
      console.error('无效的响应格式')
      this.resetBuffer()
      return
    }

    if (!this.isChecksumValid()) {
      console.error('校验和不匹配')
      this.resetBuffer()
      return
    }

    const commandCode = this.receivedDataBuffer[1]
    const responseData = this.arrayBufferToHexString(new Uint8Array(this.extractData()))
    console.warn('命令码', commandCode)
    console.warn('响应数据:', responseData)
    // 根据命令码处理不同的情况
    switch (commandCode) {
      case 0x01: // 待机工作模式
        this.handleStandbyMode(responseData)
        break
      case 0x02: // 研磨指令
        this.handleGrindMode(responseData)
        break
      case 0x03: // 注水指令
        this.handleWaterMode(responseData)
        break
      case 0x04: // 冲煮指令
        this.handleBrewMode(responseData)
        break
      case 0x05: // 配方删除
        this.handleDeleteRecipe(responseData)
        break
      case 0x06: // 配方数据指令
        this.handleRecipeData(responseData)
        break
      case 0x07: // 灯带数据指令
        this.handleLightData(responseData)
        break
      case 0xcc: // 查询机器状态
        this.handleMachineStatus(responseData)
        break
      case 0xee: // 处理警报信息
        this.handleAlarmInfo(responseData)
        break
      case 0xed: // 处理缺水信息
        this.handleLackWater(responseData)
        break
      case 0xb0: // 软件版本查询指令
        this.handleQueryVersion(responseData)
        break
      case 0xb1: // 软件升级总帧数指令
        this.handleUpgradeStatus(responseData)
        break
      case 0xb2: // 分包传输数据
        this.handleUpdate(responseData)
        break
      case 0xb3: // 软件升级状态指令
        this.handleUpgradeDataResponse(this.receivedDataBuffer[2])
        break
      case 0xb4: // 软件升级状态指令
        this.handleRestoreVersionResponse(responseData)
        break
      default:
        console.log('接收到未处理的命令码:', commandCode, '响应数据:', responseData)
        break
    }

    if (this.responseResolve) {
      this.responseResolve(responseData)
      this.responsePromise = null
      this.responseResolve = null
    }

    this.resetBuffer()
  }

  private updateReceivedDataBuffer(response: Uint8Array): void {
    this.receivedDataBuffer.push(...Array.from(response))
    if (this.expectedPacketLength === null && this.receivedDataBuffer.length >= 3) {
      const dataLength = this.receivedDataBuffer[2]
      this.expectedPacketLength = 1 + 1 + 1 + dataLength + 1 + 1
    }
  }

  private isCompletePacket(): boolean {
    return (
      this.expectedPacketLength !== null &&
      this.receivedDataBuffer.length >= this.expectedPacketLength
    )
  }

  private isValidPacket(): boolean {
    return (
      this.receivedDataBuffer[0] === START_BYTE &&
      this.receivedDataBuffer[this.receivedDataBuffer.length - 1] === END_BYTE
    )
  }

  private isChecksumValid(): boolean {
    const commandCode = this.receivedDataBuffer[1]
    const dataLength = this.receivedDataBuffer[2]
    const data = this.receivedDataBuffer.slice(3, 3 + dataLength)
    const checksum = this.receivedDataBuffer[3 + dataLength]

    const calculatedChecksum = CoffeeMachineProtocol.calculateChecksum(commandCode, data)
    return checksum === calculatedChecksum
  }

  private extractData(): number[] {
    const dataLength = this.receivedDataBuffer[2]
    return this.receivedDataBuffer.slice(3, 3 + dataLength)
  }

  private resetBuffer(): void {
    this.receivedDataBuffer = []
    this.expectedPacketLength = null
  }

  private arrayBufferToHexString(buffer: Uint8Array): string {
    return Array.from(buffer)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')
  }

  // 发送封装 --------------------- START
  public async standbyMode(type: number): Promise<string> {
    const data = [type]
    return this.sendCommand(0x01, data)
  }

  public async sendRecipeData(recipeData: number[]): Promise<string> {
    return this.sendCommand(0x06, recipeData)
  }

  public async deleteRecipe(recipeData: number[]): Promise<string> {
    return this.sendCommand(0x05, recipeData)
  }

  public async sendBrewMode(recipeData: number[]): Promise<string> {
    return this.sendCommand(0x04, recipeData)
  }

  public async sendLightBelt(type: number): Promise<string> {
    return this.sendCommand(0x07, [type])
  }

  public async synchronizeTime(data: number[]): Promise<string> {
    return this.sendCommand(0x08, data)
  }

  public async shutdown(type: number): Promise<string> {
    return this.sendCommand(0x09, [type])
  }

  public async sendGrindMode(data: number[]): Promise<string> {
    return this.sendCommand(0x02, data)
  }

  public async sendWaterMode(data: number[]): Promise<string> {
    return this.sendCommand(0x03, data)
  }

  public async sendLackWaterMode(data: number[]): Promise<string> {
    return this.sendCommand(0xed, data)
  }

  public async queryVersion(): Promise<string> {
    return this.sendCommand(0xb0, [0])
  }

  public async sendUpgradeStatus(dataTotal: number[]): Promise<string> {
    return this.sendCommand(0xb1, dataTotal)
  }

  public async sendUpgradeData(recipeData: number[]): Promise<string> {
    return this.sendCommand(0xb2, recipeData)
  }

  public async upgradeConfirmed(): Promise<string> {
    return this.sendCommand(0xb3, [5])
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  public async checkVersion(currentVersion: number): Promise<string> {
    return this.sendCommand(0xb2, [currentVersion])
  }

  public async queryDeviceStatus(data: number): Promise<string> {
    return this.sendCommand(0xb3, [12, data])
  }

  public async SendUpdateDeviceStatusFail(): Promise<string> {
    return this.sendCommand(0xb3, [4])
  }

  public async queryMachineStatus(): Promise<string> {
    return this.sendCommand(0xcc, [])
  }

  public async SendRestoreVersion(): Promise<string> {
    return this.sendCommand(0xb4, [1])
  }

  public async listenForResponses() {
    this.bluetoothStore.onDataReceived(this.handleDataReceived)
  }

  public async stopListeningForResponses() {
    this.bluetoothStore.offDataReceived()
  }
  // 发送封装 --------------------- END

  private handleDataReceived = async (receivedData: any) => {
    try {
      await this.handleResponse(new Uint8Array(receivedData.data))
    } catch (error) {
      console.error('处理响应数据失败:', error)
    }
  }

  // 接收封装 -------------------- START
  public handleBrewMode(responseData: string): void {
    this.machineStatusStore.updateBrewInfo(responseData)
  }

  public handleStandbyMode(responseData: string): void {
    console.log('待机工作模式:', responseData)
  }

  public handleGrindMode(responseData: string): void {
    this.machineStatusStore.updateGrindInfo(responseData)
  }

  public handleWaterMode(responseData: string): void {
    this.machineStatusStore.updateInjectionInfo(responseData)
  }

  public handleDeleteRecipe(responseData: string): void {
    console.log('配方删除:', responseData)
  }

  public handleRecipeData(responseData: string): void {
    if (responseData === 'dd') {
      console.log('配方指令:', responseData)
    } else {
      this.machineStatusStore.updateFormulaInfo(responseData)
    }
  }

  public handleMachineStatus(responseData: string): void {
    this.machineStatusStore.updateMachineStatus(responseData)
  }

  public handleOnOffData(responseData: string): void {
    console.log('开关机指令:', responseData)
  }

  public handleUpdate(responseData: string): void {
    console.warn(responseData, '接收包发送升级回调')
  }

  public handleAlarmInfo(responseData: string): void {
    this.machineStatusStore.updateAlarmInfo(responseData)
  }

  public handleLackWater(responseData: string): void {
    this.machineStatusStore.updateLackWater(responseData)
  }

  public handleQueryVersion(responseData: string): void {
    if (responseData === 'dd') {
      console.log('检查版本响应成功' + responseData)
    } else {
      this.deviceVersionStore.setVersion(this.hexToString(responseData))
    }
  }

  public handleUpgradeStatus(responseData: string): void {
    this.machineStatusStore.firmwareReady(responseData)
  }

  public handleUpgradeDataResponse(responseData: number): void {
    this.machineStatusStore.upgradeStatusAction(responseData)
  }

  public handleRestoreVersionResponse(responseData: string): void {
    console.log('恢复到初始版本响应:', responseData) 
  }

  public handleLightData(responseData: string): void {
    console.log('灯带数据响应:', responseData)
  }
  // 接收封装 -------------------- END

  private hexToString(hexString: string) {
    if (hexString.length % 2 !== 0) {
      throw new Error('十六进制字符串长度必须是偶数')
    }
    let result = ''
    for (let i = 0; i < hexString.length; i += 2) {
      const hexByte = hexString.slice(i, i + 2)
      const charCode = parseInt(hexByte, 16)
      result += String.fromCharCode(charCode)
    }
    return result
  }
}