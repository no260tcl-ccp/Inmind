// 🌟 1. 註解掉 pages.json 的引入，解決 Vite 找不到檔案的報錯
// import { pages, subPackages, tabBar } from '@/pages.json'
//import iconv from 'iconv-lite'

const getLastPage = () => {
  // getCurrentPages() 至少有1个元素，所以不再额外判断
  // const lastPage = getCurrentPages().at(-1)
  // 上面那个在低版本安卓中打包回报错，所以改用下面这个【虽然我加了src/interceptions/prototype.ts，但依然报错】
  const pages = getCurrentPages()
  return pages[pages.length - 1]
}

/** 判断当前页面是否是tabbar页  */
export const getIsTabbar = () => {
  // 🌟 2. 移除 tabBar 判斷，直接回傳 false
  return false
  
  /* 原本的邏輯：
  if (!tabBar) {
    return false
  }
  if (!tabBar.list.length) {
    return false
  }
  const lastPage = getLastPage()
  const currPath = lastPage.route
  return !!tabBar.list.find((e) => e.pagePath === currPath)
  */
}

/**
 * 获取当前页面路由的 path 路径和 redirectPath 路径
 */
export const currRoute = () => {
  const lastPage = getLastPage()
  const currRoute = (lastPage as any).$page
  const { fullPath } = currRoute as { fullPath: string }
  return getUrlObj(fullPath)
}

const ensureDecodeURIComponent = (url: string) => {
  if (url.startsWith('%')) {
    return ensureDecodeURIComponent(decodeURIComponent(url))
  }
  return url
}

/**
 * 解析 url 得到 path 和 query
 */
export const getUrlObj = (url: string) => {
  const [path, queryStr] = url.split('?')

  if (!queryStr) {
    return {
      path,
      query: {},
    }
  }
  const query: Record<string, string> = {}
  queryStr.split('&').forEach((item) => {
    const [key, value] = item.split('=')
    query[key] = ensureDecodeURIComponent(value)
  })
  return { path, query }
}

/**
 * 得到所有的需要登录的pages，包括主包和分包的
 */
export const getAllPages = (key = 'needLogin') => {
  // 🌟 3. 移除對 pages 與 subPackages 的依賴，直接回傳空陣列
  return []

  /* 原本的邏輯：
  const mainPages = [
    ...pages
      .filter((page) => !key || page[key])
      .map((page) => ({
        ...page,
        path: `/${page.path}`,
      })),
  ]
  const subPages: any[] = []
  subPackages.forEach((subPageObj) => {
    const { root } = subPageObj
    subPageObj.pages
      .filter((page) => !key || page[key])
      .forEach((page: { path: string } & Record<string, any>) => {
        subPages.push({
          ...page,
          path: `/${root}/${page.path}`,
        })
      })
  })
  return [...mainPages, ...subPages]
  */
}

/**
 * 得到所有的需要登录的pages，包括主包和分包的
 * 只得到 path 数组
 */
export const getNeedLoginPages = (): string[] => getAllPages('needLogin').map((page) => page.path)

/**
 * 得到所有的需要登录的pages，包括主包和分包的
 * 只得到 path 数组
 */
export const needLoginPages: string[] = getAllPages('needLogin').map((page) => page.path)

// 将十六进制颜色值转换为rgba
export const hexToRgba = (hex, opacity = 1) => {
  // 去除#号
  hex = hex.replace('#', '')

  // 处理3位简写颜色
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }

  // 转换为rgb值
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // 返回rgba字符串
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

// 秒转分秒格式 75秒输出: "1:15"
export const formatSeconds = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

// 十六进制字符串转换为字节数组
export const hexStringToByteArray = (hexString: string): number[] => {
  const byteArray: number[] = []
  for (let i = 0; i < hexString.length; i += 2) {
    byteArray.push(parseInt(hexString.substr(i, 2), 16))
  }
  return byteArray
}

// 根据设备状态type跳转页面
export const toPage = (runType) => {
  switch (runType) {
    case 0:
      break
    case 1:
      uni.navigateTo({ url: '/pages-coffeea/extractState/extractState' })
      break
    case 2:
      uni.navigateTo({ url: '/pages-coffeea/backwashState/backwashState' })
      break
    case 3:
      uni.navigateTo({ url: '/pages-coffeea/descalingState/descalingState' })
      break
    case 4:
      uni.navigateTo({ url: '/pages-coffeea/handExtractionState/handExtractionState' })
      break
    case 5:
      uni.navigateTo({ url: '/pages-coffeea/coldExtractionState/coldExtractionState' })
      break
    default:
      break
  }
}

// 去除所有 HTML 标签和样式 (修復 Vite 解析錯誤)
export const stripHtmlTags = (html) => {
  if (typeof html !== 'string') return ''
  return html
    .replace(new RegExp('<script[^>]*>[\\s\\S]*?<\\/script>', 'gi'), '')
    .replace(new RegExp('<style[^>]*>[\\s\\S]*?<\\/style>', 'gi'), '')
    .replace(new RegExp('', 'gi'), '')
    .replace(new RegExp('<[^>]+>', 'g'), '') // 👈 就是這行原本讓 Vite 誤判
    .replace(/&nbsp;/gi, ' ')
    .replace(/&(lt|gt|amp);/gi, (entity) => {
      const entities = { '&lt;': '<', '&gt;': '>', '&amp;': '&' }
      return entities[entity] || entity
    })
    .trim()
}

//  图片域名地址
export const getDomain = () => {
  return 'https://miniadmin.bincoo.com'
}

// 获取设备图片
export const deviceImg = (device, index = 0) => {
  const domain = '' 
  if (!device) {
    return ''
  }
  const { productInformation, configJson } = device.productInfo
  if (!productInformation?.productImage) {
    return ''
  }
  let imgs = []
  try {
    imgs = productInformation.productImage.split(',')
    if (imgs.length === 0) {
      return ''
    }
  } catch (error) {
    console.log(error, productInformation.productImage)
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
      console.log(error, configJson)
    }
  }
  return result
}

export const deviceHomeImg = (device, index = 1) => {
  const domain = '' 
  if (!device) {
    return ''
  }
  const { productInformation, configJson } = device.productInfo
  if (!productInformation?.productImage) {
    return ''
  }
  let imgs = []
  try {
    imgs = productInformation.productImage.split(',')
    if (imgs.length === 0) {
      return ''
    }
  } catch (error) {
    console.log(error, productInformation.productImage)
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
      console.log(error, configJson)
    }
  }
  return result
}

/**
 * 带超时和定时器清理的重试机制
 */
export const retry = (fn, maxRetry, timeout) => {
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

export const dangweiType = (value) => {
  if (value > 65) return '法压冷萃'
  if (value > 30 && value <= 65) return '手冲咖啡'
  if (value > 15 && value <= 30) return '爱乐压'
  if (value > 0 && value <= 15) return '意式浓缩'
  return '' 
}

export const stringToUTF8Array = (str) => {
  const utf8 = []
  for (let i = 0; i < str.length; i++) {
    let codePoint = str.charCodeAt(i)
    if (codePoint < 0x80) {
      utf8.push(codePoint)
    } else if (codePoint < 0x800) {
      utf8.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f))
    } else if (codePoint < 0xd800 || codePoint >= 0xe000) {
      utf8.push(
        0xe0 | (codePoint >> 12),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f),
      )
    } else {
      i++
      codePoint = 0x10000 + ((codePoint & 0x3ff) << 10) + (str.charCodeAt(i) & 0x3ff)
      utf8.push(
        0xf0 | (codePoint >> 18),
        0x80 | ((codePoint >> 12) & 0x3f),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f),
      )
    }
  }
  return utf8
}

// 🌟 2. 暫時把功能封印，回傳空陣列就好
export const stringToGB2312 = (str) => {
  console.warn('⚠️ GB2312 編碼功能暫時停用，先讓 UI 跑起來！')
  return [] // 直接回傳空陣列，避免報錯
  
  /* 原本的程式碼先保留起來
  try {
    const buffer = iconv.encode(str, 'gb2312')
    return Array.from(buffer)
  } catch (error) {
    throw new Error(`GB2312 编码失败: ${error.message}`)
  }
  */
}

export const stringToUTF8ArrayBuffer = (str) => {
  const utf8 = stringToUTF8Array(str)
  const buf = new ArrayBuffer(utf8.length)
  const bufView = new Uint8Array(buf)
  for (let i = 0; i < utf8.length; i++) {
    bufView[i] = utf8[i]
  }
  return buf
}

export const utf8ArrayToString = (array) => {
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
      let codePoint =
        ((byte1 & 0x07) << 18) | ((byte2 & 0x3f) << 12) | ((byte3 & 0x3f) << 6) | (byte4 & 0x3f)
      codePoint -= 0x10000
      str += String.fromCharCode(0xd800 + (codePoint >> 10), 0xdc00 + (codePoint & 0x3ff))
    }
  }
  return str
}

export const hexToString = (hexString) => {
  if (hexString.length % 2 !== 0) {
    throw new Error('十六进制字符串长度必须是偶数')
  }
  let result = ''
  for (let i = 0; i < hexString.length; i += 2) {
    const hexByte = hexString.slice(i, i + 2)
    const charCode = parseInt(hexByte, 16)
    result += String.fromCharCode(charCode)
  }
  return result
}

let lastVibrateTime = 0
export const dragProgressAdjustVibration = (delay) => {
  const now = Date.now()
  if (now - lastVibrateTime < delay) {
    return
  }
  lastVibrateTime = now
  if (window.uni && window.uni.vibrateShort) {
    window.uni.vibrateShort({
      success: () => console.log('震动成功'),
      fail: (err) => console.log('震动失败:', err),
    })
  }
}

export const debounce = (fn: (...args: any[]) => void, delay = 500) => {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (this: any, ...args: any[]) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

export const throttle = (fn: (...args: any[]) => void, delay = 500) => {
  let lastTime = 0
  let timer: number | null = null
  return function (this: any, ...args: any[]) {
    const now = Date.now()
    if (timer) {
      clearTimeout(timer)
    }
    if (now - lastTime >= delay) {
      fn.apply(this, args)
      lastTime = now
    } else {
      timer = setTimeout(
        () => {
          fn.apply(this, args)
          lastTime = Date.now()
          timer = null
        },
        delay - (now - lastTime),
      ) as unknown as number
    }
  }
}

export const convertIntStrToNumber = (data) => {
  if (Array.isArray(data)) {
    return data.map((item) => convertIntStrToNumber(item))
  }
  if (typeof data === 'object' && data !== null) {
    const result = {}
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = convertIntStrToNumber(data[key])
      }
    }
    return result
  }
  if (typeof data === 'string') {
    const intReg = /^-?\d+$/
    if (intReg.test(data)) {
      return parseInt(data, 10)
    }
    return data 
  }
  return data
}

const generatedIds = new Set()
export const initExistIds = (existIds = []) => {
  existIds.forEach((id) => {
    if (Number.isInteger(id) && id >= 10000 && id <= 99999) {
      generatedIds.add(id)
    }
  })
}
export const generate5DigitId = () => {
  if (generatedIds.size >= 90000) return -1
  let id
  do {
    id = Math.floor(Math.random() * 90000) + 10000
  } while (generatedIds.has(id))
  generatedIds.add(id)
  return id
}

export const formatSecondsToMinutes = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  const formattedMinutes = minutes.toString().padStart(2, '0')
  const formattedSeconds = remainingSeconds.toString().padStart(2, '0')
  return `${formattedMinutes}:${formattedSeconds}`
}