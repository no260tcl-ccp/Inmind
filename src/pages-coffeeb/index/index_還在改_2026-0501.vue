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
        
        <div class="menu-item" @click="showRecipeModal = true">
          <div class="icon-circle bg-orange-100">
            <van-icon name="notes-o" size="28" color="#ff976a" />
          </div>
          <div class="menu-name">我的配方</div>
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
	
	<div v-if="showRecipeModal" class="recipe-overlay" @click.self="showRecipeModal = false">
    <div class="recipe-window">
        <div class="recipe-header">
            <h3>☕ 我的專屬配方</h3>
            <span class="close-btn" @click="showRecipeModal = false">&times;</span>
        </div>
        <div class="recipe-body">
            <div v-for="item in myRecipes" :key="item.id" class="recipe-box" @click="applyRecipe(item)">
                <div class="recipe-main-info">
                    <span class="recipe-title">{{ item.name }}</span>
                    <span class="recipe-sub">{{ item.powder }}g | 1:{{ item.ratio }} | {{ item.temp }}°C</span>
                </div>
                <div class="apply-tag">套用</div>
            </div>
            <div v-if="myRecipes.length === 0" class="empty-msg">尚無收藏配方</div>
        </div>
    </div>
</div>
	
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
//import { useBluetoothStore, useMachineBStatusStore } from '@/store'
// ✅ 修正後的寫法：明確告訴 Vite 檔案在哪裡
import { useMachineBStatusStore } from '@/store/coffeebStatus'
// ⚠️ 注意：以下這行請依據您專案裡真實的藍牙 store 檔名調整
// 如果您的檔案叫 bluetooth.ts 就用下方這行；如果叫 bluetoothStore.ts，就補上 Store
import { useBluetoothStore } from '@/store/blue'

const router = useRouter()
const bluetoothStore = useBluetoothStore()
const machineStatusStore = useMachineBStatusStore()

const settingShow = ref(false)
const colorValue = ref('white')
const homeImg = ref('https://cdn.bincoocoffee.cn/home-machine.png

// --- [新增] 配方功能相關變數與邏輯 ---
const showRecipeModal = ref(false); // 控制彈窗顯示

// 這些資料格式對應我們討論的 PostgreSQL/GORM 模型
const myRecipes = ref([
  {
    id: 1,
    name: '耶加雪菲 - 清爽果香',
    powder: 15.0,
    ratio: 15.0,
    temp: 92,
  },
  {
    id: 2,
    name: '深焙曼特寧 - 厚實',
    powder: 20.0,
    ratio: 12.0,
    temp: 88,
  }
]);

// 點擊「一鍵套用」時的動作
const applyRecipe = (recipe) => {
  coffeePowder.value = recipe.powder; // 自動填入粉量
  waterRatio.value = recipe.ratio;    // 自動填入粉水比
  targetTemp.value = recipe.temp;      // 自動填入溫度
  
  showRecipeModal.value = false;      // 關閉視窗
  showToast(`已載入：${recipe.name}`);
};




// 計算機器運作狀態
const runStateObj = computed(() => {
  const status = machineStatusStore.runStatus
  if (status === 1) {
    return { text: '研磨中', color: '#004097', icon: 'icon-yanyanjia', isJump: true }
  } else if (status === 2 || status === 3) {
    return { text: '冲煮中', color: '#004097', icon: 'icon-zhushui', isJump: true }
  }
  return { text: '设备就绪', color: '#999', icon: 'icon-kongxian', isJump: false }
})

// 路由跳轉
const toHome = () => router.push('/')
const toQuick = () => router.push('/pages-coffeeb/grind/grind')
const toState = () => {
  if (runStateObj.value.isJump) {
    router.push('/pages-coffeeb/pulverizing/pulverizing')
  }
}

// 顏色切換
const colorConfirm = () => {
  if (bluetoothStore.connectedDevice) {
    console.log('同步顏色到設備:', colorValue.value)
  } else {
    console.log('本地模擬切換:', colorValue.value)
  }
  showToast({ type: 'success', message: '颜色设置成功' })
}

onMounted(() => {
  console.log('首頁加載成功，狀態同步中...')
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
  grid-template-columns: repeat(3, 1fr);
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
  font-size: 13px;
  color: #666;
}
.bg-blue-100 { background-color: #eef4ff; }
.bg-orange-100 { background-color: #fff4ec; }
.bg-green-100 { background-color: #f0fdf4; }
</style>