<route lang="json5">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '消息',
  },
}
</route>
<template>
  <view class="px-4 page-container">
    <wd-navbar
      fixed
      safeAreaInsetTop
      :title="`消息(${alarmMessages.length})`"
      left-arrow
      @click-left="handleBack"
    ></wd-navbar>
    <!-- <z-paging ref="paging" v-model="messageList" @query="queryList"> -->
    <view v-if="!hasAlarm" class="no-data-container">
      <bc-status-tip icon="/static/images/common/no-data.png">
        <template #message>
          <p class="desc-color">暂无消息</p>
        </template>
      </bc-status-tip>
    </view>
    <view class="message-list mt-6" v-else>
      <view class="message-item" v-for="(item, index) in alarmMessages" :key="index">
        <view class="message-item-time flex justify-between">
          <view>{{ item.time }}</view>
        </view>
        <view class="message-item-title" :class="{ 'current-time': index === 0 }">
          {{ item.text }}
        </view>
        <!-- <view class="message-item-content">{{ item.content }}</view> -->
      </view>
    </view>
    <!-- </z-paging> -->
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore, useMachineBStatusStore } from '@/store'
import { httpGet, httpDelete } from '@/utils/http'
import { updateTitle } from '@/utils/title'
import { t } from '@/locale'
import dayjs from 'dayjs'
const userStore = useUserStore()
const userInfo = userStore.userInfo
const paging = ref(null)
const handleBack = () => {
  uni.navigateBack({})
}
// 设备状态 Store
const machineStatusStore = useMachineBStatusStore()

// 判断是否有警报
const hasAlarm = computed(() => machineStatusStore.hasAlarm)

// 根据警报信息动态生成警报内容
const alarmMessages = computed(() => {
  const alarms = machineStatusStore.alarmStatus
  const messages = []

  if (alarms.waterOverload.status === 1) {
    messages.push({
      text: '缺水/过载提醒',
      time: dayjs(alarms.waterOverload.time).format('YYYY-MM-DD HH:mm:ss'),
    })
  }
  if (alarms.machineFault.status === 1) {
    messages.push({
      text: `机器故障：${alarms.machineFault.text}`,
      time: dayjs(alarms.machineFault.time).format('YYYY-MM-DD HH:mm:ss'),
    })
  }

  return messages
})
</script>

<style lang="scss" scoped>
:deep(.wd-navbar__title) {
  font-size: 28rpx !important; // 标题字体（加!important确保生效）
  font-weight: 600 !important;
  color: black !important;
}
.page-container {
  .no-data-container {
    height: calc(100vh - 100rpx);
  }
  .message-list {
    margin-top: 12vh;
    .message-item {
      padding: 28rpx;
      border-radius: 20rpx;
      background: #ffffff;
      margin-top: 24rpx;
      font-size: 24rpx;
      line-height: 36rpx;
      .message-item-title {
        font-size: 32rpx;
        line-height: 48rpx;
        color: #222222;
        margin-top: 24rpx;
      }
      .message-item-content {
        color: #666666;
        margin-top: 10rpx;
      }
      .message-item-time {
        color: #999999;
      }
      .current-time {
        color: #e51f4d;
      }
    }
  }
}
</style>
