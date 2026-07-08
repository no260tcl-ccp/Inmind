// src/composables/useLineExternalBrowserPrompt.js
import { ref, onMounted } from 'vue'

export function useLineExternalBrowserPrompt() {
  const showPrompt = ref(false)
  const isOpenedInLINE = ref(false)

  /**
   * 檢測是否在 LINE 中打開
   */
  const detectLINE = () => {
    isOpenedInLINE.value = /Line/i.test(navigator.userAgent)
    return isOpenedInLINE.value
  }

  /**
   * 生成帶有 openExternalBrowser 參數的 URL
   */
  const getExternalBrowserURL = (url = window.location.href) => {
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}openExternalBrowser=1`
  }

  /**
   * 顯示提示框
   */
  const showPromptIfInLINE = () => {
    if (detectLINE()) {
      showPrompt.value = true
    }
  }

  /**
   * 用戶點擊「在外部瀏覽器打開」時
   */
  const openInExternalBrowser = () => {
    const externalURL = getExternalBrowserURL()
    window.location.href = externalURL
  }

  /**
   * 用戶點擊「繼續在 LINE 中」時
   */
  const continueInLINE = () => {
    showPrompt.value = false
  }

  /**
   * 在組件掛載時檢測並顯示提示
   */
  const promptOnMount = () => {
    onMounted(() => {
      showPromptIfInLINE()
    })
  }

  return {
    showPrompt,
    isOpenedInLINE,
    detectLINE,
    getExternalBrowserURL,
    showPromptIfInLINE,
    openInExternalBrowser,
    continueInLINE,
    promptOnMount
  }
}
