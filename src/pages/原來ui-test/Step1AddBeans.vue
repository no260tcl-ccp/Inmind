<script setup>
import { ref } from 'vue'

// 控制彈窗顯示與隱藏
const showModal = ref(true)
</script>

<template>
  <div class="relative w-full max-w-[375px] mx-auto h-[812px] bg-white shadow-2xl overflow-hidden rounded-[40px] border-[8px] border-black">
    <div :class="{'brightness-50 transition-all duration-300': showModal}" class="h-full flex flex-col p-6 pt-12">
      <div class="flex justify-between items-center mb-8">
        <i class="fas fa-chevron-left text-xl text-gray-600 cursor-pointer" @click="$router.back()"></i>
        <h1 class="text-lg font-medium">快速冲煮</h1>
        <div class="flex space-x-4">
          <i class="fas fa-ellipsis-h text-gray-600"></i>
          <i class="far fa-dot-circle text-gray-600"></i>
        </div>
      </div>

      <div class="space-y-4">
        <div class="bg-gray-50 p-4 rounded-2xl flex justify-between items-end border border-gray-100">
          <span class="text-blue-600 text-sm font-medium self-start">豆粉量</span>
          <div class="flex items-baseline">
            <span class="text-4xl font-semibold text-gray-800">15</span>
            <span class="text-gray-400 ml-1">g</span>
          </div>
        </div>
        
        <div class="bg-gray-50 p-4 rounded-2xl flex justify-between items-end border border-gray-100">
          <span class="text-blue-600 text-sm font-medium self-start">研磨度</span>
          <div class="flex items-baseline">
            <span class="text-4xl font-semibold text-gray-800">3.5</span>
          </div>
        </div>

        <div class="bg-gray-50 p-4 rounded-2xl flex justify-between items-end border border-gray-100">
          <span class="text-blue-600 text-sm font-medium self-start">转速</span>
          <div class="flex items-baseline">
            <span class="text-4xl font-semibold text-gray-800">120</span>
            <span class="text-gray-400 ml-1 text-sm uppercase">RPM</span>
          </div>
        </div>
      </div>

      <div class="mt-auto flex justify-between pb-8">
        <button class="w-[30%] py-3 rounded-full border border-gray-300 text-gray-600 font-medium active:bg-gray-100">重置</button>
        <button @click="showModal = true" class="w-[35%] py-3 rounded-full bg-[#001D3D] text-white font-medium active:bg-gray-800">开始</button>
        <button class="w-[30%] py-3 rounded-full border border-gray-300 text-gray-600 font-medium text-sm active:bg-gray-100">注水设置</button>
      </div>
    </div>

    <div v-if="showModal" class="absolute inset-0 flex items-center justify-center bg-black/40 z-50">
      <div class="relative w-[320px] flex flex-col items-center">
        <div class="w-full bg-[#0055CC] rounded-[40px] p-8 text-white bg-coffee-pattern relative overflow-hidden border border-white/20">
          <div class="relative z-10 flex">
            <div class="flex-1 flex flex-col items-center justify-center space-y-8 py-4">
              <div class="text-center">
                <p class="text-white/60 text-sm font-light">Step1</p>
                <p class="text-xl font-medium mt-1">请输入咖啡豆</p>
              </div>
              <div class="text-white/40">
                <svg width="24" height="40" viewBox="0 0 24 40" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 0L12 36M12 36L4 28M12 36L20 28"/></svg>
              </div>
              <div class="text-center">
                <p class="text-white/60 text-sm font-light">Step2</p>
                <p class="text-xl font-medium mt-1">将滤杯放入支架</p>
              </div>
            </div>
            <div class="flex-1 flex items-center justify-center pl-4">
              <div class="relative w-full h-[240px] bg-white/10 rounded-3xl overflow-hidden flex items-center justify-center">
                <img src="https://replicate.delivery/xezq/F80YVAYeVZyeBkzepgsWadJM3eg0UgzEF7CV7GGg1kcRyENZB/out.png" alt="Coffee Machine" class="w-full h-full object-cover">
              </div>
            </div>
          </div>
          <button @click="showModal = false" class="w-full mt-10 bg-white text-[#0055CC] py-4 rounded-full font-bold text-lg shadow-lg active:bg-gray-100">
            开始
          </button>
        </div>
        <button @click="showModal = false" class="mt-8 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-95">
          <i class="fas fa-times text-[#0055CC] text-xl"></i>
        </button>
      </div>
    </div>
    <div class="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-black rounded-full"></div>
  </div>
</template>

<style scoped>
.bg-coffee-pattern {
  background-image: url('https://replicate.delivery/xezq/BrZyCN6w3q5rBNEe6UfaN45QuqP0isn4JcZ14rTuEU1lMRTWA/out.png');
  background-size: cover;
}
</style>