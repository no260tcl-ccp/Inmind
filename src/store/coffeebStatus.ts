import { utf8ArrayToString } from '@/utils'
import { defineStore } from 'pinia'

export const useMachineBStatusStore = defineStore('machineBStatus', {
  state: () => ({
    mode: 0,
    lightStatus: 0,
    runStatus: 0, // 运行状态
    grindData: {
      startStop: 0,
      gear: 0,
      speed: 0,
    },
    injectionData: {
      startStop: 0,
      water: 0,
      waterHigh: 0,
      waterLow: 0,
      temperature: 0,
      velocity: 0,
      type: 0,
      injectedWaterHigh: 0,
      injectedWaterLow: 0,
    },
    brewData: {
      startStop: 0,
      type: 0,
      id: 0,
      brewStep: 0,
      injectedWaterHigh: 0,
      injectedWaterLow: 0,
      brewTime: 0,
      brewTimerHigh: 0,
      brewTimerLow: 0,
    },
    formulaData: {
      id: 0,
      powderWaterRatio: 0,
      beanPowderAmount: 0,
      grindSwitch: 0,
      grindGear: 0,
      grindSpeed: 0,
      brewSegmentCount: 0,
      segment0WaterAmount: 0,
      segment0FlowRate: 0,
      segment0Temperature: 0,
      segment0WaterType: 0,
      segment0ResidenceTime: 0,
      segment1WaterAmount: 0,
      segment1FlowRate: 0,
      segment1Temperature: 0,
      segment1WaterType: 0,
      segment1ResidenceTime: 0,
      segment2WaterAmount: 0,
      segment2FlowRate: 0,
      segment2Temperature: 0,
      segment2WaterType: 0,
      segment2ResidenceTime: 0,
      segment3WaterAmount: 0,
      segment3FlowRate: 0,
      segment3Temperature: 0,
      segment3WaterType: 0,
      segment3ResidenceTime: 0,
      segment4WaterAmount: 0,
      segment4FlowRate: 0,
      segment4Temperature: 0,
      segment4WaterType: 0,
      segment4ResidenceTime: 0,
      name: '',
    },
    alarmStatus: {
      waterOverload: { status: 0, time: '' },
      machineFault: { status: 0, time: '', text: '' },
    },
    lackWater: 0,
  }),

  actions: {
    resetRunStatus() {
      this.mode = 0
      this.lightStatus = 0
      this.runStatus = 0
    },
    updateMachineStatus(responseData: string) {
      const data = this.hexStringToByteArray(responseData)
      if (data.length < 3) return
      this.mode = data[0]
      this.lightStatus = data[1]
      this.runStatus = data[2]
    },
    updateGrindInfo(responseData: string) {
      const data = this.hexStringToByteArray(responseData)
      if (data.length < 3) return
      this.grindData.startStop = data[0]
      this.grindData.gear = data[1]
      this.grindData.speed = data[2]
    },
    updateInjectionInfo(responseData: string) {
      const data = this.hexStringToByteArray(responseData)
      if (data.length < 8) return
      this.injectionData.startStop = data[0]
      this.injectionData.waterHigh = data[1]
      this.injectionData.waterLow = data[2]
      this.injectionData.temperature = data[3]
      this.injectionData.velocity = data[4]
      this.injectionData.type = data[5]
      this.injectionData.injectedWaterHigh = data[6]
      this.injectionData.injectedWaterLow = data[7]
    },
    updateBrewInfo(responseData: string) {
      const data = this.hexStringToByteArray(responseData)
      if (data.length < 12) return
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
    updateFormulaInfo(responseData: string) {
      const data = this.hexStringToByteArray(responseData)
      if (data.length < 35) return
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
    updateAlarmInfo(responseData: string) {
      const data = this.hexStringToByteArray(responseData)
      const currentTime = new Date().toLocaleString()
      if (this.alarmStatus.waterOverload.status === 0 && data[0] === 1) {
        this.alarmStatus.waterOverload.time = currentTime
      }
      this.alarmStatus.waterOverload.status = data[0]
      if (this.alarmStatus.machineFault.status === 0 && data[0] === 2) {
        this.alarmStatus.machineFault.time = currentTime
      }
      this.alarmStatus.machineFault.status = data[0]
      this.alarmStatus.machineFault.text = utf8ArrayToString(data.slice(1, data.length))
    },
    updateLackWater(responseData: string) {
      const data = this.hexStringToByteArray(responseData)
      if (data.length < 1) return
      this.lackWater = data[0]
    },
    hexStringToByteArray(hexString: string): number[] {
      const byteArray: number[] = []
      for (let i = 0; i < hexString.length; i += 2) {
        byteArray.push(parseInt(hexString.substring(i, i + 2), 16))
      }
      return byteArray
    },
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
    modeString: (state) => {
      switch (state.mode) {
        case 0x00: return '空闲模式'
        case 0x01: return '正常模式'
        case 0x02: return '节能模式'
        case 0x03: return '维护模式'
        default: return '未知模式'
      }
    },
    lightStatusString: (state) => (state.lightStatus === 0x01 ? '开' : '关'),
    runStatusString: (state) => {
      switch (state.runStatus) {
        case 0x00: return '空闲'
        case 0x01: return '研磨中'
        case 0x02: return '冲泡中'
        case 0x03: return '冲煮中'
        default: return '未知状态'
      }
    },
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
    hasAlarm: (state) => {
      return Object.values(state.alarmStatus).some((alarm) => alarm.status > 0)
    },
  },
})