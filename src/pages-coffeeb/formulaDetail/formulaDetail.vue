<template>
  <div class="page-container">
    <van-nav-bar
      :title="isEditMode ? '修改配方' : '創建新配方'"
      left-arrow
      fixed
      placeholder
      @click-left="router.back()"
    />

    <div class="formula-body">
      <van-cell-group inset title="基礎參數" class="mb-4">
        <van-field
          v-model="recipeName"
          label="配方名稱"
          placeholder="請輸入配方名稱"
          input-align="right"
          required
        />
        <van-cell title="咖啡豆粉量">
          <template #value>
            <van-stepper v-model="legumes" min="5" max="40" step="1" integer suffix="g" />
          </template>
        </van-cell>
        <van-cell :title="`粉水比 (1:${(proportion / 2).toFixed(1)})`">
          <template #value>
            <div class="slider-wrapper">
              <van-slider v-model="proportion" :min="20" :max="40" :step="1" />
            </div>
          </template>
        </van-cell>
        <van-cell title="預計總注水量" :value="`${targetTotalWater} ml`" value-class="text-blue font-bold" />
      </van-cell-group>

      <van-cell-group inset title="研磨與轉速" class="mb-4">
        <van-cell title="是否需要自動研磨">
          <template #right-icon>
            <van-switch v-model="grind" size="22px" active-color="#004097" />
          </template>
        </van-cell>
        <van-cell title="研磨檔位 (細 1 - 100 粗)" v-if="grind">
          <template #value>
            <van-stepper v-model="gear" min="1" max="100" step="1" integer />
          </template>
        </van-cell>
        <van-cell title="磨豆轉速 (RPM)" v-if="grind">
          <template #value>
            <van-stepper v-model="speed" min="60" max="120" step="5" integer />
          </template>
        </van-cell>
      </van-cell-group>

      <div class="stage-container">
        <div class="stage-header flex justify-between items-center px-4 mb-2">
          <span class="stage-title font-bold">注水階段管理 ({{ accordionItems.length }} / 5 段)</span>
          <van-button 
            size="small" 
            type="primary" 
            icon="plus" 
            round 
            :disabled="accordionItems.length >= 5"
            @click="addStage"
          >
            增加階段
          </van-button>
        </div>

        <div 
          v-for="(stage, idx) in accordionItems" 
          :key="idx" 
          class="stage-card p-4 mx-4 mb-4 bg-white rounded-xl shadow-sm"
        >
          <div class="flex justify-between items-center border-b pb-2 mb-3">
            <span class="font-bold text-blue">
              {{ stage.paragraph || (idx === 0 ? '焖蒸' : `第 ${idx} 段`) }}
            </span>
            <van-button 
              v-if="idx > 0" 
              size="mini" 
              type="danger" 
              plain 
              round
              @click="removeStage(idx)"
            >
              刪除此段
            </van-button>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <van-field v-model.number="stage.water" label="注水(ml)" type="digit" input-align="right" />
            <van-field v-model.number="stage.temperature" label="溫度(°C)" type="digit" input-align="right" />
            <van-field v-model.number="stage.time" label="時間(秒)" type="digit" input-align="right" />
            <van-field v-model.number="stage.velocity" label="流速(格)" type="digit" input-align="right" placeholder="1-5" />
          </div>
        </div>
      </div>

      <div class="water-bar mx-4 p-4 rounded-xl flex justify-between items-center" :class="isWaterMatch ? 'bg-success-light' : 'bg-warning-light'">
        <div class="text-sm">
          <div>設定總量：<span class="font-bold">{{ targetTotalWater }}ml</span></div>
          <div>階段總和：<span class="font-bold" :class="isWaterMatch ? 'text-green' : 'text-orange'">{{ currentStagesWaterSum }}ml</span></div>
        </div>
        <div class="text-xs text-right max-w-60">
          <van-tag type="success" size="medium" v-if="isWaterMatch">✨ 水量分配合法，就緒！</van-tag>
          <van-tag type="warning" size="medium" v-else>⚠️ 各段相加需等於預計總量</van-tag>
        </div>
      </div>

      <div class="footer-placeholder"></div>
      <div class="footer-fixed-bar">
        <van-button 
          round 
          block 
          type="primary" 
          class="save-submit-btn" 
          @click="saveRecipe"
        >
          保存配方至私藏庫
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'

const route = useRoute()
const router = useRouter()

// --- 智慧表單響應式變數 ---
const isEditMode = ref(false)
const recipeId = ref<any>(null)
const recipeName = ref('')
const legumes = ref(15)       // 豆粉量 (預設 15g)
const proportion = ref(30)    // 粉水比指標 (30 代表 1:15)
const grind = ref(true)       // 是否研磨
const gear = ref(60)         // 研磨檔位
const speed = ref(120)        // 轉速
const accordionItems = ref<any[]>([])

// 🌟 核心智慧幾何：預計總水量 = 粉量 * (粉水比指標 / 2)
const targetTotalWater = computed(() => Math.round((proportion.value / 2) * legumes.value))

// 🌟 核心防禦幾何：加總目前所有動態卡片輸入的水量
const currentStagesWaterSum = computed(() => {
  return accordionItems.value.reduce((sum, item) => sum + (Number(item.water) || 0), 0)
})

// 判斷兩者是否完全對齊 (符合手沖專業水量防呆邏輯)
const isWaterMatch = computed(() => targetTotalWater.value === currentStagesWaterSum.value)

/**
 * 頁面初始化生命週期：分辨「新增」或「編輯」
 */
const initForm = () => {
  const queryData = route.query.data as string
  
  if (queryData) {
    // 🚀 【修改模式】：解析發送端傳過來的參數並進行回填
    try {
      const params = JSON.parse(decodeURIComponent(queryData))
      isEditMode.value = true
      recipeId.value = params.id
      recipeName.value = params.name || ''
      
      const config = params.configJson || {}
      legumes.value = config.legumes || 15
      proportion.value = config.proportion || 30
      grind.value = config.grind !== undefined ? config.grind : true
      gear.value = config.gear || 60
      speed.value = config.speed || 120
      accordionItems.value = JSON.parse(JSON.stringify(config.accordionItems || []))
      
      console.log('📝 成功進入【修改配方】模式，參數已完美還原填表')
    } catch (e) {
      console.error('回填配方資料失敗:', e)
    }
  } else {
    // 🚀 【新增模式】：初始化乾淨的預設黃金參數
    isEditMode.value = false
    recipeId.value = null
    recipeName.value = ''
    legumes.value = 15
    proportion.value = 30
    grind.value = true
    gear.value = 60
    speed.value = 120
    // 預設給予兩段標準手沖骨架 (悶蒸 30ml + 主沖 195ml = 225ml)
    accordionItems.value = [
      { paragraph: '阻蒸', water: 30, temperature: 92, time: 30, velocity: 3, type: 0 },
      { paragraph: '第 1 段', water: 195, temperature: 92, time: 120, velocity: 3, type: 0 }
    ]
    console.log('✨ 成功進入【新增配方】模式，已加載預設黃金骨架')
  }
}

/**
 * 動態點擊事件：增加一個注水階段 (最大上限 5 段)
 */
const addStage = () => {
  if (accordionItems.value.length >= 5) {
    showToast('手沖協議最大支援 5 段注水哦')
    return
  }
  const currentLength = accordionItems.value.length
  accordionItems.value.push({
    paragraph: `第 ${currentLength} 段`,
    water: 40,
    temperature: 92,
    time: 60,
    velocity: 3,
    type: 0
  })
}

/**
 * 動態點擊事件：刪除某個注水階段
 */
const removeStage = (index: number) => {
  accordionItems.value.splice(index, 1)
  // 重新自動校準後續段數的中文名稱
  for (let i = 1; i < accordionItems.value.length; i++) {
    accordionItems.value[i].paragraph = `第 ${i} 段`
  }
}

/**
 * 🌟 核心重構：打包資料並同步寫入 LocalStorage 本地資料庫
 */
const saveRecipe = () => {
  // 1. 基本防呆驗證
  if (!recipeName.value.trim()) {
    showToast({ type: 'fail', message: '請填寫配方名稱' })
    return
  }

  // 2. 專業手沖水量分配防護：各段水容量加總必須等於總水量設定
  if (!isWaterMatch.value) {
    showConfirmDialog({
      title: '水量分配不一致',
      message: `當前各段注水總和為 ${currentStagesWaterSum.value}ml，不等於設定總量 ${targetTotalWater.value}ml！\n是否要幫您將尾差自動歸併到最後一段？`,
      confirmButtonColor: '#004097'
    }).then(() => {
      // 智慧自動校準差額：把不夠或多出來的水量，直接灌給最後一段
      const lastIdx = accordionItems.value.length - 1
      const diff = targetTotalWater.value - (currentStagesWaterSum.value - accordionItems.value[lastIdx].water)
      if (diff > 0) {
        accordionItems.value[lastIdx].water = diff
        executeSaveProcess() // 校準完成，強制通關儲存！
      } else {
        showToast('無法自動歸併，請手動調整水量欄位')
      }
    }).catch(() => {
      // 使用者選擇自己調整
    })
    return
  }

  executeSaveProcess()
}

/**
 * 執行真正的 LocalStorage 資料庫儲存事務
 */
const executeSaveProcess = () => {
  try {
    // 讀取現有配方清單
    const localRecipesStr = localStorage.getItem('bincoo_my_recipes')
    let currentList: any[] = localRecipesStr ? JSON.parse(localRecipesStr) : []

    // 建立本次要儲存的 configJson 內部包結構
    const newConfigJson = {
      legumes: Number(legumes.value),
      proportion: Number(proportion.value),
      grind: grind.value,
      gear: Number(gear.value),
      speed: Number(speed.value),
      accordionItems: accordionItems.value
    }

    if (isEditMode.value && recipeId.value) {
      // 🚀 【修改模式】：在陣列中找到舊的 ID，精準替換
      const targetIndex = currentList.findIndex((item: any) => item.id === recipeId.value)
      if (targetIndex !== -1) {
        currentList[targetIndex] = {
          ...currentList[targetIndex],
          name: recipeName.value.trim(),
          configJson: newConfigJson
        }
        showToast({ type: 'success', message: '配方修改成功！' })
      } else {
        throw new Error('找不到該配方ID')
      }
    } else {
      // 🚀 【新增模式】：生成唯一時戳 ID，置頂 Unshift 插入配方庫
      const newRecipeItem = {
        id: Date.now(),
        name: recipeName.value.trim(),
        configJson: newConfigJson
      }
      currentList.unshift(newRecipeItem)
      showToast({ type: 'success', message: '私藏配方創建成功！' })
    }

    // 寫回硬碟持久化
    localStorage.setItem('bincoo_my_recipes', JSON.stringify(currentList))

    // 延時 800ms 後優雅退回上一頁列表庫，促使 myFormula.vue 觸發 onMounted 滿血重整
    setTimeout(() => {
      router.back()
    }, 800)

  } catch (err) {
    console.error('儲存配方事務失敗:', err)
    showToast('資料庫儲存異常')
  }
}

onMounted(() => {
  initForm()
})
</script>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background-color: #f7f8fa;
}
.formula-body {
  padding-top: 12px;
  padding-bottom: 90px;
}
.mb-4 {
  margin-bottom: 16px;
}
.slider-wrapper {
  padding: 10px 4px 0 0;
  width: 140px;
  display: inline-block;
}
.text-blue {
  color: #004097;
}
.font-bold {
  font-weight: bold;
}
.text-green {
  color: #07c160;
}
.text-orange {
  color: #ff976a;
}
.stage-title {
  font-size: 14px;
  color: #646566;
}
.stage-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.01);
}
.grid {
  display: grid;
}
.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.gap-3 {
  gap: 12px;
}

// 智慧看板底色
.bg-success-light {
  background-color: #ebfff0;
  border: 1px solid #c2f0d1;
  color: #1b5e20;
}
.bg-warning-light {
  background-color: #fff6ed;
  border: 1px solid #ffe3d1;
  color: #e65100;
}

// 底部固定保存列布局
.footer-placeholder {
  height: 60px;
}
.footer-fixed-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  padding: 12px 16px;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.06);
  z-index: 100;
}
.save-submit-btn {
  background: #004097 !important;
  border-color: #004097 !important;
  height: 46px;
  font-size: 15px;
  font-weight: 500;
}
</style>