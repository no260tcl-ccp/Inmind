// hooks/useRunStatusWatcher.ts
// 🌟 補上這行，把需要的 Vue API 引入進來
import { watch, ref, computed } from 'vue'
//import type { Ref } from 'vue'
// // 定义 runType 对应的页面路径映射
// const RUN_TYPE_TO_PAGE = {
//   1: 'pages-coffeea/extractState/extractState',
//   2: 'pages-coffeea/backwashState/backwashState',
//   3: 'pages-coffeea/descalingState/descalingState',
//   4: 'pages-coffeea/handExtractionState/handExtractionState',
//   5: 'pages-coffeea/coldExtractionState/coldExtractionState',
// } as const

// type RunType = keyof typeof RUN_TYPE_TO_PAGE

// 定义 RUN_TYPE_TO_PAGE 的类型
type RunTypeToPage = Record<string, string>
/**
 * 封装页面跳转逻辑
 * @param targetRoute 目标页面路径
 */
function navigateToPage(targetRoute: string): void {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const currentRoute = currentPage.route

  if (currentRoute === targetRoute) {
    uni.redirectTo({ url: `/${targetRoute}` })
  } else {
    uni.navigateTo({ url: `/${targetRoute}` })
  }
}

export function useRunStatusWatcher(runType, autoJump, runTypeToPage) {
  watch(
    runType,
    (newVal) => {
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const currentRoute = currentPage.route

      // 如果 autoJump 为 true 或者当前处于反冲洗或除垢页面，则自动跳转
      // if (
      //   autoJump.value ||
      //   currentRoute === 'pages-coffeea/backwash/backwash' ||
      //   currentRoute === 'pages-coffeea/descaling/descaling'
      // ) {
      //   toPage(newVal)
      // }
      if (autoJump.value) {
        toPage(newVal)
      }
    },
    { immediate: true },
  )

  /**
   * 根据 runType 执行页面跳转
   * @param runType 当前运行状态
   */
  const toPage = (runType): void => {
    const targetRoute = runTypeToPage[runType]
    if (!targetRoute) return // 防止无效 runType

    navigateToPage(targetRoute)
  }

  return {
    toPage,
  }
}
