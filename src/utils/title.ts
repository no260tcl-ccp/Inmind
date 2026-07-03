// 🌟 1. 暫時註解掉多國語言套件的引入
// import i18n, { t } from "@/locale/index";

// 🌟 2. 改寫 updateTitle，直接回傳傳入的字串，不透過 i18n 翻譯
export const updateTitle = (titleUp: string) => {
  // const title = i18n.global.t(titleUp);
  const title = titleUp; // 直接使用原本的文字
  
  // 更新網頁標題
  if (typeof document !== 'undefined') {
    document.title = `${title} - Bincoo`;
  }
}
