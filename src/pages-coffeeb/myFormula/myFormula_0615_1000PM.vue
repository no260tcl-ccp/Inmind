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
              
              <div class="formula-item" @click.stop="itemClick(item)">
                <div class="formula-item-left">
                  <div class="recipe-name">{{ item.name || '未命名配方' }}</div>
                  
                  <div class="recipe-info-row">
                    <div>{{ item.configJson?.legumes || 15 }}g</div>
                    <div class="divider"></div>
                    <div>
                      1:{{ item.configJson?.proportion ? (item.configJson.proportion / 2).toFixed(1) : '15' }}
                      <span class="divider-empty"></span>
                      {{ item.configJson?.proportion && item.configJson?.legumes ? ((item.configJson.proportion / 2) * item.configJson.legumes).toFixed(0) : 225 }}ml
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
                <van-button square text="编辑" type="primary" class="h-full" @click.stop="editRecipeDirect(item)" />
                <van-button square text="删除" type="danger" class="h-full" @click.stop="deleteRecipe(item, index)" />
              </template>
            </van-swipe-cell>
          </div>

          <van-empty v-else description="暂无配方，請重新整理頁面" />
        </van-list>
      </van-pull-refresh>
    </div>

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

// --- 🌟 智慧面板動態變數 ---
const showActionSheet = ref(false)
const selectedItem = ref<any>(null)

// 宣告三個核心操作軌道
const actionOptions = [
  { name: '☕ 進入沖煮詳情', subname: '直接查看參數並傳送沖煮', id: 'detail' },
  { name: '📝 修改模式 (覆蓋目前配方)', subname: '編輯參數並取代當前檔案', id: 'edit' },
  { name: '✨ 新增模式 (複製為新配方)', subname: '以此配方為範本另存新檔', id: 'copy' }
]

const runStatus = computed(() => machineStatusStore.runStatus)

// 讀取與自動注入本地資料庫
const fetchLocalRecipes = () => {
  listLoading.value = true
  try {
    let localStr = localStorage.getItem('bincoo_my_recipes')
    if (!localStr || JSON.parse(localStr).length === 0) {
      const defaultRecipes = [{
        id: 123456, name: '晨光序曲 (本地快取)', configJson: {
          legumes: 15, proportion: 30, grind: true, gear: 60, speed: 120,
          accordionItems: [
            { paragraph: '焖蒸', water: 30, temperature: 92, time: 30, velocity: 3, type: 0 },
            { paragraph: '第1段', water: 195, temperature: 92, time: 120, velocity: 3, type: 0 }
          ]
        }
      }]
      localStorage.setItem('bincoo_my_recipes', JSON.stringify(defaultRecipes))
      localStr = JSON.stringify(defaultRecipes)
    }

    const rawRecipes = JSON.parse(localStr)
    dataList.value = rawRecipes.map((item: any) => {
      let config = item.configJson
      if (typeof config === 'string') {
        try { config = JSON.parse(config) } catch(e) { config = {} }
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

const onRefresh = () => { isRefreshing.value = true; fetchLocalRecipes() }
const loadMore = () => { fetchLocalRecipes() }
const getDangweiType = (gear: any) => {
  const dangwei = Number(gear) || 60
  if (dangwei > 82) return '法压冷萃'
  if (dangwei > 47 && dangwei <= 82) return '手冲咖啡'
  if (dangwei > 23 && dangwei <= 47) return '爱乐压'
  return '意式浓缩'
}

/**
 * 1. 點擊整條卡片：不盲目跳轉，先將資料鎖定，並攤開選擇面板
 */
const itemClick = (item: any) => {
  if (!item) return
  selectedItem.value = item
  showActionSheet.value = true // 喚起面板
}

/**
 * 2. 🌟 核心控制中樞：根據玩家選擇的按鈕，分流到不同跳轉模式
 */
const handleActionSelect = (action: any) => {
  if (!selectedItem.value) return
  const item = selectedItem.value

  // 軌道 A：前往沖煮詳情頁面
  if (action.id === 'detail') {
    const params = { configJson: item.configJson, id: item.id, isEdit: false, name: item.name }
    localStorage.setItem('bincoo_transit_data', JSON.stringify(params))
    router.push('/pages-coffeeb/formulaDetail/formulaDetail')
  } 
  
  // 軌道 B：修改模式 (isEdit: true -> 保留原 ID，保存時覆蓋舊資料)
  else if (action.id === 'edit') {
    const params = { configJson: item.configJson, id: item.id, isEdit: true, name: item.name }
    router.push({
      path: '/pages-coffeeb/formula/formula',
      query: { data: encodeURIComponent(JSON.stringify(params)) }
    })
  } 
  
  // 軌道 C：新增模式 (isEdit: false -> 繼承引數，保存時另存新檔，產生全新ID)
  else if (action.id === 'copy') {
    const params = { configJson: item.configJson, id: item.id, isEdit: false, name: item.name + ' (副本)' }
    router.push({
      path: '/pages-coffeeb/formula/formula',
      query: { data: encodeURIComponent(JSON.stringify(params)) }
    })
  }
}

// 側滑欄的直接編輯按鈕（預設走修改模式）
const editRecipeDirect = (item: any) => {
  const params = { configJson: item.configJson, id: item.id, isEdit: true, name: item.name }
  router.push({
    path: '/pages-coffeeb/formula/formula',
    query: { data: encodeURIComponent(JSON.stringify(params)) }
  })
}

const deleteRecipe = (item: any, index: number) => {
  showConfirmDialog({
    title: '提示', message: `確定要刪除配方「${item.name}」嗎？`, confirmButtonColor: '#004097'
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
.page-container { min-height: 100vh; background-color: #f7f8fa; }
.formula-content { padding: 12px 0; }
.formula-list { padding: 0 16px; }
.formula-item { background: #ffffff; padding: 16px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02); cursor: pointer; }
.formula-item:active { background-color: #f2f3f5; }
.formula-item-left { flex: 1; }
.recipe-name { font-size: 16px; font-weight: bold; color: #323233; }
.recipe-info-row { display: flex; align-items: center; margin-top: 8px; font-size: 12px; color: #969799; }
.divider { width: 1px; height: 10px; background-color: #e6e6e6; margin: 0 8px; }
.divider-empty { display: inline-block; width: 6px; }
.formula-item-right { display: flex; align-items: center; }
.recipe-temp { font-size: 14px; color: #323233; margin-right: 16px; font-weight: 500; }
.stage-badge { width: 36px; height: 36px; border-radius: 18px; background-color: #ffeef0; color: #ff976a; font-size: 16px; display: flex; justify-content: center; align-items: center; font-weight: bold; }
.stage-unit { font-size: 10px; font-weight: normal; margin-left: 1px; margin-top: 4px; }
.h-full { height: 100%; }
</style>