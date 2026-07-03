/**
 * by 菲鸽 on 2024-03-06
 * 路由拦截，通常也是登录拦截
 * 可以设置路由白名单，或者黑名单，看业务需要选哪一个
 * 我这里因为大部分页面都可以随便进入，所以使用黑名单
 */

// 导入用户状态管理的 store
import { useUserStore } from '@/store'
// 导入获取需要登录页面的方法和默认的需要登录页面数组
import { getNeedLoginPages, needLoginPages as _needLoginPages } from '@/utils'

// TODO Check
// 首页路径
const loginRoute = '/pages/mine/login'

/**
 * 检查用户登录状态
 * @returns {boolean} 返回用户是否已登录
 */
// 定义一个函数来检查用户是否登录
const isLogined = () => {
  // 获取用户状态管理的 store 实例
  const userStore = useUserStore()
  // 返回用户是否登录的状态
  return userStore.isLogined
}

// 判断当前环境是否为开发环境
const isDev = import.meta.env.DEV

/**
 * 黑名单登录拦截器 - （适用于大部分页面不需要登录，少部分页面需要登录）
 */
// 定义一个对象来表示拦截器
const navigateToInterceptor = {
  /**
   * 拦截器的调用逻辑
   * @param {Object} info - 拦截器调用时传递的信息，包含url
   * @returns {boolean} - 返回true表示放行，false表示拦截
   */
  // 定义拦截器的调用方法
  invoke({ url }: { url: string }) {
    // 提取请求的路径，去除查询字符串
    const path = url.split('?')[0]
    // 初始化需要登录的页面路径数组
    let needLoginPages: string[] = []

    // 如果当前环境为开发环境
    if (isDev) {
      // 从 utils 中动态获取需要登录的页面路径
      needLoginPages = getNeedLoginPages()
    } else {
      // 如果不是开发环境，则使用默认的需要登录的页面路径
      needLoginPages = _needLoginPages
    }
    // 检查当前请求的路径是否在需要登录的页面路径数组中
    const isNeedLogin = needLoginPages.includes(path)
    // 如果当前路径不在需要登录的页面路径数组中
    if (!isNeedLogin) {
      // 放行
      return true
    }
    // 检查用户是否已登录
    const hasLogin = isLogined()
    // 如果用户已登录
    if (hasLogin) {
      // 放行
      return true
    }
    // 构造重定向到登录页面的路径，携带原始请求的路径作为查询参数
    // 清空用户信息
    const userStore = useUserStore()
    userStore.clearUserInfo()
    const redirectRoute = `${loginRoute}?redirect=${encodeURIComponent(url)}`
    // 使用 uni.switchTab 进行页面跳转  还可以uni.navigateTo跳转
    uni.navigateTo({ url: redirectRoute })
    // 拦截
    return false
  },
}

/**
 * 路由拦截器的安装类
 */
// 定义一个对象来表示路由拦截器的安装类
export const routeInterceptor = {
  /**
   * 安装路由拦截器
   */
  // 定义安装方法
  install() {
    // 将拦截器安装到 navigateTo 操作上
    uni.addInterceptor('navigateTo', navigateToInterceptor)
    // 将拦截器安装到 reLaunch 操作上
    uni.addInterceptor('reLaunch', navigateToInterceptor)
    // 将拦截器安装到 redirectTo 操作上
    uni.addInterceptor('redirectTo', navigateToInterceptor)
  },
}
