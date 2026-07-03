<template>
  <div class="accordion-container">
    <div
      v-for="(item, index) in items"
      :key="item.id"
      class="accordion-item"
      :class="{ 'is-active': activeIndex === index }"
    >
      <wd-swipe-action>
        <view class="accordion-header" @click="handleHeaderClick(index)">
          <!-- 左侧 -->
          <div class="left-section">
            <div class="line">
              <span>{{ item.paragraph }}</span>
            </div>
            <div class="line">
              <span class="percentage">
                {{ item.percentage }}
                <span class="font-size-6">%</span>
              </span>
            </div>
          </div>
          <!-- 右侧 -->
          <div class="right-section flex">
            <div>
              <div>
                <span>{{ item.water }}ml</span>
              </div>
              <div class="mt-2">
                <span>
                  <!-- 中心 -->
                  <view v-if="item.type == 0" class="flex justify-center items-center">
                    <!-- <wd-img :width="17" :height="17" src="/static/images/formula/center2.png" /> -->
                    <i class="iconfont icon-juzhong icon-size-13"></i>
                    <text class="ml-1">中心</text>
                  </view>
                  <!-- 螺旋 -->
                  <view v-if="item.type == 1" class="flex justify-center items-center">
                    <!-- <wd-img :width="17" :height="17" src="/static/images/formula/spiral2.png" /> -->
                    <i class="iconfont icon-luoxuan icon-size-13"></i>
                    <text class="ml-1">螺旋</text>
                  </view>
                  <!-- 环绕 -->
                  <view v-if="item.type == 2" class="flex justify-center items-center">
                    <!-- <wd-img :width="17" :height="17" src="/static/images/formula/surround2.png" /> -->
                    <i class="iconfont icon-huanrao icon-size-13"></i>
                    <view class="ml-1">环绕</view>
                  </view>
                </span>
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
            <div class="flex-1 flex justify-end items-center">
              <wd-img
                :width="34"
                v-if="activeIndex === index"
                :height="34"
                src="/static/images/formula/up.png"
              />
              <wd-img :width="34" v-else :height="34" src="/static/images/formula/down.png" />
            </div>
          </div>
        </view>
        <template #right>
          <view class="action-box">
            <wd-img
              :width="34"
              :height="34"
              src="/static/images/formula/del.png"
              @click="deleteItem(index)"
            />
          </view>
        </template>
      </wd-swipe-action>
      <!-- 展开内容 -->
      <div v-if="activeIndex === index" class="accordion-content">
        <view class="buttonClass">
          <view
            class="type-button-group"
            :class="{ active: item.type === i.type }"
            v-for="i in injectionTypeSet"
            :key="i"
            @click="handleTypeClick(index, i.type)"
          >
            <i :class="['iconfont', i.icon, 'icon-size-13']"></i>
            <text class="ml-1">{{ i.text }}</text>
          </view>
        </view>
        <!-- 水量 -->
        <horizontal-slidert
          :initialValue="item.water"
          sliderText="水量"
          @slider-change="handleSliderChangeWater"
          :maxSliderValue="240"
          :minSliderValue="0"
          unitValue="ml"
          :stepSize="1"
          :showValue="true"
          sliderHeight="108rpx"
          :numberSize="20"
        />
        <view class="mt-3"></view>
        <!-- 水温 -->
        <horizontal-slidert
          :initialValue="item.temperature"
          sliderText="水温"
          @slider-change="handleSliderChangeTemperature"
          :maxSliderValue="95"
          :minSliderValue="40"
          unitValue="°C"
          :stepSize="1"
          :showValue="true"
          sliderHeight="108rpx"
          :numberSize="20"
        />
        <view class="mt-3"></view>
        <!-- 流速 驻留时间 -->
        <wd-row :gutter="20">
          <wd-col :span="12">
            <horizontal-slidert
              :initialValue="item.velocity"
              sliderText="流速"
              frontDecimal="3."
              @slider-change="handleSliderChangeVelocity"
              :maxSliderValue="8"
              :minSliderValue="0"
              unitValue="ml/s"
              :stepSize="1"
              :showValue="true"
              :isHorizontal="true"
              :isVertical="false"
              sliderHeight="108rpx"
              :numberSize="20"
            />
          </wd-col>
          <wd-col :span="12">
            <horizontal-slidert
              :initialValue="item.time"
              sliderText="驻留时间"
              @slider-change="handleSliderChangeTime"
              :maxSliderValue="59"
              :minSliderValue="0"
              unitValue="s"
              :stepSize="1"
              :showValue="true"
              :isHorizontal="true"
              :isVertical="false"
              sliderHeight="108rpx"
              :numberSize="20"
            />
          </wd-col>
        </wd-row>
        <view class="mt-3"></view>
        <!-- 暂时不需要没有这个功能 -->
        <view v-if="false">
          <wd-row :gutter="20">
            <wd-col :span="12">
              <view class="switchClass">
                <view class="bodyClass">
                  <wd-switch v-model="item.paragraphFornt" size="24px" />
                  <text class="textClass">段前震动</text>
                </view>
              </view>
            </wd-col>
            <wd-col :span="12">
              <view class="switchClass">
                <view class="bodyClass">
                  <wd-switch v-model="item.paragraphAfter" size="24px" />
                  <text class="textClass">段后震动</text>
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
import { ref } from 'vue'
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
    const activeIndex = ref(-1) // 当前展开的索引
    const totalWater = ref(0) // 用于存储总水量
    const injectionTypeSet = ref([
      {
        icon: 'icon-juzhong',
        text: '中心注水',
        type: 0,
      },
      {
        icon: 'icon-luoxuan',
        text: '螺旋注水',
        type: 1,
      },
      {
        icon: 'icon-huanrao',
        text: '环绕注水',
        type: 2,
      },
    ])
    // 注水类型选择
    const handleTypeClick = (index, type) => {
      emit('updateWaterInjectType', { index, type })
    }
    const handleSliderChangeWater = (value) => {
      const index = activeIndex.value
      emit('updateWater', { index, newValue: value })
      totalWater.value = calculateTotalWater() // 计算新的总水量
      emit('updateTotalWater', totalWater.value) // 发送总水量给父组件
    }

    // 计算总水量的函数（根据你的需求调整）
    const calculateTotalWater = () => {
      return props.items.reduce((acc, item) => acc + item.water, 0)
    }

    const handleSliderChangeTemperature = (value) => {
      const index = activeIndex.value
      emit('updateTemperature', { index, newValue: value })
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
      emit('updateActiveIndex', activeIndex.value) // 发送当前展开的索引
    }

    const deleteItem = (index) => {
      props.items.splice(index, 1)
      totalWater.value = calculateTotalWater()
      emit('updateTotalWater', totalWater.value)
    }

    const handleHeaderClick = (index) => {
      togglePanel(index)
    }
    // 监听 items 的变化，特别是 water 的变化
    watch(
      () => props.items,
      (newItems) => {
        console.log(newItems, 'newItems')
        totalWater.value = calculateTotalWater() // 更新总水量
        console.log('总水量更新:', totalWater.value)
      },
      { deep: true }, // 深度监听，以捕获数组中每个对象的变化
    )

    return {
      activeIndex,
      injectionTypeSet,
      handleTypeClick,
      handleHeaderClick,
      deleteItem,
      handleSliderChangeWater,
      handleSliderChangeTemperature,
      handleSliderChangeVelocity,
      handleSliderChangeTime,
    }
  },
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
  box-sizing: border-box; /* 确保 padding 和 border 包含在总高度中 */
  // margin-bottom: 10px; /* 面板之间的间距 */
  overflow: hidden;
  border-top: 1px solid #f3f3f3;
  font-family: 'DigitalNumbers';
}
.accordion-item:nth-last-child(1) {
  border-bottom: 1px solid #f3f3f3;
}
.accordion-header {
  box-sizing: border-box; /* 确保 padding 和 border 包含在总高度中 */
  display: flex;
  justify-content: space-between;
  padding: 10px;
  // cursor: pointer;
  // background-color: #f3f3f3;
  // border: 1px solid #e1e1e1;
  border-radius: 12px;
}
.is-active .accordion-header {
  // background-color: #ddd;
  // border-bottom-right-radius: 0;
  // border-bottom-left-radius: 0;
}

.accordion-content {
  box-sizing: border-box; /* 确保 padding 和 border 包含在总高度中 */
  padding: 0 10px 10px 10px;
  border-top: none;
  border-bottom-right-radius: 12px;
  border-bottom-left-radius: 12px;
}
/* Left and Right Section Styles */
.left-section,
.right-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.left-section {
  width: 220rpx;
  margin-right: 10px; /* Ensure space between left and right sections */
}

.right-section {
  display: flex;
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: start;
  font-size: 28rpx;
}

.line {
  display: flex;
  align-items: center;
  margin-bottom: 5px; /* Space between lines */
}
.bodyClass {
  position: relative; // 使 .desc 的绝对定位生效
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 10px; // 添加内边距，使 wd-switch 距离左上角 10px
}
.textClass {
  position: absolute;
  right: 10px;
  font-size: 18px;
}
.switchClass {
  margin-top: -20rpx;
  :deep(.wd-radio__label) {
    border-radius: 4px;
  }
}
.buttonClass {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 18rpx;
  margin-bottom: 32rpx;
  .type-button-group {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 70rpx;
    font-size: 12px;
    color: #666666;
    background: #f5f5f5;
    border-radius: 7px;
    .icon-juzhong,
    .icon-luoxuan,
    .icon-huanrao {
      font-size: 28rpx;
    }
  }
  .active {
    color: #004097;
    background: rgba(0, 64, 151, 0.08);
  }
}
:deep(.wd-radio) {
  :deep(.wd-radio__label) {
    border-radius: 4px;
  }
}
.percentage {
  font-size: 64rpx;
  color: #004097;
}
.action-box {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  margin-left: 20rpx;
}
.icon-size-13 {
  font-size: 26rpx !important;
}
</style>
