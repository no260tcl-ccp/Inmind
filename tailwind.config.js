/** @type {import('tailwindcss').Config} */
export default {
  // 讓 Tailwind 掃描所有的 vue 檔案
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 這裡可以補上您原本專案自訂的顏色，例如 bg-brand
      colors: {
        brand: '#您的品牌主色碼', // 例如 '#cda077'
        'brand-hover': '#您的品牌深色碼'
      }
    },
  },
  plugins: [],
}

