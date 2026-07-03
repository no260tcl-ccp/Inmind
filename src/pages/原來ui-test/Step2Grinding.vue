<script setup>
// 目前無特定響應式狀態
</script>

<template>
  <div class="w-full max-w-[360px] mx-auto min-h-screen bg-white text-gray-800 shadow-xl relative overflow-hidden">
    <header class="px-4 pt-4 pb-2 flex items-center justify-between">
      <i class="fas fa-chevron-left text-gray-500 cursor-pointer" @click="$router.back()"></i>
      <div class="text-[14px] font-semibold">快达冲煮</div>
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center"><i class="fas fa-ellipsis-h text-gray-500 text-[12px]"></i></div>
        <div class="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center"><i class="far fa-circle text-gray-500 text-[12px]"></i></div>
      </div>
    </header>

    <div class="mx-3 mt-1 border border-dashed border-gray-300 rounded-lg p-4 flex justify-center">
      <img src="https://replicate.delivery/xezq/eODQpeDA0RgoxEAM70LLLCa71F61fWpVUqDIfH52ClvZJFNZB/out.png" class="w-48 h-40 object-contain" />
    </div>

    <div class="border-t border-dashed border-gray-300 my-4"></div>

    <main class="px-5">
      <div class="text-[22px] font-bold mb-3">研磨中</div>

      <div class="flex justify-between mb-4">
        <div>
          <div class="text-[12px] text-gray-400 mb-1">研磨度</div>
          <div class="text-[16px] font-medium">50 手冲咖啡</div>
        </div>
        <div class="text-right">
          <div class="text-[12px] text-gray-400 mb-1">电机转速</div>
          <div class="text-[16px] font-medium">80 RPM</div>
        </div>
      </div>

      <div class="flex justify-between text-[14px] text-gray-600 mb-6 border-b border-gray-100 pb-4">
        <div>0/225ml</div>
        <div>1:15</div>
        <div>咖啡粉 15g</div>
      </div>

      <div class="space-y-3">
        <div class="flex items-center gap-4">
          <div class="text-[12px] text-gray-400 w-14"><div>93℃</div><div>3.0ml/s</div></div>
          <div class="flex-1 border border-gray-200 rounded-xl h-9 px-3 flex items-center text-gray-400 text-[13px] bg-gray-50">
            <i class="fas fa-sync-alt mr-2 text-gray-300"></i> 焖蒸&nbsp;&nbsp;0/35ml
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-[12px] text-gray-400 w-14"><div>93℃</div><div>3.0ml/s</div></div>
          <div class="flex-1 border border-gray-200 rounded-xl h-9 px-3 flex items-center text-gray-400 text-[13px] bg-gray-50">
            <i class="fas fa-sync-alt mr-2 text-gray-300"></i> 第一段&nbsp;&nbsp;0/85ml
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-[12px] text-gray-400 w-14"><div>93℃</div><div>3.0ml/s</div></div>
          <div class="flex-1 border border-gray-200 rounded-xl h-9 px-3 flex items-center text-gray-400 text-[13px] bg-gray-50">
            <i class="fas fa-sync-alt mr-2 text-gray-300"></i> 第二段&nbsp;&nbsp;0/110ml
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between mt-10">
        <div>
          <div class="text-[24px] font-semibold text-gray-700 leading-none">00:00</div>
          <div class="text-[12px] text-blue-500 mt-1">研磨完成后开始焖蒸</div>
        </div>
        <button class="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center active:bg-gray-50 transition">
          <i class="fas fa-pause text-blue-600 text-[20px]"></i>
        </button>
      </div>
    </main>
  </div>
</template>