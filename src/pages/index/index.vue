<template>
  <view class="login-page">
    <view class="brand-section">
      <view class="logo-heart">
        <view class="heart-left">
          <view class="sun"></view>
        </view>
        <view class="heart-right">
          <view class="moon"></view>
        </view>
      </view>
      <view class="logo-text">
        <text class="text-jian">见</text>
        <text class="text-hao">好</text>
        <text class="text-zhi">知</text>
        <text class="text-fei">非</text>
      </view>
      <view class="slogan">见光成光，知非而进</view>
    </view>

    <view class="action-section">
      <button class="wechat-btn" @tap="handleWeChatLogin">
        <text class="icon">💬</text>
        <text>微信一键登录</text>
      </button>

      <view class="info-icon" @tap="toggleInfo">
        <text class="icon-q">?</text>
      </view>
    </view>

    <view class="info-panel" v-if="showInfo">
      <view class="info-content">
        <view class="info-title">关于「见好知非」</view>
        <view class="info-desc">「见好知非」是一个记录与觉察的小工具。</view>
        <view class="info-item">🙌 见人好 — 发现他人的善意与美好</view>
        <view class="info-item">🌟 见我好 — 记录自己的进步与成长</view>
        <view class="info-item">🧠 知非 — 觉察不足，轻装前行</view>
        <view class="info-belief">我们相信：看见光，才能成为光。</view>
      </view>
    </view>

    <view class="footer">
      <text class="tip">登录即表示同意《用户协议》和《隐私政策》</text>
    </view>

    <ProfileSetupModal
      :visible="showProfileModal"
      @close="showProfileModal = false"
      @submit="handleProfileSubmit"
    />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/store/user'
import ProfileSetupModal from '@/components/ProfileSetupModal.vue'

const userStore = useUserStore()
const showInfo = ref(false)
const showProfileModal = ref(false)

const toggleInfo = () => {
  showInfo.value = !showInfo.value
}

const handleWeChatLogin = async () => {
  // 若已登录，直接跳转，不再弹出完善资料框
  if (userStore.isLoggedIn) {
    uni.navigateTo({
      url: '/pages/record/record',
      fail: (err) => {
        console.error('跳转失败:', err)
        uni.showToast({ title: '页面跳转失败', icon: 'none' })
      }
    })
    return
  }

  uni.showLoading({ title: '登录中...' })
  const res = await userStore.loginWithWeChat()
  uni.hideLoading()

  if (res.success) {
    showProfileModal.value = true
  } else {
    uni.showToast({ title: res.error || '登录失败', icon: 'none' })
  }
}

const handleProfileSubmit = async (profile) => {
  console.log('收到资料:', profile)

  uni.showLoading({ title: '保存中...' })
  const res = await userStore.updateProfile(profile)
  uni.hideLoading()

  console.log('保存结果:', res)

  if (res.success) {
    showProfileModal.value = false
    console.log('准备跳转到记录页面')

    uni.navigateTo({
      url: '/pages/record/record',
      success: () => {
        console.log('跳转成功')
      },
      fail: (err) => {
        console.error('跳转失败:', err)
        uni.showToast({ title: '页面跳转失败', icon: 'none' })
      }
    })
  } else {
    uni.showToast({ title: res.error || '保存失败', icon: 'none' })
  }
}
</script>

<style scoped lang="scss">
$morning-gold: #FFB300;
$night-blue: #0D47A1;
$text-dark: #212121;

.login-page {
  min-height: 100vh;
  padding: 60rpx 40rpx;
  background: #fff;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.brand-section {
  text-align: center;
  margin-top: 80rpx;
  margin-bottom: 60rpx;
}

.logo-heart {
  width: 200rpx;
  height: 180rpx;
  margin: 0 auto 20rpx;
  position: relative;
  display: flex;
}

.heart-left,
.heart-right {
  width: 100rpx;
  height: 160rpx;
  position: relative;
  overflow: hidden;
}

.heart-left {
  background: linear-gradient(180deg, #FFB300 0%, #FF8F00 100%);
  border-radius: 100rpx 100rpx 0 40rpx;
  transform: rotate(-8deg);
  transform-origin: right bottom;
}

.heart-right {
  background: linear-gradient(180deg, #2196F3 0%, #0D47A1 100%);
  border-radius: 100rpx 100rpx 40rpx 0;
  transform: rotate(8deg);
  transform-origin: left bottom;
}

.sun {
  width: 48rpx;
  height: 48rpx;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 40rpx;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 0 0 12rpx rgba(255,255,255,0.3);
}

.moon {
  width: 40rpx;
  height: 40rpx;
  background: transparent;
  border-radius: 50%;
  position: absolute;
  top: 44rpx;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: -8rpx 4rpx 0 0 #fff;
}

.logo-text {
  display: flex;
  justify-content: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
  font-size: 48rpx;
  font-weight: bold;
}

.text-jian, .text-hao {
  color: #FFB300;
}

.text-zhi, .text-fei {
  color: #0D47A1;
}

.slogan {
  font-size: 28rpx;
  color: #999;
}

.action-section {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  margin-bottom: 40rpx;
  flex-shrink: 0;
}

.wechat-btn {
  width: 100%;
  height: 96rpx;
  background: #07C160;
  color: #fff;
  border-radius: 16rpx;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;

  .icon {
    font-size: 36rpx;
  }
}

.info-icon {
  width: 48rpx;
  height: 48rpx;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;

  .icon-q {
    font-size: 28rpx;
    color: #999;
    font-weight: bold;
  }
}

.info-panel {
  background: #f8f9fa;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 40rpx;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.info-content {
  text-align: left;
}

.info-title {
  font-size: 32rpx;
  font-weight: bold;
  color: $text-dark;
  margin-bottom: 20rpx;
  text-align: center;
}

.info-desc {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
  line-height: 1.6;
}

.info-item {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 12rpx;
  line-height: 1.6;
}

.info-belief {
  font-size: 28rpx;
  color: #999;
  margin-top: 16rpx;
  line-height: 1.6;
  text-align: center;
}

.footer {
  margin-top: auto;
  padding-top: 40rpx;
  padding-bottom: 40rpx;
  text-align: center;
  flex-shrink: 0;
}

.tip {
  font-size: 22rpx;
  color: #bbb;
}

button::after {
  border: none;
}
</style>
