<template>
  <view class="modal-overlay" v-if="visible" @tap="close">
    <view class="modal-content" @tap.stop>
      <view class="modal-header">
        <text class="title">完善资料</text>
        <text class="subtitle">选择头像和昵称，让记录更有个性</text>
      </view>

      <view class="avatar-section">
        <button
          class="avatar-btn"
          open-type="chooseAvatar"
          @chooseavatar="onChooseAvatar"
        >
          <image
            v-if="avatarUrl"
            class="avatar-img"
            :src="avatarUrl"
            mode="aspectFill"
          />
          <view v-else class="avatar-placeholder">
            <text class="placeholder-icon">📷</text>
            <text class="placeholder-text">点击选择头像</text>
          </view>
        </button>
      </view>

      <view class="nickname-section">
        <text class="label">昵称</text>
        <input
          type="nickname"
          class="nickname-input"
          placeholder="请输入昵称"
          @blur="onNicknameBlur"
          @input="onNicknameInput"
        />
      </view>

      <view class="action-section">
        <button class="submit-btn" @tap="submit">完成</button>
        <button class="skip-btn" @tap="skip">跳过</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])

const avatarUrl = ref('')
const nickname = ref('')

watch(() => props.visible, (val) => {
  if (val) {
    avatarUrl.value = ''
    nickname.value = ''
  }
})

const onChooseAvatar = (e) => {
  console.log('选择头像:', e.detail)
  avatarUrl.value = e.detail.avatarUrl
}

const onNicknameInput = (e) => {
  nickname.value = e.detail.value
}

const onNicknameBlur = (e) => {
  nickname.value = e.detail.value
}

const submit = () => {
  console.log('提交资料:', { nickName: nickname.value, avatarUrl: avatarUrl.value })

  if (!nickname.value || !nickname.value.trim()) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }
  emit('submit', {
    avatarUrl: avatarUrl.value,
    nickName: nickname.value.trim()
  })
}

const skip = () => {
  emit('submit', {
    avatarUrl: '',
    nickName: '微信用户'
  })
}

const close = () => {
  emit('close')
}
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 80%;
  max-width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx 40rpx;
}

.modal-header {
  text-align: center;
  margin-bottom: 40rpx;

  .title {
    display: block;
    font-size: 36rpx;
    font-weight: bold;
    color: #212121;
    margin-bottom: 12rpx;
  }

  .subtitle {
    display: block;
    font-size: 26rpx;
    color: #999;
  }
}

.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 40rpx;
}

.avatar-btn {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  padding: 0;
  margin: 0;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &::after {
    border: none;
  }
}

.avatar-img {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
}

.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .placeholder-icon {
    font-size: 48rpx;
    margin-bottom: 8rpx;
  }

  .placeholder-text {
    font-size: 22rpx;
    color: #999;
  }
}

.nickname-section {
  margin-bottom: 40rpx;

  .label {
    display: block;
    font-size: 28rpx;
    color: #666;
    margin-bottom: 16rpx;
  }

  .nickname-input {
    width: 100%;
    height: 88rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
    padding: 0 24rpx;
    font-size: 30rpx;
    color: #212121;
    box-sizing: border-box;
  }
}

.action-section {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: #07C160;
  color: #fff;
  border-radius: 12rpx;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    border: none;
  }
}

.skip-btn {
  width: 100%;
  height: 88rpx;
  background: transparent;
  color: #999;
  border-radius: 12rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    border: none;
  }
}
</style>
