import { defineStore } from 'pinia'

export const useTemperatureStore = defineStore('temperature', {
  state: () => ({
    unit: '°C', // 默认单位为摄氏度
  }),
  actions: {
    toggleUnit() {
      this.unit = this.unit === '°C' ? '°F' : '°C'
      uni.setStorageSync('temperatureUnit', this.unit)
    },
    initFromCache() {
      const cachedUnit = uni.getStorageSync('temperatureUnit')
      if (cachedUnit) {
        this.unit = cachedUnit
      }
    },
  },
})
