# 云同步与登录注册 Spec

> 目标文件: `src/pages/index/index.vue`, `src/store/user.js`, `src/utils/request.js`

## 做什么
- 增加微信登录（一键登录）
- 增加注册（微信一键注册）
- 增加云同步（记录自动上传/下载）
- 保持本地存储作为兜底

## 接口

### 1. Store (user.js)
```javascript
export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    userInfo: null,
    token: ''
  }),
  actions: {
    async loginWithWeChat() {},
    async syncRecords() {}
  }
})
```

### 2. API (request.js)
```javascript
const request = (options) => {
  // 带 token 请求
}
```

### 3. 页面 (index.vue)
- 登录状态检查
- 同步按钮
- 登录/注册入口

## 验收
- [ ] 微信一键登录成功
- [ ] 记录能同步到云端
- [ ] 多设备能看到同一份数据
- [ ] 无 lint 警告
