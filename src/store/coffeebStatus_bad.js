import { hexToString, utf8ArrayToString } from '@/utils'
import { defineStore } from 'pinia'
export const useMachineBStatusStore = defineStore('machineBStatus', {
  state: () => ({
    mode: 0,
    lightStatus: 0,
    runStatus: 0, // 运行状态
    // 研磨数据
    grindData: {
      startStop: 0, // 0 停止，1 开始， 2 暂停, 3 继续
      gear: 0,
      speed: 0,
    },
    // 注水数据
    injectionData: {
      startStop: 0, // 0 停止，1 开始， 2 暂停, 3 继续
      water: 0,
      waterHigh: 0, // 注入水
      waterLow: 0,
      temperature: 0, // 温度
      velocity: 0, // 流速
      type: 0, // 注水方式
      injectedWaterHigh: 0, // 注水流量
      injectedWaterLow: 0,
      // injectedTimerHigh: 0, // 注水计时
      // injectedTimerLow: 0,
    },
    // 冲煮数据
    brewData: {
      startStop: 0, // 0 停止，1 开始， 2 暂停, 3 继续
      type: 0, //  0研磨中，1注水中
      id: 0, // 配方编号
      brewStep: 0, // 冲煮段数（0~4）。
      injectedWaterHigh: 0, // 注水流量
      injectedWaterLow: 0,
      brewTime: 0, // 每段冲煮停留倒计时。
      brewTimerHigh: 0, // 冲煮计时
      brewTimerLow: 0,
    },
    // 配方数据
    formulaData: {
      id: 0,
      powderWaterRatio: 0, // 粉水比
      beanPowderAmount: 0, // 豆粉量
      grindSwitch: 0, // 研磨开关：0关、1开
      grindGear: 0, // 研磨档位
      grindSpeed: 0, // 研磨速度
      brewSegmentCount: 0, // 冲煮段数（最多5段）
      segment0WaterAmount: 0, // 0段注水水量（0段对应闷蒸）
      segment0FlowRate: 0, // 0段注水流速
      segment0Temperature: 0, // 0段注水温度
      segment0WaterType: 0, // 0段注水方式
      segment0ResidenceTime: 0, // 0注水驻留时间
      segment1WaterAmount: 0, // 1段注水水量
      segment1FlowRate: 0, // 1段注水流速
      segment1Temperature: 0, // 1段注水温度
      segment1WaterType: 0, // 1段注水方式
      segment1ResidenceTime: 0, // 1注水驻留时间
      segment2WaterAmount: 0, // 2段注水水量
      segment2FlowRate: 0, // 2段注水流速
      segment2Temperature: 0, // 2段注水温度
      segment2WaterType: 0, // 2段注水方式
      segment2ResidenceTime: 0, // 2注水驻留时间
      segment3WaterAmount: 0, // 3段注水水量
      segment3FlowRate: 0, // 3段注水流速
      segment3Temperature: 0, // 3段注水温度
      segment3WaterType: 0, // 3段注水方式
      segment3ResidenceTime: 0, // 3注水驻留时间
      segment4WaterAmount: 0, // 4段注水水量
      segment4FlowRate: 0, // 4段注水流速
      segment4Temperature: 0, // 4段注水温度
      segment4WaterType: 0, // 4段注水方式
      segment4ResidenceTime: 0, // 4注水驻留时间
      name: '', // 配方名称
    },
    alarmStatus: {
      waterOverload: { status: 0, time: '' }, // 缺水/过载提醒
      machineFault: { status: 0, time: '', text: '' }, // 机器故障
    },
    lackWater: 0, // 缺水
  }),

  actions: {
    // 重置运行状态
    resetRunStatus() {
      this.mode = 0
      this.lightStatus = 0
      this.runStatus = 0
    },
    // 更新机器状态
    updateMachineStatus(responseData: string) {
      const data = this.hexStringToByteArray(responseData)
      console.log('data:', data.length)
      // 数据长度检查
      if (data.length < 3) {
        // 4 字节 * 2 + 3 字节的额外数据 (mode、lightStatus、runStatus)
        console.error('无效的响应数据长度')
        return
      }

      // 解析各个字段
      this.mode = data[0]
      this.lightStatus = data[1]
      this.runStatus = data[2] // 解析运行状态
      console.log('机器模式更新:', this.mode)
      console.log('机器状态更新:', this.runStatus)
    },
    // 更新研磨信息
    updateGrindInfo(responseData: string) {
      const data = this.hexStringToByteArray(responseData)
      console.log('data:', data.length)
      if (data.length < 3) {
        // 确保接收到所有的数据字段
        console.error('研磨指令数据长度不足')
        return
      }
      this.grindData.startStop = data[0]
      this.grindData.gear = data[1]
      this.grindData.speed = data[2]
    },
    // 更新注入信息
    updateInjectionInfo(responseData: string) {
      const data = this.hexStringToByteArray(responseData)
      console.log('data:', data.length)
      // 数据长度检查
      if (data.length < 8) {
        console.error('注水指令数据长度不足')
        return
      }
      this.injectionData.startStop = data[0]
      this.injectionData.waterHigh = data[1]
      this.injectionData.waterLow = data[2]
      this.injectionData.temperature = data[3]
      this.injectionData.velocity = data[4]
      this.injectionData.type = data[5]
      this.injectionData.injectedWaterHigh = data[6]
      this.injectionData.injectedWaterLow = data[7]
      // this.injectionData.injectedTimerHigh = data[8]
      // this.injectionData.injectedTimerLow = data[9]
    },
    // 更新冲煮信息
    updateBrewInfo(responseData: string) {
      const data = this.hexStringToByteArray(responseData)
      console.log('data:', data.length)
      // 数据长度检查
      if (data.length < 12) {
        console.error('冲煮指令数据长度不足')
        return
      }
      this.brewData.startStop = data[0]
      this.brewData.type = data[1]
      this.brewData.id = (data[2] << 24) | (data[3] << 16) | (data[4] << 8) | data[5]
      this.brewData.brewStep = data[6]
      this.brewData.injectedWaterHigh = data[7]
      this.brewData.injectedWaterLow = data[8]
      this.brewData.brewTime = data[9]
      this.brewData.brewTimerHigh = data[10]
      this.brewData.brewTimerLow = data[11]
    },
    // 在 src/store/coffeebStatus.ts 裡面
    // 更新当前冲煮配方信息
    updateFormulaInfo(responseData: string) {
      const data = this.hexStringToByteArray(responseData)
      console.log('data:', data.length)
      console.log('dataTest:', data)
      // 数据长度检查
      if (data.length < 35) {
        console.error('冲煮指令数据长度不足')
        return
      }
      this.formulaData.id = (data[0] << 24) | (data[1] << 16) | (data[2] << 8) | data[3]
      this.formulaData.powderWaterRatio = data[4]
      this.formulaData.beanPowderAmount = data[5]
      this.formulaData.grindSwitch = data[6]
      this.formulaData.grindGear = data[7]
      this.formulaData.grindSpeed = data[8]
      this.formulaData.brewSegmentCount = data[9]
      this.formulaData.segment0WaterAmount = data[10]
      this.formulaData.segment0FlowRate = data[11] / 10
      this.formulaData.segment0Temperature = data[12]
      this.formulaData.segment0WaterType = data[13]
      this.formulaData.segment0ResidenceTime = data[14]
      this.formulaData.segment1WaterAmount = data[15]
      this.formulaData.segment1FlowRate = data[16] / 10
      this.formulaData.segment1Temperature = data[17]
      this.formulaData.segment1WaterType = data[18]
      this.formulaData.segment1ResidenceTime = data[19]
      this.formulaData.segment2WaterAmount = data[20]
      this.formulaData.segment2FlowRate = data[21] / 10
      this.formulaData.segment2Temperature = data[22]
      this.formulaData.segment2WaterType = data[23]
      this.formulaData.segment2ResidenceTime = data[24]
      this.formulaData.segment3WaterAmount = data[25]
      this.formulaData.segment3FlowRate = data[26] / 10
      this.formulaData.segment3Temperature = data[27]
      this.formulaData.segment3WaterType = data[28]
      this.formulaData.segment3ResidenceTime = data[29]
      this.formulaData.segment4WaterAmount = data[30]
      this.formulaData.segment4FlowRate = data[31] / 10
      this.formulaData.segment4Temperature = data[32]
      this.formulaData.segment4WaterType = data[33]
      this.formulaData.segment4ResidenceTime = data[34]
      this.formulaData.name = utf8ArrayToString(data.slice(35, data.length))
    },
    // 更新警报信息
    updateAlarmInfo(responseData: string) {
      const data = this.hexStringToByteArray(responseData)

      // // 数据长度检查
      // if (data.length < 4) {
      //   console.error('无效的警报数据长度')
      //   return
      // }

      console.log('更新警报信息数据:', data) // 检查数据是否正确传入

      // 获取当前时间字符串
      const currentTime = new Date().toLocaleString()

      // 更新警报信息并在状态从 0 变为 1 时记录时间
      if (this.alarmStatus.waterOverload.status === 0 && data[0] === 1) {
        this.alarmStatus.waterOverload.time = currentTime
      }
      this.alarmStatus.waterOverload.status = data[0]
      if (this.alarmStatus.machineFault.status === 0 && data[0] === 2) {
        this.alarmStatus.machineFault.time = currentTime
      }
      this.alarmStatus.machineFault.status = data[0]
      this.alarmStatus.machineFault.text = utf8ArrayToString(data.slice(1, data.length))

      console.log('警报状态更新:', this.alarmStatus) // 确认状态更新后
    },
    // 更新设备缺水状态
    updateLackWater(responseData: string) {
      const data = this.hexStringToByteArray(responseData)
      console.log('data:', data.length)
      // 数据长度检查
      if (data.length < 1) {
        // 4 字节 * 2 + 3 字节的额外数据 (mode、lightStatus、runStatus)
        console.error('无效的响应数据长度')
        return
      }

      // 解析各个字段
      this.lackWater = data[0]
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
        grindData: this.grindData,
        injectionData: this.injectionData,
        brewData: this.brewData,
        runStatus: this.runStatus,
        alarmStatus: this.alarmStatus,
        lackWater: this.lackWater,
      }
    },
  },

  getters: {
    // 获取模式对应的字符串
    modeString: (state) => {
      switch (state.mode) {
        case 0x00:
          return '空闲模式'
        case 0x01:
          return '正常模式'
        case 0x02:
          return '节能模式'
        case 0x03:
          return '维护模式'
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
          return '研磨中'
        case 0x02:
          return '冲泡中'
        case 0x03:
          return '冲煮中'
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
        machineFault:
          state.alarmStatus.machineFault.status === 1
            ? `机器故障（时间: ${state.alarmStatus.machineFault.time}）`
            : '正常',
      }
    },
    // 判断是否有任何警报信息
    hasAlarm: (state) => {
      return Object.values(state.alarmStatus).some((alarm) => alarm.status > 0)
    },
  },
})
