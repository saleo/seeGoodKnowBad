<template>
  <view class="container">
    <!-- 顶部栏 -->
    <view class="top-bar">
      <view class="brand-mini">
        <view class="logo-heart-mini">
          <view class="heart-left-mini"></view>
          <view class="heart-right-mini"></view>
        </view>
        <text class="brand-text">见好知非</text>
      </view>

      <view class="user-section">
        <view v-if="userStore.isLoggedIn" class="user-info">
          <image
            v-if="userStore.userAvatar"
            class="avatar"
            :src="userStore.userAvatar"
            mode="aspectFill"
          />
          <view v-else class="avatar-placeholder">👤</view>
          <text class="nickname">{{ userStore.userNickname }}</text>
        </view>
        <button v-else class="login-mini-btn" @tap="goToLogin">登录</button>
      </view>
    </view>

    <view class="input-section">
      <textarea
        :value="content"
        @input="handleInput"
        :placeholder="currentPlaceholder"
        class="content-input"
        placeholder-class="placeholder"
      ></textarea>

      <view class="segmented-control">
        <view
          v-for="option in options"
          :key="option.value"
          :class="['option', { active: selectedType === option.value }]"
          @tap="selectType(option.value)"
        >
          <text :class="['option-text', { active: selectedType === option.value }]">
            {{ option.label }}
          </text>
        </view>
      </view>

      <button class="save-button" @tap="saveRecord">
        <text class="save-icon">✨</text>
        <text>保存记录</text>
      </button>
    </view>

    <view class="timeline-section">
      <view class="section-header">
        <text class="section-title">成长流</text>
        <text class="section-subtitle">见好成光，知非而进</text>
      </view>

      <view v-if="records.length === 0" class="empty-state">
        <view class="empty-icon">🌱</view>
        <text class="empty-text">开始记录你的第一份觉察吧</text>
      </view>

      <view v-for="record in records" :key="record.id" class="record-item">
        <view :class="['color-bar', getColorClass(record)]"></view>
        <view class="record-content">
          <view class="record-header">
            <view class="record-type">
              <text class="type-icon">{{ getTypeIcon(record.type) }}</text>
              <text :class="['type-text', getColorClass(record)]">
                {{ getTypeLabel(record) }}
              </text>
            </view>
            <view class="header-right">
              <text class="record-time">{{ formatTime(record.time || record.createdAt) }}</text>
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
      <button class="action-button delete" @tap="confirmClear">
        <text class="action-icon">🗑️</text>
        <text class="action-text">清空</text>
      </button>
      <button class="action-button export" @tap="exportData">
        <text class="action-icon">📋</text>
        <text class="action-text">导出</text>
      </button>
      <button class="action-button invite" open-type="share" data-type="invite">
        <text class="action-icon">💌</text>
        <text class="action-text">邀请</text>
      </button>
    </view>

    <!-- 同步状态提示 -->
    <view v-if="syncMessage" class="sync-toast">
      <text>{{ syncMessage }}</text>
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
const selectedType = ref('SEE_OTHERS_GOOD')
const syncMessage = ref('')

const records = computed(() => recordStore.records)

const options = [
  { value: 'SEE_OTHERS_GOOD', label: '🙌 见人好' },
  { value: 'SEE_SELF_GOOD', label: '🌟 见我好' },
  { value: 'REFLECT_NON', label: '🧠 知非' }
]

const placeholders = {
  SEE_OTHERS_GOOD: '发现他人的善意与美好...',
  SEE_SELF_GOOD: '记录自己的进步与成长...',
  REFLECT_NON: '觉察不足，轻装前行...'
}

const currentPlaceholder = computed(() => placeholders[selectedType.value])

const handleInput = (e) => {
  content.value = e.detail.value
}

const selectType = (value) => {
  selectedType.value = value
}

const showSyncMessage = (msg) => {
  syncMessage.value = msg
  setTimeout(() => { syncMessage.value = '' }, 2000)
}

const saveRecord = async () => {
  const text = content.value.trim()
  if (!text) {
    uni.showToast({ title: '请输入内容', icon: 'none' })
    return
  }

  uni.showLoading({ title: '保存中...' })

  try {
    // 先保存到本地
    recordStore.addRecord({
      type: selectedType.value,
      content: text
    })

    // 如果已登录，同步到云端
    if (userStore.isLoggedIn) {
      const syncRes = await userStore.syncRecords([{
        type: selectedType.value,
        content: text
      }])

      if (syncRes.success) {
        showSyncMessage('已同步到云端')
      } else {
        showSyncMessage('本地已保存，云端同步失败')
      }
    } else {
      showSyncMessage('已保存到本地')
    }

    content.value = ''
    uni.showToast({ title: '已记录', icon: 'success' })
  } catch (err) {
    console.error('保存失败:', err)
    uni.showToast({ title: '保存失败', icon: 'none' })
  } finally {
    uni.hideLoading()
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

const goToLogin = () => {
  uni.navigateTo({ url: '/pages/index/index' })
}

const getColorClass = (record) => {
  const type = record.type || record.recordType
  if (type === 'SEE_OTHERS_GOOD') return 'orange'
  if (type === 'SEE_SELF_GOOD') return 'gold'
  return 'blue'
}

const getTypeIcon = (type) => {
  const map = {
    'SEE_OTHERS_GOOD': '🙌',
    'SEE_SELF_GOOD': '🌟',
    'REFLECT_NON': '🧠'
  }
  return map[type] || '📝'
}

const getTypeLabel = (record) => {
  const type = record.type || record.recordType
  const map = {
    'SEE_OTHERS_GOOD': '见人好',
    'SEE_SELF_GOOD': '见我好',
    'REFLECT_NON': '知非'
  }
  return map[type] || '记录'
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 加载云端记录
const loadCloudRecords = async () => {
  if (!userStore.isLoggedIn) return

  try {
    const res = await userStore.getCloudRecords()
    if (res.success && res.records) {
      // 合并云端记录到本地（去重）
      const cloudRecords = res.records.map(r => ({
        id: r._id || Date.now(),
        type: r.type,
        content: r.content,
        time: new Date(r.createdAt).getTime(),
        createdAt: new Date(r.createdAt).getTime()
      }))

      // 简单合并：以本地记录为基础，补充云端记录
      const existingIds = new Set(recordStore.records.map(r => r.id))
      const newRecords = cloudRecords.filter(r => !existingIds.has(r.id))

      if (newRecords.length > 0) {
        recordStore.records = [...newRecords, ...recordStore.records]
        recordStore.saveToStorage()
        showSyncMessage(`已同步 ${newRecords.length} 条云端记录`)
      }
    }
  } catch (err) {
    console.error('加载云端记录失败:', err)
  }
}

onMounted(() => {
  recordStore.loadRecords()
  userStore.loadFromStorage()
  loadCloudRecords()
})

onShareAppMessage((res) => {
  if (res.from === 'button' && res.target.dataset.record) {
    const record = JSON.parse(res.target.dataset.record)
    return { title: `【${getTypeIcon(record.type || record.recordType)}】${record.content}` }
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

/* 顶部栏 */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.brand-mini {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.logo-heart-mini {
  width: 48rpx;
  height: 44rpx;
  position: relative;
  display: flex;
}

.heart-left-mini,
.heart-right-mini {
  width: 24rpx;
  height: 40rpx;
  position: relative;
  overflow: hidden;
}

.heart-left-mini {
  background: linear-gradient(180deg, #FFB300 0%, #FF8F00 100%);
  border-radius: 24rpx 24rpx 0 10rpx;
  transform: rotate(-8deg);
  transform-origin: right bottom;
}

.heart-right-mini {
  background: linear-gradient(180deg, #2196F3 0%, #0D47A1 100%);
  border-radius: 24rpx 24rpx 10rpx 0;
  transform: rotate(8deg);
  transform-origin: left bottom;
}

.brand-text {
  font-size: 32rpx;
  font-weight: bold;
  color: $text-dark;
}

.user-section {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
}

.avatar-placeholder {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.nickname {
  font-size: 26rpx;
  color: #666;
}

.login-mini-btn {
  font-size: 24rpx;
  color: $night-blue;
  background: transparent;
  padding: 8rpx 20rpx;
  border: 1rpx solid $night-blue;
  border-radius: 24rpx;
}

/* 输入区域 */
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
}

.placeholder {
  color: #bbb;
}

.segmented-control {
  display: flex;
  margin: 20rpx 0;
  background: #f8f8f8;
  border-radius: 16rpx;
  padding: 4rpx;
}

.option {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  border-radius: 12rpx;
  &.active { background: #fff; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1); }
}

.option-text { font-size: 26rpx; color: #666; }
.option.active .option-text { color: $text-dark; font-weight: bold; }

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
  gap: 12rpx;

  .save-icon {
    font-size: 32rpx;
  }
}

/* 成长流 */
.timeline-section {
  margin-bottom: 30rpx;
}

.section-header {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
  margin-bottom: 20rpx;
  padding: 0 10rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: $text-dark;
}

.section-subtitle {
  font-size: 24rpx;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 60rpx 0;
}

.empty-icon {
  font-size: 64rpx;
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.record-item {
  background: #fff;
  margin-bottom: 20rpx;
  border-radius: 24rpx;
  padding: 24rpx;
  display: flex;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}

.color-bar {
  width: 8rpx;
  margin-right: 20rpx;
  border-radius: 4rpx;
  flex-shrink: 0;
  &.orange { background: $morning-gold; }
  &.gold { background: #F1C40F; }
  &.blue { background: $night-blue; }
}

.record-content {
  flex: 1;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.record-type {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.type-icon {
  font-size: 28rpx;
}

.type-text {
  font-size: 24rpx;
  font-weight: bold;
  &.orange { color: $morning-gold; }
  &.gold { color: #F1C40F; }
  &.blue { color: $night-blue; }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.record-time {
  font-size: 22rpx;
  color: #999;
}

.share-icon-btn {
  background: transparent;
  padding: 0;
  margin: 0;
  line-height: 1;
}

.share-icon {
  font-size: 28rpx;
}

.record-text {
  font-size: 28rpx;
  color: $text-dark;
  line-height: 1.5;
}

/* 底部操作 */
.bottom-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 40rpx;
  margin-bottom: 40rpx;
}

.action-button {
  flex: 1;
  height: 72rpx;
  font-size: 24rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  background: #fff;
  color: #666;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);

  .action-icon {
    font-size: 28rpx;
  }

  .action-text {
    font-size: 24rpx;
  }

  &.delete { color: #e74c3c; }
  &.export { color: $night-blue; }
  &.invite { color: $morning-gold; }
}

/* 同步提示 */
.sync-toast {
  position: fixed;
  bottom: 120rpx;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 16rpx 32rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
  z-index: 100;
}

button::after { border: none; }
</style>
