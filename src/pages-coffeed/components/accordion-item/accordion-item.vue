<template>
  <div class="w-full max-w-[600px] mx-auto">
    <div
      v-for="(item, index) in items"
      :key="item.id"
      class="relative box-border overflow-hidden border-t border-gray-100 last:border-b"
      :class="{ 'is-active': activeIndex === index }"
    >
      <wd-swipe-action>
        <view class="box-border flex justify-start py-5 px-1.5 rounded-lg cursor-pointer" @click="handleHeaderClick(index)">
          <view class="flex-1">
            <view class="flex items-center justify-start leading-none">
              <view class="w-[26px] h-[26px] mr-[11px] leading-[26px] text-white text-center bg-danger-strong rounded-xl">
                {{ index + 1 }}
              </view>
              <view class="text-[32px] text-brand">
                {{
                  generateDwellTimeRanges(
                    index,
                    items.map((vas) => vas.time),
                  )
                }}
              </view>
            </view>
            
            <view class="flex items-center justify-start mt-4 text-sm leading-none text-gray-900">
              <view>{{ item.water }}ml</view>
              <view class="px-2.5 text-gray-300">|</view>
              <view>3.{{ item.velocity }}ml/s</view>
              <view class="px-2.5 text-gray-300">|</view>
              
              <view class="flex items-center">
                <view v-if="item.type == 0" class="flex items-center justify-center">
                  <i class="iconfont icon-juzhong text-[14px]"></i>
                  <text class="ml-1">中心</text>
                </view>
                <view v-if="item.type == 1" class="flex items-center justify-center">
                  <i class="iconfont icon-luoxuan text-[14px]"></i>
                  <text class="ml-1">螺旋</text>
                </view>
                <view v-if="item.type == 2" class="flex items-center justify-center">
                  <i class="iconfont icon-huanrao text-[14px]"></i>
                  <view class="ml-1">環繞</view>
                </view>
              </view>
              
              <view class="px-2.5 text-gray-300">|</view>
              <view>駐留{{ item.time }}s</view>
            </view>
          </view>
          
          <view class="flex items-center justify-center w-[50px]">
            <div class="flex flex-1 items-center justify-end">
              <wd-img
                :width="34"
                v-if="activeIndex === index"
                :height="34"
                src="/static/images/formula/up.png"
              />
              <wd-img :width="34" v-else :height="34" src="/static/images/formula/down.png" />
            </div>
          </view>
        </view>

        <template #right>
          <view class="flex items-center justify-center h-full ml-2.5">
            <wd-img
              :width="34"
              :height="34"
              src="/static/images/formula/del.png"
              @click="deleteItem(index)"
            />
          </view>
        </template>
      </wd-swipe-action>

      <div v-if="activeIndex === index" class="box-border px-2.5 rounded-b-lg">
        
        <view class="grid grid-cols-3 gap-[9px] mb-4">
          <view
            class="flex items-center justify-center h-[35px] text-xs rounded-md cursor-pointer transition-colors"
            :class="item.type === i.type ? 'text-brand bg-brand-overlay' : 'text-gray-600 bg-gray-50'"
            v-for="i in injectionTypeSet"
            :key="i"
            @click="handleTypeClick(index, i.type)"
          >
            <i :class="['iconfont', i.icon, 'text-[14px]']"></i>
            <text class="ml-1">{{ i.text }}</text>
          </view>
        </view>

        <horizontal-slidert
          :initialValue="item.water"
          sliderText="水量"
          @slider-change="handleSliderChangeWater"
          :maxSliderValue="240"
          :minSliderValue="0"
          unitValue="ml"
          :stepSize="1"
          :showValue="true"
          sliderHeight="56px"
          borderSize="2px"
          :numberSize="20"
        />
        <view class="mt-4"></view>

        <view class="flex items-center justify-between">
          <view class="text-sm text-brand">流速</view>
          <view class="flex flex-row items-center justify-end w-[200px]">
            <view class="flex flex-row items-center justify-center h-4 text-sm text-gray-600 cursor-pointer" @click="item.flexibleFixation = 1">
              <view
                class="flex items-center justify-center w-4 h-4 border rounded-full"
                :class="item.flexibleFixation === 1 ? 'border-brand' : 'border-gray-500'"
              >
                <i
                  class="iconfont icon-3 icon-a-ci-yql-check-circleCopy text-brand text-[12px] leading-none scale-75"
                  v-if="item.flexibleFixation === 1"
                ></i>
              </view>
              <view class="ml-1.5">靈活</view>
            </view>
            <view class="flex flex-row items-center justify-center h-4 ml-6 text-sm text-gray-600 cursor-pointer" @click="item.flexibleFixation = 2">
              <view
                class="flex items-center justify-center w-4 h-4 border rounded-full"
                :class="item.flexibleFixation === 2 ? 'border-brand' : 'border-gray-500'"
              >
                <i
                  class="iconfont icon-3 icon-a-ci-yql-check-circleCopy text-brand text-[12px] leading-none scale-75"
                  v-if="item.flexibleFixation === 2"
                ></i>
              </view>
              <view class="ml-1.5">固定</view>
            </view>
          </view>
        </view>
        <view class="mt-4"></view>

        <horizontal-slidert
          :initialValue="item.velocity"
          sliderText="流速"
          frontDecimal="3."
          @slider-change="handleSliderChangeVelocity"
          :maxSliderValue="5"
          :minSliderValue="0"
          unitValue="ml/s"
          :stepSize="1"
          :showValue="true"
          sliderHeight="56px"
          borderSize="2px"
          :numberSize="20"
        />
        <view class="mt-4"></view>

        <horizontal-slidert
          :initialValue="item.time"
          sliderText="駐留時間"
          @slider-change="handleSliderChangeTime"
          :maxSliderValue="59"
          :minSliderValue="0"
          unitValue="s"
          :stepSize="1"
          :showValue="true"
          sliderHeight="56px"
          borderSize="2px"
          :numberSize="20"
        />
        <view class="mt-4"></view>

        <view v-if="false">
          <wd-row :gutter="20">
            <wd-col :span="12">
              <view class="-mt-2.5 custom-switch">
                <view class="relative flex items-start justify-start p-2.5">
                  <wd-switch v-model="item.paragraphFornt" size="24px" />
                  <text class="absolute right-2.5 text-[18px]">段前震動</text>
                </view>
              </view>
            </wd-col>
            <wd-col :span="12">
              <view class="-mt-2.5 custom-switch">
                <view class="relative flex items-start justify-start p-2.5">
                  <wd-switch v-model="item.paragraphAfter" size="24px" />
                  <text class="absolute right-2.5 text-[18px]">段後震動</text>
                </view>
              </view>
            </wd-col>
          </wd-row>
        </view>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue' // 增加了遺漏的 watch 引入
import horizontalSlidert from '@/components/horizontal-slidert/horizontal-slidert.vue'

export default {
  components: { horizontalSlidert },
  props: {
    items: {
      type: Array,
      required: true,
    },
  },
  setup(props, { emit }) {
    const activeIndex = ref(-1) // 當前展開的索引
    const totalWater = ref(0) // 用於儲存總水量
    const injectionTypeSet = ref([
      {
        icon: 'icon-juzhong',
        text: '中心',
        type: 0,
      },
      {
        icon: 'icon-luoxuan',
        text: '螺旋',
        type: 1,
      },
      {
        icon: 'icon-huanrao',
        text: '環繞',
        type: 2,
      },
    ])
    
    // 注水類型選擇
    const handleTypeClick = (index, type) => {
      emit('updateWaterInjectType', { index, type })
    }

    const handleSliderChangeWater = (value) => {
      const index = activeIndex.value
      emit('updateWater', { index, newValue: value })
      totalWater.value = calculateTotalWater() // 計算新的總水量
      emit('updateTotalWater', totalWater.value) // 發送總水量給父組件
    }

    // 計算總水量的函數
    const calculateTotalWater = () => {
      return props.items.reduce((acc, item) => acc + item.water, 0)
    }

    const handleSliderChangeVelocity = (value) => {
      const index = activeIndex.value
      emit('updateVelocity', { index, newValue: value })
    }
    
    const handleSliderChangeTime = (value) => {
      const index = activeIndex.value
      emit('updateTime', { index, newValue: value })
    }

    const togglePanel = (index) => {
      if (activeIndex.value === index) {
        activeIndex.value = -1
      } else {
        activeIndex.value = index
      }
      emit('updateActiveIndex', activeIndex.value) // 發送當前展開的索引
    }

    const deleteItem = (index) => {
      props.items.splice(index, 1)
      totalWater.value = calculateTotalWater()
      emit('updateTotalWater', totalWater.value)
    }

    const handleHeaderClick = (index) => {
      togglePanel(index)
    }
    
    // 監聽 items 的變化，特別是 water 的變化
    watch(
      () => props.items,
      (newItems) => {
        console.log(newItems, 'newItems')
        totalWater.value = calculateTotalWater() // 更新總水量
        console.log('總水量更新:', totalWater.value)
      },
      { deep: true }, // 深度監聽，以捕獲陣列中每個物件的變化
    )

    /**
     * 將秒數轉換為分:秒格式 (MM:SS)
     * @param {number} seconds - 秒數
     * @returns {string} 格式化的時間字串
     */
    const formatSecondsToMMSS = (seconds) => {
      if (seconds < 0 || seconds === undefined || seconds === null) return '00:00'

      // 確保是數字
      const secNum = Number(seconds)
      if (isNaN(secNum)) return '00:00'

      const mins = Math.floor(secNum / 60)
      const secs = secNum % 60

      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    /**
     * 生成駐留時間區間陣列（按照示例規則）
     * @param {Array<number>} dwellTimesArray - 駐留時間陣列（單位：秒）
     * @returns {Array<string>} 處理好的時間區間陣列
     */
    const generateDwellTimeRanges = (index, dwellTimesArray) => {
      // 參數驗證：確保輸入是陣列
      if (!Array.isArray(dwellTimesArray)) {
        console.error('generateDwellTimeRanges: 參數必須是陣列', dwellTimesArray)
        return []
      }

      // 最多只處理5筆資料
      const times = dwellTimesArray.slice(0, 5)
      const result = []
      let total = 0

      times.forEach((currentTime, index) => {
        // 確保當前時間是數字
        const timeValue = Number(currentTime)
        if (isNaN(timeValue)) {
          result.push('00:00 - 00:00')
          return
        }

        const startSeconds = total + index
        const endSeconds = total + timeValue + index

        const startTime = formatSecondsToMMSS(startSeconds)
        const endTime = formatSecondsToMMSS(endSeconds)
        result.push(`${startTime} - ${endTime}`)

        total += timeValue
      })

      return result[index]
    }

    return {
      activeIndex,
      injectionTypeSet,
      handleTypeClick,
      handleHeaderClick,
      deleteItem,
      handleSliderChangeWater,
      handleSliderChangeVelocity,
      handleSliderChangeTime,
      generateDwellTimeRanges,
    }
  },
}
</script>

<style scoped>
/* 僅保留無法被 Tailwind Utility 覆蓋的深度 UI 庫樣式 */
.custom-switch {
  :deep(.wd-radio__label) {
    border-radius: 4px;
  }
}
</style>