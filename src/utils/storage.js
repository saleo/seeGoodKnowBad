// 统一存储工具，微信小程序环境
export const storage = {
  // 保存数据
  set(key, value) {
    try {
      wx.setStorageSync(key, value)
    } catch (error) {
      console.error('存储失败:', error)
    }
  },

  // 获取数据
  get(key) {
    try {
      return wx.getStorageSync(key)
    } catch (error) {
      console.error('读取失败:', error)
      return null
    }
  },

  // 删除数据
  remove(key) {
    try {
      wx.removeStorageSync(key)
    } catch (error) {
      console.error('删除失败:', error)
    }
  },

  // 清空所有数据
  clear() {
    try {
      wx.clearStorageSync()
    } catch (error) {
      console.error('清空失败:', error)
    }
  }
}