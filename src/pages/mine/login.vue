<template>
  <view
    class="px-4 page-container"
    :style="{
      backgroundImage: `url(${cdnBaseUrl}/7cd3142339717bcc2e1ee47743b8b38d5a2b35cc0c9748eb912e376ecb7b25f7.png)`,
    }"
  >
    <wd-navbar
      safeAreaInsetTop
      custom-style="background-color: transparent;color: #ffffff"
      :bordered="false"
      @click-left="handleClickLeft"
    >
      <template #left>
        <i class="iconfont icon-a-ze-arrow-leftCopy2 icon-size-22"></i>
      </template>
    </wd-navbar>
    <scroll-view class="scroll-Y">
      <!-- 缺省页 -->
      <view class="flex flex-col justify-center items-center flex-justify-between mt-40">
        <view class="flex justify-center">
          <wd-img :width="181" :height="118" :src="logoUrl" />
        </view>
        <view class="flex justify-center flex-col mt-20">
          <wd-button @click="wxLogin" :loading="loading" type="error" custom-class="custom-button">
            微信授权登录
          </wd-button>
          <view
            class="flex justify-center items-center my-4 font-size-3 tips"
            @click="disabled = !disabled"
          >
            <wd-icon v-if="!disabled" name="circle" size="15px"></wd-icon>
            <wd-icon v-else name="check-circle-filled" color="#FFFFFF" size="15px"></wd-icon>
            <view class="ml-1">
              <text class="opacity-60">我已阅读并同意</text>
              <text class="link" @click.stop="openUserAgreement">《用户协议》</text>
              <text class="link" @click.stop="openPrivacyPolicy">《隐私协议》</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
    <bc-first-tip :show="showTips" @close="showTips = false" />
  </view>
</template>

<script lang="ts" setup>
import { httpGet } from '@/utils/http'
import { useUserStore, useBluetoothStore } from '@/store'
import { useToast } from 'wot-design-uni'
const totast = useToast()
const bluetoothStore = useBluetoothStore()
const disabled = ref(false)
const showTips = ref(false)
const loading = ref(false)
// 使用 useUserStore
const userStore = useUserStore()
const cdnBaseUrl = import.meta.env.VITE_CDN_BASE_URL
const logoUrl = `${cdnBaseUrl}/5941ecb20ba5d1f49a959923808710a7d058cdfddda7b9a67f75c1d1a1b9262e.png`
const disconnect = () => {
  bluetoothStore.disconnectFromDevice(bluetoothStore.connectedDevice.deviceId)
}
// 背景图片 URL
const bgImageUrl = `${cdnBaseUrl}/7cd3142339717bcc2e1ee47743b8b38d5a2b35cc0c9748eb912e376ecb7b25f7.png`
// 预加载背景图片，减少空白时间
const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    // 使用小程序的 wx.getImageInfo 方法预加载图片
    wx.getImageInfo({
      src: url,
      success: () => {
        resolve(true)
      },
      fail: (error) => {
        reject(error)
      },
    })
  })
}
// 页面加载生命周期
onMounted(() => {
  preloadImage(bgImageUrl).catch((error) => {
    console.error('背景图片加载失败:', error)
  })
  // if (userStore.userInfo.openid) {
  //   uni.switchTab({
  //     url: '/pages/index/index',
  //   })
  // }
})

// 微信登录方法
const wxLogin = () => {
  if (disabled.value) {
    loading.value = true
    uni.login({
      provider: 'weixin', // 使用微信登录
      success: function (loginRes) {
        const { run } = useRequest<IResponseData>(() =>
          httpGet('/api/login', { code: loginRes.code }),
        )
        run().then((response) => {
          // 将openid 存储到pinia中
          loading.value = false
          userStore.setUserInfo({
            nickname: response.wxuser.nickname,
            avatar: response.wxuser.avatar,
            openid: response.wxuser.openid,
            token: response.token,
            city: response.wxuser.city,
            country: response.wxuser.country,
            province: response.wxuser.province,
            gender: response.wxuser.gender,
            phone: response.wxuser.phone,
            id: response.wxuser.id,
          })
          uni.navigateBack({ delta: 1 })
          // uni.switchTab({
          //   url: '/pages/index/index',
          // })
        })
      },
      fail: (fail) => {
        loading.value = false
        console.log(fail)
      },
    })
  } else {
    totast.error('请先阅读并同意用户协议和隐私协议!')
  }
}
// 打开用户协议页面
const openUserAgreement = () => {
  uni.navigateTo({
    url: '/pages/mine/userAgreement',
  })
}

// 打开隐私协议页面
const openPrivacyPolicy = () => {
  uni.navigateTo({
    url: '/pages/mine/privacyPolicy',
  })
}
const handleClickLeft = () => {
  uni.switchTab({
    url: '/pages/index/index',
  })
}
</script>

<style lang="scss" scoped>
.page-container {
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover; /* 或者其他合适的值，如 contain, 100% 100% 等 */
  :deep(.custom-button) {
    width: 582rpx !important;
    height: 100rpx !important;
    font-size: 32rpx !important;
    // color: #004097 !important;
    // background-color: #ffffff !important;
  }
  .tips {
    color: #ffffff;
    font-size: 28rpx;
  }
}
.scroll-Y {
  height: 100vh;
}
</style>
