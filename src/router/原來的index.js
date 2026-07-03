
import { createRouter, createWebHistory } from 'vue-router'
// 引入您的實際首頁組件 (路徑請依照您實際的檔案位置調整)
import BrewPage from '@/pages-coffeed/brew/brew.vue'

const routes = [
  // 必須要有 path: '/' 的設定！
  // 1. 藍牙連接頁 (起點)
  //{ path: '/', name: 'Search', component: () => import('@/views/Search.vue') },
  {
    path: '/',
    name: 'Home',
    component: BrewPage // 直接將首頁綁定在這裡
  },
  // 2. 設備主頁
  //{ path: '/device/home', name: 'DeviceHome', component: () => import('@/views/DeviceHome.vue') },

  // 3. 各項設置頁 (從設備主頁進入)
  //{ path: '/fast-brew/settings', name: 'FastBrewSettings', component: () => import('@/views/FastBrewSettings.vue') },
  //{ path: '/grind/settings', name: 'GrindSettings', component: () => import('@/views/GrindSettings.vue') },
  //{ path: '/pour/settings', name: 'PourSettings', component: () => import('@/views/PourSettings.vue') },

  // 4. 任務執行監控頁 (您剛剛重構的 brew.vue 放在這裡)
  // 核心：不管快速沖煮、配方沖煮、單純研磨，執行畫面都是跳轉到這個路由
  { path: '/brew/executing', name: 'BrewExecuting', component: () => import('@/pages-coffeed/brew/brew.vue') },

  // 5. 任務完成頁 (您重構的 boiling-completed.vue)
  { path: '/brew/completed', name: 'BrewCompleted', component: () => import('@/pages-coffeed/boiling-completed/boiling-completed.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router