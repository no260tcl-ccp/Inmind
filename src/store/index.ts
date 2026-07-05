// src/store/index.ts
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

const store = createPinia()
store.use(
  createPersistedState({
    storage: {
      getItem: localStorage.getItem,
      setItem: localStorage.setItem,
    },
  }),
)

export default store

// 模組統一匯出
export * from './user'
export * from './blue'
export * from './unit'
export * from './heartbeat'
export * from './coffeeaStatus'
export * from './coffeebStatus'
export * from './deviceVersion'
export * from './coffeedStatus'

// --- 新增這一段來解決 Missing Export ---
// 如果實際檔案沒有這個 store，這是一個空殼，能讓打包通過
export const useMachineEStatusStore = () => {
    console.warn('MachineEStatusStore 尚未對接，返回空物件');
    return {}; 
};