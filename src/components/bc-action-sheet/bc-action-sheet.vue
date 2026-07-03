<template>
  <wd-action-sheet v-model="localShow" @click-modal="handleClose">
    <view class="bc-action-sheet">
      <!-- <view class="header">
        <view class="close" @click="handleClose">
          <wd-img :width="30" :height="30" src="/static/images/user/close.png" />
        </view>
      </view> -->
      <view class="main">
        <wd-img :width="77" :height="77" src="/static/images/popup/sucess.png" />
        <view class="text">已分享至咖啡机</view>
        <view class="name">配方名：{{ objData.name }}</view>
        <view class="tips">专属于您的美味，已准备就绪~</view>
      </view>
      <view class="footer">
        <view @click="handleClose" class="custom-close">关闭</view>
        <view @click="handleStart" class="custom-shadow">
          <i class="iconfont icon-a-lujing1 custom-shadow-icon"></i>
        </view>
      </view>
    </view>
  </wd-action-sheet>
  <wd-toast />
</template>

<script lang="ts" setup>
import { useToast } from 'wot-design-uni'
const totast = useToast()
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  isShareToCoffeeMachine: {
    type: Boolean,
    default: true,
  },
  objData: {
    type: Object,
    default: () => ({}),
  },
})
const localShow = ref(props.show)
watch(
  () => props.show,
  (newValue) => {
    localShow.value = newValue
  },
)
const emit = defineEmits(['close', 'success'])
const handleClose = () => {
  emit('close')
}
const handleStart = () => {
  emit('success', props.objData)
}
</script>

<style lang="scss" scoped>
.bc-action-sheet {
  margin: 36rpx;
  .header {
    text-align: end;
  }
  .main {
    display: flex;
    flex-direction: column;
    align-items: center;
    .text {
      width: 100%;
      margin-top: 12rpx;
      font-size: 36rpx;
      color: #222222;
      text-align: center;
    }
    .name,
    .tips {
      margin-top: 24rpx;
      font-size: 26rpx;
      color: #666666;
    }
    .tips {
      margin-top: 8rpx;
    }
  }
  .footer {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 56rpx;
    .custom-close {
      box-sizing: border-box;
      width: 280rpx;
      height: 92rpx;
      margin-right: 26rpx;
      font-size: 28rpx;
      line-height: 92rpx;
      color: #666666;
      text-align: center;
      background: #f5f5f5;
      border: 2rpx solid #dfdfdf;
      border-radius: 46px;
      .custom-shadow-icon::after {
        margin-left: 12rpx;
        content: '关闭';
      }
    }
    .custom-shadow {
      width: 280rpx;
      height: 92rpx;
      font-size: 28rpx;
      line-height: 92rpx;
      color: #ffffff;
      text-align: center;
      background: #004097;
      border-radius: 50rpx;
      .custom-shadow-icon::after {
        margin-left: 12rpx;
        content: '开始冲煮';
      }
    }
  }
}
</style>
