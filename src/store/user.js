import { defineStore } from 'pinia'
import { storage } from '@/utils/storage'

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    userInfo: null,
    token: '',
    syncStatus: 'idle'
  }),

  getters: {
    userNickname: (state) => state.userInfo?.nickName || '未登录',
    userAvatar: (state) => state.userInfo?.avatarUrl || '',
    canSync: (state) => state.isLoggedIn && state.token
  },

  actions: {
    async loginWithWeChat() {
      try {
        const loginRes = await uni.login({ provider: 'weixin' })

        if (loginRes.code) {
          const { result } = await uni.cloud.callFunction({
            name: 'login',
            data: { code: loginRes.code }
          })

          if (result.success) {
            this.token = result.openid
            this.isLoggedIn = true
            this.userInfo = {
              nickName: '微信用户',
              avatarUrl: ''
            }
            storage.set('user_token', this.token)
            storage.set('user_info', this.userInfo)
            return { success: true }
          } else {
            return { success: false, error: result.error }
          }
        }
      } catch (err) {
        console.error('登录失败:', err)
        return { success: false, error: err.message || '登录失败' }
      }
    },

    async updateProfile(profile) {
      try {
        this.userInfo = {
          ...this.userInfo,
          nickName: profile.nickName,
          avatarUrl: profile.avatarUrl
        }

        storage.set('user_info', this.userInfo)

        const { result } = await uni.cloud.callFunction({
          name: 'login',
          data: {
            action: 'updateProfile',
            openid: this.token,
            profile: {
              nickName: profile.nickName,
              avatarUrl: profile.avatarUrl
            }
          }
        })

        if (result.success) {
          return { success: true }
        } else {
          return { success: false, error: result.error }
        }
      } catch (err) {
        console.error('更新资料失败:', err)
        return { success: false, error: err.message || '更新失败' }
      }
    },

    logout() {
      this.isLoggedIn = false
      this.userInfo = null
      this.token = ''
      storage.remove('user_token')
      storage.remove('user_info')
    },

    loadFromStorage() {
      const token = storage.get('user_token', '')
      const info = storage.get('user_info', null)
      if (token && info) {
        this.token = token
        this.userInfo = info
        this.isLoggedIn = true
        console.log('用户状态已恢复: isLoggedIn=' + this.isLoggedIn)
      } else {
        console.log('用户状态未恢复: token=' + !!token + ', info=' + !!info)
      }
    },
    
    async ensureLogin() {
      if (this.isLoggedIn) {
        return { success: true, message: '已登录' }
      }
      
      const token = storage.get('user_token', '')
      const info = storage.get('user_info', null)
      
      if (token && info) {
        this.token = token
        this.userInfo = info
        this.isLoggedIn = true
        return { success: true, message: '已从本地恢复登录状态' }
      }
      
      return { success: false, error: '未登录，请先登录' }
    },

    async syncRecords(records) {
      if (!this.canSync) return { success: false, error: '未登录' }

      this.syncStatus = 'syncing'
      try {
        const { result } = await uni.cloud.callFunction({
          name: 'syncRecords',
          data: { records }
        })

        if (result.success) {
          this.syncStatus = 'synced'
          storage.set('last_sync', Date.now())
          return { success: true }
        } else {
          this.syncStatus = 'error'
          return { success: false, error: result.error }
        }
      } catch (err) {
        this.syncStatus = 'error'
        return { success: false, error: err.message }
      }
    },

    async getCloudRecords() {
      if (!this.canSync) return { success: false, error: '未登录' }

      try {
        const { result } = await uni.cloud.callFunction({
          name: 'getRecords'
        })

        if (result.success) {
          return { success: true, records: result.records }
        } else {
          return { success: false, error: result.error }
        }
      } catch (err) {
        return { success: false, error: err.message }
      }
    }
  }
})
