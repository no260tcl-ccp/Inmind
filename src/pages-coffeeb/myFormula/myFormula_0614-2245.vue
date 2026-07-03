<template>
  <div class="page-container">
    <van-nav-bar
      title="我的配方"
      left-arrow
      fixed
      placeholder
      @click-left="router.back()"
    />

    <div class="formula-content">
      <van-pull-refresh v-model="isRefreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="listLoading"
          :finished="listFinished"
          finished-text="没有更多配方了"
          @load="loadMore"
        >
          <div class="formula-list" v-if="dataList.length > 0">
            <van-swipe-cell v-for="(item, index) in dataList" :key="item.id || index" class="mb-4">
              
              <div class="formula-item" @click.stop="itemClick(item, index)">
                <div class="formula-item-left">
                  <div class="recipe-name">{{ item.name || '未命名配方' }}</div>
                  
                  <div class="recipe-info-row">
                    <div>{{ item.configJson?.legumes ? `${item.configJson.legumes}g` : '15g' }}</div>
                    <div class="divider"></div>
                    <div>
                      1:{{ item.configJson?.proportion ? (item.configJson.proportion / 2).toFixed(1) : '15' }}
                      <span class="divider-empty"></span>
                      {{ item.configJson?.proportion && item.configJson?.legumes ? ((item.configJson.proportion / 2) * item.configJson.legumes).toFixed(0) + 'ml' : '225ml' }}
                    </div>
                    <div class="divider"></div>
                    <div>{{ getDangweiType(item.configJson?.gear) }}</div>
                  </div>
                </div>
                
                <div class="formula-item-right">
                  <div class="recipe-temp">
                    {{ item.configJson?.accordionItems?.[0]?.temperature || 92 }}°C
                  </div>
                  <div class="stage-badge">
                    {{ item.configJson?.accordionItems?.length || 2 }}
                    <span class="stage-unit">段</span>
                  </div>
                </div>
              </div>

              <template #right>
                <van-button square text="编辑" type="primary" class="h-full" @click.stop="editRecipe(item)" />
                <van-button square text="删除" type="danger" class="h-full" @click.stop="deleteRecipe(item, index)" />
              </template>
            </van-swipe-cell>
          </div>

          <van-empty v-else description="暂无配方，請重新整理頁面" />
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'

import { useMachineBStatusStore } from '@/store/coffeebStatus'
import { useBluetoothStore } from '@/store/blue'

const router = useRouter()
const machineStatusStore = useMachineBStatusStore()
const bluetoothStore = useBluetoothStore()

const isRefreshing = ref(false)
const listLoading = ref(false)
const listFinished = ref(false)
const dataList = ref<any[]>([])

const runStatus = computed(() => machineStatusStore.runStatus)

/**
 * 🌟 智慧自動注入：如果發現本地沒資料，開機時直接把「晨光序曲」塞進資料庫
 */
const fetchLocalRecipes = () => {
  listLoading.value = true
  try {
    let localStr = localStorage.getItem('bincoo_my_recipes')
    
    // 🚀 核心保險：如果 LocalStorage 裡面沒東西，直接初始化注入模擬配方
    if (!localStr || JSON.parse(localStr).length === 0) {
      const defaultRecipes = [
        {
          id: 123456,
          name: '晨光序曲 (本地快取)',
          configJson: {
            legumes: 15,
            proportion: 30, // 1:15
            grind: true,
            gear: 60,
            speed: 120,
            accordionItems: [
              { paragraph: '焖蒸', water: 30, temperature: 92, time: 30, velocity: 3, type: 0 },
              { paragraph: '第1段', water: 195, temperature: 92, time: 120, velocity: 3, type: 0 }
            ]
          }
        }
      ]
      localStorage.setItem('bincoo_my_recipes', JSON.stringify(defaultRecipes))
      localStr = JSON.stringify(defaultRecipes)
    }

    const rawRecipes = JSON.parse(localStr)
    dataList.value = rawRecipes.map((item: any) => {
      let config = item.configJson
      if (typeof config === 'string') {
        config = JSON.parse(config)
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

const onRefresh = () => {
  isRefreshing.value = true
  fetchLocalRecipes()
}

const loadMore = () => {
  fetchLocalRecipes()
}

const getDangweiType = (gear: any) => {
  const dangwei = Number(gear) || 60
  if (dangwei > 82) return '法压冷萃'
  if (dangwei > 47 && dangwei <= 82) return '手冲咖啡'
  if (dangwei > 23 && dangwei <= 47) return '爱乐压'
  return '意式浓缩'
}

//const itemClick = (item: any, index: number) => {
//  const params = { configJson: item.configJson, id: item.id, isEdit: false, name: item.name }
//  router.push({
//    path: '/pages-coffeeb/formulaDetail/formulaDetail',
//    query: { data: encodeURIComponent(JSON.stringify(params)) }
//  }).catch(err => {
//    // 加上這行，如果跳轉失敗就會直接彈窗警告您！
//    alert('跳轉失敗，請檢查路徑：' + err.message);
//  })
//}

/**
 * 點擊整條卡片安全進入配方詳情頁
 */
// 🌟 同步更新詳情頁解析邏輯：接軌標準解碼
const initRecipeData = () => {
  const queryData = route.query.data as string
  if (!queryData) return

  try {
    // 1. ✨ 現代標準解法：Vue Router 4 自動還原網址編碼，這裡直接將乾淨的 JSON 字串轉回物件
    let rawJson = queryData
    
    // 2. 🛡️ 舊格式防禦：如果發現還是帶有 % 的雙重編碼殘留，手動幫它多解碼一次
    if (rawJson.includes('%')) {
      rawJson = decodeURIComponent(rawJson)
    }
    
    const params = JSON.parse(rawJson)

    isShare.value = params.isShare || false
    nickName.value = params.nickName || 'Bincoo 玩家'
    avatar.value = params.avatar || `https://api.dicebear.com/9.x/thumbs/svg?seed=${params.id || 'bincoo'}`
    name.value = params.name || '未命名配方'
    tips.value = params.tips || ''
    recipeId.value = params.id || Date.now()

    let config = params.configJson
    if (typeof config === 'string') {
      config = JSON.parse(config)
    }
    
    configJson.value = { ...configJson.value, ...(config || {}) }
    
    if (!configJson.value.accordionItems || !Array.isArray(configJson.value.accordionItems)) {
      configJson.value.accordionItems = []
    }
    accordionItems.value = configJson.value.accordionItems

    console.log('🚀 詳情頁數據同步解析掛載成功！', params)
  } catch (error) {
    console.error('🚨 詳情頁解析發生嚴重錯誤:', error)
  }
}

const editRecipe = (item: any) => {
  const params = { configJson: item.configJson, id: item.id, isEdit: true, name: item.name }
  router.push({
    path: '/pages-coffeeb/formula/formula',
    query: { data: encodeURIComponent(JSON.stringify(params)) }
  })
}

const deleteRecipe = (item: any, index: number) => {
  showConfirmDialog({
    title: '提示',
    message: `確定要刪除配方「${item.name}」嗎？`,
    confirmButtonColor: '#004097'
  }).then(() => {
    dataList.value.splice(index, 1)
    localStorage.setItem('bincoo_my_recipes', JSON.stringify(dataList.value))
    showToast({ type: 'success', message: '刪除成功' })
  }).catch(() => {})
}

onMounted(() => {
  fetchLocalRecipes()
})
</script>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background-color: #f7f8fa;
}
.formula-content {
  padding: 12px 0;
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  cursor: pointer;
}
.formula-item:active {
  background-color: #f2f3f5;
}
.formula-item-left {
  flex: 1;
}
.recipe-name {
  font-size: 16px;
  font-weight: bold;
  color: #323233;
}
.recipe-info-row {
  display: flex;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
  color: #969799;
}
.divider {
  width: 1px;
  height: 10px;
  background-color: #e6e6e6;
  margin: 0 8px;
}
.divider-empty {
  display: inline-block;
  width: 6px;
}
.formula-item-right {
  display: flex;
  align-items: center;
}
.recipe-temp {
  font-size: 14px;
  color: #323233;
  margin-right: 16px;
  font-weight: 500;
}
.stage-badge {
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: #ffeef0;
  color: #ff976a;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
}
.stage-unit {
  font-size: 10px;
  font-weight: normal;
  margin-left: 1px;
  margin-top: 4px;
}
.h-full {
  height: 100%;
}
</style>