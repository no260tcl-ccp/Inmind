<template>
  <div class="page-container">
    <van-nav-bar fixed placeholder :border="false" class="nav-transparent">
      <template #left>
        <div @click="toHome">
          <i class="iconfont icon-a-ze-arrow-leftCopy2 icon-size-22"></i>
        </div>
      </template>
      <template #right>
        <van-icon name="setting-o" size="22" @click="settingShow = true" />
      </template>
    </van-nav-bar>

    <div class="page-content">
      <div class="flex flex-col items-center justify-center mb-6 mt-4">
        <van-image width="180" height="160" :src="homeImg" />
        <div class="page-content-title mt-4">
          {{ bluetoothStore.connectedDevice?.productInfo?.deviceName || '全自动咖啡机' }}
        </div>
        
        <div
          class="state-box flex items-center justify-center mt-3"
          :style="{ color: runStateObj.color }"
          @click="toState"
        >
          <i class="iconfont mr-1" :class="runStateObj.icon"></i>
          <span>{{ runStateObj.text }}</span>
          <span v-if="runStateObj.isJump" class="jump-text ml-2">查看详情 ></span>
        </div>
      </div>

      <div class="menu-grid">
        <div class="menu-item" @click="toQuick">
          <div class="icon-circle bg-blue-100">
            <van-icon name="fire-o" size="28" color="#004097" />
          </div>
          <div class="menu-name">快速冲煮</div>
        </div>
        
        <div class="menu-item" @click="openSaveDialog">
          <div class="icon-circle bg-red-100">
            <van-icon name="like-o" size="28" color="#ee0a24" />
          </div>
          <div class="menu-name">收藏参数</div>
        </div>
        
        <div class="menu-item" @click="openRecipeLibrary">
          <div class="icon-circle bg-orange-100">
            <van-icon name="notes-o" size="28" color="#ff976a" />
          </div>
          <div class="menu-name">我的配方(食譜)</div>
        </div>

        <div class="menu-item" @click="showToast('敬请期待')">
          <div class="icon-circle bg-green-100">
            <van-icon name="records-o" size="28" color="#07c160" />
          </div>
          <div class="menu-name">冲煮记录</div>
        </div>
      </div>
    </div>

    <van-popup v-model:show="settingShow" position="bottom" round style="height: 30%">
      <div class="p-5">
        <div class="text-lg font-bold mb-4">机器设置</div>
        <van-cell title="外观颜色">
          <template #value>
            <van-radio-group v-model="colorValue" direction="horizontal" @change="colorConfirm">
              <van-radio name="white">白色</van-radio>
              <van-radio name="black">黑色</van-radio>
            </van-radio-group>
          </template>
        </van-cell>
      </div>
    </van-popup>

    <van-dialog v-model:show="showSaveDialog" title="保存为私藏配方" show-cancel-button @confirm="confirmSaveRecipe">
      <div class="p-4">
        <van-field v-model="newRecipeName" label="配方名称" placeholder="如: 晨间醒脑" />
        <div class="mt-3 text-xs" style="color: #888; text-align: center;">
          当前参数快照：<br>
          粉量 {{ currentPowder }}g | 粉水比 1:{{ currentRatio }} | 水温 {{ currentTemp }}°C
        </div>
      </div>
    </van-dialog>

    <van-popup v-model:show="recipeShow" position="bottom" round style="height: 65%; background: #f6f8fb;">
      <div class="recipe-popup-header p-4 flex justify-between items-center bg-white">
        <div class="text-lg font-bold" style="color: #333;">☕ 配方库</div>
        <div class="flex items-center gap-3">
          <van-button size="small" type="primary" icon="setting-o" round color="#ff976a" plain @click="toManageFormula">
            管理進階配方
          </van-button>
          <van-icon name="cross" size="20" color="#999" @click="recipeShow = false" />
        </div>
      </div>

      <van-tabs v-model:active="currentTab" color="#ff976a" sticky animated>
        <van-tab title="我的私藏" name="local">
          <div class="p-4 recipe-list-area">
            <div v-for="(item, index) in localRecipes" :key="item.id" class="recipe-card">
              <div class="recipe-info">
                <div class="recipe-name">{{ item.name }}</div>
                <!-- UI 始終讀取最平坦、最安全的屬性，永不報錯 -->
                <div class="recipe-params">粉量: {{ item.powder }}g | 1:{{ item.ratio }} | {{ item.temp }}°C</div>
              </div>
  
              <div class="recipe-actions">
                <van-button size="small" plain type="danger" round @click.stop="deleteLocalRecipe(item.id)">
                  删除
                </van-button>
                <van-button size="small" type="primary" round color="#ff976a" @click.stop="shareRecipeToDevice(item)">
                  分享
                </van-button>
              </div>
            </div>
            
            <van-empty v-if="localRecipes.length === 0" description="您还没有保存任何私藏配方哦">
              <van-button round type="primary" color="#ff976a" size="small" @click="toManageFormula">
                去客製化創建新配方
              </van-button>
            </van-empty>
          </div>
        </van-tab>
        
        <van-tab title="官方精选" name="cloud">
          <div class="p-4 recipe-list-area">
            <div v-for="item in cloudRecipes" :key="item.id" class="recipe-card">
              <div class="recipe-info">
                <div class="recipe-name">{{ item.name }}</div>
                <div class="recipe-params">粉量: {{ item.powder }}g | 1:{{ item.ratio }} | {{ item.temp }}°C</div>
              </div>
              <van-button size="small" type="primary" round color="#004097" plain @click.stop="downloadCloudRecipe(item)">
                下载
              </van-button>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </van-popup>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'

import { useMachineBStatusStore } from '@/store/coffeebStatus'
import { useBluetoothStore } from '@/store/blue'

const router = useRouter()
const bluetoothStore = useBluetoothStore()
const machineStatusStore = useMachineBStatusStore()

// =================================================================
// 1. 核心資料結構定義 (適配器模式)
// =================================================================
// 這是專門給「首頁 UI 渲染」與「藍牙發送」用的安全平坦結構
interface Recipe {
  id: number | string;
  name: string;
  powder: number;       
  ratio: number;        
  temp: number;
  rawConfig?: any; // 祕密保留給 myFormula.vue 的大師級原始資料
}

const settingShow = ref(false)
const recipeShow = ref(false)
const showSaveDialog = ref(false) 
const newRecipeName = ref('')
const colorValue = ref('white')
const homeImg = ref('https://cdn.bincoocoffee.cn/home-machine.png')
const currentTab = ref('local')

const currentPowder = ref(15)
const currentRatio = ref(15)
const currentTemp = ref(92)

const localRecipes = ref<Recipe[]>([])

const cloudRecipes = ref<Recipe[]>([
  { id: 101, name: '【官方】世界冠军手冲参数', powder: 15, ratio: 15, temp: 92 },
  { id: 102, name: '【官方】深焙豆黄金萃取', powder: 18, ratio: 12, temp: 88 }
])

// =================================================================
// 2. 基礎商業邏輯與核心跳轉
// =================================================================
const runStateObj = computed(() => {
  const status = machineStatusStore.runStatus
  if (status === 1) { return { text: '研磨中', color: '#004097', icon: 'icon-yanyanjia', isJump: true } } 
  else if (status === 2 || status === 3) { return { text: '冲煮中', color: '#004097', icon: 'icon-zhushui', isJump: true } }
  return { text: '设备就绪', color: '#999', icon: 'icon-kongxian', isJump: false }
})

const toHome = () => router.push('/')
const toQuick = () => router.push('/pages-coffeeb/grind/grind')
const toState = () => { if (runStateObj.value.isJump) { router.push('/pages-coffeeb/pulverizing/pulverizing') } }
const colorConfirm = () => { showToast({ type: 'success', message: '颜色设置成功' }) }

const openRecipeLibrary = () => {
  loadLocalRecipes()
  recipeShow.value = true
}

const openSaveDialog = () => {
  showSaveDialog.value = true
}

const toManageFormula = () => {
  recipeShow.value = false
  router.push('/pages-coffeeb/myFormula/myFormula')
}

// =================================================================
// 3. 配方管理核心 (⭐ 轉接器模式：完美同步 bincoo_my_recipes)
// =================================================================
const loadLocalRecipes = () => {
  try {
    // 💡 讀取與 myFormula.vue 相同的金庫
    const saved = localStorage.getItem('bincoo_my_recipes')
    if (saved) {
      const rawLibrary = JSON.parse(saved)
      if (Array.isArray(rawLibrary)) {
        // 將大師級巢狀結構，安全清洗成首頁 UI 喜歡的平坦結構
        localRecipes.value = rawLibrary.map((item: any) => {
          let config = item.configJson
          // 防呆：解決字串/物件型態衝突
          if (typeof config === 'string') {
            try { config = JSON.parse(config) } catch(e) { config = {} }
          }
          if (!config) config = {}

          return {
            id: item.id || Date.now(),
            name: item.name || '未命名配方',
            powder: config.legumes || 15,
            ratio: config.proportion ? (config.proportion / 2) : 15,
            temp: config.accordionItems?.[0]?.temperature || 92,
            rawConfig: config // 秘密把大師級設定藏在這裡，藍牙發送時會用到！
          }
        })
      }
    } else {
      localRecipes.value = []
    }
  } catch (e) {
    console.error('读取首页配方失败:', e)
    localRecipes.value = []
  }
}

const confirmSaveRecipe = () => {
  const finalName = newRecipeName.value.trim() || `我的配方 ${new Date().toLocaleTimeString('zh-TW', {hour: '2-digit', minute:'2-digit'})}`
  
  const totalWater = currentPowder.value * currentRatio.value
  const bloomWater = Math.min(totalWater, currentPowder.value * 2) 
  const mainWater = Math.max(0, totalWater - bloomWater)          

  // 💡 寫入時：打包成 myFormula.vue 能看懂的 `configJson` 結構
  const autoConfig = {
    legumes: currentPowder.value,
    proportion: currentRatio.value * 2, 
    grind: true,             
    gear: 60,                 
    speed: 120,               
    accordionItems: [
      { paragraph: '闷蒸', water: bloomWater, temperature: currentTemp.value, time: 30, velocity: 3, type: 1 }
    ]
  }
  if (mainWater > 0) {
    autoConfig.accordionItems.push({ paragraph: '第1段', water: mainWater, temperature: currentTemp.value, time: 120, velocity: 3, type: 1 })
  }

  const newRawRecipe = { id: 'local_' + Date.now(), name: finalName, configJson: autoConfig }

  let currentLibrary: any[] = []
  try {
    const currentStr = localStorage.getItem('bincoo_my_recipes')
    if (currentStr) currentLibrary = JSON.parse(currentStr)
    if (!Array.isArray(currentLibrary)) currentLibrary = []
  } catch(e) { currentLibrary = [] }

  currentLibrary.unshift(newRawRecipe)
  localStorage.setItem('bincoo_my_recipes', JSON.stringify(currentLibrary))

  loadLocalRecipes() // 重新刷新畫面
  newRecipeName.value = ''
  showSaveDialog.value = false
  showToast({ type: 'success', message: '已保存至我的私藏！' })
}

const downloadCloudRecipe = (recipe: Recipe) => {
  const finalName = recipe.name.replace('【官方】', '【私藏】')
  const isDuplicate = localRecipes.value.some(r => r.name === finalName)
  if (isDuplicate) {
    showToast({ type: 'text', message: '该配方已存在于我的私藏中' })
    return
  }

  const totalWater = recipe.powder * recipe.ratio
  const bloomWater = Math.min(totalWater, recipe.powder * 2) 
  const mainWater = Math.max(0, totalWater - bloomWater)   

  const cloudConfig = {
    legumes: recipe.powder,
    proportion: recipe.ratio * 2, 
    grind: true,             
    gear: 60,                 
    speed: 120,               
    accordionItems: [
      { paragraph: '闷蒸', water: bloomWater, temperature: recipe.temp, time: 30, velocity: 3, type: 1 }
    ]
  }
  if (mainWater > 0) {
    cloudConfig.accordionItems.push({ paragraph: '第1段', water: mainWater, temperature: recipe.temp, time: 120, velocity: 3, type: 1 })
  }

  const newRawRecipe = { id: 'local_' + Date.now(), name: finalName, configJson: cloudConfig }

  let currentLibrary: any[] = []
  try {
    const currentStr = localStorage.getItem('bincoo_my_recipes')
    if (currentStr) currentLibrary = JSON.parse(currentStr)
    if (!Array.isArray(currentLibrary)) currentLibrary = []
  } catch(e) { currentLibrary = [] }

  currentLibrary.unshift(newRawRecipe)
  localStorage.setItem('bincoo_my_recipes', JSON.stringify(currentLibrary))

  loadLocalRecipes()
  showToast({ type: 'success', message: '下载成功，已加入我的私藏' })
}

const deleteLocalRecipe = (recipeId: number | string) => {
  showConfirmDialog({
    title: '确认删除',
    message: '确定要删除这个私藏配方吗？'
  }).then(() => {
    let currentLibrary: any[] = []
    try {
      const localStr = localStorage.getItem('bincoo_my_recipes')
      if (localStr) {
        currentLibrary = JSON.parse(localStr)
        if (Array.isArray(currentLibrary)) {
          // 使用 ID 來精準刪除
          currentLibrary = currentLibrary.filter(r => r.id !== recipeId)
          localStorage.setItem('bincoo_my_recipes', JSON.stringify(currentLibrary))
        }
      }
    } catch (e) {
      console.error(e)
    }
    loadLocalRecipes()
    showToast('删除成功')
  }).catch(() => {})
}

// =================================================================
// 4. 藍牙協議發送中心 (自動提取並發送大師級多段協議)
// =================================================================
const shareRecipeToDevice = (recipe: Recipe) => {
  if (!bluetoothStore.connectedDevice) {
    showToast('设备未连接，请先连线咖啡机')
    return
  }

  const recipePkg = new Uint8Array(60)
  recipePkg[0] = 0x5A  
  recipePkg[1] = 0x06  
  recipePkg[2] = 55    

  const numId = typeof recipe.id === 'number' ? recipe.id : Date.now() % 100000
  recipePkg[3] = (numId >> 24) & 0xFF
  recipePkg[4] = (numId >> 16) & 0xFF
  recipePkg[5] = (numId >> 8) & 0xFF
  recipePkg[6] = numId & 0xFF

  const config = recipe.rawConfig || {}
  
  recipePkg[7] = recipe.ratio      
  recipePkg[8] = recipe.powder         
  recipePkg[9] = config.grind !== false ? 1 : 0  
  recipePkg[10] = config.gear || 3         
  recipePkg[11] = config.speed || 90         

  const items = config.accordionItems || []
  
  // 若是官方精選直接點擊分享（沒有 rawConfig），則手動計算兩段式
  if (items.length === 0) {
    recipePkg[12] = 2 // 總段數
    const totalWater = recipe.powder * recipe.ratio
    const bloomWater = Math.min(totalWater, recipe.powder * 2) 
    const mainWater = Math.max(0, totalWater - bloomWater)          

    recipePkg[13] = bloomWater                                   
    recipePkg[14] = 33                       
    recipePkg[15] = recipe.temp                         
    recipePkg[16] = 1                              
    recipePkg[17] = 30                           

    recipePkg[18] = mainWater                                   
    recipePkg[19] = 33                                 
    recipePkg[20] = recipe.temp                         
    recipePkg[21] = 1                                  
    recipePkg[22] = 0  

    for (let i = 23; i < 38; i++) recipePkg[i] = 0x00
  } else {
    // 若是從私藏庫讀取出來的，擁有真實的 accordionItems 陣列
    const totalStages = Math.min(5, Math.max(1, items.length))
    recipePkg[12] = totalStages

    let offset = 13
    for (let i = 0; i < 5; i++) {
      if (i < totalStages && items[i]) {
        recipePkg[offset] = items[i].water || 0                                   
        recipePkg[offset + 1] = Number(`3.${items[i].velocity || 3}`) * 10        
        recipePkg[offset + 2] = items[i].temperature || recipe.temp                         
        recipePkg[offset + 3] = items[i].type || 1                                
        recipePkg[offset + 4] = items[i].time || 0                                
      } else {
        recipePkg[offset] = 0x00
        recipePkg[offset + 1] = 0x00
        recipePkg[offset + 2] = 0x00
        recipePkg[offset + 3] = 0x00
        recipePkg[offset + 4] = 0x00
      }
      offset += 5 
    }
  }

  const encoder = new TextEncoder()
  const nameBuffer = encoder.encode(recipe.name)
  for (let i = 0; i < 20; i++) {
    recipePkg[38 + i] = i < nameBuffer.length ? nameBuffer[i] : 0x00
  }

  let crc = recipePkg[1] ^ recipePkg[2]
  for (let i = 3; i < 58; i++) {
    crc ^= recipePkg[i]
  }
  recipePkg[58] = crc
  recipePkg[59] = 0xAA 

  bluetoothStore.sendData(recipePkg)
  showToast({ type: 'success', message: `《${recipe.name}》大師級配方已同步寫入！` })
}

// =================================================================
// 5. 生命周期刷新監聽
// =================================================================
onMounted(() => {
  loadLocalRecipes()
})

// 確保從配方大廳編輯完返回首頁時，資料會自動同步
onActivated(() => {
  loadLocalRecipes()
})
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f6f8fb;
  .nav-transparent {
    background-color: transparent !important;
  }
}
.page-content-title {
  font-size: 22px;
  font-weight: bold;
  color: #333;
}
.state-box {
  font-size: 14px;
  padding: 6px 16px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  cursor: pointer;
  display: inline-flex;
}
.jump-text {
  color: #004097;
  text-decoration: underline;
}
.menu-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  padding: 20px;
}
.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  padding: 20px 10px;
  border-radius: 16px;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}
.menu-item:active {
  transform: scale(0.95);
  background: #fafafa;
}
.icon-circle {
  width: 50px;
  height: 50px;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}
.menu-name {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}
.bg-blue-100 { background-color: #eef4ff; }
.bg-orange-100 { background-color: #fff4ec; }
.bg-green-100 { background-color: #f0fdf4; }
.bg-red-100 { background-color: #ffeef0; }

.recipe-popup-header {
  border-bottom: 1px solid #f0f0f0;
  border-radius: 20px 20px 0 0;
}
.recipe-list-area {
  height: calc(65vh - 100px);
  overflow-y: auto;
}
.recipe-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  cursor: pointer;
  &:active {
    transform: scale(0.98);
    background: #fcfcfc;
  }
  .recipe-info {
    .recipe-name {
      font-size: 15px;
      font-weight: bold;
      color: #333;
      margin-bottom: 6px;
    }
    .recipe-params {
      font-size: 12px;
      color: #888;
    }
  }
  .recipe-actions {
    display: flex;
    gap: 8px;
  }
}
</style>