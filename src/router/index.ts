import { createRouter, createWebHistory } from 'vue-router'
//這是 BINCOO微信小程序的 
const routes = [

  // 🌟 [新增] 解決白畫面：當網址是根目錄 '/' 時，自動導向首頁
  {
    path: '/',
    redirect: '/pages/index/index' // 您也可以根據需求改成 '/pages-coffeeb/index/index'
  },
  // ==========================================
  // 1. 主包 (pages) - 包含首頁與登入等基礎設定
  // ==========================================
  {
    path: '/pages/index/index',
    name: 'Home',
    component: () => import('@/pages/index/index.vue'),
    meta: { title: 'Bincoo' } // 取代原 %tabbar.index%
  },
  {
    path: '/pages/index/user-popup',
    name: 'UserPopup',
    component: () => import('@/pages/index/user-popup.vue')
  },
  {
    path: '/pages/message/info',
    name: 'MessageInfo',
    component: () => import('@/pages/message/info.vue'),
    meta: { title: '系统消息' }
  },
  {
    path: '/pages/message/message',
    name: 'Message',
    component: () => import('@/pages/message/message.vue'),
    meta: { title: '消息' } // 取代原 %tabbar.message%
  },
  {
    path: '/pages/mine/login',
    name: 'Login',
    component: () => import('@/pages/mine/login.vue')
  },
  {
    path: '/pages/mine/mine',
    name: 'Mine',
    component: () => import('@/pages/mine/mine.vue'),
    meta: { title: '商城' } // 取代原 %tabbar.mine%
  },
  {
    path: '/pages/mine/privacyPolicy',
    name: 'PrivacyPolicy',
    component: () => import('@/pages/mine/privacyPolicy.vue'),
    meta: { title: '隐私协议' }
  },
  {
    path: '/pages/mine/userAgreement',
    name: 'UserAgreement',
    component: () => import('@/pages/mine/userAgreement.vue'),
    meta: { title: '用户协议' }
  },

  // ==========================================
  // 2. 設備連線 (pages-device)
  // ==========================================
  {
    path: '/pages-device/add/add',
    name: 'DeviceAdd',
    component: () => import('@/pages-device/add/add.vue'),
    meta: { title: '添加设备' } // 取代原 %index.device%
  },
  {
    path: '/pages-device/connect/connect',
    name: 'DeviceConnect',
    component: () => import('@/pages-device/connect/connect.vue'),
    meta: { title: '连接设备' }
  },
  {
    path: '/pages-device/device-seting/device-seting',
    name: 'DeviceSetting',
    component: () => import('@/pages-device/device-seting/device-seting.vue'),
    meta: { title: '修改设备名称' }
  },

  // ==========================================
  // 3. 全自動手沖咖啡機 (pages-coffeeb)
  // ==========================================
  {
    path: '/pages-coffeeb/brew/brew',
    name: 'CoffeeBBrew',
    component: () => import('@/pages-coffeeb/brew/brew.vue'),
    meta: { title: '冲煮' }
  },
  {
    path: '/pages-coffeeb/cloudFormula/cloudFormula',
    name: 'CoffeeBCloudFormula',
    component: () => import('@/pages-coffeeb/cloudFormula/cloudFormula.vue'),
    meta: { title: '为您推荐' }
  },
  {
    path: '/pages-coffeeb/formula/formula',
    name: 'CoffeeBFormula',
    component: () => import('@/pages-coffeeb/formula/formula.vue'),
    meta: { title: '配方参数' }
  },
  {
    path: '/pages-coffeeb/formulaDetail/formulaDetail',
    name: 'CoffeeBFormulaDetail',
    component: () => import('@/pages-coffeeb/formulaDetail/formulaDetail.vue'),
    meta: { title: '配方详情' }
  },
  {
    path: '/pages-coffeeb/grind/grind-old',
    name: 'CoffeeBGrindOld',
    component: () => import('@/pages-coffeeb/grind/grind-old.vue'),
    meta: { title: '研磨' }
  },
  {
    path: '/pages-coffeeb/grind/grind',
    name: 'CoffeeBGrind',
    component: () => import('@/pages-coffeeb/grind/grind.vue'),
    meta: { title: '快速冲煮' }
  },
  {
    path: '/pages-coffeeb/index/index',
    name: 'CoffeeBIndex',
    component: () => import('@/pages-coffeeb/index/index.vue'),
    meta: { title: '设备管理' }
  },
  {
    path: '/pages-coffeeb/index/setting-popup',
    name: 'CoffeeBSettingPopup',
    component: () => import('@/pages-coffeeb/index/setting-popup.vue')
  },
  {
    path: '/pages-coffeeb/info/info',
    name: 'CoffeeBInfo',
    component: () => import('@/pages-coffeeb/info/info.vue'),
    meta: { title: '机器信息' }
  },
  {
    path: '/pages-coffeeb/info/new-version',
    name: 'CoffeeBNewVersion',
    component: () => import('@/pages-coffeeb/info/new-version.vue')
  },
  {
    path: '/pages-coffeeb/instructions/customerService',
    name: 'CoffeeBCustomerService',
    component: () => import('@/pages-coffeeb/instructions/customerService.vue'),
    meta: { title: '客服' }
  },
  {
    path: '/pages-coffeeb/instructions/first',
    name: 'CoffeeBFirst',
    component: () => import('@/pages-coffeeb/instructions/first.vue'),
    meta: { title: '用户手册' }
  },
  {
    path: '/pages-coffeeb/instructions/info',
    name: 'CoffeeBInstructionsInfo',
    component: () => import('@/pages-coffeeb/instructions/info.vue'),
    meta: { title: '用户手册' }
  },
  {
    path: '/pages-coffeeb/instructions/instructions',
    name: 'CoffeeBInstructions',
    component: () => import('@/pages-coffeeb/instructions/instructions.vue'),
    meta: { title: '用户手册' }
  },
  {
    path: '/pages-coffeeb/message/message',
    name: 'CoffeeBMessage',
    component: () => import('@/pages-coffeeb/message/message.vue'),
    meta: { title: '消息' }
  },
  {
    path: '/pages-coffeeb/myFormula/myFormula',
    name: 'CoffeeBMyFormula',
    component: () => import('@/pages-coffeeb/myFormula/myFormula.vue'),
    meta: { title: '我的配方' }
  },
  {
    path: '/pages-coffeeb/pulverizing/pulverizing',
    name: 'CoffeeBPulverizing',
    component: () => import('@/pages-coffeeb/pulverizing/pulverizing.vue'),
    meta: { title: '快速冲煮' }
  },
  {
    path: '/pages-coffeeb/smash/smash',
    name: 'CoffeeBSmash',
    component: () => import('@/pages-coffeeb/smash/smash.vue'),
    meta: { title: '研磨' }
  },
  {
    path: '/pages-coffeeb/waterInjection/waterInjection-old',
    name: 'CoffeeBWaterInjectionOld',
    component: () => import('@/pages-coffeeb/waterInjection/waterInjection-old.vue'),
    meta: { title: '注水' }
  },
  {
    path: '/pages-coffeeb/waterInjection/waterInjection',
    name: 'CoffeeBWaterInjection',
    component: () => import('@/pages-coffeeb/waterInjection/waterInjection.vue'),
    meta: { title: '注水' }
  },
  {
    path: '/pages-coffeeb/pulverizing/lack-bean/lack-bean',
    name: 'CoffeeBLackBean',
    component: () => import('@/pages-coffeeb/pulverizing/lack-bean/lack-bean.vue')
  },

  // ==========================================
  // 4. 溫控手沖設備 (pages-coffeed)
  // ==========================================
  {
    path: '/pages-coffeed/boiling-completed/boiling-completed',
    name: 'CoffeeDBoilingCompleted',
    component: () => import('@/pages-coffeed/boiling-completed/boiling-completed.vue'),
    meta: { title: '冲煮完成' }
  },
  {
    path: '/pages-coffeed/brew/brew',
    name: 'CoffeeDBrew',
    component: () => import('@/pages-coffeed/brew/brew.vue'),
    meta: { title: '冲煮' }
  },
  {
    path: '/pages-coffeed/formula/formula',
    name: 'CoffeeDFormula',
    component: () => import('@/pages-coffeed/formula/formula.vue'),
    meta: { title: '配方参数' }
  },
  //{
  //  path: '/pages-coffeed/formula-addedit/formula-addedit',
  //  name: 'CoffeeDFormulaAddEdit',
  //  component: () => import('@/pages-coffeed/formula-addedit/formula-addedit.vue'),
  //  meta: { title: '配方添加/编辑 || 萃取设置' }
  //},
  //{
  //  path: '/pages-coffeed/grind/boilingWater',
  // name: 'CoffeeDBoilingWater',
  //  component: () => import('@/pages-coffeed/grind/boilingWater.vue'),
  //  meta: { title: '烧水中' }
  //},
  //{
  // path: '/pages-coffeed/grind/grind',
  //  name: 'CoffeeDGrind',
  //  component: () => import('@/pages-coffeed/grind/grind.vue'),
  //  meta: { title: '智能控温' }
  //},
  //{
  //  path: '/pages-coffeed/index/index',
  //  name: 'CoffeeDIndex',
  //  component: () => import('@/pages-coffeed/index/index.vue'),
  //  meta: { title: '手冲温控咖啡壶首页' }
  //},
  //{
  // path: '/pages-coffeed/info/info',
  //  name: 'CoffeeDInfo',
  //  component: () => import('@/pages-coffeed/info/info.vue'),
  //  meta: { title: '机器信息' }
  //},
  //{
  //  path: '/pages-coffeed/info/new-version',
  //  name: 'CoffeeDNewVersion',
  //  component: () => import('@/pages-coffeed/info/new-version.vue')
  //},
  //{
  //  path: '/pages-coffeed/instructions/customerService',
  //  name: 'CoffeeDCustomerService',
  //  component: () => import('@/pages-coffeed/instructions/customerService.vue'),
  //  meta: { title: '客服' }
  //},
  //{
  //  path: '/pages-coffeed/instructions/first',
  //  name: 'CoffeeDFirst',
  //  component: () => import('@/pages-coffeed/instructions/first.vue'),
  //  meta: { title: '用户手册' }
  //},
  //{
  //  path: '/pages-coffeed/instructions/info',
  //  name: 'CoffeeDInstructionsInfo',
  //  component: () => import('@/pages-coffeed/instructions/info.vue'),
  //  meta: { title: '用户手册' }
  //},
  //{
  //  path: '/pages-coffeed/instructions/instructions',
  //  name: 'CoffeeDInstructions',
  //  component: () => import('@/pages-coffeed/instructions/instructions.vue'),
  //  meta: { title: '用户手册' }
  //},
  //{
  //  path: '/pages-coffeed/message/message',
  //  name: 'CoffeeDMessage',
  //  component: () => import('@/pages-coffeed/message/message.vue'),
  //  meta: { title: '消息' }
  //},
  //{
  //  path: '/pages-coffeed/outWater/outWater',
  //  name: 'CoffeeDOutWater',
  //  component: () => import('@/pages-coffeed/outWater/outWater.vue'),
  //  meta: { title: '出水监测' }
  //},
  //{
  //  path: '/pages-coffeed/preset-formula/preset-formula',
  // name: 'CoffeeDPresetFormula',
  //  component: () => import('@/pages-coffeed/preset-formula/preset-formula.vue'),
  //  meta: { title: '配方详情' }
  //},
  //{
  //  path: '/pages-coffeed/quantitative-flowcontrol/quantitative-flowcontrol',
  //  name: 'CoffeeDQuantitativeFlowControl',
  //  component: () => import('@/pages-coffeed/quantitative-flowcontrol/quantitative-flowcontrol.vue'),
  //  meta: { title: '定量控流' }
  //},
  //{
  //  path: '/pages-coffeed/start-boiling/start-boiling',
  //  name: 'CoffeeDStartBoiling',
  //  component: () => import('@/pages-coffeed/start-boiling/start-boiling.vue'),
  //  meta: { title: '预设冲煮详情' }
  //}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 利用 beforeEach 守衛，動態切換網頁標題
// ✅ 修正後的 Vue Router 4 標準寫法：拔除 next 參數，改用 return true 釋放路由
router.beforeEach((to, from) => {
  // 1. 動態切換網頁標題
  if (to.meta && to.meta.title) {
    document.title = to.meta.title as string
  }

  // 2. 🌟 核心防禦：直接返回 true 代表無條件放行通關
  return true 
})

export default router