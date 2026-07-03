<template>
  <div class="high-speed">
    <div class="show-quick" :style="bgStyle">
      <div class="btn-start" @click="handleStart()">开始</div>
    </div>
    <div class="close" @click="handleClose">
      <van-image width="33" height="33" round :src="closeImg" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

// 加上預設 CDN 網址，防止破圖
const cdnBaseUrl = import.meta.env.VITE_CDN_BASE_URL || 'https://cdn.bincoocoffee.cn'

const quickImg = ref<string>(`${cdnBaseUrl}/quick.png`)
const bgStyle = computed(() => ({
  'background-image': `url('${quickImg.value}')`,
}))
const closeImg = ref<string>(`${cdnBaseUrl}/close-quick.png`)

const emit = defineEmits(['close', 'start'])

const handleClose = () => {
  emit('close')
}

const handleStart = async () => {
  emit('start')
}
</script>

<style lang="scss" scoped>
.show-quick {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: 316px; /* 632rpx -> 316px */
  height: 354px; /* 708rpx -> 354px */
  background: linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%);
  background-size: 100% 100%;

  .btn-start {
    width: 285px; /* 570rpx -> 285px */
    height: 46px; /* 92rpx -> 46px */
    margin-bottom: 12px;
    font-size: 14px;
    line-height: 46px;
    color: #004097;
    text-align: center;
    background: #ffffff;
    border-radius: 25px;
  }
}

.close {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 12px;
}
</style>