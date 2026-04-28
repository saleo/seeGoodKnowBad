<template>
  <view class="container">
    <view class="top-bar">
      <view class="user-info" v-if="userStore.isLoggedIn">
        <image class="avatar" :src="userStore.userInfo.avatarUrl" mode="aspectFill" />
        <text class="nickname">{{ userStore.userNickname }}</text>
      </view>
      <view v-else class="placeholder"></view>

      <view class="actions">
        <button v-if="userStore.isLoggedIn" class="icon-btn sync" :class="userStore.syncStatus" @tap="handleSync" :disabled="userStore.syncStatus === 'syncing'">
          ☁️
        </button>
        <button v-if="userStore.isLoggedIn" class="icon-btn" @tap="handleLogout">
          🚪
        </button>
        <button v-else class="icon-btn login" @tap="goToLogin">
          👤
        </button>
      </view>
    </view>

    <view class="input-section">
      <textarea
        :value="content"
        @input="handleInput"
        :placeholder="getPlaceholderForType(currentType)"
        class="content-input"
        placeholder-class="placeholder"
      ></textarea>

      <view class="tab-container">
        <view
          v-for="(option, index) in options"
          :key="option.value"
          :class="['tab-item', { active: currentIndex === index }]"
          @tap="switchInput(index)"
        >
          <text :class="['tab-text', { active: currentIndex === index }]">
            {{ option.label }}
          </text>
        </view>
      </view>

      <button class="save-button" @tap="saveWithType">保存记录</button>
    </view>

    <view class="timeline-section">
      <view class="section-title">成长流</view>
      <view v-if="records.length === 0" class="empty-state">
        <text>见好成光，知非而进</text>
      </view>
      <view v-for="record in records" :key="record.id" class="record-item">
        <view :class="['color-bar', getColorClass(record)]"></view>
        <view class="record-content">
          <view class="record-header">
            <text :class="['record-type-icon', getColorClass(record)]">
              {{ getTypeIcon(record) }}
            </text>
            <view class="header-right">
              <text class="record-time">{{ formatTime(record.time) }}</text>
              <button class="share-icon-btn" open-type="share" :data-record="JSON.stringify(record)">
                <text class="share-icon">↗️</text>
              </button>
            </view>
          </view>
          <text class="record-text">{{ record.content }}</text>
        </view>
      </view>
    </view>

    <view class="bottom-actions">
      <button class="action-button delete" @tap="confirmClear">清空</button>
      <button class="action-button export" @tap="exportData">导出</button>
      <button class="action-button invite" open-type="share" data-type="invite">邀请</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { useRecordStore } from '@/store/record'
import { useUserStore } from '@/store/user'

const recordStore = useRecordStore()
const userStore = useUserStore()
const content = ref('')
const currentIndex = ref(0)

const records = computed(() => recordStore.records)

const options = [
  { value: 'SEE_OTHERS_GOOD', label: '🙌 见人好' },
  { value: 'SEE_SELF_GOOD', label: '🌟 见我好' },
  { value: 'REFLECT_NON', label: '🧠 知非' }
]

const currentType = computed(() => {
  return options[currentIndex.value]?.value || options[0].value
})

const placeholderConfig = {
  SEE_OTHERS_GOOD: [
    { text: '今天，谁的光照亮了你？', weight: 1 },
    { text: '看见他人的善意与温暖', weight: 1 },
    { text: '看见光，成为光', weight: 3 }
  ],
  SEE_SELF_GOOD: [
    { text: '记录自己的进步与成长', weight: 1 },
    { text: '你的进步与成长，值得被看见', weight: 1 },
    { text: '看见光，成为光', weight: 3 }
  ],
  REFLECT_NON: [
    { text: '觉察，是改变的开始。', weight: 1 },
    { text: '真诚面对，是成长的起点。', weight: 1 },
    { text: '如实记录，轻装前行。', weight: 1 },
    { text: '觉察，而非审判', weight: 1 }
  ]
}

const getWeightedRandomPlaceholder = (type) => {
  const placeholders = placeholderConfig[type] || placeholderConfig.REFLECT_NON
  const weightedArray = []

  placeholders.forEach(item => {
    for (let i = 0; i < item.weight; i++) {
      weightedArray.push(item.text)
    }
  })

  const randomIndex = Math.floor(Math.random() * weightedArray.length)
  return weightedArray[randomIndex]
}

const getPlaceholderForType = (type) => {
  return getWeightedRandomPlaceholder(type)
}

const switchInput = (index) => {
  currentIndex.value = index
}

const handleInput = (e) => {
  content.value = e.detail.value
}

const saveWithType = () => {
  const text = content.value.trim()
  if (!text) {
    uni.showToast({ title: '请输入内容', icon: 'none' })
    return
  }

  recordStore.addRecord({
    type: currentType.value,
    content: text
  })

  content.value = ''
  uni.showToast({ title: '已记录', icon: 'success' })
}

const goToLogin = () => {
  uni.navigateTo({ url: '/pages/login/login' })
}

const handleLogout = () => {
  uni.showModal({
    title: '确认退出',
    content: '退出后本地记录仍会保留',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.showToast({ title: '已退出', icon: 'success' })
      }
    }
  })
}

const handleSync = async () => {
  const res = await userStore.syncRecords(recordStore.records)
  if (res.success) {
    uni.showToast({ title: '同步成功', icon: 'success' })
  } else {
    uni.showToast({ title: res.error, icon: 'none' })
  }
}

const confirmClear = () => {
  uni.showModal({
    title: '确认清空',
    content: '确定要重置你的成长流吗？',
    success: (res) => {
      if (res.confirm) {
        recordStore.clearAll()
      }
    }
  })
}

const exportData = () => {
  const dataStr = JSON.stringify(recordStore.records, null, 2)
  uni.setClipboardData({
    data: dataStr,
    success: () => uni.showToast({ title: '已复制' })
  })
}

const getColorClass = (record) => {
  const type = record.type
  if (type === 'SEE_OTHERS_GOOD' || type === 'other') return 'orange'
  if (type === 'SEE_SELF_GOOD' || type === 'self') return 'gold'
  if (type === 'REFLECT_NON' || type === 'non') return 'blue'
  return 'blue'
}

const getTypeIcon = (record) => {
  const type = record.type
  const subtype = record.subtype

  if (type === 'SEE_OTHERS_GOOD') return '🙌'
  if (type === 'SEE_SELF_GOOD') return '🌟'
  if (type === 'REFLECT_NON') return '🧠'

  if (type === 'good') {
    return subtype === 'other' ? '🙌' : '🌟'
  }
  if (type === 'non') return '🧠'

  return '📝'
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''

  const timestampNum = Number(timestamp)
  if (isNaN(timestampNum)) return timestamp

  const now = new Date()
  const date = new Date(timestampNum)
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays === 1) return '昨天'
  if (diffDays === 2) return '前天'
  if (diffDays < 7) return `${diffDays}天前`
  if (diffDays < 14) return '一周前'
  if (diffDays < 21) return '两周前'
  if (diffDays < 30) return '三周前'
  if (diffDays < 60) return '一个月前'
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`
  if (diffDays < 730) return '一年前'
  return `${Math.floor(diffDays / 365)}年前`
}

onMounted(() => {
  userStore.loadFromStorage()
})

onShareAppMessage((res) => {
  if (res.from === 'button' && res.target.dataset.record) {
    const record = JSON.parse(res.target.dataset.record)
    return { title: `【${getTypeIcon(record)}】${record.content}` }
  }
  return { title: '见好知非' }
})

onShareTimeline(() => ({ title: '见好知非' }))
</script>

<style scoped lang="scss">
$morning-gold: #FFB300;
$night-blue: #0D47A1;
$bg-gray: #F5F5F5;
$text-dark: #212121;

.container {
  min-height: 100vh;
  padding: 30rpx;
  background: $bg-gray;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #ddd;
}

.nickname {
  font-size: 28rpx;
  color: $text-dark;
  font-weight: 500;
}

.actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.icon-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.08);

  &.sync.syncing {
    opacity: 0.6;
  }

  &.sync.synced {
    background: #e6f7e6;
  }

  &.login {
    background: $morning-gold;
  }
}

.input-section {
  background: #fff;
  border-radius: 32rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.content-input {
  width: 100%;
  height: 200rpx;
  font-size: 30rpx;
  color: $text-dark;
  margin-bottom: 20rpx;
}

.tab-container {
  display: flex;
  margin: 20rpx 0;
  border-bottom: 2rpx solid #e0e0e0;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  position: relative;
  transition: all 0.3s ease;
  &.active {
    color: $night-blue;
  }
  &.active::after {
    content: '';
    position: absolute;
    bottom: -2rpx;
    left: 20%;
    width: 60%;
    height: 4rpx;
    background: $night-blue;
    border-radius: 2rpx;
  }
}

.tab-text {
  font-size: 26rpx;
  color: #666;
  font-weight: 500;
  &.active {
    color: $night-blue;
    font-weight: bold;
  }
}

.save-button {
  width: 100%;
  height: 88rpx;
  background: $night-blue;
  color: #fff;
  border-radius: 16rpx;
  font-size: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20rpx;
}

.record-item {
  background: #fff;
  margin-bottom: 20rpx;
  border-radius: 24rpx;
  padding: 24rpx;
  display: flex;
}

.color-bar {
  width: 8rpx;
  margin-right: 20rpx;
  border-radius: 4rpx;
  &.orange { background: $morning-gold; }
  &.gold { background: #F1C40F; }
  &.blue { background: $night-blue; }
}

.record-type-icon { font-size: 32rpx; }
.record-time { font-size: 22rpx; color: #999; }
.record-text { font-size: 28rpx; color: $text-dark; line-height: 1.5; }

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12rpx;
}

.record-time {
  font-size: 22rpx;
  color: #999;
  white-space: nowrap;
}

.share-icon-btn {
  padding: 0;
  margin: 0;
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  line-height: 1;
}

.share-icon {
  font-size: 24rpx;
  line-height: 1;
}

.bottom-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 40rpx;
}

.action-button {
  flex: 1;
  height: 72rpx;
  font-size: 24rpx;
  border-radius: 12rpx;
  &.delete { color: #e74c3c; }
}

button::after { border: none; }
</style>
