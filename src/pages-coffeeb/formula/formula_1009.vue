<template>
  <div class="formula-page-wrapper">
    <!-- 第一步：基礎設定頁面 -->
    <div v-if="step === 1" class="step-container">
      <div class="full-height-bg">
        <van-nav-bar
          fixed
          placeholder
          :border="false"
          :title="formulaTitle"
          left-arrow
          @click-left="handleBack"
          class="custom-nav-bar"
        >
          <template #left>
            <van-icon name="arrow-left" size="22px" class="nav-back-icon" />
          </template>
        </van-nav-bar>

        <div class="scroll-Y content-padding">
          <!-- 配方名稱輸入框 -->
          <div class="m3 flex items-center name-box">
            <div class="flex-1">
              <div class="name-label">配方名称</div>
              <div class="mt-2">
                <van-field
                  v-model="name"
                  placeholder="请输入您的配方名称..."
                  :maxlength="12"
                  :border="false"
                  class="custom-name-field"
                />
              </div>
            </div>
            <div class="w-6 cursor-pointer flex items-center justify-center" v-if="name" @click="clearName">
              <van-icon name="clear" size="20px" color="#99b3d5" />
            </div>
          </div>

          <!-- 基礎沖煮參數控制滑桿 -->
          <div class="mr-3 ml-3 mt-4">
            <div class="slider-item">
              <horizontal-slidert
                ref="coffeeBeansSlider"
                :initialValue="legumes"
                sliderText="咖啡粉"
                @slider-change="handleSliderChangeCoffeeBeans"
                :maxSliderValue="20"
                :minSliderValue="5"
                unitValue="g"
                :stepSize="1"
                :showValue="true"
              />
            </div>

            <div class="mt-4 slider-item">
              <horizontal-slidert
                ref="proportionSlider"
                :initialValue="proportion"
                sliderText="粉水比"
                @slider-change="handleSliderChangeProportion"
                :maxSliderValue="40"
                :minSliderValue="10"
                :proportion="true"
                :unitValue="`${totalWaterVolume}ml`"
                :stepSize="2"
                :showValue="true"
                :numberSize="20"
              />
            </div>

            <!-- 研磨開關與自適應控制 -->
            <div class="mt-4">
              <div class="switch-box">
                <div class="switch-title">
                  <span>研磨：{{ grind ? 'on' : 'off' }}</span>
                </div>
                <div>
                  <van-switch v-model="grind" size="22px" active-color="#004097" inactive-color="#d3e1f1" />
                </div>
              </div>
            </div>

            <!-- 研磨子屬性：檔位與轉速 -->
            <div v-if="grind" class="grind-sub-panel">
              <div class="mt-4 slider-item">
                <horizontal-slidert
                  ref="gearSlider"
                  :initialValue="gear"
                  sliderText="档位"
                  @slider-change="handleSliderChangeGear"
                  :maxSliderValue="120"
                  :minSliderValue="1"
                  :unitValue="dangweiType"
                  :stepSize="1"
                />
              </div>
              <div class="mt-4 slider-item">
                <horizontal-slidert
                  ref="speedSlider"
                  :initialValue="speed"
                  sliderText="研磨转速"
                  @slider-change="handleSliderChangeSpeed"
                  :maxSliderValue="120"
                  :minSliderValue="60"
                  unitValue="RPM"
                  :stepSize="5"
                  :showValue="true"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 第一步底部控制按鈕 -->
        <div class="footer fixed bottom-0 left-0 right-0 px-5 bg-white">
          <van-row gutter="12" v-if="isEdit">
            <van-col span="9">
              <van-button block type="primary" plain round class="btn-plain-blue" @click="step = 2">
                下一步
              </van-button>
            </van-col>
            <van-col span="15">
              <van-button block type="primary" round class="btn-solid-blue" @click="saveFormula">
                保存
              </van-button>
            </van-col>
          </van-row>
          <div v-else>
            <van-row gutter="12" v-if="accordionItems.length > 0">
              <van-col span="12">
                <van-button block type="primary" plain round class="btn-plain-blue" @click="step = 2">
                  {{ id ? '设置分段注水' : '下一步' }}
                </van-button>
              </van-col>
              <van-col span="12">
                <van-button block type="primary" round class="btn-solid-blue" @click="saveFormula">
                  {{ id ? '另存为' : '保存' }}
                </van-button>
              </van-col>
            </van-row>
            <van-button block type="primary" round class="btn-solid-blue-full" v-else @click="step = 2">
              设置分段注水
            </van-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 第二步：分段注水設定頁面 -->
    <div v-else class="step-container">
      <div class="full-height-bg">
        <van-nav-bar
          fixed
          placeholder
          :border="false"
          :title="formulaTitle"
          left-arrow
          @click-left="handleBack"
          class="custom-nav-bar"
        >
          <template #left>
            <van-icon name="arrow-left" size="22px" class="nav-back-icon" />
          </template>
        </van-nav-bar>

        <div class="mr-4 ml-4 mt-4 water-overview-card">
          <div class="flex justify-between items-center">
            <div>
              <div class="water-card-title">注水配比</div>
              <div class="flex font-size-3.5 mt-2 items-center">
                <div class="water-status-text" :class="waterTextType">
                  {{ nowWater }} / {{ totalWaterVolume }} ml
                </div>
                <div class="ml-2 mr-2 divider"></div>
                <div class="remaining-allocation">
                  待分配：
                  <span :class="{ 'over-color': totalWaterVolume - nowWater < 0, 'success-color': totalWaterVolume - nowWater === 0 }">
                    {{ negativeCorrection }} ml
                  </span>
                </div>
              </div>
            </div>
            <div v-if="activeIndex !== -1">
              <div class="auto-assignment cursor-pointer" @click="autoWater">自动分配</div>
            </div>
          </div>
        </div>

        <div class="item-list scroll-Y content-padding">
          <div class="mr-3 ml-3 mt-2">
            <div v-if="accordionItems.length > 0">
              <AccordionItem
                :items="accordionItems"
                :totalWaterVolume="totalWaterVolume"
                :percentagesList="percentagesList"
                @updateWater="handleUpdateWater"
                @updateWaterPercentage="handleUpdateWaterPercentage"
                @updateTemperature="handleUpdateTemperature"
                @updateVelocity="handleUpdateVelocity"
                @updateTime="handleUpdateTime"
                @updateTotalWater="handleUpdateTotalWater"
                @updateActiveIndex="handleActiveIndexUpdate"
                @updateWaterInjectType="handleUpdateWaterInjectType"
                @deleteItem="handleDeleteItem"
              />
            </div>
            <van-empty v-else description="请添加分段注水，点击右下角加号按钮開始" />
          </div>
        </div>

        <!-- 第二步底部控制按鈕 -->
        <div class="footer fixed bottom-0 left-0 right-0 px-5 bg-white">
          <van-row gutter="12">
            <van-col span="6">
              <van-button block plain round type="primary" class="btn-plain-blue square-btn" @click="step = 1">
                <van-icon name="arrow-left" size="22px" />
              </van-button>
            </van-col>
            <van-col span="12">
              <van-button block round type="primary" class="btn-solid-blue" @click="saveFormula" v-if="!isShare">
                {{ id ? (isEdit ? '保存' : '另存为') : '创建配方' }}
              </van-button>
              <van-button block round type="primary" class="btn-solid-blue" @click="saveFormula" v-else>
                另存为
              </van-button>
            </van-col>
            <van-col span="6">
              <van-button block plain round type="primary" class="btn-plain-blue square-btn" @click="addFormula">
                <van-icon name="plus" size="19px" />
              </van-button>
            </van-col>
          </van-row>
        </div>
      </div>
    </div>

    <!-- 另存成功對話框 -->
    <van-dialog v-model:show="confirmShow" :show-cancel-button="false" @confirm="successSure" class="custom-success-dialog">
      <div class="confirm-main">
        <div class="icon-box">
          <van-icon name="checked" size="48px" color="#07c160" />
        </div>
        <div class="confirm-title">另存成功</div>
        <div class="confirm-content">
          可在 <span class="nav-link" @click="toMyFormula">我的配方页面</span> 中查看此配方
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { useUserStore, useBluetoothStore } from '@/store'
import HorizontalSlidert from '@/components/horizontal-slidert/horizontal-slidert.vue'
import AccordionItem from '../components/accordion-item/accordion-item.vue'

// 路由與狀態初始化
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const bluetoothStore = useBluetoothStore()

// 頁面控制變數
const step = ref<number>(1)
const confirmShow = ref<boolean>(false)

// 基礎配方參數
const name = ref<string>('')
const avatar = ref<string>(`https://api.dicebear.com/9.x/thumbs/svg?seed=${Math.random().toString(36).substring(2, 15)}`)
const grind = ref<boolean>(true)
const legumes = ref<number>(15)
const proportion = ref<number>(30)
const totalWaterVolume = ref<number>(225)
const gear = ref<number>(60)
const speed = ref<number>(120)

// 多段注水運作狀態
const nowWater = ref<number>(0)
const activeIndex = ref<number>(-1)
const accordionItems = ref<any[]>([])
const isEdit = ref(false)
const id = ref<number | string>(0)
const deviceId = ref<any>(null)
const sort = ref<string | number>('')
const sharedToDevice = ref<number>(0)
const isShare = ref<boolean>(false)

// 建立專門打破 Vue 深層嵌套渲染盲區的獨立平坦陣列 (存放各段百分比)
const percentagesList = ref<number[]>([])

// 負數自動補正變數
const negativeCorrection = ref<number>(0)

// 標題顯示
const formulaTitle = computed(() => {
  return isEdit.value ? `编辑配方(${step.value}/2)` : `创建配方(${step.value}/2)`
})

// 清空配方名稱
const clearName = () => {
  name.value = ''
}

// 返回上一頁
const handleBack = () => {
  router.back()
}

// 跳轉到我的配方頁
const toMyFormula = () => {
  confirmShow.value = false
  router.replace('/pages-coffeeb/myFormula/myFormula')
}

// 添加分段注水項目
const addFormula = () => {
  if (accordionItems.value.length >= 5) {
    showToast({ type: 'fail', message: '您最多可以添加 5条数据' })
    return
  }
  const isFirst = accordionItems.value.length === 0
  accordionItems.value.push({
    id: Date.now() + Math.random(),
    paragraph: isFirst ? '焖蒸' : `第${accordionItems.value.length}段`,
    water: 0,
    percentage: 0,
    temperature: 93,
    velocity: 3,
    time: isFirst ? 30 : 3, // 預設：悶蒸 30 秒，一般段落 3 秒
    type: 0,
    paragraphFornt: false,
    paragraphAfter: false,
  })
  // 同步在平坦數值陣列補上 0 佔位符
  percentagesList.value = [...percentagesList.value, 0]
}

// 組件載入與參數初始化
onMounted(() => {
  if (bluetoothStore.connectionStatus === 'connected') {
    deviceId.value = bluetoothStore.connectedDevice?.productInfo?.id
  }
  const queryData = route.query.data as string
  if (queryData) {
    try {
      const decodedData = decodeURIComponent(queryData)
      const params = convertStrToPrimitive(JSON.parse(decodedData))
      // 支援微信 nested/configJson 架構與 Web 扁平化結構相容
      const config = params.configJson || params
      
      isEdit.value = params.isEdit !== undefined ? params.isEdit : (!!params.id && !params.isShare)
      isShare.value = params.isShare || false
      id.value = params.id || 0
      name.value = params.name ? decodeURIComponent(params.name) : ''
      avatar.value = params.avatar ? decodeURIComponent(params.avatar) : avatar.value
      deviceId.value = params.deviceId || deviceId.value
      sort.value = params.sort || 0
      sharedToDevice.value = params.sharedToDevice || 0
      
      gear.value = config.gear || 60
      grind.value = config.grind ?? true
      speed.value = config.speed || 120
      legumes.value = config.legumes || 15
      proportion.value = config.proportion || 30
      totalWaterVolume.value = (legumes.value * proportion.value) / 2
      
      // 相容載入微信原廠 nested 的 accordionItems 或 stages
      const rawStages = config.accordionItems || config.stages || []
      accordionItems.value = rawStages.map((item: any, idx: number) => {
        return {
          ...item,
          id: item.id || Date.now() + idx,
          water: Number(item.water || 0),
          percentage: Number(item.percentage || 0)
        }
      })
      
      // 同步計算並初始化平坦陣列
      percentagesList.value = accordionItems.value.map((item) => {
        const pct = totalWaterVolume.value > 0 ? Math.round((Number(item.water) / totalWaterVolume.value) * 100) : 0
        item.percentage = pct
        return pct
      })
      
      nowWater.value = accordionItems.value.reduce((total: number, item: any) => total + Number(item.water || 0), 0)
    } catch (e) {
      console.error('配方參數解析失敗，請確認資料結構相容性：', e)
    }
  }
})

// 原微信版遞迴解構與型態自動轉換機制 (100% 保留)
const convertStrToPrimitive = (data: any): any => {
  if (Array.isArray(data)) return data.map((item) => convertStrToPrimitive(item))
  if (typeof data === 'object' && data !== null) {
    const newObj: any = {}
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        newObj[key] = convertStrToPrimitive(data[key])
      }
    }
    return newObj
  }
  if (typeof data === 'string') {
    const trimStr = data.trim()
    if (trimStr.toLowerCase() === 'true') return true
    if (trimStr.toLowerCase() === 'false') return false
    const num = Number(trimStr)
    if (!isNaN(num) && trimStr !== '') return num
    return data
  }
  return data
}

// 攔截 updateWaterPercentage 事件，並強制更新平坦陣列觸發重繪
const handleUpdateWaterPercentage = (val: any) => {
  const newList = [...percentagesList.value]
  newList[val.index] = val.percentage
  percentagesList.value = newList
  if (accordionItems.value[val.index]) {
    accordionItems.value[val.index].percentage = val.percentage
  }
}

// 單純更新水量
const handleUpdateWater = (val: any) => {
  const idx = val.index
  const newValue = Number(val.newValue || 0)
  if (accordionItems.value[idx]) {
    accordionItems.value[idx].water = newValue
    
    // 水量變動時：聯動更新該段百分比與平坦陣列，打破畫面死角
    const pct = totalWaterVolume.value > 0 ? Math.round((newValue / totalWaterVolume.value) * 100) : 0
    accordionItems.value[idx].percentage = pct
    
    const newList = [...percentagesList.value]
    newList[idx] = pct
    percentagesList.value = newList
  }
  // 重新累加總分配水量
  nowWater.value = accordionItems.value.reduce((total: number, item: any) => total + Number(item.water || 0), 0)
}

// 更新總水量
const handleUpdateTotalWater = (val: any) => {
  nowWater.value = val
}

// 刪除指定分段並自動重新索引段落
const handleDeleteItem = (index: number) => {
  accordionItems.value.splice(index, 1)
  
  const newList = [...percentagesList.value]
  newList.splice(index, 1)
  percentagesList.value = newList
  
  // 核心自動排序整理：刪除後重新排序每一段名稱
  accordionItems.value.forEach((item, idx) => {
    item.paragraph = idx === 0 ? '焖蒸' : `第${idx}段`
  })
  
  nowWater.value = accordionItems.value.reduce((sum, item) => sum + Number(item.water || 0), 0)
}

const handleUpdateWaterInjectType = (val: any) => {
  if (accordionItems.value[val.index]) {
    accordionItems.value[val.index].type = val.type
  }
}

const handleUpdateTemperature = (val: any) => {
  if (accordionItems.value[val.index]) {
    accordionItems.value[val.index].temperature = val.newValue
  }
}

const handleUpdateVelocity = (val: any) => {
  if (accordionItems.value[val.index]) {
    accordionItems.value[val.index].velocity = val.newValue
  }
}

const handleUpdateTime = (val: any) => {
  if (accordionItems.value[val.index]) {
    accordionItems.value[val.index].time = val.newValue
  }
}

const handleActiveIndexUpdate = (val: any) => {
  activeIndex.value = val
}

const handleSliderChangeSpeed = (value: number) => {
  speed.value = value
}

// 智慧自動分配剩餘水量 (上限 240ml)
const autoWater = () => {
  if (activeIndex.value < 0 || activeIndex.value >= accordionItems.value.length) {
    showToast({ type: 'fail', message: '无效的配方段落索引' })
    return
  }
  const remainingWater = totalWaterVolume.value - nowWater.value
  if (remainingWater <= 0) {
    showToast({ type: 'fail', message: '沒有可分配的水量' })
    negativeCorrection.value = 0
    return
  }

  const maxWater = Math.min(remainingWater, 240)
  const idx = activeIndex.value
  const currentWater = Number(accordionItems.value[idx].water || 0)
  const newWater = currentWater + maxWater
  const newPct = totalWaterVolume.value > 0 ? Math.round((newWater / totalWaterVolume.value) * 100) : 0
  
  // 自動分配同步更新深淺兩層資料
  accordionItems.value[idx].water = newWater
  accordionItems.value[idx].percentage = newPct
  
  const newList = [...percentagesList.value]
  newList[idx] = newPct
  percentagesList.value = newList
  
  // 重新統計分配水量
  nowWater.value = accordionItems.value.reduce((total: number, item: any) => total + Number(item.water || 0), 0)
}

// 另存成功跳轉
const successSure = () => {
  confirmShow.value = false
  router.replace('/pages-coffeeb/myFormula/myFormula')
}

// 待分配負數檢校監聽
watch([totalWaterVolume, nowWater], ([newTotal, newNow]) => {
  negativeCorrection.value = newTotal - newNow
})

// 研磨與粉水比動態計算總水量，同時更新百分比與 flat array
watch([legumes, proportion], ([newLegumes, newProportion]) => {
  totalWaterVolume.value = (newLegumes * newProportion) / 2
  const total = totalWaterVolume.value
  
  // 全面通知與重新映射百分比，杜絕殘留百分比顯示
  percentagesList.value = accordionItems.value.map(item => {
    const pct = total > 0 ? Math.round((Number(item.water || 0) / total) * 100) : 0
    item.percentage = pct
    return pct
  })
})

// 保存配方主邏輯：嚴格校驗 -> 自動清洗 -> LocalStorage 對接
const saveFormula = () => {
  showLoadingToast({ message: '保存中...', forbidClick: true, duration: 0 })
  if (!name.value) {
    closeToast()
    showToast({ type: 'fail', message: '请输入配方名称' })
    step.value = 1
    return
  }
  if (totalWaterVolume.value - nowWater.value !== 0) {
    closeToast()
    showToast({ type: 'fail', message: '请检查水量是否分配正确!' })
    return
  }
  const hasInvalidItem = accordionItems.value.some((item) => {
    const water = Number(item.water)
    return !isNaN(water) && water <= 0
  })
  if (hasInvalidItem) {
    closeToast()
    showToast({ type: 'fail', message: '请检查水量是否分配正确(不能有0ml分段)' })
    return
  }
  if (accordionItems.value.length < 2) {
    closeToast()
    showToast({ type: 'fail', message: '请添加至少 2个配方段落' })
    return
  }

  // 儲存前資料清洗：自動剔除0ml水量的廢段、重新計算標準百分比並排序段落名稱
  accordionItems.value = accordionItems.value
    .filter((item) => Number(item.water) > 0)
    .map((item, index) => {
      return {
        ...item,
        paragraph: index === 0 ? '焖蒸' : `第${index}段`,
        percentage: percentagesList.value[index] || 0
      }
    })

  try {
    const LOCAL_RECIPES_KEY = 'bincoo_my_recipes'
    const localStr = localStorage.getItem(LOCAL_RECIPES_KEY)
    let recipes = localStr ? JSON.parse(localStr) : []

    // 封裝成完美對齊大師級巢狀結構的配方資料物件
    const recipeData: any = {
      deviceId: deviceId.value,
      userId: userStore.userInfo?.id || '',
      name: name.value,
      imageUrl: avatar.value,
      sort: Number(sort.value || 0),
      sharedToDevice: Number(sharedToDevice.value || 0),
      configJson: {
        possible: false,
        legumes: legumes.value,
        proportion: proportion.value,
        grind: grind.value,
        gear: gear.value,
        speed: speed.value,
        accordionItems: accordionItems.value,
      }
    }

    if (isEdit.value && !isShare.value) {
      recipeData.id = id.value
      const index = recipes.findIndex((r: any) => r.id === id.value)
      if (index !== -1) {
        recipes[index] = { ...recipes[index], ...recipeData }
      } else {
        recipes.unshift(recipeData)
      }
    } else {
      recipeData.id = Date.now()
      recipes.unshift(recipeData)
    }

    localStorage.setItem(LOCAL_RECIPES_KEY, JSON.stringify(recipes))
    closeToast()

    // 若從分享/熱門配方進入另存新檔，則彈窗提示
    if (id.value && !isEdit.value && isShare.value) {
      confirmShow.value = true
    } else {
      showToast({ type: 'success', message: '保存成功' })
      router.replace('/pages-coffeeb/myFormula/myFormula')
    }
  } catch (error) {
    closeToast()
    console.error('儲存本地配方失敗:', error)
    showToast({ type: 'fail', message: '保存失败，请检查浏览器儲存空間' })
  }
}

// 基礎參數拉桿聯動函式
const handleSliderChangeCoffeeBeans = (value: number) => { legumes.value = value }
const handleSliderChangeProportion = (value: number) => { proportion.value = value }
const handleSliderChangeGear = (value: number) => { gear.value = value }

// 檔位視覺文字判定
const dangweiType = computed(() => {
  const dangwei = gear.value
  if (dangwei > 82) return '法压冷萃'
  if (dangwei > 47 && dangwei <= 82) return '手冲咖啡'
  if (dangwei > 23 && dangwei <= 47) return '爱乐压'
  if (dangwei > 0 && dangwei <= 23) return '意式浓缩'
  return ''
})

// 分段注水水量動態視覺回饋 (error / warning / success)
const waterTextType = computed(() => {
  if (nowWater.value > totalWaterVolume.value) return 'error'
  if (nowWater.value < totalWaterVolume.value) return 'warning'
  return 'success'
})
</script>

<style lang="scss" scoped>
.formula-page-wrapper {
  background-color: #f6f8fb;
  min-height: 100vh;
}

.step-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.full-height-bg {
  background-color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.custom-nav-bar {
  background-color: white !important;
  .nav-back-icon {
    color: #004097;
    font-weight: bold;
  }
}

.scroll-Y {
  flex: 1;
  overflow-y: auto;
}

.content-padding {
  padding-bottom: 96px; /* 保留足夠高度，避免被 footer 遮擋 */
}

.name-box {
  min-height: 86px;
  padding: 12px 16px;
  background-color: #f8fafc;
  border: 1px solid #ebf0f7;
  border-radius: 12px;
  margin: 16px 12px 12px 12px;

  .name-label {
    font-size: 14px;
    font-weight: bold;
    color: #004097;
  }

  .custom-name-field {
    padding: 0;
    font-size: 18px;
    font-weight: bold;
    color: #004097;
    background: transparent;
    :deep(input) {
      color: #004097;
      &::placeholder {
        color: #99b3d5;
      }
    }
  }
}

.slider-item {
  background-color: white;
  padding: 8px 0;
}

.switch-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 58px;
  padding: 0 16px;
  font-size: 15px;
  font-weight: bold;
  color: #004097;
  background-color: #f8fafc;
  border: 1px solid #ebf0f7;
  border-radius: 12px;
  margin-top: 8px;
}

.grind-sub-panel {
  background: #fdfefe;
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px dashed #d3e1f1;
  margin-top: 12px;
}

.water-overview-card {
  background: #f4f7fc;
  border: 1px solid #e1e8f2;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);

  .water-card-title {
    font-size: 16px;
    font-weight: bold;
    color: #004097;
  }

  .water-status-text {
    font-size: 18px;
    font-weight: bold;
    &.success {
      color: #07c160;
    }
    &.warning {
      color: #ff976a;
    }
    &.error {
      color: #e51f4d;
    }
  }

  .remaining-allocation {
    font-size: 13px;
    color: #666;
    font-weight: 500;
  }
}

.auto-assignment {
  width: 84px;
  height: 32px;
  border-radius: 16px;
  background-color: #004097;
  color: #ffffff;
  line-height: 32px;
  text-align: center;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 6px rgba(0, 64, 151, 0.2);
  transition: all 0.2s;
  &:active {
    opacity: 0.85;
    transform: scale(0.96);
  }
}

.divider {
  display: inline-block;
  width: 1px;
  height: 12px;
  background-color: #d1d5db;
}

.over-color {
  color: #e51f4d;
  font-weight: bold;
}

.success-color {
  color: #07c160;
  font-weight: bold;
}

.item-list {
  flex: 1;
}

.footer {
  padding-top: 14px;
  padding-bottom: 24px;
  border-top: 1px solid #f1f1f1;
  z-index: 10;
  background: #ffffff;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.02);
}

/* 經典高級設計按鈕風格樣式 */
.btn-plain-blue {
  border-color: #004097 !important;
  color: #004097 !important;
  font-weight: bold !important;
}

.btn-solid-blue {
  background: #004097 !important;
  border-color: #004097 !important;
  color: #ffffff !important;
  font-weight: bold !important;
  box-shadow: 0 3px 8px rgba(0, 64, 151, 0.15);
}

.btn-solid-blue-full {
  background: #004097 !important;
  border-color: #004097 !important;
  color: #ffffff !important;
  font-weight: bold !important;
  font-size: 16px;
  height: 46px;
}

.square-btn {
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-success-dialog {
  border-radius: 16px;
  .confirm-main {
    padding: 32px 24px;
    text-align: center;
    .icon-box {
      margin-bottom: 16px;
    }
    .confirm-title {
      font-size: 20px;
      font-weight: bold;
      color: #222222;
    }
    .confirm-content {
      margin-top: 12px;
      font-size: 14px;
      color: #888888;
      line-height: 1.5;
      .nav-link {
        color: #004097;
        font-weight: bold;
        text-decoration: underline;
        cursor: pointer;
      }
    }
  }
}
</style>
