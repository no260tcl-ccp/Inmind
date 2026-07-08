<template>
  <div v-if="showPrompt" class="line-prompt-overlay">
    <div class="line-prompt-container">
      <div class="line-prompt-header">
        <h2>⚠️ 需要在外部瀏覽器中打開</h2>
      </div>
      
      <div class="line-prompt-content">
        <p>藍牙功能在 LINE 內置瀏覽器中不可用。</p>
        <p>請在外部瀏覽器（如 Chrome）中打開此應用。</p>
        
        <div class="line-prompt-steps">
          <div class="step">
            <span class="step-number">1</span>
            <span class="step-text">點擊下方「複製連結」按鈕</span>
          </div>
          <div class="step">
            <span class="step-number">2</span>
            <span class="step-text">打開 Chrome 或其他瀏覽器</span>
          </div>
          <div class="step">
            <span class="step-number">3</span>
            <span class="step-text">貼上連結並訪問</span>
          </div>
        </div>
      </div>
      
      <div class="line-prompt-actions">
        <button class="btn btn-primary" @click="copyAndOpen">
          📋 複製連結並打開
        </button>
        <button class="btn btn-secondary" @click="copyLink">
          📋 只複製連結
        </button>
        <button class="btn btn-tertiary" @click="dismissPrompt">
          ✕ 關閉提示
        </button>
      </div>
      
      <div v-if="copySuccess" class="line-prompt-success">
        ✓ 連結已複製到剪貼板！
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const showPrompt = ref(false)
const copySuccess = ref(false)

// 檢測是否在 LINE 中
const isInLine = () => {
  const ua = navigator.userAgent.toLowerCase()
  return ua.includes('line')
}

// 檢測是否支持藍牙
const isBluetoothSupported = () => {
  return !!(navigator.bluetooth || window.navigator.bluetooth)
}

// 複製連結到剪貼板
const copyLink = async () => {
  try {
    const url = window.location.href
    await navigator.clipboard.writeText(url)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch (err) {
    console.error('複製失敗:', err)
    // 備用方案：使用 input 元素
    const input = document.createElement('input')
    input.value = window.location.href
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  }
}

// 複製連結並嘗試打開外部瀏覽器
const copyAndOpen = async () => {
  await copyLink()
  
  // 嘗試打開外部瀏覽器
  const url = window.location.href
  
  // 方法 1: 使用 openExternalBrowser 參數
  const externalUrl = new URL(url)
  externalUrl.searchParams.set('openExternalBrowser', '1')
  window.location.href = externalUrl.toString()
  
  // 方法 2: 延遲後嘗試 line:// 協議（備用）
  setTimeout(() => {
    if (isInLine()) {
      window.location.href = `line://web/open?url=${encodeURIComponent(url)}`
    }
  }, 1000)
}

// 關閉提示
const dismissPrompt = () => {
  showPrompt.value = false
  // 保存到 localStorage，24 小時內不再顯示
  localStorage.setItem('linePromptDismissed', Date.now().toString())
}

onMounted(() => {
  // 檢查是否在 LINE 中且藍牙不支持
  if (isInLine() && !isBluetoothSupported()) {
    // 檢查是否在 24 小時內已經關閉過提示
    const dismissed = localStorage.getItem('linePromptDismissed')
    if (!dismissed || Date.now() - parseInt(dismissed) > 24 * 60 * 60 * 1000) {
      showPrompt.value = true
    }
  }
})
</script>

<style scoped>
.line-prompt-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.line-prompt-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  width: 100%;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.line-prompt-header {
  background: linear-gradient(135deg, #00b900 0%, #00a000 100%);
  color: white;
  padding: 20px;
  text-align: center;
}

.line-prompt-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.line-prompt-content {
  padding: 20px;
  text-align: center;
}

.line-prompt-content p {
  margin: 10px 0;
  color: #333;
  font-size: 14px;
  line-height: 1.5;
}

.line-prompt-steps {
  margin: 20px 0;
  text-align: left;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 15px;
}

.step {
  display: flex;
  align-items: center;
  margin: 10px 0;
  font-size: 14px;
  color: #333;
}

.step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #00b900;
  color: white;
  border-radius: 50%;
  font-weight: 600;
  margin-right: 12px;
  flex-shrink: 0;
}

.step-text {
  flex: 1;
}

.line-prompt-actions {
  padding: 0 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn {
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.btn-primary {
  background: #00b900;
  color: white;
}

.btn-primary:active {
  background: #009000;
  transform: scale(0.98);
}

.btn-secondary {
  background: #e8e8e8;
  color: #333;
}

.btn-secondary:active {
  background: #d0d0d0;
  transform: scale(0.98);
}

.btn-tertiary {
  background: transparent;
  color: #666;
  border: 1px solid #ddd;
}

.btn-tertiary:active {
  background: #f5f5f5;
}

.line-prompt-success {
  padding: 10px 20px;
  background: #e8f5e9;
  color: #2e7d32;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .line-prompt-container {
    max-width: 100%;
  }
  
  .line-prompt-header h2 {
    font-size: 16px;
  }
  
  .line-prompt-content p {
    font-size: 13px;
  }
}
</style>