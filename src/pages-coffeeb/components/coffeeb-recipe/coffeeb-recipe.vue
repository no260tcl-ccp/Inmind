<template>
  <view style="margin-top: 15vh">
    <view @click.stop="createFormula">
      <wd-card custom-class="custom-class">
        <view class="mt-3">
          <wd-row>
            <wd-col :span="12">
              <text class="text-2xl text-black">{{ $t('coffeea.recipe.create') }}</text>
            </wd-col>
            <wd-col :span="4" :offset="8"><wd-icon name="add" size="36px" /></wd-col>
          </wd-row>
        </view>
      </wd-card>
    </view>
    <view @click.stop="myFormula">
      <wd-card custom-class="custom-class">
        <view class="mt-3">
          <wd-row>
            <wd-col :span="12">
              <text class="text-2xl text-black">{{ $t('coffeea.recipe.my') }}</text>
            </wd-col>
            <wd-col :span="4" :offset="8"><wd-icon name="view-list" size="36px" /></wd-col>
          </wd-row>
        </view>
      </wd-card>
    </view>
    <view @click.stop="cloudFormula">
      <wd-card custom-class="custom-class">
        <view class="mt-3">
          <wd-row>
            <wd-col :span="12">
              <text class="text-2xl text-black">{{ $t('coffeea.recipe.cloud') }}</text>
            </wd-col>
            <wd-col :span="4" :offset="8"><wd-icon name="cloud" size="36px" /></wd-col>
          </wd-row>
        </view>
      </wd-card>
    </view>
  </view>
</template>
<script lang="ts">
export default {
  options: {
    styleIsolation: 'shared',
    virtualHost: true,
  },
}
</script>
<script lang="ts" setup>
//创建配方
const createFormula = () => {
  uni.navigateTo({
    url: '/pages-coffeeb/formula/formula',
  })
}
//我的配方
const myFormula = () => {
  uni.navigateTo({
    url: '/pages-coffeeb/myFormula/myFormula',
  })
}
//云配方
const cloudFormula = () => {
  uni.navigateTo({
    url: '/pages-coffeeb/cloudFormula/cloudFormula',
  })
}
</script>

<style lang="scss" scoped>
:deep(.custom-class) {
  box-shadow:
    rgba(0, 0, 0, 0.16) 0px 3px 6px,
    rgba(0, 0, 0, 0.23) 0px 3px 6px !important;
}
</style>
