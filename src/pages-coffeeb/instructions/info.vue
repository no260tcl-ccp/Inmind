<route lang="json5">
{
  style: {
    navigationBarTitleText: '用户手册',
  },
}
</route>
<template>
  <view class="page-container" v-if="questionInfo">
    <view class="page-title px-4">{{ questionInfo.title }}</view>
    <div class="page-content">
      <mp-html
        container-style="padding: 16px;background: #ffffff; padding-bottom: 40px;line-height: 24px;"
        :content="questionInfo.content"
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
const questionInfo = ref(null)
onShow(() => {})
onLoad((options) => {
  const rawQuestion = JSON.parse(decodeURIComponent(options.data))
  const domain = getDomain()

  rawQuestion.content = rawQuestion.content.replace(
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
  rawQuestion.content = rawQuestion.content.replace(
    /<iframe[^>]+class="[^"]*ql-video[^"]*"[^>]*src="([^"]+)"[^>]*>/gi,
    (match, src) => {
      return `<video src="${src}" controls class="ql-video"></video>`
    },
  )
  rawQuestion.content = rawQuestion.content.replace(/<\/?iframe[^>]*>/gi, '')
  questionInfo.value = rawQuestion
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
    background: #ffffff;
    line-height: 36rpx;
    color: #222222;
    text-align: justify; /* 可能会导致中文文本不齐 */
    letter-spacing: normal; /* 重置字母间距 */
  }
}
</style>
