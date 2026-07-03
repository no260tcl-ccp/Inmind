<template>
  <div v-if="step === 1">
    <div style="height: 100vh; background-color: white">
      <van-nav-bar
        fixed
        placeholder
        :border="false"
        :title="formulaTitle"
        left-arrow
        @click-left="handleBack"
      >
        <template #left>
          <i class="iconfont icon-a-ze-arrow-leftCopy2 icon-size-22"></i>
        </template>
      </van-nav-bar>

      <div class="scroll-Y" style="overflow-y: auto; padding-bottom: 80px;">
        <div class="m3 flex items-center name-box">
          <div class="flex-1">
            <div>配方名称</div>
            <div class="mt-2">
              <van-field
                v-model="name"
                placeholder="请输入您的配方名称..."
                :maxlength="12"
                :border="false"
                style="padding: 0; font-size: 18px; color: #004097; background: transparent;"
              />
            </div>
          </div>
          <div class="w-6 cursor-pointer" v-if="name" @click="clearName">
            <van-image width="24" height="24" src="/static/images/formula/close.png" />
          </div>
        </div>

        <div class="mr-3 ml-3">
          <div>
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
          <div class="mt-3">
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
          <div class="mt-3">
            <div class="switch-box">
              <div>
                <span>研磨：{{ grind ? 'on' : 'off' }}</span>
              </div>
              <div>
                <van-switch v-model="grind" size="22px" inactive-color="#d3e1f1" />
              </div>
            </div>
          </div>
          <div v-if="grind">
            <div class="mt-3">
              <horizontal-slidert
                ref="gearSlider"
                :initialValue="gear"
                sliderText="档位"
                @slider-change="handleSliderChangeGear"
                :maxSliderValue="120"
                :minSliderValue="1"
                :unitValue="dangweiType"
                :stepSize="1"
                :showValue="true"
              />
            </div>
            <div class="mt-3">
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

      <div class="footer fixed bottom-5 left-0 right-0 px-5 bg-white">
        <van-row gutter="12" v-if="isEdit">
          <van-col span="9">
            <van-button block type="primary" plain round @click="step = 2">下一步</van-button>
          </van-col>
          <van-col span="15">
            <van-button block type="primary" round @click="saveFormula">保存</van-button>
          </van-col>
        </van-row>
        <div v-else>
          <van-row gutter="12" v-if="accordionItems.length > 0">
            <van-col span="12">
              <van-button block type="primary" plain round @click="step = 2">
                {{ id ? '设置分段注水' : '下一步' }}
              </van-button>
            </van-col>
            <van-col span="12">
              <van-button block type="primary" round @click="saveFormula">
                {{ id ? '另存为' : '保存' }}
              </van-button>
            </van-col>
          </van-row>
          <van-button block type="primary" round v-else @click="step = 2">设置分段注水</van-button>
        </div>
      </div>
    </div>
  </div>

  <div v-else>
    <div style="height: 100vh; background-color: white">
      <van-nav-bar
        fixed
        placeholder
        :border="false"
        :title="formulaTitle"
        left-arrow
        @click-left="handleBack"
      >
        <template #left>
          <i class="iconfont icon-a-ze-arrow-leftCopy2 icon-size-22"></i>
        </template>
      </van-nav-bar>

      <div class="mr-4 ml-4 mt-4">
        <div class="flex justify-between items-center">
          <div>
            <div class="font-size-6">注水</div>
            <div class="flex font-size-3.5 mt-2 justify-center items-center flex-direction-row">
              <div>{{ nowWater + '/' + totalWaterVolume + 'ml' }}</div>
              <div class="ml-2 mr-2 divider"></div>
              <div>
                待分配：
                <span :class="{ 'over-color': totalWaterVolume - nowWater < 0 }">
                  {{ negativeCorrection + 'ml' }}
                </span>
              </div>
            </div>
          </div>
          <div v-if="activeIndex !== -1">
            <div class="auto-assignment cursor-pointer" @click="autoWater">自动分配</div>
          </div>
        </div>
      </div>

      <div class="item-list scroll-Y" style="overflow-y: auto; padding-bottom: 80px;">
        <div class="mr-3 ml-3 mt-4">
          <div v-if="accordionItems.length > 0">
            <AccordionItem
              :items="accordionItems"
              @updateWater="handleUpdateWater"
              @updateTemperature="handleUpdateTemperature"
              @updateVelocity="handleUpdateVelocity"
              @updateTime="handleUpdateTime"
              @updateTotalWater="handleUpdateTotalWater"
              @updateActiveIndex="handleActiveIndexUpdate"
              @updateWaterInjectType="handleUpdateWaterInjectType"
            />
          </div>
          <van-empty v-else description="请添加分段注水" />
        </div>
      </div>

      <div class="footer fixed bottom-5 left-0 right-0 px-5 bg-white">
        <van-row gutter="12">
          <van-col span="6">
            <van-button block plain round type="primary" @click="step = 1">
              <van-icon name="arrow-left" size="22px" />
            </van-button>
          </van-col>
          <van-col span="12">
            <van-button block round type="primary" @click="saveFormula" v-if="!isShare">
              {{ id ? (isEdit ? '保存' : '另存为') : '创建配方' }}
            </van-button>
            <van-button block round type="primary" @click="saveFormula" v-else>另存为</van-button>
          </van-col>
          <van-col span="6">
            <van-button block plain round type="primary" @click="addFormula">
              <van-icon name="plus" size="19px" />
            </van-button>
          </van-col>
        </van-row>
      </div>
    </div>
  </div>

  <van-dialog v-model:show="confirmShow" :show-cancel-button="false" @confirm="successSure">
    <div class="confirm-main" style="padding: 30px 20px; text-align: center;">
      <div class="confirm-title" style="font-size: 18px; font-weight: bold; color: #222;">另存成功</div>
      <div class="confirm-content" style="margin-top: 15px; font-size: 14px; color: #999;">
        可在 <span style="color: #004097; cursor: pointer;" @click="toMyFormula">我的配方页面</span> 中查看此配方
      </div>
    </div>
  </van-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router' 
import { showToast, showLoadingToast, closeToast } from 'vant' 
import { useUserStore, useBluetoothStore } from '@/store'

// 🌟 引入滑塊組件與摺疊面板組件 
import HorizontalSlidert from '@/components/horizontal-slidert/horizontal-slidert.vue'
import AccordionItem from '../components/accordion-item/accordion-item.vue'

// 🗑️ 已經移除 httpPost, httpPut 與 useRequest，全面改用本地儲存

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const bluetoothStore = useBluetoothStore()

const step = ref<number>(1)
const confirmShow = ref<boolean>(false)
const name = ref<string>('')
const avatar = ref<string>(`https://api.dicebear.com/9.x/thumbs/svg?seed=${Math.random().toString(36).substring(2, 15)}`)
const grind = ref<boolean>(true)
const legumes = ref<number>(15)
const proportion = ref<number>(30)
const totalWaterVolume = ref<number>(225)
const gear = ref<number>(60)
const speed = ref<number>(120)
const nowWater = ref<number>(0)
const activeIndex = ref<number>(-1)
const accordionItems = ref<any[]>([])
const isEdit = ref(false)
const id = ref<number>(0)
const deviceId = ref(null)
const sort = ref('')
const sharedToDevice = ref<number>(0)
const isShare = ref<boolean>(false)

const clearName = () => { name.value = '' }

const handleBack = () => { router.back() }

const formulaTitle = computed(() => {
  return isEdit.value ? `编辑配方(${step.value}/2)` : `创建配方(${step.value}/2)`
})

const addFormula = () => {
  if (accordionItems.value.length > 4) {
    showToast({ type: 'fail', message: '您最多可以添加5条数据' })
    return
  }
  accordionItems.value.push({
    id: accordionItems.value.length + 1,
    paragraph: accordionItems.value.length === 0 ? '焖蒸' : `第${accordionItems.value.length}段`,
    percentage: 0,
    water: 0,
    temperature: 93,
    velocity: 3,
    time: 3,
    type: 0,
    paragraphFornt: false,
    paragraphAfter: false,
  })
}

onMounted(() => {
  if (bluetoothStore.connectionStatus === 'connected') {
    deviceId.value = bluetoothStore.connectedDevice?.productInfo?.id
  }

  const queryData = route.query.data as string
  if (queryData) {
    try {
      const decodedData = decodeURIComponent(queryData)
      const params = convertStrToPrimitive(JSON.parse(decodedData))
      accordionItems.value = params.accordionItems || []
      isEdit.value = params.isEdit
      isShare.value = params.isShare
      avatar.value = decodeURIComponent(params.avatar || '')
      deviceId.value = params.deviceId || deviceId.value
      id.value = params.id
      name.value = decodeURIComponent(params.name || '')
      sort.value = params.sort || 0
      sharedToDevice.value = params.sharedToDevice || 0
      gear.value = params.gear || 60
      grind.value = params.grind ?? true
      speed.value = params.speed || 120
      legumes.value = params.legumes || 15
      proportion.value = params.proportion || 30
      
      nowWater.value = accordionItems.value.reduce((total: number, item: any) => total + item.water, 0)
    } catch (e) {
      console.error('参数解析失败', e)
    }
  }
})

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

const handleUpdateWater = ({ index, newValue }: any) => {
  accordionItems.value[index].water = newValue
  accordionItems.value.forEach((item) => {
    item.percentage = ((item.water / totalWaterVolume.value) * 100).toFixed(0)
  })
}

const autoWater = () => {
  if (activeIndex.value < 0 || activeIndex.value >= accordionItems.value.length) {
    showToast({ type: 'fail', message: '无效的配方段落索引' })
    return
  }
  const remainingWater = totalWaterVolume.value - nowWater.value
  const maxWater = Math.min(remainingWater, 240) 
  const currentWater = accordionItems.value[activeIndex.value].water
  const newWater = Math.min(currentWater + maxWater, totalWaterVolume.value) 
  
  accordionItems.value[activeIndex.value].water = newWater 
  accordionItems.value[activeIndex.value].percentage = Math.round((newWater / totalWaterVolume.value) * 100)
  nowWater.value += newWater - currentWater

  if (maxWater <= 0) {
    showToast({ type: 'fail', message: '没有可分配的水量' })
    negativeCorrection.value = 0
  }
}

const successSure = () => {
  confirmShow.value = false
  router.replace('/pages-coffeeb/myFormula/myFormula')
}

const handleUpdateWaterInjectType = ({ index, type }: any) => { accordionItems.value[index].type = type }
const handleUpdateTemperature = ({ index, newValue }: any) => { accordionItems.value[index].temperature = newValue }
const handleUpdateVelocity = ({ index, newValue }: any) => { accordionItems.value[index].velocity = newValue }
const handleUpdateTime = ({ index, newValue }: any) => { accordionItems.value[index].time = newValue }
const handleUpdateTotalWater = (newValue: any) => { nowWater.value = newValue }
const handleSliderChangeSpeed = (value: number) => { speed.value = value }
const handleActiveIndexUpdate = (index: any) => { activeIndex.value = index }

const negativeCorrection = ref<number>(0)
watch([totalWaterVolume, nowWater], ([newTotal, newNow]) => {
  negativeCorrection.value = newTotal - newNow
})

// 🚀 核心改寫：本地儲存邏輯
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
    showToast({ type: 'fail', message: '请检查水量是否分配正确' })
    return
  }
  if (accordionItems.value.length < 2) {
    closeToast()
    showToast({ type: 'fail', message: '请添加至少2个配方段落' })
    return
  }

  accordionItems.value = accordionItems.value
    .filter((item) => item.water !== 0)
    .map((item, index) => ({
      ...item,
      paragraph: index === 0 ? '焖蒸' : `第${index}段`,
    }))

  // 1. 讀取目前的本地配方庫
  try {
    const LOCAL_RECIPES_KEY = 'bincoo_my_recipes'
    const localStr = localStorage.getItem(LOCAL_RECIPES_KEY)
    let recipes = localStr ? JSON.parse(localStr) : []

    // 2. 打包要儲存的資料
    const recipeData: any = {
      deviceId: deviceId.value,
      userId: userStore.userInfo?.id || '',
      name: name.value,
      imageUrl: avatar.value,
      sort: Number(sort.value),
      sharedToDevice: Number(sharedToDevice.value),
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
      // 【編輯模式】
      recipeData.id = id.value
      const index = recipes.findIndex((r: any) => r.id === id.value)
      if (index !== -1) {
        recipes[index] = { ...recipes[index], ...recipeData } // 覆蓋舊資料
      } else {
        recipes.unshift(recipeData) // 找不到就當作新的塞到最前面
      }
    } else {
      // 【新增/另存為模式】：給予全新的時間戳 ID
      recipeData.id = Date.now()
      recipes.unshift(recipeData)
    }

    // 3. 寫回 LocalStorage
    localStorage.setItem(LOCAL_RECIPES_KEY, JSON.stringify(recipes))
    closeToast()

    // 4. 跳轉與提示
    if (id.value && !isEdit.value && isShare.value) {
      // 從分享進來，選擇另存為
      confirmShow.value = true
    } else {
      showToast({ type: 'success', message: '保存成功' })
      router.replace('/pages-coffeeb/myFormula/myFormula')
    }

  } catch (error) {
    closeToast()
    console.error('儲存本地配方失敗:', error)
    showToast({ type: 'fail', message: '保存失败，请检查浏览器储存空间' })
  }
}

const toMyFormula = () => { router.replace('/pages-coffeeb/myFormula/myFormula') }

const handleSliderChangeCoffeeBeans = (value: number) => { legumes.value = value }
const handleSliderChangeProportion = (value: number) => { proportion.value = value }
const handleSliderChangeGear = (value: number) => { gear.value = value }

watch([legumes, proportion], ([newLegumes, newProportion]) => {
  totalWaterVolume.value = (newLegumes * newProportion) / 2
  const total = totalWaterVolume.value
  accordionItems.value.forEach((item) => {
    item.percentage = total > 0 ? ((item.water / total) * 100).toFixed(0) : 0
  })
})

const dangweiType = computed(() => {
  const dangwei = gear.value
  if (dangwei > 82) return '法压冷萃'
  if (dangwei > 47 && dangwei <= 82) return '手冲咖啡'
  if (dangwei > 23 && dangwei <= 47) return '爱乐压'
  if (dangwei > 0 && dangwei <= 23) return '意式浓缩'
  return '' 
})
</script>

<style lang="scss" scoped>
.scroll-Y {
  height: calc(100vh - 170px);
}
.auto-assignment {
  width: 80px;
  height: 32px;
  border-radius: 16px;
  background-color: #004097;
  color: #ffffff;
  line-height: 32px;
  text-align: center;
  font-size: 12px;
}
.item-list {
  height: calc(100vh - 250px);
}
.name-box {
  min-height: 86px;
  padding-right: 14px;
  padding-left: 14px;
  font-size: 14px;
  color: #004097;
  border: 1px solid #ebf0f7;
  border-radius: 9px;
}
.switch-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 59px;
  padding: 0 14px;
  font-size: 14px;
  color: #004097;
  background-color: white;
  border: 1px solid #ebf0f7;
  border-radius: 9px;
}

.divider {
  display: inline-block;
  width: 1px;
  height: 10px;
  background-color: #e6e6e6;
}
.over-color {
  color: #e51f4d;
}
.footer {
  padding-top: 16px;
  padding-bottom: 20px;
  border-top: 1px solid #f1f1f1;
}
</style>