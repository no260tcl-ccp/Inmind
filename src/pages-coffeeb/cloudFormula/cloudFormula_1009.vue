<template>
  <div class="h-screen overflow-y-auto bg-white pb-10">
    <!-- 热门配方 -->
    <div class="hot-list">
      <div class="flex justify-between items-center px-5 pt-5 mb-4">
        <div class="text-lg font-bold text-gray-800">热门配方</div>
        <div v-if="hotList.length > 0" class="text-sm text-gray-500">
          <span class="font-bold text-gray-800">{{ currentHotIndex + 1 }}</span>
          <span class="text-xs">/{{ hotList.length }}</span>
        </div>
      </div>

      <van-swipe
        v-if="hotList.length > 0"
        class="h-48 px-4"
        :loop="false"
        :width="280"
        :show-indicators="false"
        @change="changeHotSwiper"
      >
        <van-swipe-item v-for="(item, index) in hotList" :key="index" class="pr-4">
          <div class="flex flex-col h-full cursor-pointer">
            <div class="h-full mb-4">
              <div
                class="relative h-full p-4 text-white bg-center bg-no-repeat bg-cover rounded-2xl shadow-sm"
                :style="{
                  backgroundImage: `url(${cdnBaseUrl}/97b213a04c4d7e9e6a6e5a17b2f35052d988a229e55f68d4946a79a440a64bbe.png)`,
                }"
                @click.stop="itemClick(item, index)"
              >
                <!-- 配置按鈕 -->
                <div
                  @click.stop="showShare(item)"
                  class="absolute top-1.5 right-1.5 flex items-center justify-center w-16 h-7 text-xs text-blue-800 bg-white rounded-tr-2xl rounded-bl-2xl cursor-pointer"
                >
                  配置
                  <i class="iconfont icon-a-svg10 ml-1 text-[10px]"></i>
                </div>
                
                <!-- 標題與提示 -->
                <div>
                  <div class="text-base font-bold">{{ item.name }}</div>
                  <div class="mt-1 text-xs opacity-60">{{ item.configJson.tips }}</div>
                </div>
                
                <!-- 數據區塊 -->
                <div class="flex mt-8 text-xs">
                  <div class="flex-1">
                    <div class="opacity-60">咖啡粉</div>
                    <div class="mt-1 text-sm font-bold">
                      {{ item.configJson.legumes }}
                      <span class="text-xs font-normal">g</span>
                    </div>
                  </div>
                  <div class="flex-1">
                    <div class="opacity-60">粉水比</div>
                    <div class="mt-1 text-sm font-bold">
                      {{
                        item.configJson.proportion
                          ? `1:${(item.configJson.proportion / 2).toFixed(1)}`
                          : '-'
                      }}
                      {{
                        item.configJson.proportion
                          ? (item.configJson.proportion / 2) * item.configJson.legumes
                          : '-'
                      }}
                      <span class="text-xs font-normal" v-if="item.configJson.proportion">ml</span>
                    </div>
                  </div>
                  <div class="flex-1 pl-2">
                    <div class="opacity-60">研磨档位</div>
                    <div class="mt-1 text-sm font-bold">
                      {{ item.configJson.gear }}
                      <span class="text-xs font-normal">{{ dangweiType(item.configJson.gear) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </van-swipe-item>
      </van-swipe>
      
      <div v-else class="mt-5">
        <van-empty image="/static/images/common/no-data1.png" description="配方更新中，敬请期待~" />
      </div>
    </div>

    <!-- 精密萃取 -->
    <div class="extract-list mt-6">
      <div class="flex justify-between items-center px-5 pt-5 mb-4">
        <div class="text-lg font-bold text-gray-800">精密萃取</div>
        <div v-if="dataList.length > 0" class="text-sm text-gray-500">
          <span class="font-bold text-gray-800">{{ currentIndex + 1 }}</span>
          <span class="text-xs">/{{ dataList.length }}</span>
        </div>
      </div>

      <van-swipe
        v-if="dataList.length > 0"
        class="px-4 min-h-[400px]"
        :loop="false"
        :show-indicators="false"
        @change="changeSwiper"
      >
        <van-swipe-item v-for="(item, index) in dataList" :key="index">
          <div class="flex flex-col w-full px-1">
            <div class="list-content w-full">
              <!-- 列表卡片 -->
              <div
                class="flex mb-4 p-2 bg-white rounded-lg cursor-pointer"
                v-for="(el, elIndex) in item.list"
                :key="elIndex"
                @click="itemClick(el, elIndex)"
              >
                <!-- 左側圖片 -->
                <div class="relative flex items-center justify-center shrink-0 max-h-[78px]">
                  <van-image width="78" height="78" :src="el.configJson.bgUrl" fit="contain" />
                  <div
                    class="absolute -bottom-3 right-1 font-roboto text-4xl font-bold tracking-tighter drop-shadow-sm"
                    :style="{ color: el.configJson.textColor }"
                  >
                    {{ el.configJson.accordionItems ? el.configJson.accordionItems.length : '' }}
                  </div>
                </div>
                
                <!-- 右側文字 -->
                <div class="flex flex-col justify-center pl-3 overflow-hidden text-xs text-gray-500">
                  <div class="mb-1 text-sm font-bold text-gray-800 truncate">{{ el.name }}</div>
                  <div class="line-clamp-2 leading-relaxed">
                    {{ el.configJson.tips }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </van-swipe-item>
      </van-swipe>
      
      <div v-else class="mt-5">
        <van-empty image="/static/images/common/no-data1.png" description="配方更新中，敬请期待~" />
      </div>
    </div>
  </div>

  <!-- 全域彈窗組件 (維持不變) -->
  <bc-confirm
    :show="isUse"
    :objData="objData"
    :isCancel="false"
    @close="isUse = false"
    @success="finishBack"
  ></bc-confirm>
  
  <bc-share
    :show="shareShow"
    @close="closeShare"
    :objData="shareData"
    @shareToCoffeeMachine="sendFormula"
  />
  
  <bc-action-sheet 
    :show="sheetShow" 
    @close="closeSheet" 
    :objData="sheetData" 
    @success="start" 
  />
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { useBluetoothStore, useMachineBStatusStore } from '@/store'
import { dangweiType, retry, stringToUTF8Array } from '@/utils'
import { CoffeeMachineProtocol } from '@/utils/coffeebBlueTool'

// 加上這行直接引入 JSON (請根據您檔案的實際相對位置調整路徑，例如 '../../static/data/recipes.json')
import rawData from '@/static/data/recipes.json'

const router = useRouter()
const coffeeMachineProtocol = CoffeeMachineProtocol.getInstance()
const machineStatusStore = useMachineBStatusStore()
const bluetoothStore = useBluetoothStore()

const cdnBaseUrl = import.meta.env.VITE_CDN_BASE_URL || 'https://cdn.bincoocoffee.cn'
const formulaBgList = [
  {
    url: `${cdnBaseUrl}/a4fe367f3bf4c0ab36b4b932689d57bb3456610c1daa287e66aa44268a528373.png`,
    color: '#F5ABBD',
  },
  {
    url: `${cdnBaseUrl}/753a976ec38d2c7c62784cfb711880923b4b2bd9a926c8a92f7ef539e946db3b.png`,
    color: '#A1B9D9',
  },
  {
    url: `${cdnBaseUrl}/7af32880c9244e35fa97b89de490fbd2beb6c6221ae1f58e07c2ed79ed1a71b1.png`,
    color: '#99CEB3',
  },
  {
    url: `${cdnBaseUrl}/ce2564f7e0e213f415624a2a8001d4d3a8b9a85743e23b7db308b73a37a8e16f.png`,
    color: '#D9C1A1',
  },
]

const hotList = ref<any[]>([])
const dataList = ref<any[]>([])
const isUse = ref(false)
const shareShow = ref(false)
const shareData = ref({})
const sheetShow = ref(false)
const sheetData = ref({})

const objData = {
  icon: '/static/images/popup/sucess.png',
  content: `配方配置成功`,
  tips: '专属于您的美味，已准备就绪~',
}

const currentIndex = ref(0)
const currentHotIndex = ref(0)

// Vant 的 change 事件直接回傳 index
const changeSwiper = (index: number) => {
  currentIndex.value = index
}
const changeHotSwiper = (index: number) => {
  currentHotIndex.value = index
}

const runStatus = ref(machineStatusStore.runStatus)

watch(
  () => machineStatusStore.runStatus,
  (newStatus) => {
    runStatus.value = newStatus
  },
  { immediate: true },
)

const fetchLocalRecipes = () => { //async () => {
  try {
    //const response = await fetch('/static/data/recipes.json')
    //const rawData = await response.json()
    const recipes = Array.isArray(rawData) ? rawData : (rawData.rows || [])

    hotList.value = []
    dataList.value = []
    let tempArray: any[] = []

    recipes.forEach((el: any) => {
      if (typeof el.configJson === 'string') {
        try {
          el.configJson = JSON.parse(el.configJson)
        } catch (e) {
          el.configJson = {}
        }
      }

      const sign = Math.floor(Math.random() * formulaBgList.length)
      if (!el.configJson.bgUrl) {
        el.configJson.bgUrl = formulaBgList[sign].url
        el.configJson.textColor = formulaBgList[sign].color
      }

      if (Number(el.configJson?.type) === 1) {
        hotList.value.push(el)
      } else {
        tempArray.push(el)
        if (tempArray.length === 4) {
          dataList.value.push({ list: tempArray })
          tempArray = []
        }
      }
    })

    if (tempArray.length > 0) {
      dataList.value.push({ list: tempArray })
    }
  } catch (error) {
    console.error('讀取本地配方失敗:', error)
  }
}

onMounted(() => {
  fetchLocalRecipes()
})

const encodedParams = (item: any) => {
  const params = {
    ...item.configJson,
    avatar: item.avatar,
    createTime: item.createTime,
    deviceId: item.deviceId,
    id: item.id,
    isEdit: false,
    name: item.name,
    userId: item.userId,
  }
  return encodeURIComponent(JSON.stringify(params))
}

const itemClick = (item: any, index: number) => {
  // 使用 Vue Router 推送路由
  router.push(`/pages-coffeeb/formulaDetail/formulaDetail?data=${encodedParams(item)}`)
}

const showShare = (data: any) => {
  shareShow.value = true
  shareData.value = data
}

const closeShare = () => {
  shareShow.value = false
}

const sendFormula = async (data: any) => {
  showLoadingToast({ message: '分享中...', forbidClick: true, duration: 0 })
  try {
    await retry(() => send(data), 3, 500)
  } catch (error) {
    console.log(error, '配置命令执行失败')
    showToast({ type: 'fail', message: '命令执行失败，请重新尝试' })
  } finally {
    closeToast()
  }
}

const send = async (formulaData: any) => {
  const obj = formulaData.configJson
  const data = [
    (formulaData.id >> 24) & 0xff,
    (formulaData.id >> 16) & 0xff,
    (formulaData.id >> 8) & 0xff,
    formulaData.id & 0xff,
    obj.proportion / 2,
    obj.legumes,
    obj.grind ? 1 : 0,
    obj.gear,
    obj.speed,
    obj.accordionItems.length,
  ]
  for (let i = 0; i < 5; i++) {
    if (i < obj.accordionItems.length) {
      const item = obj.accordionItems[i]
      data.push(item.water)
      data.push(item.velocity)
      data.push(item.temperature)
      data.push(item.type)
      data.push(item.time)
    } else {
      data.push(...[0, 0, 0, 0, 0])
    }
  }
  const bytes = stringToUTF8Array(formulaData.name)
  for (let i = 0; i < 40; i++) {
    if (i < bytes.length) {
      data.push(bytes[i])
    } else {
      data.push(0)
    }
  }
  console.log('配方数据:', data)
  const response = await coffeeMachineProtocol.sendRecipeData(data)
  if (response == 'dd') {
    closeShare()
    showSheet(formulaData)
  } else {
    throw new Error('命令执行失败，请重新尝试')
  }
}

const start = async (item: any) => {
  if (runStatus.value !== 0) {
    showToast({ type: 'fail', message: '设备当前正在运行，请先停止当前任务' })
    return
  }
  const data = [
    1,
    item.configJson.grind ? 1 : 0,
    (item.id >> 24) & 0xff,
    (item.id >> 16) & 0xff,
    (item.id >> 8) & 0xff,
    item.id & 0xff,
    item.configJson.accordionItems.length,
    0,
    0,
    0,
  ]
  
  showLoadingToast({ message: '发送中...', forbidClick: true, duration: 0 })
  try {
    await retry(
      async () => {
        const response = await coffeeMachineProtocol.sendBrewMode(data)
        if (response === 'dd') {
          closeSheet()
          // 使用 H5 標準的 localStorage 替換 uni.setStorageSync
          localStorage.setItem('id', item.id)
          router.push('/pages-coffeeb/brew/brew?id=' + item.id)
        } else {
          throw new Error('命令执行失败，请重新尝试')
        }
      },
      3,
      500,
    )
  } catch (error: any) {
    showToast({ type: 'fail', message: error.message || '命令执行失败' })
  } finally {
    closeToast()
  }
}

const showSheet = (data: any) => {
  sheetShow.value = true
  sheetData.value = data
}

const closeSheet = () => {
  sheetShow.value = false
}

const finishBack = () => {
  isUse.value = false
}
</script>

<style lang="scss" scoped>
/* 大多數樣式已移轉為 Tailwind CSS 類別，僅保留自訂字體與特例樣式 */
.font-roboto {
  font-family: 'Roboto', sans-serif;
}
</style>