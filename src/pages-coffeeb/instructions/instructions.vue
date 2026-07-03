<route lang="json5">
{
  style: {
    navigationBarTitleText: '用户手册',
    navigationBarBackgroundColor: '#ffffff',
    disableScroll: true,
  },
}
</route>
<template>
  <view class="page-container">
    <view class="page-header flex justify-center items-center">
      <view
        v-for="(item, index) in headerList"
        :key="index"
        class="flex-1 flex justify-center items-center flex-col"
      >
        <button @click="toCustomerService" v-if="item.type === 3">
          <view><wd-img :width="38" :height="38" :src="item.icon" /></view>
          <view class="mt-1.5 font-size-3">{{ item.title }}</view>
        </button>
        <view
          @click="callTel(item.tel)"
          v-else-if="item.type === 4"
          class="flex justify-center items-center flex-col"
        >
          <view><wd-img :width="38" :height="38" :src="item.icon" /></view>
          <view class="mt-1.5 font-size-3">{{ item.title }}</view>
        </view>
        <view
          v-else
          class="flex justify-center items-center flex-col"
          @click="handleHeanderClick(item)"
        >
          <view><wd-img :width="38" :height="38" :src="item.icon" /></view>
          <view class="mt-1.5">{{ item.title }}</view>
        </view>
      </view>
    </view>
    <view class="page-content">
      <wd-tabs v-model="tab" color="#004097" @click="handleClick" inactiveColor="#666666">
        <block v-for="(tab, tabIndex) in tabs" :key="tabIndex">
          <wd-tab :title="tab.name">
            <swiper
              v-if="tabList.length > 0"
              :indicator-dots="tabList.length > 1"
              class="swiper"
              circular
            >
              <swiper-item
                class="swiper-item"
                v-for="(tabItem, tabItemIndex) in tabList"
                :key="tabItemIndex"
              >
                <view class="list-box">
                  <view
                    class="item flex"
                    @click="toInfo(item)"
                    v-for="(item, index) in tabItem.list"
                    :key="index"
                  >
                    <view class="flex-1 ellipsis">{{ item.title }}</view>
                    <view class="w-3 flex tips-color">
                      <wd-icon name="arrow-right" size="12px"></wd-icon>
                    </view>
                  </view>
                </view>
              </swiper-item>
            </swiper>
            <view v-else class="mt-5 swiper">
              <bc-status-tip :width="80" :height="68" icon="/static/images/common/no-data.png">
                <template #message>
                  <p class="desc-color">暂无更新</p>
                </template>
              </bc-status-tip>
            </view>
            <!-- <view class="list-box">
                <view
                  class="item flex"
                  @click="toInfo(item)"
                  v-for="(item, index) in tabList"
                  :key="index"
                >
                  <view class="flex-1">{{ item.title }}</view>
                  <view class="w-3 flex tips-color">
                    <wd-icon name="arrow-right" size="12px"></wd-icon>
                  </view>
                </view>
              </view> -->
          </wd-tab>
        </block>
      </wd-tabs>
    </view>
  </view>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'wot-design-uni'
import { httpGet } from '@/utils/http'
import { useUserStore, useBluetoothStore } from '@/store'
const userStore = useUserStore()
const userInfo = userStore.userInfo
const bluetoothStore = useBluetoothStore()
const toast = useToast()
const tab = ref(0)
const tabs = ref([])
const cdnBaseUrl = import.meta.env.VITE_CDN_BASE_URL
const headerList = [
  { title: '初次使用', url: '', icon: '/static/images/user/first-use.png', type: 1 },
  {
    title: '下载说明书',
    url: '',
    icon: '/static/images/user/docs.png',
    type: 2,
    href: `https://cdn.bincoocoffee.cn/file/KFJ08.pdf`,
  },
  { title: '在线咨询', url: '', icon: '/static/images/user/chat.png', type: 3 },
  { title: '售后电话', url: '', icon: '/static/images/user/tel.png', type: 4, tel: '0752-7123677' },
]
const tabList = ref([])
const toInfo = (item) => {
  uni.navigateTo({
    url: `/pages-coffeeb/instructions/info?data=${encodeURIComponent(JSON.stringify(item))}`,
  })
}
const toFirst = () => {
  uni.navigateTo({
    url: `/pages-coffeeb/instructions/first`,
  })
}
const handleHeanderClick = (item) => {
  if (item.type === 1) {
    toFirst()
  } else if (item.type === 2) {
    uni.showLoading({
      title: '下载中...',
      mask: true,
    })
    // 下载说明书逻辑
    const filePath = item.href
    if (!filePath) {
      uni.hideLoading()
      toast.error('文件地址为空')
      return
    }
    uni.downloadFile({
      url: filePath,
      success: (res) => {
        if (res.statusCode === 200) {
          uni.saveFile({
            tempFilePath: res.tempFilePath,
            success: (saveRes) => {
              uni.hideLoading()
              toast.success({
                msg: '文件已下载到:' + saveRes.savedFilePath,
                duration: 4000,
              })
              console.log(saveRes.savedFilePath)
              setTimeout(() => {
                uni.openDocument({
                  filePath: saveRes.savedFilePath,
                  success: () => {
                    // console.log('打开文档成功')
                  },
                })
              }, 2000)
            },
            fail: () => {
              uni.hideLoading()
              toast.error('保存文件失败')
            },
          })
        } else {
          uni.hideLoading()
          toast.error('下载文件失败')
        }
      },
      fail: () => {
        uni.hideLoading()
        toast.error('网络请求失败')
      },
    })
  }
}
const callTel = (tel) => {
  uni.makePhoneCall({
    phoneNumber: tel,
  })
}

const toCustomerService = () => {
  uni.navigateTo({
    url: `/pages-coffeeb/instructions/customerService`,
  })
}

onShow(() => {
  getCategoryList()
})
const getCategoryList = () => {
  const { product } = bluetoothStore.connectedDevice.productInfo
  const prams = { productId: product }
  const { run } = useRequest<IResponseData>(() => httpGet('/category/category/list', prams))

  run().then((res) => {
    tabs.value = res.rows
    if (res.rows.length > 0) {
      getQuestionList(res.rows[0].id)
    }
  })
}
const getQuestionList = (id) => {
  const params = {
    categoryId: id,
    pageSize: 1000,
  }
  const { run } = useRequest<IResponseData>(() => httpGet('/article/article/list', params))

  run().then((res) => {
    tabList.value = []
    let tempArray = []
    res.rows.forEach((el) => {
      tempArray.push(el)
      if (tempArray.length === 8) {
        tabList.value.push({ list: tempArray })
        tempArray = []
      }
    })
    if (tempArray.length > 0) {
      tabList.value.push({ list: tempArray })
    }
  })
}
const handleClick = (data) => {
  const { index } = data
  tab.value = index
  const id = tabs.value[index].id
  getQuestionList(id)
}
</script>

<style lang="scss" scoped>
.page-container {
  height: 100vh;
  padding: 36rpx;
  .page-header {
    height: 200rpx;
    font-size: 24rpx;
    color: #222222;
    background: #ffffff;
    border-radius: 20rpx;
  }
  .page-content {
    padding-top: 20rpx;
    padding-bottom: 20rpx;
    margin-top: 32rpx;
    background: #ffffff;
    border-radius: 20rpx;
    .swiper {
      height: 55vh;
      .swiper-item {
        height: 100%;
        .list-box {
          padding: 32rpx;
          font-size: 28rpx;
          color: #222222;
          .item {
            margin-bottom: 48rpx;
          }
        }
      }
    }
  }
  button {
    position: relative;
    box-sizing: border-box;
    display: block;
    width: 100%;
    height: 100%;
    padding-right: 0px;
    padding-left: 0px;
    margin-right: auto;
    margin-left: auto;
    overflow: hidden;
    line-height: 1.35;
    color: #000000;
    text-align: center;
    text-decoration: none;
    background-color: #fff;
    -webkit-tap-highlight-color: transparent;
  }
}
</style>
