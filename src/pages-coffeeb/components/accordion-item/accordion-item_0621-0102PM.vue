<template>
  <div class="accordion-container">
    <div
      v-for="(item, index) in items"
      :key="item.id"
      class="accordion-item"
      :class="{ 'is-active': activeIndex === index }"
    >
      <van-swipe-cell>
        <div class="accordion-header cursor-pointer" @click="handleHeaderClick(index)">
          <div class="left-section">
            <div class="line"><span>{{ item.paragraph }}</span></div>
            <div class="line">
              <span class="percentage">
                {{ item.percentage }}<span class="font-size-6">%</span>
              </span>
            </div>
          </div>
          
          <div class="right-section flex">
            <div>
              <div><span>{{ item.water }}ml</span></div>
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
              <div><span class="ml-2">{{ item.temperature }}℃</span></div>
              <div class="mt-2"><span class="ml-2">3.{{ item.velocity }}ml/s</span></div>
            </div>
            <div class="flex-1 flex justify-end items-center pr-2">
              <van-image width="34" height="34" :src="activeIndex === index ? '/static/images/formula/up.png' : '/static/images/formula/down.png'" />
            </div>
          </div>
        </div>
        
        <template #right>
          <div class="action-box bg-red-50" @click="deleteItem(index)" style="height: 100%; display: flex; align-items: center; padding: 0 15px;">
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
          @slider-change="(val) => handleSliderChangeWater(val)"
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
          @slider-change="(val) => handleSliderChangeTemperature(val)"
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
              @slider-change="(val) => handleSliderChangeVelocity(val)"
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
              @slider-change="(val) => handleSliderChangeTime(val)"
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
import { ref, watch } from 'vue'
import HorizontalSlidert from '@/components/horizontal-slidert/horizontal-slidert.vue'

const props = defineProps({ items: { type: Array as () => any[], required: true } })
const emit = defineEmits([
  'updateWaterInjectType', 'updateWater', 'updateTotalWater', 
  'updateTemperature', 'updateVelocity', 'updateTime', 'updateActiveIndex'
])

const activeIndex = ref(-1)
const totalWater = ref(0)
const injectionTypeSet = ref([
  { icon: 'icon-juzhong', text: '中心注水', type: 0 },
  { icon: 'icon-luoxuan', text: '螺旋注水', type: 1 },
  { icon: 'icon-huanrao', text: '环绕注水', type: 2 },
])

const calculateTotalWater = () => props.items.reduce((acc, item) => acc + item.water, 0)

const handleTypeClick = (index: number, type: number) => emit('updateWaterInjectType', { index, type })

const handleSliderChangeWater = (value: number) => {
  emit('updateWater', { index: activeIndex.value, newValue: value })
  totalWater.value = calculateTotalWater()
  emit('updateTotalWater', totalWater.value)
}

const handleSliderChangeTemperature = (value: number) => emit('updateTemperature', { index: activeIndex.value, newValue: value })
const handleSliderChangeVelocity = (value: number) => emit('updateVelocity', { index: activeIndex.value, newValue: value })
const handleSliderChangeTime = (value: number) => emit('updateTime', { index: activeIndex.value, newValue: value })

const togglePanel = (index: number) => {
  activeIndex.value = activeIndex.value === index ? -1 : index
  emit('updateActiveIndex', activeIndex.value)
}

const deleteItem = (index: number) => {
  props.items.splice(index, 1)
  totalWater.value = calculateTotalWater()
  emit('updateTotalWater', totalWater.value)
}

const handleHeaderClick = (index: number) => togglePanel(index)

watch(() => props.items, () => { totalWater.value = calculateTotalWater() }, { deep: true })
</script>

<style lang="scss" scoped>
.accordion-container { width: 100%; max-width: 600px; margin: 0 auto; }
.accordion-item { position: relative; box-sizing: border-box; overflow: hidden; border-top: 1px solid #f3f3f3; font-family: 'DigitalNumbers'; }
.accordion-item:nth-last-child(1) { border-bottom: 1px solid #f3f3f3; }
.accordion-header { box-sizing: border-box; display: flex; justify-content: space-between; padding: 10px; border-radius: 12px; }
.accordion-content { box-sizing: border-box; padding: 0 10px 10px 10px; border-bottom-right-radius: 12px; border-bottom-left-radius: 12px; }
.left-section, .right-section { display: flex; flex-direction: column; justify-content: center; }
.left-section { width: 110px; margin-right: 10px; }
.right-section { display: flex; flex: 1; flex-direction: row; align-items: center; justify-content: start; font-size: 14px; }
.line { display: flex; align-items: center; margin-bottom: 5px; }
.buttonClass { display: grid; grid-template-columns: repeat(3, 1fr); grid-gap: 9px; margin-bottom: 16px; }
.type-button-group { display: flex; align-items: center; justify-content: center; height: 35px; font-size: 12px; color: #666666; background: #f5f5f5; border-radius: 7px; }
.type-button-group .active { color: #004097; background: rgba(0, 64, 151, 0.08); }
.percentage { font-size: 32px; color: #004097; }
</style>