<route lang="json5">
{
  style: {
    navigationBarTitleText: '系统消息',
  },
}
</route>
<template>
  <view class="page-container" v-if="messageInfo">
    <view class="page-title px-4">{{ messageInfo.noticeTitle }}</view>
    <div class="page-content">
      <mp-html
        container-style="padding: 16px;background: #ffffff; padding-bottom: 40px;line-height: 24px;"
        :content="messageInfo.noticeContent"
        :tag-style="{
          video: 'text-algin: center; width: 100%;',
        }"
      />
    </div>
  </view>
</template>

<script setup lang="ts">
import mpHtml from '@/uni_modules/mp-html/components/mp-html/mp-html.vue'
import { getDomain } from '@/utils'
const messageInfo = ref(null)
const preview = (src, $event) => {
  uni.previewImage({
    current: src,
    urls: [src],
  })
}
const navigate = (href, $event) => {
  console.log(href)
}
onShow(() => {})
onLoad(async (options) => {
  await nextTick()
  const rawMessage = JSON.parse(decodeURIComponent(options.data))
  const domain = getDomain()

  rawMessage.noticeContent = rawMessage.noticeContent.replace(
    /<img\b[^>]*?src\s*=\s*(['"])(.*?)\1[^>]*?>/gi,
    (match, quote, src) => {
      // 补全图片地址
      if (src && !src.startsWith('http')) {
        src = domain + src
      }
      return `<img src="${src}" />`
    },
  )
  // 后台富文本编辑器视频是用iframe标签
  rawMessage.noticeContent = rawMessage.noticeContent.replace(
    /<iframe[^>]+class="[^"]*ql-video[^"]*"[^>]*src="([^"]+)"[^>]*>/gi,
    (match, src) => {
      return `<video src="${src}" controls class="ql-video"></video>`
    },
  )
  rawMessage.noticeContent = rawMessage.noticeContent.replace(/<\/?iframe[^>]*>/gi, '')
  messageInfo.value = rawMessage
})
</script>

<style lang="scss" scoped>
.page-container {
  height: 100vh;
  background: #ffffff;
  .page-title {
    padding-top: 36rpx;
    padding-bottom: 36rpx;
    font-size: 36rpx;
    line-height: 48rpx;
    color: #222222;
    border-bottom: 1px solid #f5f5f5;
  }
  .page-content {
    font-size: 28rpx;
    line-height: 36rpx;
    color: #222222;
  }
}
</style>
