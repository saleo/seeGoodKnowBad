<template>
  <view class="login-page">
    <view class="brand-section">
      <view class="logo">🌟</view>
      <view class="app-name">见好知非</view>
      <view class="slogan">见光成光，知非而进</view>
    </view>

    <view class="form-section">
      <view class="input-group">
        <text class="label">昵称</text>
        <input
          class="input"
          v-model="nickname"
          placeholder="请输入昵称"
          placeholder-class="placeholder"
        />
      </view>

      <view class="input-group">
        <text class="label">密码</text>
        <input
          class="input"
          v-model="password"
          password
          placeholder="请输入密码"
          placeholder-class="placeholder"
        />
      </view>

      <button class="submit-btn" @tap="handleRegister">注册</button>
      <button class="submit-btn secondary" @tap="handleLogin">登录</button>
    </view>

    <view class="divider">
      <view class="line"></view>
      <text class="text">或</text>
      <view class="line"></view>
    </view>

    <button class="wechat-btn" @tap="handleWeChatLogin">
      <text class="icon">💬</text>
      <text>微信一键登录</text>
    </button>

    <view class="footer">
      <text class="tip">登录即表示同意《用户协议》和《隐私政策》</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const nickname = ref('')
const password = ref('')

const handleRegister = async () => {
  if (!nickname.value.trim()) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }
  if (!password.value.trim()) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }

  // 模拟注册
  uni.showLoading({ title: '注册中...' })
  await new Promise(resolve => setTimeout(resolve, 800))
  uni.hideLoading()

  userStore.token = 'mock-token-' + Date.now()
  userStore.isLoggedIn = true
  userStore.userInfo = {
    nickName: nickname.value,
    avatarUrl: ''
  }

  uni.showToast({ title: '注册成功', icon: 'success' })
  setTimeout(() => {
    uni.navigateBack()
  }, 1000)
}

const handleLogin = async () => {
  if (!nickname.value.trim()) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }
  if (!password.value.trim()) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }

  // 模拟登录验证
  uni.showLoading({ title: '登录中...' })
  await new Promise(resolve => setTimeout(resolve, 800))
  uni.hideLoading()

  userStore.token = 'mock-token-' + Date.now()
  userStore.isLoggedIn = true
  userStore.userInfo = {
    nickName: nickname.value,
    avatarUrl: ''
  }

  uni.showToast({ title: '登录成功', icon: 'success' })
  setTimeout(() => {
    uni.navigateBack()
  }, 1000)
}

const handleWeChatLogin = async () => {
  const res = await userStore.loginWithWeChat()
  if (res.success) {
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1000)
  } else {
    uni.showToast({ title: res.error || '登录失败', icon: 'none' })
  }
}
</script>

<style scoped lang="scss">
$morning-gold: #FFB300;
$night-blue: #0D47A1;
$bg-gray: #F5F5F5;
$text-dark: #212121;

.login-page {
  min-height: 100vh;
  padding: 60rpx 40rpx;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.brand-section {
  text-align: center;
  margin-bottom: 80rpx;
  margin-top: 40rpx;
}

.logo {
  font-size: 120rpx;
  margin-bottom: 20rpx;
}

.app-name {
  font-size: 48rpx;
  font-weight: bold;
  color: $text-dark;
  margin-bottom: 12rpx;
}

.slogan {
  font-size: 28rpx;
  color: #999;
}

.form-section {
  margin-bottom: 40rpx;
}

.input-group {
  margin-bottom: 32rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: $text-dark;
  margin-bottom: 12rpx;
  font-weight: 500;
}

.input {
  width: 100%;
  height: 88rpx;
  background: $bg-gray;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 30rpx;
  color: $text-dark;
  box-sizing: border-box;
}

.placeholder {
  color: #bbb;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: $night-blue;
  color: #fff;
  border-radius: 16rpx;
  font-size: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;

  &.secondary {
    background: #fff;
    color: $night-blue;
    border: 2rpx solid $night-blue;
  }
}

.divider {
  display: flex;
  align-items: center;
  margin: 20rpx 0 40rpx;

  .line {
    flex: 1;
    height: 1rpx;
    background: #e0e0e0;
  }

  .text {
    padding: 0 24rpx;
    font-size: 26rpx;
    color: #999;
  }
}

.wechat-btn {
  width: 100%;
  height: 88rpx;
  background: #07C160;
  color: #fff;
  border-radius: 16rpx;
  font-size: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;

  .icon {
    font-size: 36rpx;
  }
}

.footer {
  margin-top: auto;
  padding-bottom: 40rpx;
  text-align: center;
}

.tip {
  font-size: 22rpx;
  color: #bbb;
}

button::after {
  border: none;
}
</style>
