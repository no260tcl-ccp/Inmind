/* stylelint-disable order/properties-order */
<!-- 使用 type="home" 属性设置首页，其他页面不需要设置，默认为page；推荐使用json5，更强大，且允许注释 -->
<template>
  <view class="bodyClass">
    <!-- avatar -->
    <view class="avatarClass">
      <view class="icons-container" @click="settingTarget">
        <wd-icon name="setting" color="#242424" size="26px"></wd-icon>
      </view>
      <!-- 暂时不需要扫码功能 -->
      <!-- <view class="icons-container1">
        <wd-icon name="scan" size="26px" color="#242424" @click="scanCode"></wd-icon>
      </view> -->
      <view class="flex justify-center items-center" style="padding-top: 10vh">
        <view v-if="avatar === ''">
          <wd-skeleton theme="avatar" />
        </view>
        <view v-else>
          <wd-img round size="large" :width="80" :height="80" :src="avatar" />
        </view>
      </view>
      <view class="text-center">
        <text class="text-2xl text-black">{{ nickname }}</text>
      </view>
    </view>
    <!-- cell -->
    <view style="padding-top: 40px">
      <wd-card custom-class="custom-class">
        <wd-cell-group>
          <!-- <wd-cell :title="$t('mine.home')" size="large" title-width="200px" clickable is-link>
            <template #icon>
              <wd-icon name="home" size="22px"></wd-icon>
            </template>
          </wd-cell> -->
          <wd-cell :title="$t('mine.message')" size="large" title-width="200px" clickable is-link>
            <template #icon>
              <wd-icon name="chat1" size="22px"></wd-icon>
            </template>
          </wd-cell>
          <wd-cell :title="$t('mine.about')" size="large" title-width="200px" clickable is-link>
            <template #icon>
              <wd-icon name="books" size="22px"></wd-icon>
            </template>
          </wd-cell>
          <button open-type="contact">
            <wd-cell
              :title="$t('mine.customer')"
              size="large"
              title-width="200px"
              clickable
              is-link
            >
              <template #icon>
                <wd-icon name="service" size="22px"></wd-icon>
              </template>
            </wd-cell>
          </button>
          <wd-cell :title="$t('mine.question')" size="large" title-width="200px" clickable is-link>
            <template #icon>
              <wd-icon name="tips" size="22px"></wd-icon>
            </template>
          </wd-cell>
        </wd-cell-group>
      </wd-card>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/store'
import { updateTitle } from '@/utils/title'

const avatar = ref('')
const nickname = ref('Bincoo')

// 跳转设置页面
const settingTarget = () => {
  uni.navigateTo({ url: '/pages-seting/index/index' })
}
// 扫码
// const scanCode = () => {
//   uni.scanCode({
//     success: (res) => {
//       console.log('条码类型：' + res.scanType)
//       console.log('条码内容：' + res.result)
//     },
//   })
// }
onShow(() => {
  // 获取用户信息
  const userStore = useUserStore()
  const userInfo = userStore.userInfo
  avatar.value = userInfo.avatar
  nickname.value = userInfo.nickname
})
onReady(() => {
  updateTitle('tabbar.mine')
})
</script>

<style lang="scss" scoped>
.bodyClass {
  overflow: hidden; /* 禁止滚动 */
}
.avatarClass {
  position: relative; /* 设置相对定位，以允许绝对定位的元素相对于它定位 */
  height: 30vh;
  padding-right: 20px;
  padding-left: 20px;
  background-color: #34d19d;
  border-bottom-right-radius: 40px;
  border-bottom-left-radius: 40px;
}
.text-center {
  text-align: center;
}
.icons-container {
  position: absolute;
  top: 6.5vh;
  left: 20px;
}
.icons-container1 {
  position: absolute;
  top: 6.5vh;
  left: 70px;
}
button::after {
  border: none;
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
</style>
