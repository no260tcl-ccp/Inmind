//import { UnwrapRef } from 'vue'
import { ref, reactive } from 'vue';
import type { UnwrapRef } from 'vue'; // 🌟 加上 type 關鍵字，獨立一行

type IUseRequestOptions<T> = {
  /** 是否立即执行 */
  immediate?: boolean
  /** 初始化数据 */
  initialData?: T
}

/**
 * useRequest是一个定制化的请求钩子，用于处理异步请求和响应。
 * @param func 一个执行异步请求的函数，返回一个包含响应数据的Promise。
 * @param options 包含请求选项的对象 {immediate, initialData}。
 * @param options.immediate 是否立即执行请求，默认为false。
 * @param options.initialData 初始化数据，默认为undefined。
 * @returns 返回一个对象{loading, error, data, run}，包含请求的加载状态、错误信息、响应数据和手动触发请求的函数。
 */

// 🌟 修改這裡：把原本的 export default function 改成 export function
export function useRequest<T>(
  func: () => Promise<any>, // 若原本的 IResData 報錯找不到，可以暫時用 any 或確保 IResData 有被引入
  options: IUseRequestOptions<T> = { immediate: false },
) {
  const loading = ref(false)
  const error = ref(false)
  const data = ref<T>(options.initialData as T)
  const run = async () => {
    loading.value = true
    return func()
      .then((res) => {
        // 直接返回res 要不然获取不到msg消息
        data.value = res as UnwrapRef<T>

        error.value = false
        return data.value
      })
      .catch((err) => {
        error.value = err
        throw err
      })
      .finally(() => {
        loading.value = false
      })
  }

  options.immediate && run()
  return { loading, error, data, run }
}