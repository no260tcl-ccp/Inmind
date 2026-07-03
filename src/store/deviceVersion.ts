import { defineStore } from 'pinia'
import { version } from 'vue'

export const useDevicVersionStore = defineStore('devicVersion', {
  state: () => ({
    version: null, // 存储版本号
    pressureReductionData: '', // 手动挡指令
    backflushData: '', // 反冲洗数据
    descalingData: '', // 除垢数据
    settingData: {
      coldExtraction: {
        coldExtractionMode: 1,
      }, // 冷萃设置数据
      hotExtraction: {
        preInfusionVolume: 10,
        preInfusionTime: 2,
        extractionTemperature: 92,
        extractionVolume: 50,
        stepDown: false,
        accordionItems: [],
      }, // 热萃设置数据
      handExtraction: {
        extractionTemperature: 92,
      }, // 手动萃设置数据
    }, // 萃取设置
    autoJump: false, // 萃取自动跳转
    checkVersion: true, // 是否检查版本更新
  }),
  actions: {
    setVersion(version) {
      this.version = version // 设置版本号
    },
    setPressureReduction(data) {
      this.pressureReductionData = data // 设置手动挡数据
    },
    setBackflush(data) {
      this.backflushData = data // 设置反冲洗数据
    },
    setDescaling(data) {
      this.descalingData = data // 设置除垢数据
    },
    // 小程序萃取设置
    setSettingData(data) {
      this.settingData = data
    },
    // 萃取自动跳转
    setAutoJump(data) {
      this.autoJump = data
    },
    // 重置萃取设置
    resetSettingData() {
      this.settingData = {
        coldExtraction: {
          coldExtractionMode: 1,
        },
        hotExtraction: {
          preInfusionVolume: 10,
          preInfusionTime: 2,
          extractionTemperature: 92,
          extractionVolume: 50,
          stepDown: false,
          accordionItems: [],
        },
        handExtraction: {
          extractionTemperature: 92,
        },
      }
    },
    // 设备获取的萃取设置
    setSettingDataForDevice(responseData) {
      const data = this.hexStringToByteArray(responseData)
      console.log(data.length, data)

      // if (data.length < 6) {
      //   console.error('配方指令数据长度不足')
      //   return
      // }
      this.settingData.coldExtraction.coldExtractionMode = data[0]
      this.settingData.hotExtraction.preInfusionTime = data[1]
      this.settingData.hotExtraction.preInfusionVolume = data[2]
      this.settingData.hotExtraction.extractionTemperature = data[3]
      this.settingData.hotExtraction.extractionVolume = (data[4] << 8) | data[5]
      this.settingData.hotExtraction.stepDown = data[6] === 0x01
    },
    setCheckVersion(flag) {
      this.checkVersion = flag
    },
    // 十六进制字符串转换为字节数组
    hexStringToByteArray(hexString: string): number[] {
      const byteArray: number[] = []
      for (let i = 0; i < hexString.length; i += 2) {
        byteArray.push(parseInt(hexString.substr(i, 2), 16))
      }
      return byteArray
    },
  },
  getters: {
    // 获取版本号
    getVersion(state) {
      return state.version
    },
    // 获取手动挡指令
    getPressureReduction(state) {
      return state.pressureReductionData
    },
    // 获取反冲洗数据
    getBackflush(state) {
      return state.backflushData
    },
    // 获取除垢数据
    getDescaling(state) {
      return state.descalingData
    },
    // 获取除垢数据
    getSettingData(state) {
      return state.settingData
    },
    getAutoJump(state) {
      return state.autoJump
    },
    getCheckVersion(state) {
      return state.checkVersion
    },
  },
})
