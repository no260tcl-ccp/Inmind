<template>
  <view class="px-4 page-container">
    <view class="page-title">初次使用指南</view>
    <view class="page-content mt-4 pb-5">
      一、准备工作
      <view class="mb-2"></view>
      1.取下咖啡机上的所有标签和包装材料，检查并确保所有附件⻬全⽆损坏。
      <view class="mb-2"></view>
      2.使⽤温⽔与中性清洁剂清洗部件和配件
      (⼿柄、粉碗和接⽔盘),并以清⽔冲洗⼲净。使⽤柔软的湿抹布擦⼲外壳。
      <view class="mb-2"></view>
      <text class="color-#e51f4d">3.请勿将外壳、电源线或电源插头浸入清水或其他液体中。</text>
      <view class="mb-6"></view>
      二、开机
      <view class="mb-2"></view>
      1.将硅胶管上⽔头接到机器进⽔处，另⼀头连接⽔源。
      <view class="mb-2"></view>
      2.将三⻆插头连接家⽤电，机器⾯板按键灯闪烁 1秒后熄灭，单击电源开关，机器开始⼯作。
      <view class="mb-2"></view>
      3.开机预热耗时30~120秒左右；此时为“预热状态”；此状态下⼿动+蒸汽+热萃指⽰灯闪烁。
      <view class="mb-2"></view>
      4.待加热到设定的温度值，机器将会进⼊“待机状态”;此状态时所有按键指⽰灯常亮。
      <view class="mb-2"></view>
      <view style="font-weight: 600">
        注：开机默认热萃模式，单击冷萃按键可切换为冷萃模式，冷萃灯常亮后切换为冷萃模式。
      </view>
      <video
        src="https://bincoo.oss-cn-beijing.aliyuncs.com/update/coffee-08/cb566f0b4d6443d788cf3985734e16c6.mov"
        preload="auto"
        :custom-cache="false"
        controls
        class="w-full"
      ></video>
      <view class="mb-6"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
onShow(() => {})
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
    line-height: 42rpx;
    color: #222222;
    text-align: justify; /* 可能会导致中文文本不齐 */
    letter-spacing: normal; /* 重置字母间距 */
  }
}
</style>
