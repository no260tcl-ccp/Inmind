
<template>
  <div class="page-container">
    <!-- 頂部導航欄 (對齊微信版，移除右上角清空按鈕) -->
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
                  
                  <!-- 參數摘要 (以分割線連接) -->
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

                  <!-- 快捷操作按鈕列 (編輯、分享、置頂) -->
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

              <!-- 右滑選單：僅保留刪除按鈕 -->
              <template #right>
                <div class="action-box">
                  <van-button
                    square
                    type="danger"
                    class="del-btn"
                    @click.stop="deleteRecipe(item, index)"
                  >
                    <van-icon name="delete-o" size="20" />
                  </van-button>
                </div>
              </template>
            </van-swipe-cell>
          </div>

          <!-- 暫無資料空狀態 (完全對齊微信版文案與佈局) -->
          <div class="no-data" v-else>
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
import { useBluetoothStore } from '@/store/blue'

const router = useRouter()
const route = useRoute()
const bluetoothStore = useBluetoothStore()

const isRefreshing = ref(false)
const listLoading = ref(false)
const listFinished = ref(false)
const dataList = ref<any[]>([])

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
 * 構建 URI 傳參物件
 */
const encodedParams = (item: any) => {
  const params = {
    ...item.configJson,
    id: item.id,
    isEdit: true,
    name: item.name
  }
  return encodeURIComponent(JSON.stringify(params))
}

/**
 * 讀取配方列表 (捨棄原來做法，改用index.vue 裡 getMyFormula  的 作法，結合 async/await 與 myFormula.vue 的 UI 需求)
 */
const fetchLocalRecipes = async () => {
  listLoading.value = true
  try {
    // 1. 採用 index.vue 的 fetch 方式獲取資料
    const response = await fetch('/static/data/recipes.json')
    const rawRecipes = await response.json()

    // 2. 解析 configJson，並補齊 myFormula.vue 所需的背景圖與文字顏色
    dataList.value = rawRecipes.map((item: any, idx: number) => {
      let config = item.configJson
      if (typeof config === 'string') {
        try { 
          config = JSON.parse(config) 
        } catch (e) { 
          config = {} 
        }
      }

      // 保留 myFormula.vue 的主題配色分配邏輯
      const sign = idx % formulaBgList.length
      config.bgUrl = config.bgUrl || formulaBgList[sign].url
      config.textColor = config.textColor || formulaBgList[sign].color

      return { 
        ...item, 
        configJson: config 
      }
    })
    
  } catch (error) {
    console.error('讀取配方失敗:', error)
  } finally {
    // 3. 維持 Vant List / PullRefresh 的狀態更新
    listLoading.value = false
    listFinished.value = true
    isRefreshing.value = false
  }
}

const saveToStorage = (list: any[]) => {
  localStorage.setItem('bincoo_my_recipes', JSON.stringify(list))
}

const onRefresh = () => {
  isRefreshing.value = true
  fetchLocalRecipes()
}

const loadMore = () => {
  fetchLocalRecipes()
}

/**
 * 點擊卡片直接進入詳情頁 (微信原生行為)
 */
const itemClick = (item: any) => {
  router.push(`/pages-coffeeb/formulaDetail/formulaDetail?data=${encodedParams(item)}`)
}

/**
 * 編輯配方
 */
const editRecipeDirect = (item: any) => {
  router.push(`/pages-coffeeb/formula/formula?data=${encodedParams(item)}`)
}

/**
 * 置頂配方
 */
const setTopRecipe = (index: number) => {
  if (index === 0) return
  const item = dataList.value[index]
  dataList.value.splice(index, 1)
  dataList.value.unshift(item)
  saveToStorage(dataList.value)
  showToast('置頂成功')
}

/**
 * 刪除配方
 */
const deleteRecipe = (item: any, index: number) => {
  showConfirmDialog({
    title: '確認刪除',
    message: '刪除後無法恢復，請謹慎操作',
    confirmButtonColor: '#004097'
  }).then(() => {
    dataList.value.splice(index, 1)
    saveToStorage(dataList.value)
    showToast('刪除成功')
  }).catch(() => {})
}

/**
 * 分享至設備
 */
const shareRecipeToDevice = (item: any) => {
  showToast(`已分享配方《${item.name}》`)
}

/**
 * 創建配方
 */
const addFormula = () => {
  router.push('/pages-coffeeb/formula/formula')
}

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