import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate' // 数据持久化

const store = createPinia()
store.use(
  createPersistedState({
    storage: {
      getItem: localStorage.getItem,//uni.getStorageSync,
      setItem: localStorage.setItem,//uni.setStorageSync,
    },
  }),
)

export default store

// 模块统一导出
export * from './user'
export * from './blue'
export * from './unit'
export * from './heartbeat'
export * from './coffeeaStatus'
export * from './coffeebStatus'
export * from './deviceVersion'
export * from './coffeedStatus'