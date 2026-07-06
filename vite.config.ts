//import { defineConfig } from 'vite'
//import vue from '@vitejs/plugin-vue'
//import { fileURLToPath } from 'node:url'

//export default defineConfig({
//  plugins: [vue()],
//  resolve: {
//    alias: {
//      '@': fileURLToPath(new URL('./src', import.meta.url))
//    }
//  },
//  server: {
//    middlewareMode: true,
//  },
//  build: {
//    outDir: 'dist',
//    emptyOutDir: true,
//  }
//})

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import basicSsl from '@vitejs/plugin-basic-ssl' // 1. 引入 SSL 外掛

export default defineConfig({
  plugins: [
    vue(),
    basicSsl() // 2. 啟用 SSL 外掛
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // 如果沒有其他 server 設定，可以直接把 server 整個區塊刪除或註解掉
  server: {
    host: true, // 3. 固定開啟區網 IP 模式，以後直接輸入 npm run dev 即可
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
})