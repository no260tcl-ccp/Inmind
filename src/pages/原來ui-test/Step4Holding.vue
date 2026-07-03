<script setup>
</script>

<template>
  <div class="w-full max-w-md mx-auto bg-white min-h-screen flex flex-col relative shadow-lg">
    <header class="flex items-center justify-between px-4 py-3 sticky top-0 bg-white z-10 border-b border-gray-50">
      <button class="text-gray-600 text-lg" @click="$router.back()"><i class="fas fa-chevron-left"></i></button>
      <h1 class="text-gray-800 font-medium">快速冲煮</h1>
      <div class="flex items-center gap-3">
        <div class="flex items-center space-x-1 border border-gray-200 rounded-full px-2 py-1">
          <i class="fas fa-ellipsis-h text-gray-800 text-xs"></i><div class="w-px h-3 bg-gray-200"></div><i class="far fa-dot-circle text-gray-800 text-xs"></i>
        </div>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto pb-32">
      <div class="dashed-border py-6 px-6 flex justify-center items-center bg-gray-50/50">
        <div class="relative w-52 h-64 bg-[#2b2b2b] rounded-3xl overflow-hidden shadow-xl flex flex-col items-center border-[6px] border-[#333]">
          <div class="mt-4 w-4/5 h-[140px] bg-black rounded-lg border border-gray-700 flex flex-col items-center justify-center p-2">
            <div class="mb-3"><i class="fas fa-layer-group text-white/50 text-xl"></i></div>
            <div class="text-white text-3xl font-normal tracking-tight">85 <span class="text-white/40 text-xl font-light">/ 85ml</span></div>
          </div>
          <div class="absolute bottom-10 right-4 text-right">
            <div class="text-[10px] text-gray-400 font-serif italic mb-0.5">Binkos</div>
          </div>
        </div>
      </div>

      <div class="px-6 py-6">
        <div class="flex justify-between items-end mb-6">
          <h2 class="text-4xl font-bold text-gray-900 tracking-tight">浸泡萃取</h2>
          <div class="text-gray-400 text-base font-normal flex gap-4"><span>3/3</span><span>00:20</span></div>
        </div>

        <div class="grid grid-cols-3 gap-2 mb-10">
          <div><div class="text-gray-400 text-xs mb-1">注水方式</div><div class="text-gray-900 text-lg font-medium">中心</div></div>
          <div><div class="text-gray-400 text-xs mb-1">流速</div><div class="text-gray-900 text-lg font-medium">3.0ml/s</div></div>
          <div><div class="text-gray-400 text-xs mb-1">温度</div><div class="text-gray-900 text-lg font-medium">92℃</div></div>
        </div>

        <div class="flex justify-between items-center mb-10 border-b border-gray-100 pb-4">
          <div class="text-gray-900 text-xl font-medium">105/225ml</div>
          <div class="text-gray-900 text-xl font-medium">1:15</div>
          <div class="text-gray-400 text-sm">咖啡粉 <span class="text-gray-900 font-medium ml-1">15g</span></div>
        </div>

        <div class="space-y-6">
          <div class="flex items-center">
            <div class="w-20 text-[11px] text-blue-custom pr-2"><div class="font-medium">93℃</div><div class="font-normal opacity-80">3.0ml/s</div></div>
            <div class="flex-1 bg-blue-light rounded-xl px-4 py-4 flex justify-between items-center">
              <div class="flex items-center gap-3"><i class="fas fa-layer-group text-blue-custom text-xs"></i><span class="text-blue-custom font-medium text-base">焖蒸</span></div>
              <div class="text-blue-custom font-medium text-base">35 <span class="text-blue-light font-normal text-sm">/ 35ml</span></div>
            </div>
            <div class="w-24 text-[11px] text-blue-custom pl-3 leading-tight font-medium"><div>用时40s</div><div>含驻留12s</div></div>
          </div>

          <div class="flex items-center">
            <div class="w-20 text-[11px] text-blue-custom pr-2"><div class="font-medium">93℃</div><div class="font-normal opacity-80">3.0ml/s</div></div>
            <div class="flex-1 bg-blue-light rounded-xl px-4 py-4 flex justify-between items-center ring-2 ring-blue-200">
              <div class="flex items-center gap-3"><i class="fas fa-hourglass-half text-blue-custom text-xs"></i><span class="text-blue-custom font-medium text-base">第一段 (驻留)</span></div>
              <div class="text-blue-custom font-medium text-base">85 <span class="text-blue-light font-normal text-sm">/ 85ml</span></div>
            </div>
            <div class="w-24 text-[11px] text-blue-custom pl-3 leading-tight font-medium"><div>用时40s</div></div>
          </div>

          <div class="flex items-center">
            <div class="w-20 text-[11px] text-gray-300 pr-2"><div class="font-medium">93℃</div><div class="font-normal">3.0ml/s</div></div>
            <div class="flex-1 bg-white border border-gray-100 rounded-xl px-4 py-4 flex justify-between items-center">
              <div class="flex items-center gap-3"><i class="far fa-circle text-gray-300 text-xs"></i><span class="text-gray-400 font-medium text-base">第二段</span></div>
              <div class="text-gray-400 font-medium text-base">0 <span class="text-gray-300 font-normal text-sm">/ 115ml</span></div>
            </div>
            <div class="w-24 pl-3"></div>
          </div>
        </div>
      </div>
    </main>

    <footer class="fixed w-full max-w-[416px] bottom-8 left-1/2 -translate-x-1/2 bg-white rounded-full px-8 py-3 border border-gray-100 flex items-center justify-between z-20 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)]">
      <div>
        <div class="text-2xl font-bold text-gray-900 leading-none mb-1">01:12</div>
        <div class="text-blue-custom text-[11px] font-semibold">12s后进入第二段</div>
      </div>
      <button class="w-16 h-16 rounded-full flex items-center justify-center bg-[#f1f6ff] text-[#1e4bb5] transition-transform active:scale-95 shadow-sm">
        <i class="fas fa-pause text-2xl"></i>
      </button>
    </footer>
  </div>
</template>

<style scoped>
.dashed-border {
  border-bottom: 2px dashed #d1d5db;
  border-top: 2px dashed #d1d5db;
}
.text-blue-custom { color: #5b87f9; }
.bg-blue-light { background-color: #f1f6ff; }
.text-blue-light { color: #a9c6ff; }
</style>