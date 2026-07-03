<template>
  <wd-popup
    v-model="localShow"
    position="center"
    custom-style="border-radius:32rpx;"
    :z-index="zIndex"
    @close="handleClose"
    :close-on-click-modal="false"
  >
    <view
      class="popup-content"
      :style="{
        backgroundImage: `url(${cdnBaseUrl}/41ffc687468a3b0ef26f7edfdd0de12b82f2db391876e75623dce52203bc5ccd.png)`,
      }"
    >
      <template>
        <view class="header">
          <slot name="header">
            <view>
              <!-- <i class="iconfont icon-size-31" :class="objData.icon"></i> -->
              <wd-img v-if="objData.icon" :width="43" :height="45" :src="objData.icon" />
              <view v-else>提示信息</view>
            </view>
          </slot>
        </view>
        <view class="main">
          <slot name="main">
            <view class="content">{{ objData.content }}</view>
            <view class="tips" v-if="objData.tips">{{ objData.tips }}</view>
          </slot>
        </view>
        <view class="footer">
          <slot name="footer">
            <wd-button
              block
              type="info"
              plain
              custom-class="cancel-button"
              v-if="isCancel"
              @click="handleClose"
            >
              {{ cancelText }}
            </wd-button>
            <wd-button block type="error" @click="handleSuccess">
              {{ confirmText }}
            </wd-button>
          </slot>
        </view>
      </template>
    </view>
  </wd-popup>
</template>

<script lang="ts" setup>
// import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  zIndex: {
    type: Number,
    default: 100,
  },
  isCancel: {
    type: Boolean,
    default: true,
  },
  cancelText: {
    type: String,
    default: '取消',
  },
  confirmText: {
    type: String,
    default: '确定',
  },
  objData: {
    type: Object,
    default: () => ({
      icon: '/static/images/popup/finish.png',
      content: '确认进行该操作？',
      tips: '',
    }),
  },
})
const cdnBaseUrl = import.meta.env.VITE_CDN_BASE_URL
const localShow = ref(props.show)
const emit = defineEmits(['close', 'success'])
watch(
  () => props.show,
  (newValue) => {
    localShow.value = newValue
  },
)
const handleClose = () => {
  emit('close')
}

const handleSuccess = () => {
  emit('success')
}
</script>

<style lang="scss" scoped>
.popup-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 458rpx;
  min-height: 388rpx;
  padding: 40rpx 30rpx;
  background-color: #fff;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  // .header {
  // }
  .main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 46rpx;
    font-size: 24rpx;
    .content {
      font-size: 28rpx;
      text-align: center;
    }
    .tips {
      margin-top: 16rpx;
      color: #999999;
    }
  }
  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    // margin-top: 72rpx;
    margin-top: 44rpx;
    :deep(button) {
      width: 180rpx !important;
      min-width: 180rpx !important;
      height: 76rpx !important;
    }
  }
}
:deep(.cancel-button) {
  border: 1px solid #c5c5c5 !important;
  border-color: #ffffff !important;
}
// 横屏样式
@media screen and (orientation: landscape) {
  .popup-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 229px;
    min-height: 194px;
    padding: 20px 15px;
    background-color: #fff;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    .main {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-top: 23px;
      font-size: 12px;
      .content {
        font-size: 14px;
        text-align: center;
      }
      .tips {
        margin-top: 8px;
        color: #999999;
      }
    }
    .footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      margin-top: 36px;
      :deep(button) {
        width: 90px !important;
        min-width: 90px !important;
        height: 38px !important;
      }
    }
  }
}
</style>
