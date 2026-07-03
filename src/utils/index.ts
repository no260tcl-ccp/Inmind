// 🌟 移除對 pages.json 的引入，解決編譯報錯
// import { pages, subPackages, tabBar } from '@/pages.json'

// 🛡️ 全部改用 function 宣告，利用 Hoisting 特性徹底解決 "is not defined"
export function getIsTabbar() {
  return false
}

//export function getLastPage() {
//  const pages = (window as any).getCurrentPages ? (window as any).getCurrentPages() : []
//  return pages.length > 0 ? pages[pages.length - 1] : { route: '', $page: { fullPath: '' } }
//}

// 🛡️ Web 安全版：直接回傳假物件，避免呼叫小程式專屬的 getCurrentPages 導致白畫面
export function getLastPage() {
  return { route: '/', $page: { fullPath: '/' } }
}

// 🛡️ Web 安全版：直接回傳預設路由結構
export function currRoute() {
  return { path: '/', query: {} }
}

export function ensureDecodeURIComponent(url: string): string {
  if (url.startsWith('%')) {
    return ensureDecodeURIComponent(decodeURIComponent(url))
  }
  return url
}

// 關鍵函式 1：解析 URL
export function getUrlObj(url: string) {
  const [path, queryStr] = url.split('?')
  if (!queryStr) return { path, query: {} }

  const query: Record<string, string> = {}
  queryStr.split('&').forEach((item) => {
    const [key, value] = item.split('=')
    query[key] = ensureDecodeURIComponent(value)
  })
  return { path, query }
}

// 關鍵函式 2：獲取當前路由 (修正了變數名稱衝突)
//export function currRoute() {
//  const lastPage = getLastPage()
//  const routeInfo = (lastPage as any).$page // 這裡改名為 routeInfo，避免跟 currRoute 衝突
//  const fullPath = routeInfo ? routeInfo.fullPath : ''
//  return getUrlObj(fullPath)
//}

// 其他工具函式
export function hexToRgba(hex: string, opacity = 1) {
  hex = hex.replace('#', '')
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function hexStringToByteArray(hexString: string): number[] {
  const byteArray: number[] = []
  for (let i = 0; i < hexString.length; i += 2) {
    byteArray.push(parseInt(hexString.substring(i, 2), 16))
  }
  return byteArray
}

export function utf8ArrayToString(array: number[]) {
  let str = ''
  let i = 0
  while (i < array.length) {
    const byte1 = array[i++]
    if (byte1 <= 0x7f) {
      str += String.fromCharCode(byte1)
    } else if (byte1 <= 0xdf) {
      const byte2 = array[i++]
      str += String.fromCharCode(((byte1 & 0x1f) << 6) | (byte2 & 0x3f))
    } else if (byte1 <= 0xef) {
      const byte2 = array[i++]
      const byte3 = array[i++]
      str += String.fromCharCode(((byte1 & 0x0f) << 12) | ((byte2 & 0x3f) << 6) | (byte3 & 0x3f))
    } else {
      const byte2 = array[i++]
      const byte3 = array[i++]
      const byte4 = array[i++]
      let codePoint = ((byte1 & 0x07) << 18) | ((byte2 & 0x3f) << 12) | ((byte3 & 0x3f) << 6) | (byte4 & 0x3f)
      codePoint -= 0x10000
      str += String.fromCharCode(0xd800 + (codePoint >> 10), 0xdc00 + (codePoint & 0x3ff))
    }
  }
  return str
}

export function convertIntStrToNumber(data: any): any {
  if (Array.isArray(data)) return data.map((item) => convertIntStrToNumber(item))
  if (typeof data === 'object' && data !== null) {
    const result: any = {}
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) result[key] = convertIntStrToNumber(data[key])
    }
    return result
  }
  if (typeof data === 'string' && /^-?\d+$/.test(data)) return parseInt(data, 10)
  return data
}

// 🛡️ 修復後的 deviceImg
export function deviceImg(device: any, index = 0) {
  const domain = '' 
  // 🎯 加上防呆：如果 device 不存在，或者 productInfo 不存在，立刻回傳空字串
  if (!device || !device.productInfo) return ''
  
  const { productInformation, configJson } = device.productInfo
  if (!productInformation?.productImage) return ''
  
  let imgs: string[] = []
  try {
    imgs = productInformation.productImage.split(',')
    if (imgs.length === 0) return ''
  } catch (error) {
    return ''
  }
  let result = domain + imgs[index]
  if (configJson && typeof configJson === 'string') {
    try {
      const config = JSON.parse(configJson)
      if (config.colorType === 1) {
        result = domain + imgs[index]
      } else if (config.colorType === 2 && imgs.length > 2) {
        result = domain + imgs[2]
      }
    } catch (error) {
      // 忽略錯誤
    }
  }
  return result
}

// 🛡️ 修復後的 deviceHomeImg
export function deviceHomeImg(device: any, index = 1) {
  const domain = '' 
  // 🎯 同樣加上防呆保護
  if (!device || !device.productInfo) return ''
  
  const { productInformation, configJson } = device.productInfo
  if (!productInformation?.productImage) return ''
  
  let imgs: string[] = []
  try {
    imgs = productInformation.productImage.split(',')
    if (imgs.length === 0) return ''
  } catch (error) {
    return ''
  }
  let result = domain + imgs[index]
  if (configJson && typeof configJson === 'string') {
    try {
      const config = JSON.parse(configJson)
      if (config.colorType === 1) {
        result = domain + imgs[index]
      } else if (config.colorType === 2 && imgs.length > 2) {
        result = domain + imgs[3]
      }
    } catch (error) {
      // 忽略錯誤
    }
  }
  return result
}

export const stringToGB2312 = (str: string) => { return [] } // 暫時封印

// ==========================================
// 補回遺失的工具函式區塊
// ==========================================

let lastVibrateTime = 0
// 1. 拖曳震動回饋 (Web 升級版)
export function dragProgressAdjustVibration(delay: number) {
  const now = Date.now()
  if (now - lastVibrateTime < delay) return
  lastVibrateTime = now
  
  // 使用純 Web 的震動 API (需硬體支援，通常在手機瀏覽器才有作用)
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(15) 
  } else {
    // 電腦版沒有震動馬達，印出提示防當機
    // console.log('[模擬震動]')
  }
}

// 2. 防抖函數 (Debounce)
export function debounce(fn: (...args: any[]) => void, delay = 500) {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (this: any, ...args: any[]) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// 3. 節流函數 (Throttle)
export function throttle(fn: (...args: any[]) => void, delay = 500) {
  let lastTime = 0
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (this: any, ...args: any[]) {
    const now = Date.now()
    if (timer) clearTimeout(timer)
    if (now - lastTime >= delay) {
      fn.apply(this, args)
      lastTime = now
    } else {
      timer = setTimeout(() => {
        fn.apply(this, args)
        lastTime = Date.now()
        timer = null
      }, delay - (now - lastTime))
    }
  }
}

// 4. 非同步重試函數 (Retry)
export function retry(fn: any, maxRetry: number, timeout: number) {
  return new Promise((resolve, reject) => {
    let retryCount = 0
    let timer: ReturnType<typeof setTimeout> | null = null

    const run = async () => {
      try {
        const result = await fn()
        resolve(result)
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        if (retryCount < maxRetry) {
          retryCount++
          if (timer) clearTimeout(timer)
          timer = setTimeout(run, timeout)
        } else {
          reject(error)
        }
      }
    }
    run()
  })
}