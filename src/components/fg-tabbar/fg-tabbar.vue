<template>
  <wd-tabbar
    fixed
    v-model="tabbarStore.curIdx"
    safeAreaInsetBottom
    :bordered="false"
    placeholder
    @change="selectTabBar"
    :zIndex="90"
    custom-style="border-radius: 34rpx 34rpx 0 0;height: 124rpx;"
  >
    <block v-for="(item, idx) in tabbarList" :key="item.path">
      <wd-tabbar-item
        :badge-props="{ top: 3, right: 3 }"
        v-if="item.iconType === 'wot'"
        :title="$t(item.name)"
        :icon="item.icon"
      ></wd-tabbar-item>
      <wd-tabbar-item
        :badge-props="{ top: 3, right: 3 }"
        v-else-if="item.iconType === 'unocss' || item.iconType === 'iconfont'"
        :value="idx === 1 ? 0 : 0"
        :title="$t(item.name)"
      >
        <template #icon>
          <view
            h-40rpx
            w-40rpx
            :class="[item.icon, idx === tabbarStore.curIdx ? 'is-active' : 'is-inactive']"
            class="icon-size"
          ></view>
        </template>
      </wd-tabbar-item>
      <wd-tabbar-item
        :badge-props="{ top: 3, right: 3 }"
        v-else-if="item.iconType === 'local'"
        :title="$t(item.name)"
      >
        <template #icon>
          <image :src="item.icon" h-40rpx w-40rpx />
        </template>
      </wd-tabbar-item>
    </block>
  </wd-tabbar>
</template>

<script setup lang="ts">
// unocss icon 默认不生效，需要在这里写一遍才能生效！注释掉也是生效的，但是必须要有！
// i-carbon-code
import { tabBar } from '@/pages.json'
import { tabbarStore } from './tabbar'

/** tabbarList 里面的 path 从 pages.config.ts 得到 */
const tabbarList = tabBar.list.map((item) => ({
  ...item,
  path: `/${item.pagePath}`,
  name: `tabbar.${item.name}`,
}))

function selectTabBar({ value: index }: { value: number }) {
  // 切换tabbar之前保持之前的下标
  // const oldIndex = tabbarStore.curIdx
  // 跳转商城小程序
  if (index === 2) {
    wx.navigateToMiniProgram({
      appId: 'wx32e065dc35698b49',
      path: 'pages/index/index',
      envVersion: 'release',
      fail(err) {
        // 取消跳转后选中之前tabbar
        // tabbarStore.setCurIdx(oldIndex)
        console.error('跳转商城失败:', err)
      },
    })
  } else {
    const url = tabbarList[index].path
    tabbarStore.setCurIdx(index)
    uni.switchTab({ url })
  }
}
onLoad(() => {
  // 解决原生 tabBar 未隐藏导致有2个 tabBar 的问题
  // #ifdef APP-PLUS | H5
  uni.hideTabBar({
    fail(err) {
      console.log('hideTabBar fail: ', err)
    },
    success(res) {
      console.log('hideTabBar success: ', res)
    },
  })
  // #endif
})
</script>
<style lang="scss" scoped>
.icon-size {
  font-size: 56rpx;
}
</style>
