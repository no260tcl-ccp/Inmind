import { useBluetoothStore, useMachineDStatusStore, useDevicVersionStore } from '@/store'

import { computed } from 'vue'

//import { useToast } from 'wot-design-uni'
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css' // 引入提示框樣式

//const toast = useToast()
// 建立一個假的 toast 物件來橋接舊程式碼，這樣您就不必去改下面好幾處的 toast.error()
const toast = {
  error: (msg: string) => ElMessage.error(msg),
  success: (msg: string) => ElMessage.success(msg)
}



const START_BYTE = 0x5a
const END_BYTE = 0xaa
const MAX_FRAME_SIZE = 250
const bluetoothStore = useBluetoothStore()
const machineStatusStore = useMachineDStatusStore()
const deviceVersionStore = useDevicVersionStore()

export const useConnectionStatus = () => {
  const connectionStatus = computed(() => bluetoothStore.connectionStatus)
  return connectionStatus
}

export class CoffeeMachineProtocol {
  private static instance: CoffeeMachineProtocol

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
    const connectionStatus = bluetoothStore.connectionStatus
    if (connectionStatus !== 'connected') {
      toast.error('蓝牙连接已断开，请重新连接')
      return Promise.reject(new Error('Bluetooth disconnected'))
    }
    // 调试输出：显示数据的长度
    console.warn(data, '准备发送数据，数据长度:', data.length)

    // if (data.length > MAX_FRAME_SIZE - 7) {
    //   // 调试输出：分包处理
    //   console.log('数据超出最大帧长度，开始分包处理')
    //   await this.handleChunkedData(data)
    // } else {
    //   const message = CoffeeMachineProtocol.createMessage(commandCode, data)
    //   console.log('发送单帧消息:', message)
    //   await bluetoothStore.sendData(new Uint8Array(message).buffer)
    // }
    const message = CoffeeMachineProtocol.createMessage(commandCode, data)
    // 将消息转换为十六进制格式并打印
    const hexMessage = Array.from(new Uint8Array(message)) // 转换为数组
      .map((byte) => byte.toString(16).padStart(2, '0')) // 转为十六进制并补齐两位
      .join(' ') // 以空格分隔
    console.warn('发送单帧消息（十六进制）:', hexMessage) // 输出十六进制消息
    await bluetoothStore.sendData(new Uint8Array(message).buffer)
    this.setResponsePromise()
    return this.responsePromise
  }

  private receivedDataBuffer: number[] = []
  private expectedPacketLength: number | null = null

  private async handleResponse(response: Uint8Array): Promise<void> {
    this.updateReceivedDataBuffer(response)

    // if (!this.isCompletePacket()) {
    //   console.log('等待更多数据...')
    //   return
    // }

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
      // case 0x09: // 开关机指令
      //   this.handleOnOffData(responseData)
      //   break
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
      case 0xb2: // 分包传输数据:设备确认成功后，延时3S后使用0xB2命令码持续发送后续固件数据包，每个数据包都要包含完整的校验。
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
    console.log('更新后的数据缓冲区:', this.receivedDataBuffer)
    if (this.expectedPacketLength === null && this.receivedDataBuffer.length >= 3) {
      const dataLength = this.receivedDataBuffer[2]
      this.expectedPacketLength = 1 + 1 + 1 + dataLength + 1 + 1
      console.log('预计的数据包长度:', this.expectedPacketLength)
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
  // 1待机 0退出待机
  public async standbyMode(type: number): Promise<string> {
    const data = [type]
    return this.sendCommand(0x01, data)
  }

  // 发送配方指令
  public async sendRecipeData(recipeData: number[]): Promise<string> {
    const commandCode = 0x06
    const data = recipeData
    return this.sendCommand(commandCode, data)
  }

  // 删除配方
  public async deleteRecipe(recipeData: number[]): Promise<string> {
    const commandCode = 0x05
    const data = recipeData
    return this.sendCommand(commandCode, data)
  }

  // 发送冲煮指令 0终止 1开启 2暂停
  public async sendBrewMode(recipeData: number[]): Promise<string> {
    const data = recipeData
    return this.sendCommand(0x04, data)
  }

  // 发送灯带开关指令
  public async sendLightBelt(type: number): Promise<string> {
    const commandCode = 0x07
    const data = [type]
    return this.sendCommand(commandCode, data)
  }

  // 开关机指令 01 开启 00终止
  public async shutdown(type: number): Promise<string> {
    const data = [type]
    return this.sendCommand(0x09, data)
  }

  //  研磨指令
  public async sendGrindMode(data: number[]): Promise<string> {
    return this.sendCommand(0x02, data)
  }

  // 注水指令
  public async sendWaterMode(data: number[]): Promise<string> {
    return this.sendCommand(0x03, data)
  }

  // 缺水指令
  public async sendLackWaterMode(data: number[]): Promise<string> {
    return this.sendCommand(0xed, data)
  }

  // 查询版本号
  public async queryVersion(): Promise<string> {
    const data = [0]
    return this.sendCommand(0xb0, data)
  }

  // 发送升级请求 使用0xB1命令码，向设备发送升级总帧数开始升级请求
  public async sendUpgradeStatus(dataTotal: number[]): Promise<string> {
    return this.sendCommand(0xb1, dataTotal)
  }

  // 发送升级指令
  public async sendUpgradeData(recipeData: number[]): Promise<string> {
    return this.sendCommand(0xb2, recipeData)
  }

  // 发包完成发送升级确定指令
  public async upgradeConfirmed(): Promise<string> {
    console.log('发包完成发送升级确定指令')
    const data = [5]
    return this.sendCommand(0xb3, data)
  }

  // 简单的睡眠函数，用于异步等待
  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  public async checkVersion(currentVersion: number): Promise<string> {
    const data = [currentVersion]
    return this.sendCommand(0xb2, data)
  }

  // 发送查询升级状态
  public async queryDeviceStatus(data: number): Promise<string> {
    return this.sendCommand(0xb3, [12, data])
  }

  // 发送升级失败状态
  public async SendUpdateDeviceStatusFail(): Promise<string> {
    return this.sendCommand(0xb3, [4])
  }

  public async queryMachineStatus(): Promise<string> {
    return this.sendCommand(0xcc, [])
  }

  // 恢复到初始版本
  public async SendRestoreVersion(): Promise<string> {
    return this.sendCommand(0xb4, [1])
  }

  // 监听 和 停止监听方法  ---
  public async listenForResponses() {
    bluetoothStore.onDataReceived(this.handleDataReceived)
  }

  public async stopListeningForResponses() {
    bluetoothStore.offDataReceived()
  }
  // 监听 和 停止监听方法  ---
  // 发送封装 --------------------- END

  private handleDataReceived = async (receivedData: any) => {
    console.log('接收到数据:', receivedData)
    try {
      await this.handleResponse(new Uint8Array(receivedData.data))
    } catch (error) {
      console.error('处理响应数据失败:', error)
    }
  }

  // 接收封装 -------------------- START
  public handleBrewMode(responseData: string): void {
    console.log('冲煮工作模式:', responseData)
    machineStatusStore.updateBrewInfo(responseData)
    console.log('冲煮解析数据:', machineStatusStore.brewData)
  }

  public handleStandbyMode(responseData: string): void {
    console.log('待机工作模式:', responseData)
  }

  public handleGrindMode(responseData: string): void {
    console.log('研磨工作模式:', responseData)
    machineStatusStore.updateGrindInfo(responseData)
    console.log('研磨解析数据:', machineStatusStore.grindData)
  }

  public handleWaterMode(responseData: string): void {
    console.log('注水工作模式:', responseData)
    machineStatusStore.updateInjectionInfo(responseData)
    console.log('注水解析数据:', machineStatusStore.injectionData)
  }

  public handleDeleteRecipe(responseData: string): void {
    console.log('配方删除:', responseData)
  }

  public handleRecipeData(responseData: string): void {
    if (responseData == 'dd') {
      // 下行指令响应
      console.log('配方指令:', responseData)
    } else {
      // 上行数据解析
      machineStatusStore.updateFormulaInfo(responseData)
    }
  }

  public handleMachineStatus(responseData: string): void {
    console.log('机器状态信息:', responseData)

    // 调用 store 的方法更新机器状态
    machineStatusStore.updateMachineStatus(responseData)
  }

  public handleOnOffData(responseData: string): void {
    console.log('开关机指令:', responseData)
  }

  // 接收升级回调
  public handleUpdate(responseData: string): void {
    console.warn(responseData, '接收包发送升级回调')
  }

  public handleAlarmInfo(responseData: string): void {
    // 调用 store 的方法更新警报信息
    machineStatusStore.updateAlarmInfo(responseData)
  }

  // 处理缺水信息
  public handleLackWater(responseData: string): void {
    // 调用 store 的方法更新缺水信息
    machineStatusStore.updateLackWater(responseData)
  }

  public handleQueryVersion(responseData: string): void {
    if (responseData === 'dd') {
      // 响应成功
      console.log('检查版本响应成功' + responseData)
    } else {
      // 处理版本号 获取到当前版本号 存储到pinia中
      console.log('没做处理的字符串版本号数据：' + this.hexToString(responseData))
      deviceVersionStore.setVersion(this.hexToString(responseData))
    }
  }

  // 升级请求返回
  public handleUpgradeStatus(responseData: string): void {
    console.log('固件已准备好' + responseData)
    machineStatusStore.firmwareReady(responseData)
  }

  // 升级状态
  public handleUpgradeDataResponse(responseData: number): void {
    machineStatusStore.upgradeStatusAction(responseData)
  }

  public handleRestoreVersionResponse(responseData: string): void {
    console.log('恢复到初始版本响应:', responseData) // 恢复成功
  }

  public handleLightData(responseData: string): void {
    console.log('灯带数据响应:', responseData)
  }
  // 接收封装 -------------------- END

  private hexToString(hexString) {
    // 检查是否为偶数长度的十六进制字符串
    if (hexString.length % 2 !== 0) {
      throw new Error('十六进制字符串长度必须是偶数')
    }

    let result = ''
    for (let i = 0; i < hexString.length; i += 2) {
      // 取每两个字符转换为一个字节 (0xXX)
      const hexByte = hexString.slice(i, i + 2)
      const charCode = parseInt(hexByte, 16) // 将十六进制转换为整数
      result += String.fromCharCode(charCode) // 转换为对应字符
    }
    return result
  }
  // 其他方法 -------------------- START
}
