<template>
  <van-popup
    v-model:show="userShowLocal"
    @closed="userClose()"
    position="left"
    :z-index="99"
    style="width: 275px; height: 100%; overflow: hidden;"
    :safe-area-inset-bottom="true"
  >
    <div class="overflow-hidden flex main-container">
      <div class="w-full flex flex-col">
        <div class="mr-4 ml-4 flex justify-between items-center pb-6">
          <div>
            <div class="text-3.5 text-black">{{ nickname }}</div>
            <div class="text-3 mt-1 tips">会生活，才够酷！</div>
          </div>
          <div class="flex justify-center items-center">
            <div v-if="avatar === ''">
              <van-image
                round
                width="48"
                height="48"
                :src="`${cdnBaseUrl}/21e18276be915687c187ed90027221e1d3664836daa87986b54c8dab44aa5da0.png`"
              />
            </div>
            <div v-else>
              <van-image round width="48" height="48" :src="avatar" />
            </div>
          </div>
        </div>
        <div class="flex-1">
          <div>
            <div class="divider mx-4 my-2"></div>
            <van-cell-group :border="false">
              <van-cell title="修改头像" is-link @click="onChooseavatar">
                <template #icon>
                  <div class="flex items-center h-full mr-1">
                    <van-image width="20" height="20" src="/static/images/user/avatar.png" />
                  </div>
                </template>
              </van-cell>
              <van-cell title="修改昵称" is-link @click="nicknameShow = true">
                <template #icon>
                  <div class="flex items-center h-full mr-1">
                    <van-image width="20" height="20" src="/static/images/user/edit.png" />
                  </div>
                </template>
              </van-cell>
            </van-cell-group>
          </div>
          <div>
            <div class="divider mx-4 my-2"></div>
            <van-cell-group :border="false">
              <van-cell :title="$t('mine.customer')" is-link>
                <template #icon>
                  <div class="flex items-center h-full mr-1">
                    <van-image width="20" height="20" src="/static/images/user/customer.png" />
                  </div>
                </template>
              </van-cell>
              <van-cell title="意见反馈" is-link>
                <template #icon>
                  <div class="flex items-center h-full mr-1">
                    <van-image width="20" height="20" src="/static/images/user/feeback.png" />
                  </div>
                </template>
              </van-cell>
              <van-cell title="分享小程序" is-link>
                <template #icon>
                  <div class="flex items-center h-full mr-1">
                    <van-image width="20" height="20" src="/static/images/user/share.png" />
                  </div>
                </template>
              </van-cell>
            </van-cell-group>
          </div>
          <div>
            <div class="divider mx-4 my-2"></div>
            <van-cell-group :border="false">
              <van-cell title="版本信息">
                <template #icon>
                  <div class="flex items-center h-full mr-1">
                    <van-image width="20" height="20" src="/static/images/user/version.png" />
                  </div>
                </template>
                <template #value>
                  <span class="font-size-3">Version 2.0.0</span>
                </template>
              </van-cell>
            </van-cell-group>
          </div>
        </div>
        <div class="flex flex-col items-center mt-5 tips font-size-3 h-40">
          <div>
            <van-image width="88" height="44" :src="logoUrl" />
          </div>
          <div class="mt-3">ICP备案号：粤ICP备2025361148</div>
        </div>
      </div>
    </div>
  </van-popup>

  <van-popup
    v-model:show="nicknameShow"
    style="border-radius:16px; background: transparent;"
    :z-index="100"
    @closed="closeNickname"
    :close-on-click-overlay="false"
  >
    <div class="popup-content">
      <template v-if="true">
        <div class="close-icon">
          <van-image
            class="w-6"
            width="22"
            height="22"
            src="/static/images/user/close.png"
            @click="closeNickname"
          />
        </div>

        <div class="header">
          <div>修改昵称</div>
        </div>
        <div class="main">
          <input
            placeholder="请输入昵称"
            @input="bindInput"
            :value="nickname"
            type="text"
            @blur="bindblur"
          />
        </div>
        <div class="footer">
          <van-button block type="danger" class="custom-btn" @click="saveUserInfo">
            确认
          </van-button>
        </div>
      </template>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useUserStore } from '@/store';
import { updateTitle } from '@/utils/title';
import { httpPut } from '@/utils/http';
import { useRequest } from '@/hooks/useRequest';
import { showSuccessToast, showFailToast } from 'vant';

const VITE_UPLOAD_BASEURL = import.meta.env.VITE_UPLOAD_BASEURL;
const nicknameShow = ref(false);
const cdnBaseUrl = import.meta.env.VITE_CDN_BASE_URL || 'https://cdn.bincoocoffee.cn';
const logoUrl = `${cdnBaseUrl}/a2a24e75ced0bc3426fcb87778fe1e7ba35470a9e4d166d5fd5a6669841adc59.png`;

const props = defineProps({
  userShow: { type: Boolean, required: true },
});

const userShowLocal = ref(props.userShow);

watch(
  () => props.userShow,
  (newValue) => {
    userShowLocal.value = newValue;
    userInfo.value = userStore.userInfo;
    city.value = userInfo.value.city;
    phone.value = userInfo.value.phone;
    gender.value = userInfo.value.gender;
    country.value = userInfo.value.country;
    province.value = userInfo.value.province;
    avatar.value = userInfo.value.avatar;
    nickname.value = userInfo.value.nickname;
    oldNickname.value = userInfo.value.nickname;
  }
);

const emit = defineEmits(['closeUserShow']);
const userClose = () => { emit('closeUserShow'); };
const closeNickname = () => {
  nickname.value = oldNickname.value;
  nicknameShow.value = false;
};

const userStore = useUserStore();
const userInfo = ref(userStore.userInfo);
const loading = ref<boolean>(false);
const city = ref<string>('');
const country = ref<string>('');
const province = ref<string>('');
const phone = ref<string>('');
const gender = ref<number>(1);
const avatar = ref(userInfo.value.avatar);
const nickname = ref(userInfo.value.nickname || 'Bincoo');
const oldNickname = ref('');

const bindInput = (e: any) => { nickname.value = e.detail ? e.detail.value : e.target.value; };
const bindblur = (e: any) => { nickname.value = e.detail ? e.detail.value : e.target.value; };

const onChooseavatar = (res: any) => {
  if (!res.detail || !res.detail.avatarUrl) {
    showFailToast('Web環境暫不支援直接獲取微信頭像');
    return;
  }
  loading.value = true;
  uni.uploadFile({
    url: VITE_UPLOAD_BASEURL,
    filePath: res.detail.avatarUrl,
    header: { 'tenant-id': '1' },
    name: 'file',
    success: (uploadFileRes: any) => {
      const json = JSON.parse(uploadFileRes.data);
      avatar.value = json.data;
      loading.value = false;
      showSuccessToast('上传成功');
      saveUserInfo();
    },
    fail: (err: any) => {
      loading.value = false;
      showFailToast('上传失败' + err);
    }
  });
};

const saveUserInfo = () => {
  loading.value = true;
  saveUser().then((response: any) => {
    loading.value = false;
    if (response && response.code === 200) {
      userStore.setUserInfo({
        ...userInfo.value,
        nickname: nickname.value,
        avatar: avatar.value,
      });
      showSuccessToast('保存成功');
      oldNickname.value = nickname.value;
      nicknameShow.value = false;
    } else {
      showFailToast('操作失败');
    }
  });
};

const { run: saveUser } = useRequest<any>(() =>
  httpPut('/wxuser/user', {
    openid: userInfo.value.openid,
    avatar: avatar.value,
    nickname: nickname.value,
    city: city.value,
    country: country.value,
    province: province.value,
    phone: phone.value,
    gender: gender.value,
    id: userInfo.value.id,
  })
);

onMounted(() => { updateTitle('tabbar.mine'); });
</script>

<style lang="scss" scoped>
:root { background-color: #ffffff; }
.main-container {
  padding-top: 6.5vh;
  width: 100%;
  height: 100%;
}
.tips { color: #999999; }
.divider { border-top: 1px solid #f5f5f5; }
.popup-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 250px;
  padding: 20px;
  background-color: #fff;
  position: relative;
  .close-icon { position: absolute; top: 10px; right: 10px; }
  .header { font-size: 16px; margin-bottom: 20px; }
  .main {
    width: 100%;
    input {
      border-radius: 6px;
      width: 100%;
      background: #f5f5f5;
      border: 1px solid #f1f1f1;
      height: 44px;
      text-align: center;
    }
  }
  .footer {
    width: 100%;
    margin-top: 20px;
    :deep(.van-button) { width: 100% !important; height: 40px !important; }
  }
}
</style>