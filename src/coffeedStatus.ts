import { defineStore } from 'pinia'
import { httpPost, httpGet } from '@/utils/http'
import { useUserStore, useBluetoothStore, useDevicVersionStore } from '@/store' // 设备状态
// todo 热萃 冷萃
export const useMachineDStatusStore = defineStore('machineDStatus', {
  state: () => ({
    runStatus: 0, // 运行状态 0 空闲中 1 使用中 2 恒温中 3 加热中
    hasAlarm: false, // 是否有报警
    modeString: '', // 模式字符串
    batteryStatus: 2, // 电池状态 0 电量充足 1 电量低 2 充电中
    temperatureControl: {
      startStop: 0, // 0 停止 1 加热中 2 恒温中  3 终止
      temperatureConversion: false, // 温度单位  false 摄氏度 true 华氏度
      targetTemperature: 95, // 目标温度
    },
    quantitativeFlowControl: {
      // 定量控流
      tiltAngle: 0, // 倾斜角度
    },
    recipeBoiling: {
      // 预设配方冲煮
      boilingTime: '00:00', // 冲煮时间
      segmentIndex: 0, // 段数索引
      tiltAngle: 0, // 倾斜角度
      waterInjection: 0, // 水量注入
      injectionFlowRate: 0, // 注入流速
      generalSection: 0, // 总段数
    },
    waterOutlet: {
      titleIndex: 0, // 当前标题
      totalwaterVolume: 30, // 总水量
      segmentation: [], // 分段水量
      segmentedFlowVelocity: [], // 分段流速
      flowRateController: [], // 流速控制器
    },
    outletVelocity: {
      flexibleFixation: 1, // 流速控制
      waterFlow: 3.0, // 流速
    },

    mode: 0,
    powerLevel: 0,
    currentTiming: 0,
    currentFlowRate: 0,
    soundWwitch: null,
    weightStatistics: 0,
    powderWeight: 0,
    sendUpgradeDataResponse: null,
    progressBar: null,
    getError: false,
    arrayStr: '',
    alarmStatus: {
      waterOverload: { status: 0, time: '' }, // 缺水
      machineFault: { status: 1, time: '', text: '' }, // 机器故障
    },
  }),

  actions: {
    // 倾斜角度
    settingTiltAngle(data: number) {
      console.warn('store倾斜角度:', data)
      this.quantitativeFlowControl.tiltAngle = data
    },
    // 智能温控单位切换 false 摄氏度 true 华氏度
    settingTemperatureControl(data: boolean) {
      console.warn('store温度单位:', data)
      this.temperatureControl.temperatureConversion = data
    },

    // 模拟状态
    settingStartStop(data: number) {
      console.log('store模拟状态:', data)
      this.temperatureControl.startStop = data
    },

    // 水量和标题控制
    settingEffluentParameters(data: any) {
      const {
        titleIndex,
        totalwaterVolume,
        segmentation,
        segmentedFlowVelocity,
        flexibleFixation,
      } = data
      this.waterOutlet.titleIndex = titleIndex
      this.waterOutlet.totalwaterVolume = totalwaterVolume
      this.waterOutlet.segmentation.push(segmentation)
      this.waterOutlet.segmentedFlowVelocity.push(segmentedFlowVelocity)
      this.waterOutlet.flowRateController.push(flexibleFixation)
    },

    // 保存终止清空
    saveTerminateClear() {
      this.waterOutlet.titleIndex = 0
      this.waterOutlet.totalwaterVolume = 30
      this.waterOutlet.segmentation = []
      this.waterOutlet.segmentedFlowVelocity = []
      this.waterOutlet.flowRateController = []
      this.outletVelocity.flexibleFixation = 1
      this.outletVelocity.waterFlow = 3.0
    },

    // 流速类型控制
    flowRateTypeFunction(data: number) {
      this.outletVelocity.flexibleFixation = data
    },

    // 流速调节控制
    flowRateAdjustFunction(data: any) {
      this.outletVelocity.waterFlow = data
    },

    setBluetoothData(data: any) {
      this.bluetoothData = data
    },

    setModeOperation(data: any) {
      console.log('store模式:', data)
    },

    setPowderToWaterRatio(data: any) {
      console.log('store粉水比:', data)
    },

    setKeyValue(data: any) {
      console.log('store按键值:', data)
    },

    setWeight(data: any) {
      this.weightStatistics =
        parseInt(
          (data[3] > 0 ? data[3] : 0).toString(16) + (data[4] > 0 ? data[4] : 0).toString(16),
          16,
        ) / 10
      console.log('store重量:', data)
    },

    setPowderWeight(data: any) {
      this.powderWeight =
        parseInt(
          (data[3] > 0 ? data[3] : 0).toString(16) + (data[4] > 0 ? data[4] : 0).toString(16),
          16,
        ) / 10
      console.log('store粉重:', data)
    },

    setLiquidFlowRate(data: any) {
      this.currentFlowRate = parseInt(
        (data[3] > 0 ? data[3] : 0).toString(16) + (data[4] > 0 ? data[4] : 0).toString(16),
        16,
      )
      console.error('store流速:', this.currentFlowRate)
    },

    setTimer(data: any) {
      this.currentTiming = parseInt(
        (data[3] > 0 ? data[3] : 0).toString(16) + (data[4] > 0 ? data[4] : 0).toString(16),
        16,
      )
      console.log('store计时:', data)
    },

    setBatteryStatus(data: any) {
      this.powerLevel = data[4]
    },

    setVolume(data: any) {
      this.soundWwitch = this.decimalToHex(data[4])
    },

    setFirmwareVersion(data: any) {
      const deviceVersionStore = useDevicVersionStore()
      const version = parseInt(
        (data[3] > 0 ? data[3] : 0).toString(16) + (data[4] > 0 ? data[4] : 0).toString(16),
        16,
      )
        .toString(16)
        .split('')
        .join('.')
      console.log('store固件版本:', version)
      deviceVersionStore.setVersion(version)
    },

    setSendUpgradeDataResponse(data: any) {
      console.log('store发送升级数据返回:', data[2].toString(16))
      this.sendUpgradeDataResponse = data
    },

    setProgressBar(data: any) {
      this.progressBar = data[2]
    },

    setError(data) {
      console.log('setError', data)
      console.log(data.length, data)
      this.arrayStr = JSON.stringify(data)
      if (data.length > 7) this.getError = true
      else this.getError = false
    },

    setRestartTheSystem(data: any) {
      console.log('store系统重启:', data[2].toString(16))
      // this.restartTheSystem = data
    },
    // ------------------------------解析电子秤返回值start-----------------
    // 清零的时候重置所有的数据
    resetAllData() {
      this.powerLevel = 0
      this.currentTiming = 0
      this.currentFlowRate = 0
      this.soundWwitch = null
      this.weightStatistics = 0
      this.powderWeight = 0
      console.log('重置所有数据')
    },
    returnValueOfElectronicScale(responseData: any) {
      // const list = responseData.split(' ')
      console.log('用来做判断处理数据的转换：', responseData)
      const values = Object.values(responseData)
      const filledArray = []
      for (let i = 0; i < values.length; i++) {
        filledArray[i] = i in values ? values[i] : 0
      }
      /** 下标2 模式
       * 下标34 重量
       * 下标56 粉重
       * 下标7 当前流速
       * 下标89当前计时
       * 下标10当前电量
       * 下标11 声音开关
       */
      // this.mode = responseData[2]
      // this.currentTiming =
      //   (responseData[10] > 0 ? responseData[10] : 0) + (responseData[9] > 0 ? responseData[9] : 0)
      // this.soundWwitch = this.decimalToHex(responseData[12])
      // this.weightStatistics =
      //   parseInt(
      //     (responseData[4] > 0 ? responseData[4] : 0).toString(16) +
      //       (responseData[5] > 0 ? responseData[5] : 0).toString(16),
      //     16,
      //   ) / 10
      // this.powderWeight =
      //   parseInt(
      //     (responseData[6] > 0 ? responseData[6] : 0).toString(16) +
      //       (responseData[7] > 0 ? responseData[7] : 0).toString(16),
      //     16,
      //   ) / 10
      // this.currentFlowRate = responseData[8] > 0 ? responseData[8] : 0
      // this.powerLevel = responseData[11]
      // console.log('电子秤返回值绝对有效流速:', this.currentFlowRate)
    },

    /**
     * 10进制转16进制（严谨版，自动补零）
     * @param {number|string|bigint} decimal - 10进制数字
     * @param {Object} [options] - 配置选项
     * @param {number} [options.minLength=0] - 最小输出长度，不够前面补零
     * @param {boolean} [options.prefix=false] - 是否添加0x前缀
     * @param {boolean} [options.uppercase=false] - 是否大写输出
     * @param {boolean} [options.twosComplement=true] - 负数是否使用补码表示
     * @returns {string} 16进制字符串
     */
    decimalToHex(
      decimal,
      options: {
        minLength?: number
        prefix?: boolean
        uppercase?: boolean
        twosComplement?: boolean
      } = {},
    ) {
      const { minLength = 0, prefix = false, uppercase = false, twosComplement = true } = options

      // 输入验证
      if (decimal === null || decimal === undefined) {
        throw new Error('输入不能为 null 或 undefined')
      }

      if (
        typeof decimal !== 'number' &&
        typeof decimal !== 'string' &&
        typeof decimal !== 'bigint'
      ) {
        throw new Error('输入必须是数字、字符串或 BigInt')
      }

      // 处理字符串输入
      let num
      if (typeof decimal === 'string') {
        const trimmed = decimal.trim()
        if (!/^-?\d*\.?\d+$/.test(trimmed)) {
          throw new Error('无效的数字格式')
        }

        if (trimmed.includes('.') || Math.abs(Number(trimmed)) > Number.MAX_SAFE_INTEGER) {
          // 浮点数或大数字尝试使用 BigInt
          try {
            num = BigInt(trimmed.split('.')[0]) // 取整数部分
          } catch {
            throw new Error('数字超出安全范围')
          }
        } else {
          num = parseInt(trimmed, 10)
        }
      } else {
        num = decimal
      }

      // 处理特殊数值
      if (typeof num === 'number' && !isFinite(num)) {
        if (isNaN(num)) throw new Error('输入不能是 NaN')
        return num === Infinity ? 'Infinity' : '-Infinity'
      }

      let hexString

      // 核心转换逻辑
      if (typeof num === 'bigint') {
        // BigInt 处理
        if (num >= 0) {
          hexString = num.toString(16)
        } else if (twosComplement) {
          // 64位补码
          const complement = (BigInt(1) << BigInt(64)) + num
          hexString = complement.toString(16).padStart(16, 'f')
        } else {
          hexString = '-' + (-num).toString(16)
        }
      } else if (num < 0) {
        // 负数处理
        if (twosComplement) {
          hexString = (num >>> 0).toString(16)
        } else {
          hexString = '-' + Math.abs(num).toString(16)
        }
      } else {
        // 正数处理
        if (Number.isInteger(num)) {
          hexString = num.toString(16)
        } else {
          // 浮点数使用 IEEE 754
          const buffer = new ArrayBuffer(8)
          const view = new DataView(buffer)
          view.setFloat64(0, num)
          const intValue = view.getBigUint64
            ? view.getBigUint64(0)
            : (BigInt(view.getUint32(0)) << BigInt(32)) | BigInt(view.getUint32(4))
          hexString = intValue.toString(16).padStart(16, '0')
        }
      }

      // 移除补码负数的负号
      if (hexString.startsWith('-') && twosComplement) {
        hexString = hexString.substring(1)
      }

      // 自动补零
      if (minLength > 0 && hexString.length < minLength) {
        const needsPadding = !hexString.startsWith('-')
        hexString = needsPadding
          ? hexString.padStart(minLength, '0')
          : '-' + hexString.substring(1).padStart(minLength - 1, '0')
      }

      // 大写转换
      if (uppercase) {
        hexString = hexString.toUpperCase()
      }

      // 添加前缀
      if (prefix) {
        hexString = '0x' + hexString
      }

      return hexString
    },

    /**
     * 称重记录保存
     */

    async saveWeightRecord(responseData: string) {
      const deviceId = useBluetoothStore().connectedDevice.productInfo.id
      const userId = useUserStore().userInfo.id as unknown as IUserInfo
      const remark = JSON.parse(responseData).remark
      const coffeeData = JSON.parse(responseData).coffeeData
      const { run } = useRequest<IResponseData>(() =>
        httpPost<IResponseData>('/reports/reports', {
          deviceId,
          userId,
          remark,
          coffeeData,
        }),
      )
      return await run()
    },

    async obtainWeighingRecords(pageNum: number) {
      const deviceId = useBluetoothStore().connectedDevice.productInfo.id
      const userId = useUserStore().userInfo.id as unknown as IUserInfo
      const { run } = useRequest<IResponseData>(() =>
        httpGet<IResponseData>('/reports/reports/list', {
          deviceId,
          userId,
          pageNum,
          pageSize: 15,
        }),
      )
      return await run()
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
        powerLevel: this.powerLevel,
        currentTiming: this.currentTiming,
        currentFlowRate: this.currentFlowRate,
        soundWwitch: this.soundWwitch,
        weightStatistics: this.weightStatistics,
        powderWeight: this.powderWeight,
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
  },
})
