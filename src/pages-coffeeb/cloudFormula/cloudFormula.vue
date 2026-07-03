<route lang="json5">
{
  style: {
    navigationBarTitleText: '为您推荐',
    navigationBarBackgroundColor: '#ffffff',
    disableScroll: true,
  },
}
</route>
<template>
  <view class="content">
    <view class="hot-list">
      <view class="title flex justify-between px-5 pt-5">
        <view>热门配方</view>
        <view v-if="hotList.length > 0">
          {{ currentHotIndex + 1 }}
          <text class="font-size-3 title-color">/{{ hotList.length }}</text>
        </view>
      </view>
      <swiper
        v-if="hotList.length > 0"
        class="swiper hot-box"
        :next-margin="hotList.length > 1 ? '80rpx' : ''"
        circular
        :current="currentHotIndex"
        @change="changeHotSwiper"
        :indicator-dots="false"
        :autoplay="false"
      >
        <swiper-item v-for="(item, index) in hotList" :key="index">
          <view class="swiper-item flex flex-col">
            <view class="swiper-header">
              <view
                class="card-content p-4"
                :style="{
                  backgroundImage: `url(${cdnBaseUrl}/97b213a04c4d7e9e6a6e5a17b2f35052d988a229e55f68d4946a79a440a64bbe.png)`,
                }"
                @click.stop="itemClick(item, index)"
              >
                <view
                  @click.stop="showShare(item)"
                  class="top-flag flex items-center justify-center"
                >
                  配置
                  <i class="iconfont icon-a-svg10 ml-1 icon-size-10"></i>
                </view>
                <view>
                  <view class="font-size-5">{{ item.name }}</view>
                  <view class="tips-opacity font-size-3 mt-1">{{ item.configJson.tips }}</view>
                </view>
                <view class="flex font-size-3 mt-8">
                  <view class="flex-1">
                    <view class="tips-opacity">咖啡粉</view>
                    <view class="font-size-4 mt-2">
                      {{ item.configJson.legumes }}
                      <text class="font-size-3">g</text>
                    </view>
                  </view>
                  <view class="flex-1">
                    <view class="tips-opacity">粉水比</view>
                    <view class="font-size-4 mt-2">
                      {{
                        item.configJson.proportion
                          ? `1:${item.configJson.proportion.toFixed(1) / 2}`
                          : '-'
                      }}
                      {{
                        item.configJson.proportion
                          ? (item.configJson.proportion / 2) * item.configJson.legumes
                          : '-'
                      }}
                      <text class="font-size-3" v-if="item.configJson.proportion">ml</text>
                    </view>
                  </view>
                  <view class="flex-1 pl-2">
                    <view class="tips-opacity">研磨档位</view>
                    <view class="font-size-4 mt-2">
                      {{ item.configJson.gear }}
                      <text class="font-size-3">{{ dangweiType(item.configJson.gear) }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </swiper-item>
      </swiper>
      <view v-else class="mt-5">
        <bc-status-tip :width="80" :height="68" icon="/static/images/common/no-data1.png">
          <template #message>
            <p class="title-color">配方更新中</p>
            <p class="tips-color font-size-3.5 mt-2">敬请期待~</p>
          </template>
        </bc-status-tip>
      </view>
    </view>
    <view class="extract-list">
      <view class="title flex justify-between px-5 pt-5">
        <view>精密萃取</view>
        <view v-if="dataList.length > 0">
          {{ currentIndex + 1 }}
          <text class="font-size-3 title-color">/{{ dataList.length }}</text>
        </view>
      </view>
      <swiper
        v-if="dataList.length > 0"
        class="swiper extract-box"
        :next-margin="dataList.length > 1 ? '80rpx' : ''"
        circular
        :current="currentIndex"
        @change="changeSwiper"
        :indicator-dots="false"
        :autoplay="false"
      >
        <swiper-item v-for="(item, index) in dataList" :key="index">
          <view class="swiper-item flex flex-col">
            <view class="list-content">
              <view
                class="item-box flex mb-4"
                v-for="(el, index) in item.list"
                :key="index"
                @click="itemClick(el, index)"
              >
                <view class="img-box">
                  <wd-img :width="78" :height="78" :src="el.configJson.bgUrl" />
                  <view class="img-num" :style="{ color: el.configJson.textColor }">
                    {{ el.configJson.accordionItems ? el.configJson.accordionItems.length : '' }}
                  </view>
                </view>
                <view class="flex flex-col justify-center pl-3 font-size-3 content-box">
                  <view class="name ellipsis">{{ el.name }}</view>
                  <view class="ellipsis-2">
                    {{ el.configJson.tips }}
                  </view>
                </view>
              </view>
            </view>
          </view>
        </swiper-item>
      </swiper>
      <view v-else class="mt-5">
        <bc-status-tip :width="80" :height="68" icon="/static/images/common/no-data1.png">
          <template #message>
            <p class="title-color">配方更新中</p>
            <p class="tips-color font-size-3.5 mt-2">敬请期待~</p>
          </template>
        </bc-status-tip>
      </view>
    </view>
  </view>
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
  <bc-action-sheet :show="sheetShow" @close="closeSheet" :objData="sheetData" @success="start" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { httpGet } from '@/utils/http'
// import { sendStringData } from '@/utils/coffeebBlueTool'
import { useBluetoothStore, useMachineBStatusStore } from '@/store'
import { dangweiType, retry, stringToUTF8Array } from '@/utils'
import { useToast, useMessage } from 'wot-design-uni'
import { CoffeeMachineProtocol } from '@/utils/coffeebBlueTool'
const coffeeMachineProtocol = CoffeeMachineProtocol.getInstance()
const machineStatusStore = useMachineBStatusStore()
const toast = useToast()
const cdnBaseUrl = import.meta.env.VITE_CDN_BASE_URL
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
const bluetoothStore = useBluetoothStore()
const hotList = ref([])
const dataList = ref([])
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
const changeSwiper = (e) => {
  currentIndex.value = e.detail.current
}
const currentHotIndex = ref(0)
const changeHotSwiper = (e) => {
  currentHotIndex.value = e.detail.current
}
const runStatus = ref(machineStatusStore.runStatus)
watch(
  () => machineStatusStore.runStatus,
  (newStatus) => {
    runStatus.value = newStatus
  },
  { immediate: true },
)
onMounted(() => {
  queryList(1, 100)
})
const queryList = (pageNo, pageSize) => {
  console.log(pageNo, pageSize)
  const params = {
    pageNum: pageNo,
    pageSize,
    userId: 3,
    // deviceId: bluetoothStore.connectedDevice.productInfo.id,
  }

  const { run } = useRequest<IResponseData>(() => httpGet('/repice/repice/list', params))

  run().then((res) => {
    let tempArray = []
    res.rows.forEach((el, index) => {
      el.configJson = JSON.parse(el.configJson)
      const sign = Math.floor(Math.random() * formulaBgList.length)
      el.configJson.bgUrl = formulaBgList[sign].url
      el.configJson.textColor = formulaBgList[sign].color
      if (Number(el.configJson.type) === 1) {
        hotList.value.push(el)
      } else {
        tempArray.push(el)
        if (tempArray.length === 4) {
          dataList.value.push({ list: tempArray })
          tempArray = []
        }
      }
    })
    // 如果最后一个分钟数组的长度大于0，则将最后一个分钟数组添加到 dataList 中
    if (tempArray.length > 0) {
      dataList.value.push({ list: tempArray })
    }
    console.log(dataList.value, 'dataList.value')
  })
}

const encodedParams = (item) => {
  // 构建参数对象
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

  // 将参数对象序列化为 JSON 字符串
  const serializedParams = JSON.stringify(params)
  // URL 编码
  const encodedParams = encodeURIComponent(serializedParams)
  return encodedParams
}
const itemClick = (item, index) => {
  // 使用 uni.navigateTo 发起页面跳转
  uni.navigateTo({
    url: `/pages-coffeeb/formulaDetail/formulaDetail?data=${encodedParams(item)}`,
  })
}
const showShare = (data) => {
  shareShow.value = true
  shareData.value = data
}
const closeShare = () => {
  shareShow.value = false
}
const sendFormula = async (data) => {
  // 发送失败重试3次
  uni.showLoading({ title: '分享中...', mask: true })
  try {
    await retry(() => send(data), 3, 500)
  } catch (error) {
    console.log(error, '配置命令执行失败')
    toast.error('命令执行失败，请重新尝试')
  } finally {
    uni.hideLoading()
  }
}
const send = async (formulaData) => {
  // 将32位整数ID值分解为4个8位字节
  // 通过位移和按位与操作提取ID的各个字节段
  // 第一个字节：取ID值的最高8位
  // 第二个字节：取ID值的第二个8位
  // 第三个字节：取ID值的第三个8位
  // 第四个字节：取ID值的最低8位
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
  // 遍历最多5段配方数据
  for (let i = 0; i < 5; i++) {
    if (i < obj.accordionItems.length) {
      const item = obj.accordionItems[i]
      data.push(item.water)
      data.push(item.velocity)
      data.push(item.temperature)
      data.push(item.type)
      data.push(item.time)
    } else {
      // 不足5段的用0填充
      data.push(...[0, 0, 0, 0, 0])
    }
  }
  const bytes = stringToUTF8Array(formulaData.name)
  // 配方名称最大长度40字节
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
    // isUse.value = true
    closeShare()
    showSheet(formulaData)
  } else {
    throw new Error('命令执行失败，请重新尝试')
  }
}
// 开始冲煮
const start = async (item) => {
  if (runStatus.value !== 0) {
    toast.error({ msg: '设备当前正在运行，请先停止当前任务', zIndex: 1000 })
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
  uni.showLoading({ title: '发送中...', mask: true })
  try {
    await retry(
      async () => {
        const response = await coffeeMachineProtocol.sendBrewMode(data)
        if (response === 'dd') {
          closeSheet()
          uni.setStorageSync('id', item.id)
          uni.navigateTo({
            url: '/pages-coffeeb/brew/brew?id=' + item.id,
          })
        } else {
          throw new Error('命令执行失败，请重新尝试')
        }
      },
      3,
      500,
    )
  } catch (error) {
    toast.error({ msg: error.message, zIndex: 1000 })
  } finally {
    uni.hideLoading()
  }
}
const showSheet = (data) => {
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
.content {
  height: 100vh;
  overflow: auto;
  background-color: white;
  .hot-box {
    height: 350rpx;
  }
  .extract-box {
    height: calc(100vh - 520rpx);
  }
  .swiper {
    .swiper-item {
      height: 100%;
      padding: 36rpx;
      .title {
        margin-bottom: 28rpx;
        font-size: 36rpx;
      }
      .tips-opacity {
        opacity: 0.6;
      }
      .swiper-header {
        margin-bottom: 44rpx;
        .card-content {
          position: relative;
          color: #ffffff;
          background-repeat: no-repeat;
          background-position: center;
          background-size: cover;
          border-radius: 24rpx;
          .top-flag {
            position: absolute;
            top: 6rpx;
            right: 6rpx;
            width: 124rpx;
            height: 54rpx;
            font-size: 22rpx;
            color: #004097;
            background: #ffffff;
            border-top-right-radius: 24rpx;
            border-bottom-left-radius: 40rpx;
          }
        }
      }
      .list-content {
        .img-box {
          position: relative;
          max-height: 78px;
          .img-num {
            position: absolute;
            right: 8rpx;
            bottom: -14rpx;
            font-family: Roboto;
            font-size: 80rpx;
            font-weight: 600;
            color: #f5abbd;
            letter-spacing: -0.04em;
          }
          .blue {
            color: #a1b9d9;
          }
        }
        .content-box {
          min-width: 340rpx;
          line-height: 42rpx;
          color: #999999;
          .name {
            height: 42rpx;
            margin-bottom: 10rpx;
            font-family: PingFang SC;
            font-size: 28rpx;
            line-height: 32rpx;
            color: #222222;
          }
        }
      }
    }
  }
}

.item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 150rpx;
  padding: 0rpx 30rpx;
  background-color: #ffffff;
}

.avatar-container {
  width: 100rpx;
  height: 100rpx;
  margin-right: 10rpx; /* 添加右侧间距 */
  overflow: hidden; /* 隐藏超出的部分 */
  border-radius: 50%; /* 圆形 */
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1); /* 添加阴影 */
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%; /* 圆形 */
}

.name-container {
  flex: 1; /* 占据剩余空间 */
  text-align: left; /* 文字靠左对齐 */
}

.item-line {
  position: absolute;
  bottom: 0rpx;
  left: 0rpx;
  width: 100%;
  height: 1px;
  background-color: #eeeeee;
}
</style>
