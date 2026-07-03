import { useUserStore } from '@/store'
import { showToast } from 'vant'

// 定义默认的请求头
const defaultHeaders: Record<string, string> = {
  'tenant-id': '1',
}

let isNavigatingToLogin = false 

// 获取基础 API 路径
const BASE_URL = import.meta.env.VITE_APP_BASE_API || ''

export const http = <T>(options: any) => {
  const userStore = useUserStore()

  return new Promise<any>(async (resolve, reject) => {
    const headers: Record<string, string> = {
      ...defaultHeaders,
      ...(options.header || {})
    }

    if (options.method !== 'GET' && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'
    }

    let requestUrl = options.url.startsWith('http') ? options.url : `${BASE_URL}${options.url}`
    if (options.query) {
      const cleanQuery = Object.fromEntries(
        Object.entries(options.query).filter(([_, v]) => v != null)
      )
      const queryString = new URLSearchParams(cleanQuery as any).toString()
      if (queryString) {
        requestUrl += (requestUrl.includes('?') ? '&' : '?') + queryString
      }
    }

    let body = undefined
    if (options.method !== 'GET' && options.data) {
      body = JSON.stringify(options.data)
    }

    try {
      const response = await fetch(requestUrl, {
        method: options.method || 'GET',
        headers,
        body
      })

      // 🌟 【防呆避震器】：先讀取為純文字，再嘗試轉 JSON
      const textData = await response.text()
      let resData: any = {}
      
      try {
        // 嘗試將純文字轉為 JSON
        resData = JSON.parse(textData)
      } catch (e) {
        console.warn('⚠️ API 回傳了非 JSON 格式 (可能是 HTML、404 或 Vite 代理失效):', textData.substring(0, 100))
        // 偽造一個 500 錯誤，讓前端可以優雅地 fallback (例如載入預設資料)，而不是直接崩潰
        resData = { code: 500, msg: 'API 尚未連線或找不到該路徑', data: null }
      }

      // 處理回應結果
      if (response.ok || resData.code === 200) {
        if (resData.code === 401 || resData.code === 403) {
          userStore.clearUserInfo()
          const currentRoute = window.location.pathname
          const targetRoute = '/pages/mine/login'

          if (!isNavigatingToLogin && currentRoute !== targetRoute) {
            isNavigatingToLogin = true
            showToast({ type: 'fail', message: '登入已過期，請重新登入' })
            setTimeout(() => {
              window.location.href = targetRoute
              isNavigatingToLogin = false
            }, 1000)
          }
          return reject(resData)
        }
        resolve(resData)
      } else if (response.status === 401 || resData.code === 401) {
        reject(resData)
      } else {
        // 如果是我們偽造的 500 錯誤，就不一定要彈 Toast，讓組件自己處理
        if (!options.hideErrorToast && resData.code !== 500) {
          showToast({ type: 'fail', message: resData.msg || '请求错误' })
        }
        reject(resData)
      }
    } catch (err) {
      console.error('Fetch error:', err)
      showToast({ type: 'fail', message: '服务器没开或连线错误' })
      reject(err)
    }
  })
}

export const httpGet = <T>(url: string, query?: Record<string, any>) => {
  return http<T>({ url, query, method: 'GET' })
}

export const httpPost = <T>(url: string, data?: Record<string, any>, query?: Record<string, any>) => {
  return http<T>({ url, query, data, method: 'POST' })
}

export const httpPut = <T>(url: string, data?: Record<string, any>, query?: Record<string, any>) => {
  return http<T>({ url, query, data, method: 'PUT' })
}

export const httpDelete = <T>(url: string, query?: Record<string, any>) => {
  return http<T>({ url, query, method: 'DELETE' })
}

http.get = httpGet
http.post = httpPost
http.put = httpPut
http.delete = httpDelete