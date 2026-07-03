<template>
  <div class="page-container" @click="closeOutside">
    <van-nav-bar
      title="配方详情"
      left-arrow
      fixed
      placeholder
      @click-left="router.back()"
    />

    <div class="share-content title-color" v-if="isShare && nickName">
      <span class="mr-1">来自</span>
      <van-image width="22" height="22" round :src="avatar" />
      <span class="ml-1">{{ nickName }}</span>
    </div>

    <div
      class="base-card flex items-center justify-between ml-4 mr-5"
      :style="{
        backgroundImage: `url(${cdnBaseUrl}/97b213a04c4d7e9e6a6e5a17b2f35052d988a229e55f68d4946a79a440a64bbe.png)`,
      }"
    >
      <div class="flex-1">
        <div class="base-title">{{ name }}</div>
        <div class="base-tips" v-if="!isEdit">{{ tips }}</div>
      </div>
      <div class="w-20 ml-4">
        <van-image width="80" height="80" :src="`${cdnBaseUrl}/8834df9870be8e1f576e271a257ee7da2d7df26e84d46779435b546b41296cc3.png`" />
      </div>
    </div>

    <div class="main-content">
      <div class="content-wrapper">
        <div class="recipe-meta-row flex justify-around items-center my-4">
          <div class="meta-item text-center">
            <div class="meta-label tips-color">豆粉量</div>
            <div class="meta-value font-bold text-lg">{{ configJson.legumes || 15 }}g</div>
          </div>
          <div class="meta-item text-center">
            <div class="meta-label tips-color">粉水比</div>
            <div class="meta-value font-bold text-lg">1:{{ configJson.proportion ? (configJson.proportion / 2).toFixed(1) : '15.0' }}</div>
          </div>
          <div class="meta-item text-center">
            <div class="meta-label tips-color">總注水</div>
            <div class="meta-value font-bold text-lg">{{ nowWater }}ml</div>
          </div>
        </div>

        <div class="stage-section px-4">
          <div class="section-title font-bold mb-2">注水设置 ({{ accordionItems.length }}段)</div>
          <div v-for="(subItem, subIndex) in accordionItems" :key="subIndex" class="stage-card mb-3 p-3 bg-white rounded-lg shadow-sm">
            <div class="flex justify-between items-center font-bold mb-2 title-color">
              <div>{{ subItem.paragraph || `第 ${subIndex + 1} 段` }}</div>
              <div class="text-blue">{{ subItem.water }}ml</div>
            </div>
            <div class="flex justify-between text-sm tips-color">
              <div>溫度: {{ subItem.temperature }}°C</div>
              <div>時間: {{ subItem.time }}s</div>
              <div>流速: {{ subItem.velocity }}格</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="footer-barfixed" v-if="!isEdit">
      <div class="footer-btn-container flex justify-between items-center px-4 w-full">
        <button class="share-name-btn" @click.stop="showMoreOp = !showMoreOp">更多</button>
        <button class="share-coffee-machine flex-1 mx-3" @click="startBrew">
          <span class="icon-a-lujing1 mr-1">☕</span>傳送配方並沖煮
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showLoadingToast } from 'vant'
import { useMachineBStatusStore } from '@/store/coffeebStatus'

const route = useRoute()
const router = useRouter()
const machineStatusStore = useMachineBStatusStore()

const cdnBaseUrl = 'https://cdn.bincoocoffee.cn'
const isShare = ref(false)
const isEdit = ref(false)
const nickName = ref('')
const avatar = ref('')
const name = ref('')
const tips = ref('')
const recipeId = ref<any>(null)
const nowWater = ref(0)

const configJson = ref<any>({
  legumes: 15,
  proportion: 30,
  grind: true,
  gear: 60,
  speed: 120,
  accordionItems: []
})
const accordionItems = ref<any[]>([])
const showMoreOp = ref(false)

const runStatus = computed(() => machineStatusStore.runStatus)

/**
 * 🌟 智慧雙軌解鎖機制：杜絕 Unexpected token 'undefined' 閃退
 */
const initRecipeData = () => {
  try {
    console.log('--- 詳情頁啟動：智慧資料載入中 ---')
    let rawData: string | null = null

    // 軌道 1：優先從本地快遞櫃獲取私藏配方資料
    const transitData = localStorage.getItem('bincoo_transit_data')
    if (transitData && transitData !== 'undefined') {
      rawData = transitData
      console.log('✨ 成功捕獲 LocalStorage 快遞櫃包裹')
    } 
    // 軌道 2：如果快遞櫃是空的，則向下相容傳統路由 Query
    else if (route.query && route.query.data) {
      rawData = route.query.data as string
      console.log('📜 成功捕獲 URL Query 路由包裹')
    }

    // 🛡️ 核心防護盾：如果兩個軌道都沒抓到資料，優雅中斷，絕對不執行 JSON.parse()
    if (!rawData) {
      console.warn('🚨 警告：詳情頁未接收到任何配方參數，走向防呆預設值')
      return
    }

    // 🛡️ URL 轉義防禦：如果資料夾雜編碼符號，手動還原一次
    if (rawData.includes('%')) {
      rawData = decodeURIComponent(rawData)
    }

    // 安全解析 JSON
    const params = JSON.parse(rawData)

    // 資料同步綁定
    isShare.value = params.isShare || false
    isEdit.value = params.isEdit || false
    nickName.value = params.nickName || 'Bincoo 玩家'
    avatar.value = params.avatar || 'https://api.dicebear.com/9.x/thumbs/svg?seed=bincoo'
    name.value = params.name || '模擬推薦配方'
    tips.value = params.tips || '精心調配的手沖黃金參數'
    recipeId.value = params.id || Date.now()

    // 智慧解析 configJson（相容字串與物件結構）
    let config = params.configJson
    if (typeof config === 'string') {
      config = JSON.parse(config)
    }
    
    if (config) {
      configJson.value = { ...configJson.value, ...config }
      accordionItems.value = configJson.value.accordionItems || []
      
      // 計算總注水量
      nowWater.value = accordionItems.value.reduce((total: number, item: any) => total + (Number(item.water) || 0), 0)
    }

    console.log('🚀 詳情頁數據流貫通！成功渲染配方：', name.value)

  } catch (error) {
    console.error('🚨 詳情頁 initRecipeData 解析爆發嚴重異常:', error)
    showToast('配方資料格式解析失敗')
  }
}

const startBrew = () => {
  if (runStatus.value !== 0) {
    showToast({ type: 'fail', message: '設備當前正在運行，請先停止任務' })
    return
  }
  showLoadingToast({ message: '發送配方參數中...', forbidClick: true })
  // 後續實體設備下發與協定對接邏輯...
}

const closeOutside = () => {
  showMoreOp.value = false
}

onMounted(() => {
  initRecipeData()
})
</script>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 80px;
}
.share-content {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  font-size: 13px;
  background-color: #fff;
}
.base-card {
  margin: 12px 16px;
  padding: 20px;
  border-radius: 16px;
  background-size: cover;
  background-position: center;
  color: #fff;
  background-color: #004097;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.base-title {
  font-size: 20px;
  font-weight: bold;
}
.base-tips {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 6px;
}
.meta-label {
  font-size: 12px;
  color: #888;
}
.meta-value {
  font-size: 18px;
  color: #333;
  margin-top: 4px;
}
.stage-section {
  margin-top: 16px;
}
.section-title {
  font-size: 15px;
  color: #333;
  padding-left: 16px;
}
.stage-card {
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  margin: 0 16px 12px 16px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
}
.title-color { color: #323233; }
.tips-color { color: #969799; }
.text-blue { color: #004097; font-size: 16px; }

.footer-barfixed {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  z-index: 99;
}
.footer-btn-container {
  display: flex;
  width: 100%;
}
.share-name-btn {
  width: 75px;
  height: 42px;
  border-radius: 21px;
  border: 1px solid #004097;
  background: transparent;
  color: #004097;
  font-size: 14px;
}
.share-coffee-machine {
  height: 44px;
  border-radius: 22px;
  background-color: #004097;
  color: #fff;
  border: none;
  font-size: 14px;
  font-weight: 500;
  &:active { background-color: #003375; }
}
</style>