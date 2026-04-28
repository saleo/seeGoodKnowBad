# 见好知非 - 开发规范

> 微信小程序 MVP 开发准则
> 核心理念：最小化设计，按需扩展

## 🤖 AI Agent 协作协议 (UAP)

**本仓库使用 LeanSpec 驱动开发流：**

1. **检索 specs/**：任何修改前，先查 `specs/` 目录是否有相关规格
2. **规格优先**：若有相关 `.spec.md`，按规格实现
3. **验证闭环**：修改后运行 `npm run ci:enhance`

---

## 1. 技术栈

```
uni-app 3.x + Vue 3 Composition API
├── 编译目标: mp-weixin (微信小程序)
├── 状态管理: Pinia
└── 本地存储: utils/storage.js
```

---

## 2. 目录结构

```
src/
├── pages/           # 页面
│   └── index/       # 首页 (时光流 + 记录)
├── components/      # 通用组件
├── utils/           # 工具函数
├── store/           # Pinia stores
├── api/             # API 请求 (预留)
└── services/        # 业务逻辑 (预留)
```

---

## 3. 色彩体系

| 分类 | 色值 | 用途 |
|-----|------|-----|
| 晨曦金 | #FFB300 | 见好标识、主按钮 |
| 静夜蓝 | #0D47A1 | 知非标识 |
| 背景灰 | #F5F5F5 | 页面背景 |

---

## 4. 页面组件规范

```vue
<template>
  <view class="page-container">
    <!-- 内容区 -->
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'

// 状态
const loading = ref(false)

// 方法
const methodName = () => {}

// 分享
onShareAppMessage(() => ({ title: '见好知非' }))
onShareTimeline(() => ({ title: '见好知非' }))
</script>

<style scoped>
.page-container { min-height: 100vh; background: #f5f5f5; }
</style>
```

---

## 5. 路由配置 (pages.json)

```json
{
  "pages": [
    { "path": "pages/index/index" }
  ],
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "见好知非",
    "navigationBarBackgroundColor": "#FFFFFF",
    "backgroundColor": "#F5F5F5"
  },
  "tabBar": {
    "color": "#999999",
    "selectedColor": "#FFB300",
    "backgroundColor": "#FFFFFF",
    "list": [
      { "pagePath": "pages/index/index", "text": "首页" }
    ]
  }
}
```

---

## 6. 数据模型 (MVP)

```javascript
// 记录
Record {
  id: String,
  type: 'SEE_OTHERS_GOOD' | 'SEE_SELF_GOOD' | 'REFLECT_NON',
  content: String,
  createdAt: Number  // timestamp
}

// 用户 (预留)
User {
  userId: String,
  nickname: String,
  avatar: String
}
```

---

## 7. 状态管理

```javascript
import { defineStore } from 'pinia'
import { storage } from '@/utils/storage'

export const useRecordStore = defineStore('record', {
  state: () => ({
    records: []
  }),
  actions: {
    addRecord(record) {
      this.records.unshift({
        ...record,
        id: Date.now().toString(),
        createdAt: Date.now()
      })
      storage.set('records', this.records)
    },
    loadRecords() {
      this.records = storage.get('records', [])
    }
  }
})
```

---

## 8. 常用命令

```bash
# 开发
npm run dev:mp-weixin

# 构建
npm run build:mp-weixin

# 代码检查
npm run lint
npm run ci:enhance
```

---

## 9. 参考文档

| 文档 | 说明 |
|-----|------|
| `docs/archive/v2.1.md` | 产品设计 (完整版，暂存) |
| `docs/archive/v3.md` | 安全合规设计 (暂存) |
| `specs/*.spec.md` | 各功能精简规格 |

---

> Last updated: 2026-04-27
