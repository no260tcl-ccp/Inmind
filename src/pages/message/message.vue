/* stylelint-disable order/properties-order */
<!-- 使用 type="home" 属性设置首页，其他页面不需要设置，默认为page；推荐使用json5，更强大，且允许注释 -->
<route lang="json5">
{
  layout: 'tabbar',
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '%tabbar.message%',
  },
}
</route>
<template>
  <view class="px-4 page-container">
    <z-paging ref="paging" v-model="messageList" @query="getMessageList" offset-bottom="120rpx">
      <template v-slot:top>
        <wd-navbar
          fixed
          safeAreaInsetTop
          :title="`消息(${messageList ? messageList.length : 0})`"
        ></wd-navbar>
      </template>
      <template #empty>
        <bc-status-tip icon="/static/images/common/no-data.png">
          <template #message>
            <p class="desc-color">暂无消息</p>
          </template>
        </bc-status-tip>
      </template>
      <view class="message-list mt-6">
        <view
          class="message-item"
          v-for="(item, index) in messageList"
          @click="toInfo(item)"
          :key="index"
        >
          <view class="message-item-title ellipsis">{{ item.noticeTitle }}</view>
          <view class="message-item-content ellipsis-2">{{ item.content }}</view>
          <view class="message-item-time flex justify-between">
            <view>{{ item.createTime }}</view>
            <view>
              详情
              <wd-icon name="arrow-right" size="8px"></wd-icon>
            </view>
          </view>
        </view>
      </view>
    </z-paging>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { httpGet } from '@/utils/http'
import { stripHtmlTags } from '@/utils'
import { useUserStore } from '@/store'
const userStore = useUserStore()
const messageList = ref([])
const toInfo = (item) => {
  uni.navigateTo({ url: `/pages/message/info?data=${encodeURIComponent(JSON.stringify(item))}` })
}
const paging = ref(null)
const timer = ref(null)
onShow(() => {
  // getMessageList()
  // if (!userStore.userInfo.openid) {
  //   timer.value = setTimeout(() => {
  //     uni.navigateTo({ url: '/pages/mine/login' })
  //   }, 500)
  // }
})
onUnload(() => {
  if (timer.value) {
    clearTimeout(timer.value)
    timer.value = null
  }
})
watch(
  () => userStore.userInfo.openid,
  (newOpenid) => {
    if (newOpenid) {
      getMessageList()
    }
  },
)
const getMessageList = () => {
  const { run } = useRequest<IResponseData>(() => httpGet('/system/notice/list'))

  run().then((res) => {
    if (res.code === 200) {
      res.rows.forEach((item) => {
        // 去除所有 HTML 标签和样式
        item.content = stripHtmlTags(item.noticeContent)
      })
      // messageList.value = res.rows
      paging.value.complete(res.rows)
    }
  })
}
</script>

<style lang="scss" scoped>
.page-container {
  .no-data-container {
    height: calc(100vh - 100rpx);
  }
  .message-list {
    margin-top: 12vh;
    margin-bottom: 24rpx;
    .message-item {
      padding: 28rpx;
      border-radius: 20rpx;
      background: #ffffff;
      margin-top: 24rpx;
      font-size: 28rpx;
      line-height: 36rpx;
      .message-item-title {
        font-size: 32rpx;
        line-height: 48rpx;
        color: #222222;
      }
      .message-item-content {
        color: #666666;
        margin-top: 14rpx;
      }
      .message-item-time {
        color: #999999;
        margin-top: 24rpx;
      }
    }
  }
}
</style>
