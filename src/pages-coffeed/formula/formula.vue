<template>
  <view v-if="step === 1">
    <view style="height: 100vh; background-color: white">
      <wd-navbar
        safeAreaInsetTop
        custom-style="background-color: #ffffff;"
        custom-class="custom-navbar"
        left-arrow
        :bordered="false"
        :title="formulaTitle"
        @click-left="handleBack"
      >
        <template #left>
          <i class="iconfont icon-a-ze-arrow-leftCopy2 icon-size-22"></i>
        </template>
      </wd-navbar>
      <wd-toast />
      <scroll-view :scroll-y="scroll" class="scroll-Y">
        <view class="m3 flex items-center name-box">
          <view class="flex-1">
            <view>配方名称</view>
            <view class="mt-2">
              <wd-input
                type="text"
                no-border
                v-model="name"
                custom-input-class="custom-input"
                placeholder-style="font-size: 18px;color:#99b3d5;"
                placeholder="请输入您的配方名称..."
                :maxlength="12"
              />
            </view>
          </view>
          <view class="w-6" v-if="name" @click="clearName">
            <wd-img :width="24" :height="24" src="/static/images/formula/close.png" />
          </view>
        </view>
        <view class="mr-3 ml-3">
          <view class="">
            <horizontal-slidert
              ref="coffeeBeansSlider"
              :initialValue="legumes"
              :sliderText="t('components.kfdzl')"
              @slider-change="handleSliderChangeCoffeeBeans"
              :maxSliderValue="20"
              :minSliderValue="5"
              unitValue="g"
              :stepSize="1"
              :showValue="true"
            />
          </view>
          <view class="mt-3">
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
          </view>
          <view class="mt-3">
            <view class="switch-box">
              <view>
                <text>研磨：{{ grind ? 'on' : 'off' }}</text>
              </view>
              <view>
                <wd-switch v-model="grind" size="22px" inactive-color="#d3e1f1" />
              </view>
            </view>
          </view>
          <view v-if="grind">
            <view class="mt-3">
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
            </view>
            <view class="mt-3">
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
            </view>
          </view>
        </view>
      </scroll-view>

      <view class="footer fixed bottom-5 left-0 right-0 px-5">
        <!-- 编辑状态下显示 -->
        <wd-row :gutter="12" v-if="isEdit">
          <wd-col :span="9">
            <wd-button block size="large" @click="step = 2" plain>下一步</wd-button>
          </wd-col>
          <wd-col :span="15">
            <wd-button block @click="saveFormula" size="large">保存</wd-button>
          </wd-col>
        </wd-row>
        <!-- 非编辑状态下显示 -->
        <view v-else>
          <!-- 热门配方和分享配方另存为 -->
          <wd-row :gutter="12" v-if="accordionItems.length > 0">
            <wd-col :span="12">
              <wd-button block size="large" @click="step = 2" plain>
                {{ id ? '设置分段注水' : '下一步' }}
              </wd-button>
            </wd-col>
            <wd-col :span="12">
              <wd-button block @click="saveFormula" size="large">
                {{ id ? '另存为' : '保存' }}
              </wd-button>
            </wd-col>
          </wd-row>
          <!-- 我的配方新建配方 显示 -->
          <wd-button block v-else size="large" @click="step = 2">设置分段注水</wd-button>
        </view>
      </view>
    </view>
  </view>
  <view v-else>
    <view style="height: 100vh; background-color: white">
      <wd-navbar
        safeAreaInsetTop
        custom-style="background-color: #ffffff;"
        custom-class="custom-navbar"
        left-arrow
        :bordered="false"
        :title="formulaTitle"
        @click-left="handleBack"
      >
        <template #left>
          <i class="iconfont icon-a-ze-arrow-leftCopy2 icon-size-22"></i>
        </template>
      </wd-navbar>
      <wd-toast />
      <view class="mr-4 ml-4 mt-4">
        <view class="flex justify-between items-center">
          <view class="">
            <view class="font-size-6">注水</view>
            <view class="flex font-size-3.5 mt-2 justify-center items-center flex-direction-row">
              <view>{{ nowWater + '/' + totalWaterVolume + 'ml' }}</view>
              <view class="ml-2 mr-2 divider"></view>
              <view>
                待分配：
                <text :class="{ 'over-color': totalWaterVolume - nowWater < 0 }">
                  {{ negativeCorrection + 'ml' }}
                </text>
              </view>
            </view>
          </view>
          <view v-if="activeIndex !== -1">
            <view class="auto-assignment" @click="autoWater">自动分配</view>
          </view>
        </view>
      </view>

      <scroll-view :scroll-y="scroll" class="item-list">
        <view class="mr-3 ml-3 mt-4">
          <view v-if="accordionItems.length > 0">
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
          </view>
          <wd-status-tip v-else image="content" tip="请添加分段注水" />
        </view>
      </scroll-view>

      <view class="footer fixed bottom-5 left-0 right-0 px-5">
        <wd-row :gutter="12">
          <wd-col :span="6">
            <wd-button block size="large" @click="step = 1" plain>
              <wd-icon
                name="arrow-left1"
                size="22px"
                custom-style="font-weight: 500;"
                color="#004097"
              ></wd-icon>
            </wd-button>
          </wd-col>
          <wd-col :span="12">
            <!-- 我的配方创建和保存，热门配方另存为 -->
            <wd-button block @click="saveFormula" size="large" v-if="!isShare">
              {{ id ? (isEdit ? '保存' : '另存为') : '创建配方' }}
            </wd-button>
            <!-- 分享配方另存为 -->
            <wd-button block @click="saveFormula" size="large" v-else>另存为</wd-button>
          </wd-col>
          <wd-col :span="6">
            <wd-button block size="large" @click="addFormula" plain>
              <wd-icon
                name="add"
                size="19px"
                custom-style="font-weight: 500;"
                color="#004097"
              ></wd-icon>
            </wd-button>
          </wd-col>
        </wd-row>
      </view>
    </view>
  </view>
  <my-loading :loading="loading"></my-loading>
  <bc-confirm
    :show="confirmShow"
    :isCancel="false"
    :objData="objData"
    @close="confirmShow = false"
    @success="successSure"
  >
    <template v-slot:main>
      <view class="confirm-main">
        <view class="confirm-title">另存成功</view>
        <view class="confirm-content">
          可在
          <text @click="toMyFormula">我的配方页面</text>
          中查看此配方
        </view>
      </view>
    </template>
  </bc-confirm>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'wot-design-uni'
import { useUserStore, useBluetoothStore } from '@/store'
//import { t } from '@/locale/index'
import AccordionItem from '../components/accordion-item/accordion-item.vue'
import { httpPost, httpPut } from '@/utils/http'
// 动画
// 蓝牙相关
// import { sendStringData } from '@/utils/coffeebBlueTool'
const VITE_UPLOAD_BASEURL = import.meta.env.VITE_UPLOAD_BASEURL
// 使用 useUserStore
const userStore = useUserStore()
// 加载
const loading = ref<boolean>(false)
// 折叠面板 手风琴 分段
const value = ref<string[]>(['item1'])
const name = ref<string>('')
const avatar = ref<string>(
  `https://api.dicebear.com/9.x/thumbs/svg?seed=${Math.random().toString(36).substring(2, 15)}`,
)

// 精细化控制
const accurate = ref<boolean>(false)
// 研磨开关
const grind = ref<boolean>(true)
// 配方参数 ------------- START
// 咖啡粉
const legumes = ref<number>(15)
// 粉水比
const proportion = ref<number>(30)
// 预设计总水量
const totalWaterVolume = ref<number>(225)
// 档位
const gear = ref<number>(60)
// 转速
const speed = ref<number>(120)
// 当前配方列表总水量之和
const nowWater = ref<number>(0)
// 配方参数 ------------- END
// 其他参数
const activeIndex = ref<number>(-1)
const width = ref<number>(400)
const accordionItems = ref([])
const isEdit = ref(false)
const id = ref<number>(0)
const deviceId = ref(null)
const sort = ref('')
const sharedToDevice = ref<number>(0)
const isShare = ref<boolean>(false)
// ref 组件实例
// 滚动事件
const scroll = ref<boolean>(true)
const toast = useToast()
const bluetoothStore = useBluetoothStore()

const step = ref<number>(1)
const confirmShow = ref<boolean>(false)
const objData = {
  icon: '/static/images/popup/sucess.png',
  content: '',
  tips: '',
}
const clearName = () => {
  name.value = ''
}

const handleBack = () => {
  uni.navigateBack({})
}
const formulaTitle = computed(() => {
  if (isEdit.value) {
    return `编辑配方(${step.value}/2)`
  } else {
    return `创建配方(${step.value}/2)`
  }
})
// 添加配方
const addFormula = () => {
  if (accordionItems.value.length > 4) {
    toast.error('您最多可以添加5条数据')
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

// 获取路由参数
onLoad((options) => {
  if (options.data) {
    const decodedData = decodeURIComponent(options.data)
    const params = convertStrToPrimitive(JSON.parse(decodedData))
    console.log('解码后的参数:', params)
    accordionItems.value = params.accordionItems
    isEdit.value = params.isEdit
    isShare.value = params.isShare
    avatar.value = decodeURIComponent(params.avatar)
    deviceId.value = params.deviceId || ''
    id.value = params.id
    name.value = decodeURIComponent(params.name)
    sort.value = params.sort || 0
    sharedToDevice.value = params.sharedToDevice || 0
    gear.value = params.gear
    grind.value = params.grind
    speed.value = params.speed
    legumes.value = params.legumes
    proportion.value = params.proportion
    // userId.value = params.userId
    // 遍历 accordionItems 计算总水量并赋值给 nowWater
    nowWater.value = accordionItems.value.reduce((total, item) => {
      return total + item.water
    }, 0)
  }
})

const convertStrToPrimitive = (data) => {
  // 处理数组：遍历每一项递归转换
  if (Array.isArray(data)) {
    return data.map((item) => convertStrToPrimitive(item))
  }

  // 处理对象（排除null，typeof null === 'object'）
  if (typeof data === 'object' && data !== null) {
    const newObj = {}
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        newObj[key] = convertStrToPrimitive(data[key])
      }
    }
    return newObj
  }

  // 处理字符串：区分布尔字符串/数字字符串/普通字符串
  if (typeof data === 'string') {
    const trimStr = data.trim() // 去除首尾空格

    // 1. 匹配布尔值字符串（支持大小写，如"True"、"FALSE"）
    if (trimStr.toLowerCase() === 'true') {
      return true
    }
    if (trimStr.toLowerCase() === 'false') {
      return false
    }

    // 2. 匹配数字字符串（整数/小数/负数）
    const num = Number(trimStr)
    if (!isNaN(num)) {
      return num
    }

    // 3. 普通字符串：返回原字符串
    return data
  }

  // 其他类型（Number、Boolean、null、undefined等）：直接返回
  return data
}

onMounted(() => {
  // 获取到当前设备ID
  if (bluetoothStore.connectionStatus === 'connected') {
    deviceId.value = bluetoothStore.connectedDevice.productInfo.id
  } else {
    toast.error('蓝牙未连接')
  }

  console.log('当前设备ID：', deviceId)
  width.value = uni.getWindowInfo().windowWidth
})

// 配方段落组件操作
const handleUpdateWater = ({ index, newValue }) => {
  accordionItems.value[index].water = newValue
  // 计算每个配方的水量占总水量的百分比
  accordionItems.value.forEach((item) => {
    item.percentage = ((item.water / totalWaterVolume.value) * 100).toFixed(0) // 计算百分比
  })
}

const autoWater = () => {
  // 检查 activeIndex 是否有效
  if (activeIndex.value < 0 || activeIndex.value >= accordionItems.value.length) {
    toast.error('无效的配方段落索引')
    return
  }

  // 自动分配水量
  const remainingWater = totalWaterVolume.value - nowWater.value
  const maxWater = Math.min(remainingWater, 240) // 确定可以分配的最大水量
  console.log('当前总水量:', totalWaterVolume.value)
  console.log('当前已用水量:', nowWater.value)
  console.log('剩余水量:', remainingWater)

  // 获取当前的水量
  const currentWater = accordionItems.value[activeIndex.value].water
  console.log('当前水量:', currentWater)

  // 更新水量
  const newWater = Math.min(currentWater + maxWater, totalWaterVolume.value) // 确保不超过总水量
  console.log('新水量:', newWater)

  // 更新配方列表项
  accordionItems.value[activeIndex.value].water = newWater // 直接赋值
  accordionItems.value[activeIndex.value].percentage = Math.round(
    (newWater / totalWaterVolume.value) * 100,
  )
  console.log('更新后的当前水量:', nowWater.value)
  console.log('当前配方列表:', accordionItems.value)
  // 更新当前水量
  nowWater.value += newWater - currentWater // 计算实际增加的水量

  console.log('更新后的当前水量:', nowWater.value)
  // 如果没有剩余水量，提示并把剩余水量置为0
  if (maxWater <= 0) {
    toast.error('没有可分配的水量')
    negativeCorrection.value = 0
  }
}

const successSure = () => {
  confirmShow.value = false
  uni.redirectTo({
    url: '/pages-coffeeb/index/index',
  })
}

const handleUpdateWaterInjectType = ({ index, type }) => {
  accordionItems.value[index].type = type
}

const handleUpdateTemperature = ({ index, newValue }) => {
  accordionItems.value[index].temperature = newValue
}
const handleUpdateVelocity = ({ index, newValue }) => {
  accordionItems.value[index].velocity = newValue
}
const handleUpdateTime = ({ index, newValue }) => {
  accordionItems.value[index].time = newValue
}
const handleUpdateTotalWater = (newValue) => {
  nowWater.value = newValue
}

const handleSliderChangeSpeed = (value: number) => {
  speed.value = value
}

const handleActiveIndexUpdate = (index) => {
  // console.
  console.log('当前面板索引', index)

  activeIndex.value = index
}

// 负数矫正
const negativeCorrection = ref<number>(0)
watch([totalWaterVolume, nowWater], ([newTotal, newNow]) => {
  negativeCorrection.value = newTotal - newNow
})

// 保存配方参数
const saveFormula = () => {
  loading.value = true
  console.log('保存配方', accordionItems.value)
  // 判断名称是否填写
  if (name.value === '') {
    toast.error('请输入配方名称')
    step.value = 1
    loading.value = false
    return
  }
  // 判断水量是否正确
  if (totalWaterVolume.value - nowWater.value !== 0) {
    loading.value = false
    toast.error('请检查水量是否分配正确!')
    return
  }

  const hasInvalidItem = accordionItems.value.some((item) => {
    // 1. 处理属性可能为非数字的情况（如字符串、undefined）
    const water = Number(item.water)
    // 2. 核心判断：非数字值视为不满足，仅数字且 ≤0 时返回true
    return !isNaN(water) && water <= 0
  })
  if (hasInvalidItem) {
    loading.value = false
    toast.error('请检查水量是否分配正确')
    return
  }

  if (accordionItems.value.length < 2) {
    loading.value = false
    toast.error('请添加至少2个配方段落')
    return
  }

  // 删除 water 为 0 的项并重新定义 paragraph
  accordionItems.value = accordionItems.value
    .filter((item) => item.water !== 0) // 删除 water 为 0 的项
    .map((item, index) => {
      return {
        ...item,
        paragraph: index === 0 ? '焖蒸' : `第${index}段`,
      }
    })

  // 判断当前是否处于编辑状态且非分享状态
  if (isEdit.value && !isShare.value) {
    // 表示更新数据
    updateFormulaApi().then((response) => {
      if (response.code === 200) {
        loading.value = false
        toast.success(t('totast.error.bccg'))
        uni.redirectTo({ url: '/pages-coffeeb/myFormula/myFormula' })
      } else {
        loading.value = false
        toast.error(response.msg)
      }
    })
  } else {
    // 保存配方至服务器
    saveFormulaApi().then((response) => {
      console.log(response.data)

      if (response.code === 200) {
        // id.value = response.data // 配置id
        loading.value = false
        if (id.value) {
          confirmShow.value = true
        } else {
          toast.success(t('totast.error.bccg'))
          uni.redirectTo({ url: '/pages-coffeeb/myFormula/myFormula' })
        }
      } else {
        loading.value = false
        toast.error(response.msg)
      }
    })
  }

  // 跳转至我的配方页面
}
const toMyFormula = () => {
  uni.redirectTo({ url: '/pages-coffeeb/myFormula/myFormula' })
}
// 添加配方参数
const addDevice = async () => {
  // 构建配方字符串
  let formulaStr =
    `${isEdit.value ? 'C' : 'A'} ` + // 开始标识符：编辑模式用'C'，新增模式用'A'
    `${id.value} ` + // 配方id
    `${name.value} ` + // 配方名称
    `${accordionItems.value.length} ` + // 注水段数
    `${legumes.value} ` + // 咖啡粉
    `${totalWaterVolume.value} ` + // 总水量
    `${gear.value} ` + // 档位
    `${grind.value} ` // 研磨开关

  // 遍历最多5段配方数据
  for (let i = 0; i < 5; i++) {
    if (i < accordionItems.value.length) {
      const item = accordionItems.value[i]
      formulaStr +=
        '3.' +
        `${item.velocity} ` + // 1.流速
        `${item.water} ` + // 2.水量
        `${item.temperature} ` + // 3.水温
        `${item.type} ` + // 4.浇水type
        `${item.time} ` // 5.驻留时间
    } else {
      // 不足5段的用0填充
      formulaStr += '0 0 0 0 0 '
    }
  }

  formulaStr += 'kkkk' // 结束标识符

  try {
    console.log('配方字符串:', formulaStr)
    await sendStringData(formulaStr)
  } catch (error) {
    console.log(error)
  }
}

// 保存配方参数请求
const { run: saveFormulaApi } = useRequest<IResponseData>(() =>
  httpPost('/repice/repice', {
    deviceId: deviceId.value,
    userId: userStore.userInfo.id, // 用户id
    name: name.value,
    imageUrl: avatar.value,
    sort: Number(sort.value),
    sharedToDevice: Number(sharedToDevice.value), // 快速冲煮
    configJson: JSON.stringify({
      possible: false, // 是否可以直接冲煮
      legumes: legumes.value, // 咖啡粉
      proportion: proportion.value, // 粉水比
      grind: grind.value, // 研磨开关
      gear: gear.value, // 档位
      speed: speed.value, // 转速
      accordionItems: accordionItems.value, // 注水段数
    }), // 转换字符串  配方参数
  }),
)

const { run: updateFormulaApi } = useRequest<IResponseData>(() =>
  httpPut('/repice/repice', {
    id: id.value,
    deviceId: deviceId.value,
    userId: userStore.userInfo.id, // 用户id
    name: name.value,
    imageUrl: avatar.value,
    sort: Number(sort.value),
    sharedToDevice: Number(sharedToDevice.value),
    configJson: JSON.stringify({
      possible: false, // 是否可以直接冲煮
      legumes: legumes.value, // 咖啡粉
      proportion: proportion.value, // 粉水比
      grind: grind.value, // 研磨开关
      gear: gear.value, // 档位
      speed: speed.value, // 转速
      accordionItems: accordionItems.value, // 注水段数
    }), // 转换字符串  配方参数
  }),
)

const handleSliderChangeCoffeeBeans = (value: number) => {
  legumes.value = value
}

const handleSliderChangeProportion = (value: number) => {
  proportion.value = value
}

const handleSliderChangeGear = (value: number) => {
  gear.value = value
}

// 监听粉量和粉水比变化，并计算总水量  同时更新配方百分比
watch([legumes, proportion], ([newLegumes, newProportion]) => {
  totalWaterVolume.value = (newLegumes * newProportion) / 2
  console.log(`计算出的总水量: ${totalWaterVolume.value} ml`)
  const total = totalWaterVolume.value
  accordionItems.value.forEach((item) => {
    item.percentage = total > 0 ? ((item.water / total) * 100).toFixed(0) : 0
  })
})

const dangweiType = computed(() => {
  const dangwei = gear.value

  if (dangwei > 82) {
    return '法压冷萃'
  }

  if (dangwei > 47 && dangwei <= 82) {
    return '手冲咖啡'
  }

  if (dangwei > 23 && dangwei <= 47) {
    return '爱乐压'
  }

  if (dangwei > 0 && dangwei <= 23) {
    return '意式浓缩'
  }

  return '' // 如果 dangwei <= 0，则返回空字符串或其他默认值
})

// 计算属性，返回水量文本类型
const waterTextType = computed(() => {
  if (nowWater.value > totalWaterVolume.value) {
    return 'error'
  } else if (nowWater.value < totalWaterVolume.value) {
    return 'warning'
  } else {
    return 'success'
  }
})
</script>

<style lang="scss" scoped>
:deep(.wd-navbar__title) {
  font-size: 28rpx !important; // 标题字体（加!important确保生效）
  font-weight: 600 !important;
  color: black !important;
}
.scroll-Y {
  height: calc(100vh - 340rpx);
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
  height: calc(100vh - 500rpx);
}
.name-box {
  min-height: 172rpx;
  padding-right: 28rpx;
  padding-left: 28rpx;
  font-size: 28rpx;
  color: #004097;
  border: 1px solid #ebf0f7;
  border-radius: 18rpx;
  :deep(.custom-input) {
    font-size: 36rpx;
    color: #004097;
  }
}
.switch-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 118rpx;
  padding: 0 28rpx;
  font-size: 28rpx;
  color: #004097;
  background-color: white;
  border: 1rpx solid #ebf0f7;
  border-radius: 18rpx;
}

// 添加分割线样式
.divider {
  display: inline-block;
  width: 2rpx;
  height: 20rpx;
  background-color: #e6e6e6;
}
.over-color {
  color: #e51f4d;
}
.footer {
  padding-top: 32rpx;
  border-top: 1rpx solid #f1f1f1;
}
.confirm-main {
  text-align: center;
  .confirm-title {
    font-size: 28rpx;
    color: #222222;
  }
  .confirm-content {
    margin-top: 24rpx;
    font-size: 24rpx;
    color: #999999;
    text {
      color: #004097;
    }
  }
}
</style>
