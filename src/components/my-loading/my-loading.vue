<template>
  <view class="loadingClass" style="height: 100vh">
    <wd-overlay :show="loading">
      <div class="loading">
        <div class="loading-ball"></div>
        <div class="loading-ball"></div>
        <div class="loading-ball"></div>
        <div class="loading-ball"></div>
      </div>
    </wd-overlay>
  </view>
</template>

<script setup>
// 定义props
defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
})
</script>

<style></style>
<style scoped>
.loadingClass {
  position: relative;
}

.loading,
.loading .loading-ball {
  position: relative;
  box-sizing: border-box;
}

.loading {
  position: absolute;
  top: 50%; /* 垂直居中 */
  left: 50%; /* 水平居中 */
  display: block;
  font-size: 0;
  color: #000;
  transform: translate(-50%, -50%); /* 调整位置，使其真正居中 */
}

.loading.la-dark {
  color: #333;
}

.loading .loading-ball {
  display: inline-block;
  float: none;
  background-color: currentColor;
  border: 0 solid currentColor;
}

.loading {
  width: 8px;
  height: 8px;
}

.loading .loading-ball {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 100%;
  transform: translate(-50%, -50%);
  animation: ball-fussion-ball1 1s 0s ease infinite;
}

.loading .loading-ball:nth-child(1) {
  top: 0;
  left: 50%;
  z-index: 1;
}

.loading .loading-ball:nth-child(2) {
  top: 50%;
  left: 100%;
  z-index: 2;
  animation-name: ball-fussion-ball2;
}

.loading .loading-ball:nth-child(3) {
  top: 100%;
  left: 50%;
  z-index: 1;
  animation-name: ball-fussion-ball3;
}

.loading .loading-ball:nth-child(4) {
  top: 50%;
  left: 0;
  z-index: 2;
  animation-name: ball-fussion-ball4;
}

.loading.la-sm {
  width: 4px;
  height: 4px;
}

.loading.la-sm .loading-ball {
  width: 6px;
  height: 6px;
}

.loading.la-2x {
  width: 16px;
  height: 16px;
}

.loading.la-2x .loading-ball {
  width: 24px;
  height: 24px;
}

.loading.la-3x {
  width: 24px;
  height: 24px;
}

.loading.la-3x .loading-ball {
  width: 36px;
  height: 36px;
}

@keyframes ball-fussion-ball2 {
  0% {
    opacity: 0.35;
  }

  50% {
    top: 200%;
    left: 200%;
    opacity: 1;
  }

  100% {
    top: 100%;
    left: 50%;
    z-index: 1;
    opacity: 0.35;
  }
}

@keyframes ball-fussion-ball1 {
  0% {
    opacity: 0.35;
  }

  50% {
    top: -100%;
    left: 200%;
    opacity: 1;
  }

  100% {
    top: 50%;
    left: 100%;
    z-index: 2;
    opacity: 0.35;
  }
}

@keyframes ball-fussion-ball3 {
  0% {
    opacity: 0.35;
  }

  50% {
    top: 200%;
    left: -100%;
    opacity: 1;
  }

  100% {
    top: 50%;
    left: 0;
    z-index: 2;
    opacity: 0.35;
  }
}

@keyframes ball-fussion-ball4 {
  0% {
    opacity: 0.35;
  }

  50% {
    top: -100%;
    left: -100%;
    opacity: 1;
  }

  100% {
    top: 0;
    left: 50%;
    z-index: 1;
    opacity: 0.35;
  }
}
</style>
