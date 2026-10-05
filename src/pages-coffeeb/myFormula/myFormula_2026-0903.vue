<template>
  <div class="page-container">
    <!-- 頂部導航欄 -->
    <van-nav-bar
      title="我的配方"
      left-arrow
      fixed
      placeholder
      @click-left="router.back()"
      class="custom-nav-bar"
    >
      <template #right>
        <van-button 
          v-if="dataList.length > 0"
          size="small" 
          plain 
          type="danger" 
          round 
          @click="deleteAllRecipesConfirm"
        >
          清空
        </van-button>
      </template>
    </van-nav-bar>

    <!-- 配方主內容區 -->
    <div class="formula-content">
      <van-pull-refresh v-model="isRefreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="listLoading"
          :finished="listFinished"
          finished-text="沒有更多配方了"
          @load="loadMore"
        >
          <div class="formula-list" v-if="dataList.length > 0">
            <!-- 使用 Swipe Cell 包裝，提供右滑編輯與刪除 -->
            <van-swipe-cell v-for="(item, index) in dataList" :key="item.id || index" class="mb-4">
              <!-- 配方卡片 -->
              <div 
                class="formula-item" 
                :style="getCardStyle(index)"
                @click.stop="itemClick(item)"
              >
                <!-- 左側：詳細資訊與快捷操作 -->
                <div class="formula-item-left">
                  <div class="recipe-name">{{ item.name || '未命名配方' }}</div>
                  
                  <!-- 參數摘要 -->
                  <div class="recipe-info-row">
                    <span class="param-tag powder-tag">{{ item.configJson?.legumes || 15 }}g</span>
                    <div class="divider"></div>
                    <span class="param-tag ratio-tag">
                      1:{{ item.configJson?.proportion ? (item.configJson.proportion / 2).toFixed(1) : '15' }}
                      <span class="divider-empty"></span>
                      {{ item.configJson?.proportion && item.configJson?.legumes ? ((item.configJson.proportion / 2) * item.configJson.legumes).toFixed(0) : 225 }}ml
                    </span>
                    <div class="divider"></div>
                    <span class="param-tag grind-tag">{{ getDangweiType(item.configJson?.gear) }}</span>
                  </div>

                  <!-- 快捷操作按鈕組 (置頂、編輯、分享到設備) -->
                  <div class="operate-row mt-3">
                    <!-- 置頂按鈕 -->
                    <div 
                      class="operate-btn top-btn" 
                      v-if="dataList.length > 1" 
                      @click.stop="setTopRecipe(index)"
                    >
                      <i class="iconfont icon-top mr-1"></i>
                      <span>置頂</span>
                    </div>

                    <!-- 分享同步按鈕 (藍牙寫入 0x06) -->
                    <div 
                      class="operate-btn share-btn" 
                      @click.stop="shareRecipeToDevice(item)"
                    >
                      <van-icon name="share-o" class="mr-1" />
                      <span>分享設備</span>
                    </div>

                    <!-- 快捷編輯按鈕 -->
                    <div 
                      class="operate-btn edit-btn" 
                      @click.stop="editRecipeDirect(item)"
                    >
                      <van-icon name="edit" class="mr-1" />
                      <span>編輯</span>
                    </div>
                  </div>
                </div>

                <!-- 右側：水溫與段數重疊浮水視覺 -->
                <div class="formula-item-right">
                  <div class="recipe-temp">
                    <van-icon name="clock-o" class="mr-1" />
                    <span>{{ item.configJson?.accordionItems?.[0]?.temperature || 92 }}°C</span>
                  </div>
                  
                  <!-- 原廠微信經典：段數大數字浮水印 -->
                  <div class="stage-watermark" :style="getStageWatermarkStyle(index)">
                    {{ item.configJson?.accordionItems?.length || 2 }}
                    <span class="stage-unit">段</span>
                  </div>
                </div>
              </div>

              <!-- 右滑選單 -->
              <template #right>
                <van-button square text="編輯" type="primary" class="h-full-btn" @click.stop="editRecipeDirect(item)" />
                <van-button square text="刪除" type="danger" class="h-full-btn" @click.stop="deleteRecipe(item, index)" />
              </template>
            </van-swipe-cell>
          </div>

          <!-- 暫無配方空狀態 (提供快捷創建按鈕) -->
          <div class="no-data-container" v-else>
            <van-empty description="暫無自訂配方">
              <template #image>
                <img src="https://cdn.bincoocoffee.cn/home-machine.png" class="empty-img" />
              </template>
              <div class="empty-action">
                <p class="desc-text">快去打造您的第一款專屬美味吧~</p>
                <van-button round type="primary" class="create-btn" @click="addFormula">
                  <van-icon name="plus" class="mr-1" /> 創建專屬配方
                </van-button>
              </div>
            </van-empty>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- 底部懸浮創建配方按鈕 (有資料時固定顯示) -->
    <div class="long-create-bar" v-if="dataList.length > 0">
      <van-button block round type="primary" class="bottom-action-btn" @click="addFormula">
        <van-icon name="plus" class="mr-1" /> 創建新配方
      </van-button>
    </div>

    <!-- 點擊配方卡片的操作選單 Action Sheet -->
    <van-action-sheet
      v-model:show="showActionSheet"
      :actions="actionOptions"
      cancel-text="取消"
      description="請選擇配方操作模式"
      close-on-click-action
      @select="handleActionSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
// 深度整合全域 Store 大腦
import { useMachineBStatusStore } from '@/store/coffeebStatus'
import { useBluetoothStore } from '@/store/blue'

const router = useRouter()
const route = useRoute()
const bluetoothStore = useBluetoothStore()
const machineStatusStore = useMachineBStatusStore()

const isRefreshing = ref(false)
const listLoading = ref(false)
const listFinished = ref(false)
const dataList = ref<any[]>([])
const showActionSheet = ref(false)
const selectedItem = ref<any>(null)

// 操作面板選項
const actionOptions = [
  { name: '進入沖煮詳情', subname: '直接載入參數並執行沖煮', id: 'detail' },
  { name: '修改配方參數', subname: '編輯目前配方的各項設定', id: 'edit' },
  { name: '複製另存配方', subname: '以此配方為範本創建新配方', id: 'copy' }
]

// 原廠風格的配色方案
const bgColors = ['#ffeef0', '#eef4ff', '#f0fdf4', '#fff4ec']
const textColors = ['#ff976a', '#a1b9d9', '#99CEB3', '#D9C1A1']

const getCardStyle = (index: number) => {
  const colorIndex = index % bgColors.length
  return {
    borderLeft: `5px solid ${textColors[colorIndex]}`
  }
}

const getStageWatermarkStyle = (index: number) => {
  const colorIndex = index % bgColors.length
  return {
    color: textColors[colorIndex]
  }
}

/**
 * 讀取本地端配方 (同時對齊 formula.vue 與 index.vue 的 LocalStorage 鍵值)
 */
const fetchLocalRecipes = () => {
  listLoading.value = true
  try {
    // 優先讀取 web 統一標準鍵值 'bincoo_my_recipes'
    let localStr = localStorage.getItem('bincoo_my_recipes')
    
    // 雷達安全備份機制：若為空，嘗試讀取部分 index.vue 歷史保存的 'bincoo_local_recipes' 並自動雙向同步
    if (!localStr || JSON.parse(localStr).length === 0) {
      const backupStr = localStorage.getItem('bincoo_local_recipes')
      if (backupStr && JSON.parse(backupStr).length > 0) {
        localStr = backupStr
        localStorage.setItem('bincoo_my_recipes', backupStr)
      }
    }

    // 若本地完全無資料，則載入一套經典的大師預設配方作為新手導引
    if (!localStr || JSON.parse(localStr).length === 0) {
      const defaultRecipes = [
        {
          id: 123456,
          name: '晨光序曲 (黃金經典)',
          configJson: {
            legumes: 15,
            proportion: 30,
            grind: true,
            gear: 60,
            speed: 120,
            accordionItems: [
              { paragraph: '焖蒸', water: 30, temperature: 92, time: 30, velocity: 3, type: 1 },
              { paragraph: '第 1 段', water: 195, temperature: 92, time: 120, velocity: 3, type: 1 }
            ]
          }
        },
        {
          id: 789012,
          name: '午茶時光 (輕柔萃取)',
          configJson: {
            legumes: 12,
            proportion: 32,
            grind: true,
            gear: 70,
            speed: 110,
            accordionItems: [
              { paragraph: '焖蒸', water: 25, temperature: 93, time: 25, velocity: 2, type: 1 },
              { paragraph: '第 1 段', water: 167, temperature: 91, time: 100, velocity: 3, type: 1 }
            ]
          }
        }
      ]
      saveToStorage(defaultRecipes)
      localStr = JSON.stringify(defaultRecipes)
    }

    const rawRecipes = JSON.parse(localStr)
    dataList.value = rawRecipes.map((item: any) => {
      let config = item.configJson
      if (typeof config === 'string') {
        try { config = JSON.parse(config) } catch (e) { config = {} }
      }
      return { ...item, configJson: config || {} }
    })
  } catch (error) {
    console.error('讀取配方庫失敗:', error)
  } finally {
    listLoading.value = false
    listFinished.value = true
    isRefreshing.value = false
  }
}

/**
 * 統一儲存寫入與同步 (徹底阻絕 index 與 formula 的鍵值衝突)
 */
const saveToStorage = (list: any[]) => {
  const jsonStr = JSON.stringify(list)
  localStorage.setItem('bincoo_my_recipes', jsonStr)
  localStorage.setItem('bincoo_local_recipes', jsonStr) // 雙鍵全同步防丟失
}

const onRefresh = () => {
  isRefreshing.value = true
  fetchLocalRecipes()
}

const loadMore = () => {
  fetchLocalRecipes()
}

/**
 * 研磨檔位文字解析
 */
const getDangweiType = (gear: any) => {
  const dangwei = Number(gear) || 60
  if (dangwei > 82) return '法压冷萃'
  if (dangwei > 47 && dangwei <= 82) return '手冲咖啡'
  if (dangwei > 23 && dangwei <= 47) return '爱乐压'
  return '意式浓缩'
}

/**
 * 點擊單一配方，彈出操作面版
 */
const itemClick = (item: any) => {
  if (!item) return
  selectedItem.value = item
  showActionSheet.value = true
}

/**
 * 操作面板選項分流 (與 formulaDetail, formula 高度聯動)
 */
const handleActionSelect = (action: any) => {
  if (!selectedItem.value) return
  const item = selectedItem.value

  if (action.id === 'detail') {
    // 進入沖煮詳情 (寫入 transit_data 讓詳情頁自動讀取渲染)
    const params = { 
      configJson: item.configJson, 
      id: item.id, 
      isEdit: false, 
      name: item.name 
    }
    localStorage.setItem('bincoo_transit_data', JSON.stringify(params))
    router.push('/pages-coffeeb/formulaDetail/formulaDetail')
  } 
  else if (action.id === 'edit') {
    // 編輯模式
    const payload = { ...item, isEdit: true }
    router.push({
      path: '/pages-coffeeb/formula/formula',
      query: { data: encodeURIComponent(JSON.stringify(payload)) }
    })
  } 
  else if (action.id === 'copy') {
    // 複製範本新建模式 (isEdit = false)
    const payload = { ...item, isEdit: false, id: null } // 消除 id 視為另存新檔
    router.push({
      path: '/pages-coffeeb/formula/formula',
      query: { data: encodeURIComponent(JSON.stringify(payload)) }
    })
  }
}

/**
 * 快捷編輯跳轉
 */
const editRecipeDirect = (item: any) => {
  const payload = { ...item, isEdit: true }
  router.push({
    path: '/pages-coffeeb/formula/formula',
    query: { data: encodeURIComponent(JSON.stringify(payload)) }
  })
}

/**
 * 藍牙 0x06 配方同步寫入核心 (精準對齊 index_vue.pdf 多段通訊協議)
 */
const shareRecipeToDevice = (item: any) => {
  if (!bluetoothStore.connectedDevice) {
    showToast('設備未連線，請先連線您的咖啡機')
    return
  }

  showToast({ type: 'loading', message: '傳送配方中...', forbidClick: true })

  try {
    const config = item.configJson || {}
    const legumes = config.legumes || 15
    const proportion = config.proportion || 30
    const grind = config.grind ?? true
    const gear = config.gear || 60
    const speed = config.speed || 120
    const accordionItems = config.accordionItems || []

    // 建立 60 字节的標準藍牙緩衝二進位陣列
    const recipePkg = new Uint8Array(60)
    recipePkg[0] = 0x5A  // 起始符 STX
    recipePkg[1] = 0x06  // 命令碼 (CMD: 0x06 配方數據)
    recipePkg[2] = 55    // 參數長度

    // Data 0~3: 產生唯一配方 ID 位元
    const numId = typeof item.id === 'number' ? item.id : Date.now() % 100000
    recipePkg[3] = (numId >> 24) & 0xFF
    recipePkg[4] = (numId >> 16) & 0xFF
    recipePkg[5] = (numId >> 8) & 0xFF
    recipePkg[6] = numId & 0xFF

    // Data 4~8: 基礎參數封包
    recipePkg[7] = proportion / 2      // 協議規範：粉水比需除以 2 傳輸
    recipePkg[8] = legumes             // 豆粉量 (g)
    recipePkg[9] = grind ? 1 : 0       // 研磨開關
    recipePkg[10] = gear               // 研磨檔位
    recipePkg[11] = speed              // 研磨轉速

    // Data 9: 段落數量
    const totalStages = accordionItems.length
    recipePkg[12] = totalStages

    // Data 10~34: 動態 5 段注水封包對位
    let offset = 13
    for (let i = 0; i < 5; i++) {
      if (i < totalStages) {
        const stage = accordionItems[i]
        recipePkg[offset] = stage.water                                   // 水量 (ml)
        recipePkg[offset + 1] = Number(`3.${stage.velocity}`) * 10        // 流速對位
        recipePkg[offset + 2] = stage.temperature                         // 獨立溫度
        recipePkg[offset + 3] = stage.type                                // 注水方式
        recipePkg[offset + 4] = stage.time                                // 停駐秒數 / 悶蒸秒數
      } else {
        // 剩餘空白協議空間，補上零，阻絕亂碼
        recipePkg[offset] = 0x00
        recipePkg[offset + 1] = 0x00
        recipePkg[offset + 2] = 0x00
        recipePkg[offset + 3] = 0x00
        recipePkg[offset + 4] = 0x00
      }
      offset += 5
    }

    // Data 35~54: 配方名稱轉二進位 (標準 TextEncoder)
    const encoder = new TextEncoder()
    const nameBuffer = encoder.encode(item.name || '未命名')
    for (let i = 0; i < 20; i++) {
      recipePkg[38 + i] = i < nameBuffer.length ? nameBuffer[i] : 0x00
    }

    // 計算 Checksum 異或校驗碼 (從 CMD 異或到名稱尾端)
    let crc = recipePkg[1] ^ recipePkg[2]
    for (let i = 3; i < 58; i++) {
      crc ^= recipePkg[i]
    }
    recipePkg[58] = crc
    recipePkg[59] = 0xAA // 結束符 ETX

    // 呼叫藍牙適配器發射
    bluetoothStore.sendData(recipePkg)
    showToast({ type: 'success', message: `《${item.name}》大師級配方已同步寫入咖啡機！` })
  } catch (error) {
    console.error('寫入咖啡機失敗:', error)
    showToast({ type: 'fail', message: '配方同步寫入失敗，請檢查藍牙連線' })
  }
}

/**
 * 本地配方置頂 (Set Top) - 經典原廠便捷邏輯
 */
const setTopRecipe = (index: number) => {
  if (index === 0) return
  const item = dataList.value[index]
  
  // 陣列操作：拔出並推至首位
  dataList.value.splice(index, 1)
  dataList.value.unshift(item)
  
  saveToStorage(dataList.value)
  showToast({ type: 'success', message: `「${item.name}」已成功置頂` })
}

/**
 * 刪除配方 (帶有確認彈窗)
 */
const deleteRecipe = (item: any, index: number) => {
  showConfirmDialog({
    title: '確認刪除',
    message: `確定要將配方「${item.name}」從私藏中移除嗎？`,
    confirmButtonColor: '#004097'
  }).then(() => {
    dataList.value.splice(index, 1)
    saveToStorage(dataList.value)
    showToast({ type: 'success', message: '刪除成功' })
  }).catch(() => {})
}

/**
 * 清空所有配方 (高階清空防呆)
 */
const deleteAllRecipesConfirm = () => {
  showConfirmDialog({
    title: '警告',
    message: '確定要清空所有的自訂私藏配方嗎？此操作將無法復原。',
    confirmButtonColor: '#ee0a24'
  }).then(() => {
    dataList.value = []
    saveToStorage([])
    showToast({ type: 'success', message: '已成功清空配方庫' })
  }).catch(() => {})
}

/**
 * 跳轉創建新配方
 */
const addFormula = () => {
  router.push('/pages-coffeeb/formula/formula')
}

// 監聽路由路徑，當從 formula.vue 返回此頁時自動重新拉取最新資料庫
watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/pages-coffeeb/myFormula/myFormula') {
      fetchLocalRecipes()
    }
  }
)

onMounted(() => {
  fetchLocalRecipes()
})
</script>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background-color: #f7f8fa;
  display: flex;
  flex-direction: column;
}

.custom-nav-bar {
  :deep(.van-nav-bar__title) {
    font-weight: bold;
    color: #333333;
  }
  :deep(.van-icon) {
    color: #004097;
    font-weight: bold;
  }
}

.formula-content {
  flex: 1;
  padding: 12px 0 80px 0; // 留出底部按鈕的高度防遮擋
}

.formula-list {
  padding: 0 16px;
}

.formula-item {
  background: #ffffff;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: transform 0.15s, background-color 0.15s;

  &:active {
    background-color: #f2f3f5;
    transform: scale(0.99);
  }
}

.formula-item-left {
  flex: 1;
  z-index: 2; // 確保文字在右側大數字浮水印上方
}

.recipe-name {
  font-size: 16px;
  font-weight: bold;
  color: #222222;
  margin-bottom: 6px;
}

.recipe-info-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 4px;
}

.param-tag {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.powder-tag {
  background-color: #ffeef0;
  color: #ee0a24;
}

.ratio-tag {
  background-color: #eef4ff;
  color: #004097;
}

.grind-tag {
  background-color: #f0fdf4;
  color: #07c160;
}

.divider {
  width: 1px;
  height: 10px;
  background-color: #e6e6e6;
  margin: 0 6px;
}

.divider-empty {
  display: inline-block;
  width: 4px;
}

.operate-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.operate-btn {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 20px;
  cursor: pointer;
  transition: opacity 0.15s;

  &:active {
    opacity: 0.7;
  }
}

.top-btn {
  background-color: #f1f1f1;
  color: #666666;
}

.share-btn {
  background-color: #e5ebf4;
  color: #004097;
  font-weight: 500;
}

.edit-btn {
  background-color: #fbf0e6;
  color: #ff976a;
}

.formula-item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  height: 52px;
  min-width: 70px;
  position: relative;
}

.recipe-temp {
  font-size: 12px;
  color: #666666;
  font-weight: 600;
  display: flex;
  align-items: center;
  z-index: 2;
}

/* 微信經典大數字水印 */
.stage-watermark {
  position: absolute;
  right: -5px;
  bottom: -15px;
  font-family: 'Roboto', 'Arial Black', sans-serif;
  font-size: 56px;
  font-weight: 900;
  opacity: 0.12;
  letter-spacing: -0.05em;
  line-height: 1;
  pointer-events: none;
  z-index: 1;
}

.stage-unit {
  font-size: 14px;
  font-weight: normal;
  margin-left: -2px;
}

.h-full-btn {
  height: 100%;
  border: none;
}

/* 暫無資料空狀態 */
.no-data-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;

  .empty-img {
    width: 140px;
    height: auto;
    opacity: 0.8;
  }

  .desc-text {
    font-size: 13px;
    color: #999999;
    margin: 8px 0 16px 0;
  }

  .create-btn {
    width: 180px;
    background-color: #004097;
    border-color: #004097;
    font-weight: bold;
  }
}

/* 底部懸浮按鈕 */
.long-create-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px 24px 20px 24px;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(5px);
  z-index: 10;

  .bottom-action-btn {
    background-color: #004097;
    border-color: #004097;
    font-weight: bold;
    height: 46px;
    font-size: 15px;
  }
}
</style>
