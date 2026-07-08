<!-- src/components/LineExternalBrowserPrompt.vue -->
<template>
  <div v-if="showPrompt" class="prompt-overlay">
    <div class="prompt-modal">
      <div class="prompt-header">
        <h2>⚠️ 藍牙連線提示</h2>
      </div>
      
      <div class="prompt-body">
        <p>
          我們偵測到你在 LINE 中打開此頁面。
        </p>
        <p>
          為了確保藍牙連線功能正常運作，建議你在系統預設瀏覽器（Chrome）中打開此頁面。
        </p>
        <p class="prompt-note">
          💡 <strong>提示：</strong>在外部瀏覽器中打開後，藍牙連線會更穩定。
        </p>
      </div>

      <div class="prompt-actions">
        <button class="btn-primary" @click="handleOpenExternal">
          在外部瀏覽器打開
        </button>
        <button class="btn-secondary" @click="handleContinue">
          繼續在 LINE 中使用
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  showPrompt: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['open-external', 'continue-in-line'])

const handleOpenExternal = () => {
  const separator = window.location.href.includes('?') ? '&' : '?'
  const externalURL = `${window.location.href}${separator}openExternalBrowser=1`
  window.location.href = externalURL
  emit('open-external')
}

const handleContinue = () => {
  emit('continue-in-line')
}
</script>

<style scoped>
.prompt-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.prompt-modal {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  width: 90%;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.prompt-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  text-align: center;
}

.prompt-header h2 {
  margin: 0;
  font-size: 18px;
}

.prompt-body {
  padding: 20px;
  line-height: 1.6;
  color: #333;
}

.prompt-body p {
  margin: 10px 0;
}

.prompt-note {
  background-color: #f0f4ff;
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid #667eea;
  margin: 15px 0 0 0;
}

.prompt-actions {
  display: flex;
  gap: 10px;
  padding: 15px 20px;
  background-color: #f9f9f9;
  border-top: 1px solid #eee;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #667eea;
  color: white;
}

.btn-primary:hover {
  background-color: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background-color: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #d0d0d0;
}
</style>
