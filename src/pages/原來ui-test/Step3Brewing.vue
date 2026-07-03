<script setup>
</script>

<template>
  <div class="max-w-md mx-auto min-h-screen bg-white flex flex-col relative pb-24 shadow-xl">
    <header class="flex items-center justify-between px-4 py-3 bg-white sticky top-0 z-20">
      <i class="fas fa-chevron-left text-lg text-gray-700 cursor-pointer" @click="$router.back()"></i>
      <h1 class="text-base font-semibold">快速冲煮</h1>
      <div class="flex items-center space-x-2 bg-gray-50 rounded-full px-3 py-1.5 border border-gray-100">
        <i class="fas fa-ellipsis-h text-xs text-gray-800"></i>
        <div class="w-px h-3 bg-gray-200"></div>
        <div class="w-4 h-4 rounded-full border border-gray-800 flex items-center justify-center p-[1px]">
          <div class="w-full h-full rounded-full bg-gray-800"></div>
        </div>
      </div>
    </header>

    <div class="dashed-separator"></div>

    <div class="bg-gray-50 flex flex-col items-center py-6">
      <div class="w-64 h-80 bg-[#1a1a1a] rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col items-center p-4 border-[6px] border-[#222]">
        <div class="w-full aspect-[4/3] bg-[#0c0c0c] rounded-xl flex flex-col items-center justify-center border border-white/5 relative mt-4">
          <div class="flex flex-col items-center">
            <div class="w-10 h-10 border border-white/20 rounded flex items-center justify-center mb-4">
              <i class="fas fa-sync-alt text-lg text-white/40"></i>
            </div>
            <div class="text-5xl font-light text-white tracking-tight">
              <span class="font-bold">60</span><span class="text-white/40 mx-2 text-3xl font-light">/</span><span class="text-white/40 text-3xl">85ml</span>
            </div>
          </div>
        </div>
        <div class="mt-auto mb-10 self-end pr-4">
          <div class="text-white/20 italic font-serif text-sm">Binic</div>
        </div>
      </div>
    </div>

    <div class="dashed-separator"></div>

    <main class="flex-grow bg-white px-6 pt-8 pb-32">
      <div class="flex justify-between items-baseline mb-8">
        <h2 class="text-5xl font-bold tracking-tight">第一段</h2>
        <div class="flex items-baseline space-x-3 text-gray-400">
          <span class="text-3xl font-medium">2/3</span>
          <span class="text-2xl font-normal">00:20</span>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-8 mb-10">
        <div><p class="text-gray-400 text-sm font-medium mb-2">注水方式</p><p class="text-2xl font-semibold">中心</p></div>
        <div><p class="text-gray-400 text-sm font-medium mb-2">流速</p><p class="text-2xl font-semibold">3.0ml/s</p></div>
        <div><p class="text-gray-400 text-sm font-medium mb-2">温度</p><p class="text-2xl font-semibold">92℃</p></div>
      </div>

      <div class="flex justify-between items-end mb-8 border-b border-gray-100 pb-6">
        <div class="flex items-baseline gap-4">
          <span class="text-2xl font-bold">105/225ml</span>
          <span class="text-2xl font-medium">1:15</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-gray-500 text-lg">咖啡粉</span>
          <span class="text-2xl font-bold">15g</span>
        </div>
      </div>

      <div class="space-y-5">
        <div class="flex items-center h-16">
          <div class="w-20 text-blue-600 text-[13px] font-bold pr-2 leading-tight"><div>93℃</div><div>3.0ml/s</div></div>
          <div class="flex-grow flex items-center justify-between bg-blue-50/60 rounded-xl px-5 py-4">
            <div class="flex items-center"><i class="fas fa-check-circle text-blue-600 mr-2"></i><span class="text-blue-800 font-bold text-lg">焖蒸</span></div>
            <div class="text-blue-600 font-bold"><span class="text-xl">35</span><span class="text-blue-300">/35ml</span></div>
          </div>
          <div class="w-28 pl-4 text-[11px] text-blue-500 font-medium leading-[1.3]"><div>用时40s</div><div>含驻留12s</div></div>
        </div>

        <div class="flex items-center h-16">
          <div class="w-20 text-blue-600 text-[13px] font-bold pr-2 leading-tight"><div>93℃</div><div>3.0ml/s</div></div>
          <div class="flex-grow relative bg-white border border-blue-50 rounded-xl overflow-hidden h-full shadow-sm">
            <div class="absolute inset-y-0 left-0 bg-[#eef5ff] w-[70%]"></div>
            <div class="relative h-full flex items-center justify-between px-5">
              <div class="flex items-center"><i class="fas fa-sync-alt text-blue-600 mr-2"></i><span class="text-blue-800 font-bold text-lg">第一段</span></div>
              <div class="text-blue-600 font-bold"><span class="text-xl">60</span><span class="text-blue-300">/85ml</span></div>
            </div>
          </div>
          <div class="w-28"></div>
        </div>

        <div class="flex items-center h-16">
          <div class="w-20 text-gray-300 text-[13px] font-bold pr-2 leading-tight"><div>93℃</div><div>3.0ml/s</div></div>
          <div class="flex-grow flex items-center justify-between bg-white rounded-xl px-5 py-4 border border-gray-200">
            <div class="flex items-center"><i class="far fa-circle text-gray-300 mr-2"></i><span class="text-gray-300 font-bold text-lg">第二段</span></div>
            <div class="text-gray-300 font-bold"><span class="text-xl">0</span><span>/110ml</span></div>
          </div>
          <div class="w-28"></div>
        </div>
      </div>
    </main>

    <div class="fixed bottom-10 w-full max-w-md px-6 z-30">
      <div class="bg-white rounded-full p-2.5 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.1)] border border-gray-50 flex items-center justify-between">
        <div class="pl-10 flex flex-col justify-center">
          <div class="text-4xl font-bold text-gray-800 tracking-tight leading-none">01:12</div>
          <div class="text-[11px] text-gray-400 font-bold mt-1.5 uppercase">总用时</div>
        </div>
        <button class="bg-[#eef5ff] w-16 h-16 rounded-full flex items-center justify-center text-[#003da5] border-4 border-white pause-btn-shadow transition-transform active:scale-95">
          <i class="fas fa-pause text-2xl"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashed-separator {
  background-image: linear-gradient(to right, #d1d5db 40%, rgba(255, 255, 255, 0) 0%);
  background-position: top;
  background-size: 8px 1px;
  background-repeat: repeat-x;
  height: 1px;
  width: 100%;
}
.pause-btn-shadow {
  box-shadow: 0 4px 14px 0 rgba(0, 118, 255, 0.1);
}
</style>