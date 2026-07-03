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
          <van-icon name="arrow-left" size="22" color="#000000" style="font-weight: bold;" />
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

        <div class="px-4 py-2 text-sm" style="color: #999999; background-color: #f7f8fa;">
          冲煮参数
        </div>

        <div class="m3">
          <div class="mb-4">
            <horizontal-slidert
              ref="legumesSlider"
              :initialValue="legumes"
              sliderText="咖啡粉"
              @slider-change="handleSliderChange"
              :maxSliderValue="40"
              :minSliderValue="5"
              unitValue="g"
              :stepSize="1"
              :showValue="true"
            />
          </div>
          <div class="mb-4">
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
        </div>

        <div class="px-4 py-2 text-sm" style="color: #999999; background-color: #f7f8fa;">
          研磨设置
        </div>

        <div class="m3">
          <div class="flex justify-between items-center py-2 border-b border-gray-100">
            <div style="font-size: 16px; color: #333;">研磨</div>
            <van-switch v-model="grind" active-color="#004097" inactive-color="#dcdee0" size="24px" />
          </div>

          <div v-if="grind" class="mt-4">
            <div class="mb-4">
              <horizontal-slidert
                ref="gearSlider"
                :initialValue="gear"
                sliderText="档位"
                @slider-change="handleSliderChangeGear"
                :maxSliderValue="100"
                :minSliderValue="1"
                :unitValue="dangweiType"
                :stepSize="1"
                :showValue="true"
              />
            </div>
            <div class="mb-4">
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
      <div class="fixed bottom-0 left-0 right-0 p-3 bg-white" style="box-shadow: 0 -2px 10px rgba(0,0,0,0.05);">
        <van-button type="primary" block round color="#004097" @click="nextStep">下一步</van-button>
      </div>
    </div>
  </div>

  <div v-if="step === 2">
    <div style="height: 100vh; background-color: #f7f8fa;">
      <van-nav-bar
        fixed
        placeholder
        :border="false"
        title="注水设置"
        left-arrow
        @click-left="step = 1"
      >
        <template #left>
          <van-icon name="arrow-left" size="22" color="#000000" style="font-weight: bold;" />
        </template>
      </van-nav-bar>

      <div class="m3 item-list" style="overflow-y: auto;">
        <div class="bg-white rounded-lg p-3 mb-3 flex items-center justify-between shadow-sm">
          <div class="text-sm">
            <div style="color: #666">预计总注水量: <span style="color: #004097; font-weight: bold; font-size: 16px;">{{ totalWaterVolume }}ml</span></div>
            <div class="mt-1" style="color: #666">当前阶段总和: <span :style="{ color: isWaterMatch ? '#07c160' : '#ff976a', fontWeight: 'bold' }">{{ currentTotalWater }}ml</span></div>
          </div>
          <div class="text-xs text-right">
            <div v-if="isWaterMatch" style="color: #07c160;">✨ 分配合理</div>
            <div v-else style="color: #ff976a;">⚠️ 差额 {{ negativeCorrection }}ml</div>
          </div>
        </div>

        <accordion-item
          ref="accordionRef"
          :items="accordionItems"
          :maxWater="totalWaterVolume"
          @updateWater="handleUpdateWater"
          @updateTemperature="handleUpdateTemperature"
          @updateVelocity="handleUpdateVelocity"
          @updateTime="handleUpdateTime"
          @updateTotalWater="handleUpdateTotalWater"
          @updateActiveIndex="handleActiveIndexUpdate"
          @updateWaterInjectType="handleUpdateWaterInjectType"
        />
      </div>

      <div class="fixed bottom-0 left-0 right-0 p-3 bg-white flex justify-between" style="box-shadow: 0 -2px 10px rgba(0,0,0,0.05);">
        <van-button plain type="primary" round color="#004097" style="width: 48%;" @click="pushItems">增加阶段</van-button>
        <van-button type="primary" round color="#004097" style="width: 48%;" @click="addFormula">完成</van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import AccordionItem from '../components/accordion-item/accordion-item.vue'
import HorizontalSlidert from '@/components/horizontal-slidert/horizontal-slidert.vue'

const router = useRouter()
const route = useRoute()

const step = ref(1)
const name = ref('')
const legumes = ref(15)
const proportion = ref(30)
const totalWaterVolume = ref(225)
const grind = ref(true)
const gear = ref(60)
const speed = ref(120)

const accordionRef = ref(null)
const accordionItems = ref<any[]>([])

const isEdit = ref(false)
const id = ref<any>(null)

const handleBack = () => {
  router.back()
}

const formulaTitle = computed(() => {
  return isEdit.value ? '编辑配方 (1/2)' : '创建配方 (1/2)'
})

// 🌟 核心防禦：確保用 ID 去抓最新資料，拒絕任何舊網址的快取！
onMounted(() => {
  try {
    const queryId = route.query.id as string
    const isEditMode = route.query.isEdit === 'true'

    if (queryId) {
      const localStr = localStorage.getItem('bincoo_my_recipes')
      if (localStr) {
        const allRecipes = JSON.parse(localStr)
        const targetRecipe = allRecipes.find((r: any) => String(r.id) === String(queryId))
        
        if (targetRecipe && targetRecipe.configJson) {
          isEdit.value = isEditMode
          id.value = isEditMode ? targetRecipe.id : null
          name.value = isEditMode ? targetRecipe.name : targetRecipe.name + ' (副本)'

          const config = targetRecipe.configJson
          legumes.value = Number(config.legumes) || 15
          proportion.value = Number(config.proportion) || 30
          grind.value = config.grind !== undefined ? config.grind : true
          gear.value = Number(config.gear) || 60
          speed.value = Number(config.speed) || 120
          
          if (config.accordionItems && Array.isArray(config.accordionItems)) {
            accordionItems.value = JSON.parse(JSON.stringify(config.accordionItems))
          }
          totalWaterVolume.value = Math.round((legumes.value * proportion.value) / 2)
          return // 成功載入最新資料，提早結束
        }
      }
    }

    // 全新創建模式
    isEdit.value = false
    id.value = null
    totalWaterVolume.value = Math.round((legumes.value * proportion.value) / 2)
    accordionItems.value = [
      { paragraph: '焖蒸', water: 30, temperature: 92, time: 30, velocity: 3, type: 0 },
      { paragraph: '第 1 段', water: 195, temperature: 92, time: 120, velocity: 3, type: 0 }
    ]
  } catch (error) {
    console.error('初始化失敗:', error)
  }
})

const addFormula = () => {
  let flag = false
  let totalValue = 0
  accordionItems.value.forEach((item) => {
    if (item.water == 0 || item.temperature == 0 || item.time == 0) flag = true
    totalValue += Number(item.water)
  })

  if (flag) { showToast('参数不能为0'); return }
  if (totalWaterVolume.value !== totalValue) { showToast('水量分配不等于预计总水量'); return }

  const currentConfig = {
    legumes: legumes.value, proportion: proportion.value,
    grind: grind.value, gear: gear.value, speed: speed.value,
    accordionItems: accordionItems.value
  }

  const localStr = localStorage.getItem('bincoo_my_recipes')
  let currentList = localStr ? JSON.parse(localStr) : []

  if (isEdit.value && id.value) {
    const targetIndex = currentList.findIndex((item: any) => String(item.id) === String(id.value))
    if (targetIndex !== -1) {
      currentList[targetIndex].name = name.value || '未命名配方'
      currentList[targetIndex].configJson = currentConfig
    }
  } else {
    currentList.unshift({ id: Date.now(), name: name.value || '未命名配方', configJson: currentConfig })
  }

  localStorage.setItem('bincoo_my_recipes', JSON.stringify(currentList))
  showToast({ type: 'success', message: '保存成功！' })

  setTimeout(() => {
    router.back()
  }, 600)
}

const clearName = () => { name.value = '' }
const nextStep = () => {
  if (!name.value) { showToast('请输入配方名称'); return }
  step.value = 2
}

const currentTotalWater = computed(() => {
  return accordionItems.value.reduce((sum, item) => sum + (Number(item.water) || 0), 0)
})

const isWaterMatch = computed(() => currentTotalWater.value === totalWaterVolume.value)
const negativeCorrection = computed(() => totalWaterVolume.value - currentTotalWater.value)

const pushItems = () => {
  if (accordionItems.value.length >= 5) { showToast('最多支持 5 段注水'); return }
  accordionItems.value.push({
    paragraph: `第 ${accordionItems.value.length} 段`,
    water: 40, temperature: 92, time: 60, velocity: 3, type: 0
  })
}

const handleSliderChange = (value: number) => { legumes.value = value }
const handleSliderChangeProportion = (value: number) => { proportion.value = value }
const handleSliderChangeGear = (value: number) => { gear.value = value }
const handleSliderChangeSpeed = (value: number) => { speed.value = value }
const handleUpdateWater = (val: any) => { accordionItems.value[val.index].water = val.val }
const handleUpdateTemperature = (val: any) => { accordionItems.value[val.index].temperature = val.val }
const handleUpdateVelocity = (val: any) => { accordionItems.value[val.index].velocity = val.val }
const handleUpdateTime = (val: any) => { accordionItems.value[val.index].time = val.val }
const handleUpdateTotalWater = (val: number) => {}
const handleActiveIndexUpdate = (val: any) => {}
const handleUpdateWaterInjectType = (val: any) => { accordionItems.value[val.index].type = val.type }

watch([legumes, proportion], ([newLegumes, newProportion]) => {
  totalWaterVolume.value = Math.round((newLegumes * newProportion) / 2)
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
.scroll-Y { height: calc(100vh - 170px); }
.auto-assignment { width: 80px; height: 32px; border-radius: 16px; background-color: #004097; color: #ffffff; line-height: 32px; text-align: center; font-size: 12px; }
.item-list { height: calc(100vh - 250px); }
.name-box { min-height: 86px; padding-right: 14px; padding-left: 14px; font-size: 16px; color: #333; background-color: #f7f8fa; border-radius: 12px; }
</style>