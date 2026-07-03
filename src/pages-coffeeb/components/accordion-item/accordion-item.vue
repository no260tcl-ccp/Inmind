<template>
  <div class="accordion-container">
    <div
      v-for="(item, index) in items"
      :key="item.id || index"
      class="accordion-item"
      :class="{ 'is-active': activeIndex === index }"
    >
      <van-swipe-cell>
        <div class="accordion-header cursor-pointer" @click="handleHeaderClick(index)">
          <div class="left-section">
            <div class="line">
              <span>{{ item.paragraph }}</span>
            </div>
            <div class="line">
              <span class="percentage">
                {{ percentagesList[index] !== undefined ? percentagesList[index] : (item.percentage || 0) }}<span class="font-size-6">%</span>
              </span>
            </div>
          </div>
          <div class="right-section flex">
            <div>
              <div>
                <span>{{ item.water }}ml</span>
              </div>
              <div class="mt-2">
                <div v-if="item.type == 0" class="flex justify-center items-center">
                  <i class="iconfont icon-juzhong icon-size-13"></i>
                  <span class="ml-1">中心</span>
                </div>
                <div v-if="item.type == 1" class="flex justify-center items-center">
                  <i class="iconfont icon-luoxuan icon-size-13"></i>
                  <span class="ml-1">螺旋</span>
                </div>
                <div v-if="item.type == 2" class="flex justify-center items-center">
                  <i class="iconfont icon-huanrao icon-size-13"></i>
                  <span class="ml-1">环绕</span>
                </div>
              </div>
            </div>
            <div class="ml-4">
              <div>
                <span class="ml-2">{{ item.temperature }}℃</span>
              </div>
              <div class="mt-2">
                <span class="ml-2">3.{{ item.velocity }}ml/s</span>
              </div>
            </div>
            <div class="flex-1 flex justify-end items-center pr-2">
              <van-image
                width="34"
                height="34"
                :src="activeIndex === index ? '/static/images/formula/up.png' : '/static/images/formula/down.png'"
              />
            </div>
          </div>
        </div>

        <template #right>
          <div
            class="action-box bg-red-50"
            @click="deleteItem(index)"
            style="height: 100%; display: flex; align-items: center; padding: 0 15px;"
          >
            <van-image width="34" height="34" src="/static/images/formula/del.png" />
          </div>
        </template>
      </van-swipe-cell>

      <div v-if="activeIndex === index" class="accordion-content">
        <div class="buttonClass">
          <div
            class="type-button-group cursor-pointer"
            :class="{ active: item.type === i.type }"
            v-for="i in injectionTypeSet"
            :key="i.type"
            @click="handleTypeClick(index, i.type)"
          >
            <i :class="['iconfont', i.icon, 'icon-size-13']"></i>
            <span class="ml-1">{{ i.text }}</span>
          </div>
        </div>

        <horizontal-slidert
          :initialValue="item.water"
          sliderText="水量"
          @slider-change="handleSliderChangeWater($event, index)"
          :maxSliderValue="240"
          :minSliderValue="0"
          unitValue="ml"
          :stepSize="1"
          :showValue="true"
          sliderHeight="54px"
          :numberSize="20"
        />
        <div class="mt-3"></div>

        <horizontal-slidert
          :initialValue="item.temperature"
          sliderText="水温"
          @slider-change="handleSliderChangeTemperature($event, index)"
          :maxSliderValue="95"
          :minSliderValue="40"
          unitValue="°C"
          :stepSize="1"
          :showValue="true"
          sliderHeight="54px"
          :numberSize="20"
        />
        <div class="mt-3"></div>

        <van-row gutter="20">
          <van-col span="12">
            <horizontal-slidert
              :initialValue="item.velocity"
              sliderText="流速"
              frontDecimal="3."
              @slider-change="handleSliderChangeVelocity($event, index)"
              :maxSliderValue="8"
              :minSliderValue="0"
              unitValue="ml/s"
              :stepSize="1"
              :showValue="true"
              :isHorizontal="true"
              :isVertical="false"
              sliderHeight="54px"
              :numberSize="20"
            />
          </van-col>
          <van-col span="12">
            <horizontal-slidert
              :initialValue="item.time"
              sliderText="驻留时间"
              @slider-change="handleSliderChangeTime($event, index)"
              :maxSliderValue="59"
              :minSliderValue="0"
              unitValue="s"
              :stepSize="1"
              :showValue="true"
              :isHorizontal="true"
              :isVertical="false"
              sliderHeight="54px"
              :numberSize="20"
            />
          </van-col>
        </van-row>
        <div class="mt-3"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'
import HorizontalSlidert from '@/components/horizontal-slidert/horizontal-slidert.vue'

const props = defineProps({
  items: {
    type: Array as () => any[],
    required: true,
  },
  totalWaterVolume: {
    type: Number,
    required: true,
    default: 225
  },
  // 💡 接收父組件專門管理的平坦百分比陣列
  percentagesList: {
    type: Array as () => number[],
    default: () => []
  }
})

// 💡 依照您的提議，加入 updateWaterPercentage 事件！
const emit = defineEmits([
  'updateWaterInjectType',
  'updateWater',
  'updateTotalWater',
  'updateTemperature',
  'updateVelocity',
  'updateTime',
  'updateActiveIndex',
  'deleteItem',
  'updateWaterPercentage' 
])

const activeIndex = ref(-1)

const injectionTypeSet = ref([
  { icon: 'icon-juzhong', text: '中心注水', type: 0 },
  { icon: 'icon-luoxuan', text: '螺旋注水', type: 1 },
  { icon: 'icon-huanrao', text: '环绕注水', type: 2 },
])

const calculateTotalWater = () => {
  return props.items.reduce((acc, item) => acc + (Number(item.water) || 0), 0)
}

const handleTypeClick = (index: number, type: number) => {
  emit('updateWaterInjectType', { index, type })
}

const handleSliderChangeWater = (value: any, index: number) => {
  const w = Number(value || 0)
  
  // 1. 發送原本的水量更新
  emit('updateWater', { index, newValue: w })
  
  // 2. 💡 實作您的完美思路：子組件算好百分比，觸發新事件發射出去！
  const pct = props.totalWaterVolume > 0 ? Math.round((w / props.totalWaterVolume) * 100) : 0
  emit('updateWaterPercentage', { index, percentage: pct })
  
  emit('updateTotalWater', calculateTotalWater() - (props.items[index].water || 0) + w)
}

const handleSliderChangeTemperature = (value: any, index: number) => {
  emit('updateTemperature', { index, newValue: value })
}

const handleSliderChangeVelocity = (value: any, index: number) => {
  emit('updateVelocity', { index, newValue: value })
}

const handleSliderChangeTime = (value: any, index: number) => {
  emit('updateTime', { index, newValue: value })
}

const togglePanel = (index: number) => {
  activeIndex.value = activeIndex.value === index ? -1 : index
  emit('updateActiveIndex', activeIndex.value)
}

const deleteItem = (index: number) => {
  emit('deleteItem', index)
}

const handleHeaderClick = (index: number) => {
  togglePanel(index)
}
</script>

<style lang="scss" scoped>
.accordion-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}
.accordion-item {
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  border-top: 1px solid #f3f3f3;
  font-family: 'DigitalNumbers';
}
.accordion-item:nth-last-child(1) {
  border-bottom: 1px solid #f3f3f3;
}
.accordion-header {
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-radius: 12px;
}
.accordion-content {
  box-sizing: border-box;
  padding: 0 10px 10px 10px;
  border-bottom-right-radius: 12px;
  border-bottom-left-radius: 12px;
}
.left-section,
.right-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.left-section {
  width: 110px;
  margin-right: 10px;
}
.right-section {
  display: flex;
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: start;
  font-size: 14px;
}
.line {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}
.buttonClass {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 9px;
  margin-bottom: 16px;
}
.type-button-group {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 35px;
  font-size: 12px;
  color: #666666;
  background: #f5f5f5;
  border-radius: 7px;
}
.type-button-group.active {
  color: #004097;
  background: rgba(0, 64, 151, 0.08);
}
.percentage {
  font-size: 32px;
  color: #004097;
}
</style>