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
        
        <div class="menu-item" @click="openRecipeLibrary"> <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
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
        <van-icon name="cross" size="20" color="#999" @click="recipeShow = false" />
      </div>

      <van-tabs v-model:active="currentTab" color="#ff976a" sticky animated>
        <van-tab title="我的私藏" name="local">
          <div class="p-4 recipe-list-area">
            <div v-for="(item, index) in localRecipes" :key="item.id" class="recipe-card">
              <div class="recipe-info cursor-pointer" @click="goToDetail(item)">
                <div class="recipe-name">{{ item.name }}</div>
                <div class="recipe-params">粉量: {{ item.powder }}g | 1:{{ item.ratio }} | {{ item.temp }}°C</div>
              </div>
  
              <div class="recipe-actions">
                <van-button size="small" plain type="danger" round @click.stop="deleteLocalRecipe(index)">
                  删除
                </van-button>
                <van-button size="small" type="primary" round color="#ff976a" @click.stop="shareRecipeToDevice(item)">
                  分享
                </van-button>
              </div>
            </div>
            <van-empty v-if="localRecipes.length === 0" description="您还没有保存任何私藏配方哦" />
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'

// 引入您專案原有的 Store 大腦
import { useMachineBStatusStore } from '@/store/coffeebStatus'
import { useBluetoothStore } from '@/store/blue'

const router = useRouter()
const bluetoothStore = useBluetoothStore()
const machineStatusStore = useMachineBStatusStore()

// =================================================================
// 1. 核心資料結構定義 (全面翻新為大師級巢狀結構，對齊 grind.vue)
// =================================================================
interface StageItem {
  id: number;
  water: number;        // 該段注水量 (ml)
  velocity: number;     // 流速倍率 (1~5)
  temperature: number;  // 該段獨立水溫 (°C)
  type: number;         // 注水方式 (1:中心, 2:螺旋, 3:環繞)
  time: number;         // 沖煮後停駐/悶蒸時間 (秒)
  paragraph?: string;   // 段落中文名稱
}

interface Recipe {
  id: number | string;
  name: string;
  powder: number;       // 豆粉量 (g)
  ratio: number;        // 粉水比 (例如 15 代表 1:15)
  temp: number;         // 為了相容舊版 UI 顯示保留的根溫
  grind: boolean;       // 研磨開關
  gear: number;         // 研磨檔位
  speed: number;        // 研磨轉速 (RPM)
  stages: StageItem[];  // ★ 進階多段注水陣列 (最多5段)
}

// =================================================================
// 2. UI 狀態變數 (完全保留您原本的變數命名，確保不破壞舊 UI 綁定)
// =================================================================
const settingShow = ref(false)
const recipeShow = ref(false)
const showSaveDialog = ref(false) // 控制舊版儲存彈窗
const newRecipeName = ref('')
const colorValue = ref('white')
const homeImg = ref('https://cdn.bincoocoffee.cn/home-machine.png')
const currentTab = ref('local')

// 模擬或承接當前首頁/機器的設定參數 (與您原程式碼完全一致)
const currentPowder = ref(15)
const currentRatio = ref(15)
const currentTemp = ref(92)

// 響應式配方庫列表
const localRecipes = ref<Recipe[]>([])

// 官方精選配方：同步升級為多段骨架，點擊發送時同樣走高階協議
const cloudRecipes = ref<Recipe[]>([
  {
    id: 101,
    name: '【官方】世界冠军手冲参数',
    powder: 15,
    ratio: 15,
    temp: 92,
    grind: true,
    gear: 3,
    speed: 90,
    stages: [
      { id: 1, water: 40, velocity: 3, temperature: 92, type: 1, time: 30, paragraph: '闷蒸' },
      { id: 2, water: 100, velocity: 3, temperature: 92, type: 1, time: 0, paragraph: '第1段' },
      { id: 3, water: 85, velocity: 3, temperature: 92, type: 1, time: 0, paragraph: '第2段' }
    ]
  },
  {
    id: 102,
    name: '【官方】深焙豆黄金萃取',
    powder: 18,
    ratio: 12,
    temp: 88,
    grind: true,
    gear: 2,
    speed: 85,
    stages: [
      { id: 1, water: 35, velocity: 2, temperature: 88, type: 1, time: 25, paragraph: '闷蒸' },
      { id: 2, water: 181, velocity: 3, temperature: 88, type: 1, time: 0, paragraph: '第1段' }
    ]
  }
])

// =================================================================
// 3. 基礎商業邏輯 (維持原樣)
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

// 🌟 1. 新增跳轉到詳情頁的函式
/**
 * 首頁私藏彈窗 - 點擊配方名稱跳轉詳情頁 (相容升級版)
 */
const goToDetail = (item: any) => {
  try {
    console.log('--- 觸發首頁私藏配方跳轉 ---', item)
    if (!item) return

    let finalConfig = item.configJson
    if (typeof finalConfig === 'string') {
      finalConfig = JSON.parse(finalConfig)
    }

    // 幫舊配方自動升級格式
    if (!finalConfig) {
      finalConfig = {
        legumes: item.powder || 15,
        proportion: (item.ratio || 15) * 2,
        grind: true,
        gear: 60,
        speed: 120,
        accordionItems: [
          { paragraph: '焖蒸', water: 30, temperature: item.temp || 92, time: 30, velocity: 3, type: 0 },
          { paragraph: '第1段', water: 195, temperature: item.temp || 92, time: 120, velocity: 3, type: 0 }
        ]
      }
    }

    const params = {
      id: item.id || Date.now(),
      name: item.name || '未命名配方',
      isShare: false,
      configJson: finalConfig 
    }

    // 關閉首頁底部彈窗
    recipeShow.value = false 

    // 🔥 加上 .catch 強制攔截 Vue Router 的隱形錯誤
    router.push({
      path: '/pages-coffeeb/formulaDetail/formulaDetail',
      query: { data: JSON.stringify(params) }
    }).catch((err) => {
      // 如果跳轉失敗，這裡會立刻彈窗警告！
      alert('🚨 跳轉詳情頁失敗！找不到網址路徑。請檢查 router/index.ts 裡的 path 是不是拼錯了？');
      console.error('路由跳轉錯誤:', err);
    })

  } catch (err) {
    console.error('首頁彈窗跳轉詳情頁發生錯誤:', err)
  }
}

// 🌟 2. 讓首頁彈窗能讀取到您在 formula.vue 建立的真實配方！
const loadLocalRecipes = () => {
  try {
    const localStr = localStorage.getItem('bincoo_my_recipes')
    if (localStr) {
      const rawRecipes = JSON.parse(localStr)
      // 將資料轉換成首頁彈窗 UI 需要的格式 (powder, ratio, temp)
      localRecipes.value = rawRecipes.map((r: any) => {
        return {
          ...r, // 保留原始所有欄位，跳轉時才拿得到 configJson
          id: r.id,
          name: r.name,
          powder: r.configJson?.legumes || 0,
          ratio: r.configJson?.proportion ? r.configJson.proportion / 2 : 0,
          temp: r.configJson?.accordionItems?.[0]?.temperature || 92
        }
      })
    } else {
      localRecipes.value = []
    }
  } catch (error) {
    console.error('讀取首頁配方失敗:', error)
  }
}

// 🔥 修改點 2：新增呼叫並開啟配方庫彈窗的函式 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
const openRecipeLibrary = () => {
  console.log('開啟配方庫彈窗...')
  loadLocalRecipes()
  recipeShow.value = true // 開啟包含「我的私藏」與「官方精選」的底部彈窗
  // 如果您希望每次打開都直接預設在官方精選，可以加上這行： currentTab.value = 'cloud'
}

// 補上畫面點擊「收藏參數」時觸發的實作函式
const openSaveDialog = () => {
  console.log('偵測到點擊收藏參數，正在開啟命名彈窗...') //<<<<<<<<<<<<<<<<<<<<
  if (typeof showSaveDialog !== 'undefined') showSaveDialog.value = true
}

// =================================================================
// 4. 配方管理核心 (大師級升級：自動清洗、包裝多段資料並寫入快存)
// =================================================================
const confirmSaveRecipe = () => { //保持與 06230703相同
  const nameStr = newRecipeName.value.trim()
  if (!nameStr) {
    showToast({ type: 'fail', message: '请输入配方名称' })
    return
  }

  const totalWater = currentPowder.value * currentRatio.value
  const bloomWater = Math.min(totalWater, currentPowder.value * 2) 
  const mainWater = Math.max(0, totalWater - bloomWater)          

  const autoGeneratedStages: StageItem[] = [
    { id: 1, water: bloomWater, velocity: 3, temperature: currentTemp.value, type: 1, time: 30, paragraph: '闷蒸' }
  ]
  if (mainWater > 0) {
    autoGeneratedStages.push({ id: 2, water: mainWater, velocity: 3, temperature: currentTemp.value, type: 1, time: 0, paragraph: '第1段' })
  }

  const newRecipe: Recipe = {
    id: 'local_' + Date.now(),
    name: nameStr,
    powder: currentPowder.value,
    ratio: currentRatio.value,
    temp: currentTemp.value, 
    grind: true,             
    gear: 3,                 
    speed: 90,               
    stages: autoGeneratedStages 
  }

  localRecipes.value.unshift(newRecipe)
  localStorage.setItem('bincoo_local_recipes', JSON.stringify(localRecipes.value))

  newRecipeName.value = ''
  showSaveDialog.value = false
  showToast({ type: 'success', message: '已成功保存大师级配方！' })
}

// 下載官方配方
const downloadCloudRecipe = (recipe: Recipe) => { //保持與 06230703相同
  const cloned: Recipe = {
    ...JSON.parse(JSON.stringify(recipe)), 
    id: 'local_' + Date.now()
  }
  localRecipes.value.unshift(cloned)
  localStorage.setItem('bincoo_local_recipes', JSON.stringify(localRecipes.value))
  showToast({ type: 'success', message: '已下載至我的私藏' })
}

// 刪除私藏配方
const deleteLocalRecipe = (index: number) => { //保持與 06230703相同
  showConfirmDialog({ title: '确认删除', message: '确定要删除这个私藏配方吗？' }).then(() => {
    localRecipes.value.splice(index, 1)
    localStorage.setItem('bincoo_local_recipes', JSON.stringify(localRecipes.value))
    showToast('删除成功')
  }).catch(() => {})
}

// =================================================================
// 5. 藍牙協議發送中心 (完美參考 grind.vue 5段對位對位機制重構 0x06 指令)
// =================================================================
const shareRecipeToDevice = (recipe: Recipe) => { //保持與 06230703相同
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

  recipePkg[7] = recipe.ratio / 2      
  recipePkg[8] = recipe.powder         
  recipePkg[9] = recipe.grind ? 1 : 0  
  recipePkg[10] = recipe.gear          
  recipePkg[11] = recipe.speed         

  const totalStages = recipe.stages ? recipe.stages.length : 1
  recipePkg[12] = totalStages

  let offset = 13
  for (let i = 0; i < 5; i++) {
    if (recipe.stages && i < totalStages) {
      const stage = recipe.stages[i]
      recipePkg[offset] = stage.water                                   
      recipePkg[offset + 1] = Number(`3.${stage.velocity}`) * 10        
      recipePkg[offset + 2] = stage.temperature                         
      recipePkg[offset + 3] = stage.type                                
      recipePkg[offset + 4] = stage.time                                
    } else {
      recipePkg[offset] = 0x00
      recipePkg[offset + 1] = 0x00
      recipePkg[offset + 2] = 0x00
      recipePkg[offset + 3] = 0x00
      recipePkg[offset + 4] = 0x00
    }
    offset += 5 
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
  showToast({ type: 'success', message: `《${recipe.name}》大師級配方已同步寫入咖啡機！` })
}

// =================================================================
// 6. 生命週期初始化
// =================================================================
onMounted(() => { //保持與 06230703相同
  loadLocalRecipes()
  console.log('首頁加載成功，大師級配方引擎已就緒...')
  const saved = localStorage.getItem('bincoo_local_recipes')
  if (saved) {
    try {
      localRecipes.value = JSON.parse(saved)
    } catch (e) {
      console.error('解析大師級配方庫失敗，重置快取', e)
    }
  }
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