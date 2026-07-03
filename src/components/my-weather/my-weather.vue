<!-- 使用外部API和风天气 -->
<template>
  <view :class="'weather ' + weatherClass" v-if="loading">
    <view class="p-5">
      <wd-row>
        <wd-col :span="6">
          <image :src="getIconPath(icon)" mode="scaleToFill" class="h-10 w-10"></image>
        </wd-col>
        <wd-col :span="18">
          <wd-text :text="tempMin + '-' + tempMax + unit" bold size="26px" color="black" />
        </wd-col>
      </wd-row>
      <view class="mt-2 text-coolGray" style="font-size: 12px">
        <wd-row>
          <wd-col :span="24">
            <wd-row>
              <wd-col :span="6">{{ $t('components.weather') }}</wd-col>
              <wd-col :span="6">{{ $t('components.humidity') }}</wd-col>
              <wd-col :span="6">{{ $t('components.wind') }}</wd-col>
            </wd-row>
            <wd-row>
              <wd-col :span="6">{{ textDay }}</wd-col>
              <wd-col :span="6">{{ humidity }}%</wd-col>
              <wd-col :span="6">{{ windSpeedDay }}/km</wd-col>
            </wd-row>
          </wd-col>
        </wd-row>
      </view>
    </view>
    <!--晴-->
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
//获取当前语言 以及 温度单位
//温度单位
import { useTemperatureStore } from '@/store'
const unitStore = useTemperatureStore()

// 定义 icon 变量
const loading = ref<boolean>(false)
const weatherClass = ref<string>('sunny')
const icon = ref<string>('103') // 初始化为空字符串
const weatherData = ref<AnyObject>({})
//当天天气
const textDay = ref<string>('')
//最高气温
const tempMax = ref<number>(0)
//最低气温
const tempMin = ref<number>(0)
//湿度
const humidity = ref<number>(0)
//风向
const windDirDay = ref<string>('')
//风速
const windSpeedDay = ref<number>(0)
// 初始化 Store 时从缓存读取单位
const lang = ref<string>('')
const unit = ref<string>('')
//当前位置经纬度
const longitude = ref<number>(0)
const latitude = ref<number>(0)
const key = ref<string>('b0cdf4fb24d440bf85652eedd03c9731')

// 获取已保存的语言设置
const getStoredLanguage = () => {
  try {
    const storedLanguage = uni.getStorageSync('selectedLanguage')
    return storedLanguage ? storedLanguage : uni.getLocale()
  } catch (error) {
    console.error('Error getting stored language:', error)
    return uni.getLocale()
  }
}

// 获取图标路径的方法
function getIconPath(iconName: string): string {
  console.log(`http://bincooshop.oss-cn-beijing.aliyuncs.com/water/icons/${iconName}.svg`)
  return `http://bincooshop.oss-cn-beijing.aliyuncs.com/water/icons/${iconName}.svg`
}
// 每次进入页面触发
onShow(() => {
  const language = getStoredLanguage().toLowerCase()
  unitStore.initFromCache()
  //代表已改变环境 重新进行加载API接口
  if (lang.value != language || unitStore.unit != unit.value) {
    unit.value = unitStore.unit
    lang.value = language
    getWeather()
  }
})

// 页面加载完成时触发
onLoad(() => {
  //初始化
  lang.value = getStoredLanguage().toLowerCase() //转换小写
  unitStore.initFromCache()
  unit.value = unitStore.unit

  uni.getLocation({
    type: 'wgs84',
    geocode: true, // 设置该参数为true可直接获取经纬度及城市信息
    success: function (res) {
      longitude.value = res.longitude
      latitude.value = res.latitude
      getWeather()
    },
    fail: function () {
      loading.value = false
      console.log('获取地理位置失败')
    },
  })
})

const getWeather = () => {
  uni.request({
    url:
      'https://devapi.qweather.com/v7/weather/3d?location=' +
      longitude.value +
      ',' +
      latitude.value +
      '&key=' +
      key.value +
      '&lang=' +
      lang.value,
    header: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    method: 'GET',
    sslVerify: true,
    success: ({ data, statusCode }) => {
      console.log('weather:', data)
      if (statusCode === 200) {
        // 假设 data 可能是 string, AnyObject 或 ArrayBuffer 类型
        if (typeof data === 'string') {
          weatherData.value = JSON.parse(data)
        } else if (data instanceof ArrayBuffer) {
          // 将 ArrayBuffer 转换为字符串
          const str = new TextDecoder().decode(new Uint8Array(data))
          weatherData.value = JSON.parse(str)
        } else if (typeof data === 'object') {
          // 如果 data 已经是一个对象，则不需要解析
          weatherData.value = data
        }

        //图标赋值
        icon.value = weatherData.value.daily[0].iconDay
        //获取第一天的天气  根据天气类型判断 动态Class
        textDay.value = weatherData.value.daily[0].textDay
        //最高气温
        tempMax.value = weatherData.value.daily[0].tempMax
        //最低气温
        tempMin.value = weatherData.value.daily[0].tempMin
        //风向
        windDirDay.value = weatherData.value.daily[0].windDirDay
        //风俗
        windSpeedDay.value = weatherData.value.daily[0].windSpeedDay
        //湿度
        humidity.value = weatherData.value.daily[0].humidity

        // 根据 unit 转换温度
        changeUnit()

        //动态切换Class
        if (textDay.value.includes('晴')) {
          weatherClass.value = 'sunny'
        } else if (textDay.value.includes('云') || textDay.value.includes('阴')) {
          weatherClass.value = 'cloudy'
        } else if (textDay.value.includes('雨')) {
          weatherClass.value = 'rainy'
        } else if (textDay.value.includes('雪')) {
          weatherClass.value = 'snowy'
        } else {
          weatherClass.value = 'sunny'
        }

        //成功加载
        loading.value = true
      } else {
        //加载失败
        loading.value = false
      }
    },
    fail: (error) => {
      console.log(error)
      loading.value = false
    },
  })
}

const changeUnit = () => {
  // 根据 unit 转换温度
  if (unit.value === '°C') {
    tempMax.value = Math.round(tempMax.value)
    tempMin.value = Math.round(tempMin.value)
  } else if (unit.value === '°F') {
    tempMax.value = Math.round((tempMax.value * 9) / 5 + 32)
    tempMin.value = Math.round((tempMin.value * 9) / 5 + 32)
  }
}
</script>

<style scoped>
.weather {
  position: relative;
  display: inline-block;
  width: 100%;
  background: linear-gradient(90deg, #ffffff 0%, #ace0f9 100%);
  border-radius: 10px;
  box-shadow:
    rgba(0, 0, 0, 0.16) 0px 3px 6px,
    rgba(0, 0, 0, 0.23) 0px 3px 6px;
}
.sunny:before {
  position: absolute;
  top: 50%;
  left: 80%;
  z-index: 2;
  width: 60px;
  height: 60px;
  content: '';
  background: #f6d963;
  border-radius: 50%;
  box-shadow: 0 0 20px #ff0;
  transform: translate(-50%, -50%);
}
.sunny:after {
  position: absolute;
  top: 50%;
  left: 80%;
  z-index: 1;
  width: 90px;
  height: 90px;
  margin: -45px 0 0 -45px;
  clip-path: polygon(
    50% 0%,
    65.43% 25%,
    93.3% 25%,
    78.87% 50%,
    93.3% 75%,
    64.43% 75%,
    50% 100%,
    35.57% 75%,
    6.7% 75%,
    21.13% 50%,
    6.7% 25%,
    35.57% 25%
  );
  content: '';
  background: #ffeb3b;
  animation: sunScale 2s linear infinite;
}
@keyframes sunScale {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
.cloudy:before,
.rainy:before,
.snowy:before {
  position: absolute;
  top: 50%;
  left: 70%;
  z-index: 2;
  width: 36px;
  height: 36px;
  content: '';
  background: #fff;
  border-radius: 50%;
  box-shadow:
    #fff 22px -15px 0 6px,
    #fff 57px -6px 0 2px,
    #fff 87px 4px 0 -4px,
    #fff 33px 6px 0 6px,
    #fff 61px 6px 0 2px,
    #ccc 29px -23px 0 6px,
    #ccc 64px -14px 0 2px,
    #ccc 94px -4px 0 -4px;
  transform: translate(-50%, -50%);
}
.cloudy:before {
  animation: cloudMove 2s linear infinite;
}
@keyframes cloudMove {
  0% {
    transform: translate(-50%, -50%);
  }
  50% {
    transform: translate(-50%, -60%);
  }
  100% {
    transform: translate(-50%, -50%);
  }
}
.rainy:after {
  position: absolute;
  top: 50%;
  left: 70%;
  width: 4px;
  height: 14px;
  content: '';
  background: #fff;
  border-radius: 2px;
  box-shadow:
    #fff 25px -10px 0,
    #fff 50px 0 0,
    #fff 75px -10px 0,
    #fff 0 25px 0,
    #fff 25px 15px 0,
    #fff 50px 25px 0,
    #fff 75px 15px 0,
    #fff 0 50px 0,
    #fff 25px 40px 0,
    #fff 50px 50px 0,
    #fff 75px 40px 0;
  animation: rainDrop 2s linear infinite;
}
@keyframes rainDrop {
  0% {
    transform: translate(0, 0) rotate(10deg);
  }
  100% {
    box-shadow:
      #fff 25px -10px 0,
      #fff 50px 0 0,
      #fff 75px -10px 0,
      #fff 0 25px 0,
      #fff 25px 15px 0,
      #fff 50px 25px 0,
      #fff 75px 15px 0,
      rgba(255, 255, 255, 0) 0 50px 0,
      rgba(255, 255, 255, 0) 25px 40px 0,
      rgba(255, 255, 255, 0) 50px 50px 0,
      rgba(255, 255, 255, 0) 75px 40px 0;
    transform: translate(-4px, 24px) rotate(10deg);
  }
}
.snowy:after {
  position: absolute;
  top: 50%;
  left: 70%;
  width: 8px;
  height: 8px;
  content: '';
  background: #fff;
  border-radius: 50%;
  box-shadow:
    #fff 25px -10px 0,
    #fff 50px 0 0,
    #fff 75px -10px 0,
    #fff 0 25px 0,
    #fff 25px 15px 0,
    #fff 50px 25px 0,
    #fff 75px 15px 0,
    #fff 0 50px 0,
    #fff 25px 40px 0,
    #fff 50px 50px 0,
    #fff 75px 40px 0;
  animation: snowDrop 2s linear infinite;
}
@keyframes snowDrop {
  0% {
    transform: translateY(0);
  }
  100% {
    box-shadow:
      #fff 25px -10px 0,
      #fff 50px 0 0,
      #fff 75px -10px 0,
      #fff 0 25px 0,
      #fff 25px 15px 0,
      #fff 50px 25px 0,
      #fff 75px 15px 0,
      rgba(255, 255, 255, 0) 0 50px 0,
      rgba(255, 255, 255, 0) 25px 40px 0,
      rgba(255, 255, 255, 0) 50px 50px 0,
      rgba(255, 255, 255, 0) 75px 40px 0;
    transform: translateY(25px);
  }
}
</style>
