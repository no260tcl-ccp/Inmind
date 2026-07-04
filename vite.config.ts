import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import basicSsl from '@vitejs/plugin-basic-ssl' // 引入 ssl 套件
import path from 'path' // 需要引入 path

export default defineConfig({
  plugins: [vue(),basicSsl()], // 啟用它
  resolve: {
    alias: {
      // 告訴 Vite 將 @ 替換為 src 目錄的絕對路徑
      '@': path.resolve(__dirname, './src'),
	  // 👇 直接把 @/store 綁定到這個總機檔案上！
      '@/store': path.resolve(__dirname, './src/store/index.ts'),
    },
	// 加上這行，讓 Vite 像 Webpack 一樣自動幫忙找副檔名
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  server: {
    host: '0.0.0.0', // 讓區域網路可以存取
    https: true,      // 強制開啟 https
	middleware:true,
	hmr:false
  }
})