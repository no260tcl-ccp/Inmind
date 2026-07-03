import { defineStore } from 'pinia'
// todo 热萃 冷萃
export const useMachineStatusStore = defineStore('machineStatus', {
  state: () => ({
    mode: 0,
    lightStatus: 0,
    extractionCupCount: 0,
    extractionTime: 0,
    steamTime: 0,
    cleanCount: 0,
    runStatus: 0, // 运行状态
    backflushStatus: 0, // 反冲洗状态
    hotExtraction: {
      startStop: 0, // 0 停止，1 开始
      extractionTemperature: 0, // 萃取温度
      preInfusionVolume: 0,
      extractionVolumeHigh: 0,
      extractionVolumeLow: 0,
      stepDown: 0, // 0 关闭降压，1 开启降压
      extractionTimerHigh: 0,
      extractionTimerLow: 0,
      extractionStatus: 0, // 0 预浸泡，1 萃取，2 降压
      injectedWaterHigh: 0, // 注入水
      injectedWaterLow: 0,
      realPressure: 0,
      preInfusionTime: 0,
    },
    coldExtraction: {
      startStop: 0,
      coldExtractionMode: 0, // 1.清爽模式 2.平衡模式 3.浓郁模式
      extractionTimerHigh: 0,
      extractionTimerLow: 0,
      injectedWaterHigh: 0, // 注入水
      injectedWaterLow: 0,
    },
    alarmStatus: {
      waterOverload: { status: 0, time: '' }, // 缺水/过载提醒
      backflush: { status: 0, time: '' }, // 反清洗提醒
      descaling: { status: 0, time: '' }, // 除垢提醒
      machineFault: { status: 0, time: '', code: 0 }, // 机器故障
    },
    steamData: '', // 蒸汽数据
    pushSlagData: '', // 推渣数据
  }),

  actions: {
    // 重置运行状态
    resetRunStatus() {
      this.mode = 0
      this.lightStatus = 0
      this.runStatus = 0
    },
    // 更新推渣数据
    updatepushSlagData(data) {
      this.pushSlagData = data
    },
    // 更新蒸汽数据
    updateSteamData(data) {
      this.steamData = data
    },
    // 更新反冲洗状态
    updateBackflushStatus(status: number) {
      this.backflushStatus = status
    },
    // 更新机器状态
    updateMachineStatus(responseData: string) {
      const data = this.hexStringToByteArray(responseData)

      // 数据长度检查，32位的字段解析需要更多字节
      if (data.length < 15) {
        // 4 字节 * 2 + 3 字节的额外数据 (mode、lightStatus、runStatus)
        console.error('无效的响应数据长度')
        return
      }

      // 解析各个字段
      this.mode = data[0]
      this.lightStatus = data[1]
      this.extractionCupCount = (data[2] << 8) + data[3]

      // 32 位解析
      this.extractionTime = (data[4] << 24) | (data[5] << 16) | (data[6] << 8) | data[7]
      this.steamTime = (data[8] << 24) | (data[9] << 16) | (data[10] << 8) | data[11]

      this.cleanCount = (data[12] << 8) + data[13]
      this.runStatus = data[14] // 解析运行状态
      console.log('机器模式更新:', this.mode)
      console.log('机器状态更新:', this.runStatus)
    },

    // 更新警报信息
    updateAlarmInfo(responseData: string) {
      const data = this.hexStringToByteArray(responseData)

      // 数据长度检查
      if (data.length < 4) {
        console.error('无效的警报数据长度')
        return
      }

      console.log('更新警报信息数据:', data) // 检查数据是否正确传入

      // 获取当前时间字符串
      const currentTime = new Date().toLocaleString()

      // 更新警报信息并在状态从 0 变为 1 时记录时间
      if (this.alarmStatus.waterOverload.status === 0 && data[0] === 1) {
        this.alarmStatus.waterOverload.time = currentTime
      }
      this.alarmStatus.waterOverload.status = data[0]

      if (this.alarmStatus.backflush.status === 0 && data[1] === 1) {
        this.alarmStatus.backflush.time = currentTime
      }
      this.alarmStatus.backflush.status = data[1]

      if (this.alarmStatus.descaling.status === 0 && data[2] === 1) {
        this.alarmStatus.descaling.time = currentTime
      }
      this.alarmStatus.descaling.status = data[2]

      if (this.alarmStatus.machineFault.status === 0 && data[3] === 1) {
        this.alarmStatus.machineFault.time = currentTime
      }
      this.alarmStatus.machineFault.status = data[3]
      this.alarmStatus.machineFault.code = data[4]

      console.log('警报状态更新:', this.alarmStatus) // 确认状态更新后
    },
    // 更新热萃信息
    updateHotExtraction(responseData: string) {
      const data = this.hexStringToByteArray(responseData)
      if (data.length < 13) {
        // 确保接收到所有的数据字段
        console.error('热萃指令数据长度不足')
        return
      }
      // 更新热萃信息
      this.hotExtraction.startStop = data[0]
      this.hotExtraction.extractionTemperature = data[1]
      this.hotExtraction.preInfusionVolume = data[2]
      this.hotExtraction.extractionVolumeHigh = data[3]
      this.hotExtraction.extractionVolumeLow = data[4]
      this.hotExtraction.stepDown = data[5]
      this.hotExtraction.extractionTimerHigh = data[6]
      this.hotExtraction.extractionTimerLow = data[7]
      this.hotExtraction.extractionStatus = data[8]
      this.hotExtraction.injectedWaterHigh = data[9]
      this.hotExtraction.injectedWaterLow = data[10]
      this.hotExtraction.realPressure = data[11]
      this.hotExtraction.preInfusionTime = data[12]
      console.log('extractionStatus:', this.hotExtraction)
      console.log('injectedWaterHigh:', this.hotExtraction.injectedWaterHigh)
      console.log('injectedWaterLow:', this.hotExtraction.injectedWaterLow)
    },
    // 新增冷萃指令处理方法
    updateColdExtraction(responseData: string) {
      const data = this.hexStringToByteArray(responseData)
      console.log(data.length, data)

      if (data.length < 6) {
        console.error('冷萃指令数据长度不足')
        return
      }
      this.coldExtraction.startStop = data[0]
      this.coldExtraction.coldExtractionMode = data[1]
      this.coldExtraction.extractionTimerHigh = data[2]
      this.coldExtraction.extractionTimerLow = data[3]
      this.coldExtraction.injectedWaterHigh = data[4]
      this.coldExtraction.injectedWaterLow = data[5]
    },
    // 十六进制字符串转换为字节数组
    hexStringToByteArray(hexString: string): number[] {
      const byteArray: number[] = []
      for (let i = 0; i < hexString.length; i += 2) {
        byteArray.push(parseInt(hexString.substr(i, 2), 16))
      }
      return byteArray
    },

    // 获取所有字段的数据
    getAllFields() {
      return {
        mode: this.mode,
        lightStatus: this.lightStatus,
        extractionCupCount: this.extractionCupCount,
        extractionTime: this.extractionTime,
        steamTime: this.steamTime,
        cleanCount: this.cleanCount,
        runStatus: this.runStatus,
        backflushStatus: this.backflushStatus,
        hotExtraction: this.hotExtraction,
        coldExtraction: this.coldExtraction,
        alarmStatus: this.alarmStatus,
      }
    },
  },

  getters: {
    // 获取模式对应的字符串
    modeString: (state) => {
      switch (state.mode) {
        case 0x00:
          return '关机模式'
        case 0x01:
          return '正常模式' // 热萃模式
        case 0x02:
          return '节能模式'
        case 0x03:
          return '维护模式'
        case 0x04:
          return '预热模式'
        case 0x05:
          return '冷萃模式'
        default:
          return '未知模式'
      }
    },

    // 获取灯带状态的字符串
    lightStatusString: (state) => (state.lightStatus === 0x01 ? '开' : '关'),

    // 获取运行状态的字符串
    runStatusString: (state) => {
      switch (state.runStatus) {
        case 0x00:
          return '空闲'
        case 0x01:
          return '萃取中'
        case 0x02:
          return '反冲洗中'
        case 0x03:
          return '除垢中'
        case 0x04:
          return '手动萃取中'
        case 0x05:
          return '冷萃中'
        default:
          return '未知状态'
      }
    },

    // 获取警报状态的字符串和时间
    alarmStatusString: (state) => {
      return {
        waterOverload:
          state.alarmStatus.waterOverload.status === 1
            ? `缺水/过载提醒（时间: ${state.alarmStatus.waterOverload.time}）`
            : '正常',
        backflush:
          state.alarmStatus.backflush.status === 1
            ? `反清洗提醒（时间: ${state.alarmStatus.backflush.time}）`
            : '正常',
        descaling:
          state.alarmStatus.descaling.status === 1
            ? `除垢提醒（时间: ${state.alarmStatus.descaling.time}）`
            : '正常',
        machineFault:
          state.alarmStatus.machineFault.status === 1
            ? `机器故障（时间: ${state.alarmStatus.machineFault.time}）`
            : '正常',
      }
    },
    // 获取热萃指令的数据
    hotExtractionCommand: (state) => ({
      startStop: state.hotExtraction.startStop,
      extractionTemperature: state.hotExtraction.extractionTemperature,
      preInfusionVolume: state.hotExtraction.preInfusionVolume,
      extractionVolume:
        (state.hotExtraction.extractionVolumeHigh << 8) | state.hotExtraction.extractionVolumeLow,
      stepDown: state.hotExtraction.stepDown,
      extractionTimer:
        (state.hotExtraction.extractionTimerHigh << 8) | state.hotExtraction.extractionTimerLow,
      extractionStatus: state.hotExtraction.extractionStatus,
    }),
    // 冷萃状态描述
    coldExtractionStatus: (state) => {
      const modeDescriptions = ['清爽模式', '平衡模式', '浓郁模式']
      return {
        startStopStatus: state.coldExtraction.startStop === 0 ? '已停止' : '正在运行',
        coldExtractionMode:
          modeDescriptions[state.coldExtraction.coldExtractionMode - 1] || '未知模式',
        extractionTimer:
          (state.coldExtraction.extractionTimerHigh << 8) | state.coldExtraction.extractionTimerLow,
      }
    },
    // 判断是否有任何警报信息
    hasAlarm: (state) => {
      return Object.values(state.alarmStatus).some((alarm) => alarm.status === 1)
    },
    getPushSlagData: (state) => {
      return state.pushSlagData
    },
    getSteamData: (state) => {
      return state.steamData
    },
  },
})
