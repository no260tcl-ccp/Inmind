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
    />

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
            <van-swipe-cell
              v-for="(item, index) in dataList"
              :key="item.id || index"
            >
              <!-- 配方卡片：點擊直接進入詳情頁 -->
              <div
                class="formula-item"
                :class="{ 'last-formula-item': index === dataList.length - 1 }"
                @click.stop="itemClick(item)"
              >
                <!-- 左側資訊與操作列 -->
                <div class="formula-item-left">
                  <div class="recipe-name">{{ item.name || '未命名配方' }}</div>
                  
                  <!-- 參數摘要 -->
                  <div class="recipe-info-row">
                    <span>{{ item.configJson?.legumes ? `${item.configJson.legumes}g` : '-' }}</span>
                    <span class="divider"></span>
                    <span>
                      {{
                        item.configJson?.proportion
                          ? `1:${(item.configJson.proportion / 2).toFixed(1)}`
                          : '-'
                      }}
                      <span class="divider-empty"></span>
                      {{
                        item.configJson?.proportion && item.configJson?.legumes
                          ? `${((item.configJson.proportion / 2) * item.configJson.legumes).toFixed(0)}ml`
                          : '-'
                      }}
                    </span>
                    <span class="divider"></span>
                    <span>
                      {{
                        item.configJson?.gear
                          ? `${item.configJson.gear}(${dangweiType(item.configJson.gear)})`
                          : '-'
                      }}
                    </span>
                  </div>

                  <!-- 快捷操作按鈕列 -->
                  <div class="operate-row mt-3.5">
                    <div class="operate-eidt" @click.stop="editRecipeDirect(item)">
                      <van-icon name="edit" size="14" />
                    </div>
                    <div class="operate-setting" @click.stop="shareRecipeToDevice(item)">
                      <van-image width="10" height="10" src="https://cdn.bincoocoffee.cn/share.png" class="mr-1" />
                      <span>分享</span>
                    </div>
                    <div
                      class="operate-eidt"
                      v-if="dataList.length > 1"
                      @click.stop="setTopRecipe(index)"
                    >
                      <van-icon name="top" size="14" />
                    </div>
                  </div>
                </div>

                <!-- 右側卡片背景圖與動態大數字水印 -->
                <div class="formula-item-right">
                  <van-image
                    width="78"
                    height="78"
                    fit="contain"
                    :src="item.configJson?.bgUrl"
                  />
                  <div class="img-num" :style="{ color: item.configJson?.textColor }">
                    {{ item.configJson?.accordionItems ? item.configJson.accordionItems.length : '' }}
                  </div>
                </div>
              </div>

              <!-- 右滑選單：刪除 -->
              <template #right>
                <div class="action-box">
                  <van-button
                    square
                    type="danger"
                    class="del-btn"
                    @click.stop="deleteRecipe(item)"
                  >
                    <van-icon name="delete-o" size="20" />
                  </van-button>
                </div>
              </template>
            </van-swipe-cell>
          </div>

          <!-- 暫無資料空狀態 -->
          <div class="no-data" v-else-if="!listLoading && dataList.length === 0">
            <van-image width="124" height="100" src="https://cdn.bincoocoffee.cn/no-data.png" />
            <p class="desc-color">暫無配方</p>
            <p class="title-color">快去打造您的專屬美味吧~</p>
            <div class="create" @click="addFormula">
              <van-icon name="plus" size="12" class="mr-1" />
              創建配方
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- 底部懸浮創建按鈕 -->
    <div class="long-create" v-if="dataList.length > 0" @click="addFormula">
      <div class="btn">
        <van-icon name="plus" size="12" class="mr-1" />
        創建配方
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const route = useRoute()

const isRefreshing = ref(false)
const listLoading = ref(false)
const listFinished = ref(false)
const dataList = ref<any[]>([])

// 純前端版：定義統一的儲存 Key
const STORAGE_KEY = 'bincoo_my_recipes'
const TRANSIT_KEY = 'bincoo_transit_data'

const cdnBaseUrl = 'https://cdn.bincoocoffee.cn'
const formulaBgList = [
  { url: `${cdnBaseUrl}/a4fe367f3bf4c0ab36b4b932689d57bb3456610c1daa287e66aa44268a528373.png`, color: '#F5ABBD' },
  { url: `${cdnBaseUrl}/753a976ec38d2c7c62784cfb711880923b4b2bd9a926c8a92f7ef539e946db3b.png`, color: '#A1B9D9' },
  { url: `${cdnBaseUrl}/7af32880c9244e35fa97b89de490fbd2beb6c6221ae1f58e07c2ed79ed1a71b1.png`, color: '#99CEB3' },
  { url: `${cdnBaseUrl}/ce2564f7e0e213f415624a2a8001d4d3a8b9a85743e23b7db308b73a37a8e16f.png`, color: '#D9C1A1' }
]

/**
 * 檔位對應研磨類型解析
 */
const dangweiType = (gear: any) => {
  const dangwei = Number(gear) || 60
  if (dangwei > 82) return '法压冷萃'
  if (dangwei > 47 && dangwei <= 82) return '手冲咖啡'
  if (dangwei > 23 && dangwei <= 47) return '爱乐压'
  return '意式浓缩'
}

/**
 * 查詢清單 (讀取 LocalStorage)
 */
const queryList = () => {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY)
    let recipes = rawData ? JSON.parse(rawData) : []

    // 處理防錯與隨機背景圖
    recipes.forEach((el: any) => {
      if (typeof el.configJson === 'string') {
        try {
          el.configJson = JSON.parse(el.configJson)
        } catch (e) {
          el.configJson = {}
        }
      }
      if (!el.configJson) el.configJson = {}
      
      // 若建立時未附圖，隨機賦予背景圖與字體顏色
      if (!el.configJson.bgUrl) {
        const sign = Math.floor(Math.random() * formulaBgList.length)
        el.configJson.bgUrl = formulaBgList[sign].url
        el.configJson.textColor = formulaBgList[sign].color
      }
    })

    dataList.value = recipes
  } catch (error) {
    console.error('讀取本機配方失敗:', error)
    dataList.value = []
  } finally {
    // 本機讀取無分頁延遲，一次載入即完成
    listFinished.value = true
    listLoading.value = false
    isRefreshing.value = false
  }
}

/**
 * 下拉刷新
 */
const onRefresh = () => {
  isRefreshing.value = true
  queryList()
}

/**
 * 滾動到底部觸發 (因已改為一次性載入，這裡僅設定狀態結束)
 */
const loadMore = () => {
  listLoading.value = false
  listFinished.value = true
}

/**
 * 點擊卡片進入詳情頁 (透過快遞櫃 Key 傳參，避免 URL 過長)
 */
const itemClick = (item: any) => {
  const params = { ...item, isEdit: true }
  localStorage.setItem(TRANSIT_KEY, JSON.stringify(params))
  router.push('/pages-coffeeb/formulaDetail/formulaDetail')
}

/**
 * 編輯配方 (透過快遞櫃 Key 傳參，避免 URL 過長)
 */
const editRecipeDirect = (item: any) => {
  const params = { ...item, isEdit: true }
  localStorage.setItem(TRANSIT_KEY, JSON.stringify(params))
  router.push('/pages-coffeeb/formula/formula')
}

/**
 * 置頂配方 (陣列重排並保存至 LocalStorage)
 */
const setTopRecipe = (index: number) => {
  if (index === 0) return 
  
  const rawData = localStorage.getItem(STORAGE_KEY)
  if (!rawData) return

  try {
    let recipes = JSON.parse(rawData)
    const target = recipes[index]
    
    // 切換置頂，將目標項目抽離並重新擺放至最前
    recipes.splice(index, 1)
    recipes.unshift(target)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes))
    showToast('置頂成功')
    queryList() 
  } catch (error) {
    showToast('置頂失敗')
    console.error('置頂錯誤:', error)
  }
}

/**
 * 刪除配方 (陣列過濾並保存至 LocalStorage)
 */
const deleteRecipe = (item: any) => {
  showConfirmDialog({
    title: '確認刪除',
    message: '刪除後無法恢復，請謹慎操作',
    confirmButtonColor: '#004097'
  }).then(() => {
    try {
      const rawData = localStorage.getItem(STORAGE_KEY)
      if (rawData) {
        let recipes = JSON.parse(rawData)
        recipes = recipes.filter((r: any) => r.id !== item.id)
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes))
        showToast('刪除成功')
        queryList()
      }
    } catch (error) {
      showToast('刪除失敗')
      console.error('刪除錯誤:', error)
    }
  }).catch(() => {})
}

/**
 * 分享至設備
 */
const shareRecipeToDevice = (item: any) => {
  showToast(`準備分享配方《${item.name}》`)
}

/**
 * 創建配方
 */
const addFormula = () => {
  localStorage.removeItem(TRANSIT_KEY) // 確保是全新創建狀態
  router.push('/pages-coffeeb/formula/formula')
}

// 監聽路由，返回時刷新列表抓取最新 LocalStorage
watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/pages-coffeeb/myFormula/myFormula') {
      onRefresh()
    }
  }
)

onMounted(() => {
  queryList()
})
</script>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background-color: #ffffff;
}

.custom-nav-bar {
  :deep(.van-nav-bar__title) {
    font-weight: bold;
    color: #222222;
  }
  :deep(.van-icon) {
    color: #222222;
  }
}

.formula-content {
  height: 100vh;
  padding-bottom: 120px;
  background-color: #ffffff;

  .formula-list {
    padding: 18px 18px 0 18px;

    .formula-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 16px;
      margin-bottom: 16px;
      font-size: 14px;
      color: #222222;
      border-bottom: 1px solid #f5f5f5;
      cursor: pointer;

      .formula-item-left {
        flex: 1;

        .recipe-name {
          font-size: 15px;
          font-weight: bold;
          color: #222222;
        }

        .recipe-info-row {
          display: flex;
          align-items: center;
          font-size: 12px;
          color: #666666;
          margin-top: 8px;
        }

        .operate-row {
          display: flex;
          align-items: center;
        }

        .operate-eidt {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 28px;
          margin-right: 8px;
          color: #666666;
          background: #f1f1f1;
          border-radius: 14px;
        }

        .operate-setting {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 62px;
          height: 28px;
          font-size: 12px;
          color: #004097;
          background: #e5ebf4;
          border-radius: 14px;
          margin-right: 8px;
        }
      }

      .formula-item-right {
        position: relative;
        display: flex;

        .img-num {
          position: absolute;
          right: 4px;
          bottom: -12px;
          font-family: 'Roboto', sans-serif;
          font-size: 60px;
          font-weight: 600;
          letter-spacing: -0.04em;
          pointer-events: none;
        }
      }
    }

    .last-formula-item {
      padding-bottom: 0;
      border-bottom: none;
    }
  }

  .divider {
    display: inline-block;
    width: 1px;
    height: 10px;
    background-color: #e6e6e6;
    margin: 0 8px;
  }

  .divider-empty {
    display: inline-block;
    width: 10px;
  }

  .action-box {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    margin-left: 10px;

    .del-btn {
      height: 100%;
      border: none;
      background-color: #ee0a24;
    }
  }
}

.no-data {
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  font-size: 16px;

  .desc-color {
    color: #222222;
    margin-top: 22px;
  }

  .title-color {
    color: #666666;
    margin-top: 8px;
    font-size: 14px;
  }

  .create {
    width: 165px;
    height: 44px;
    line-height: 44px;
    background: #004097;
    border-radius: 22px;
    color: #ffffff;
    margin-top: 16px;
    text-align: center;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.long-create {
  width: 100%;
  position: fixed;
  left: 0;
  bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;

  .btn {
    width: 343px;
    height: 44px;
    line-height: 44px;
    background: #004097;
    border-radius: 22px;
    color: #ffffff;
    text-align: center;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.mr-1 { margin-right: 4px; }
.mt-2 { margin-top: 8px; }
.mt-3\.5 { margin-top: 14px; }
</style>