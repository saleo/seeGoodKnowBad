# CI 增强系统文档

## 📋 概述

CI 增强系统是一套自动化工具，用于在构建微信小程序时自动处理配置同步、版本管理和代码生成任务。

## 🎯 功能

### 1. 更新 manifest.json 版本号
- 自动从 `package.json` 读取版本号
- 同步到 `src/manifest.json`
- 自动递增 `versionCode`

### 2. 自动生成 pages.json 路由
- 递归扫描 `src/pages/` 目录
- 自动检测 `index.vue/ts/js` 文件
- 生成完整的路由配置
- 保留现有的全局配置（globalStyle、tabBar 等）

### 3. 自动补全 uni.request API 封装
- 创建 `src/utils/request.js`
- 提供统一的请求接口：`request()`, `get()`, `post()`, `put()`, `del()`
- 支持自定义超时和请求头
- 标准化错误处理

### 4. 自动同步微信 project.config.json
- 同步版本号
- 同步项目名称
- 确保编译配置正确（es6、minify、postcss）

## 🚀 使用方式

### 方式 1：手动运行
```bash
npm run ci:enhance
```

### 方式 2：在构建前自动运行
```bash
npm run build
```
该命令会自动执行 CI 增强，然后进行小程序构建。

### 方式 3：完整发布流程
```bash
npm run release
```
该命令执行：
1. 代码检查（ESLint）
2. CI 增强处理
3. 小程序构建
4. 上传到微信服务器

## 📊 工作流

```
┌─────────────────────┐
│  package.json       │
│  版本号配置         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  CI 增强脚本        │
│ (ci-enhance.js)     │
└──────────┬──────────┘
           │
     ┌─────┼─────┬──────────┐
     │     │     │          │
     ▼     ▼     ▼          ▼
┌────────────────────────────────────┐
│ 1. manifest.json 版本同步          │
│ 2. pages.json 路由自动生成         │
│ 3. request.js API 封装生成        │
│ 4. project.config.json 配置同步    │
│ 5. ci-preview.js 版本同步          │
└──────────┬─────────────────────────┘
           │
           ▼
   ✨ 自动化完成！
```

## 🔧 配置说明

### API 封装配置

编辑 `src/utils/request.js`，可自定义：

```javascript
const BASE_URL = process.env.VUE_APP_API_URL || 'https://api.example.com';
const TIMEOUT = 30000; // 30秒超时
```

### 环境变量

在 `.env` 文件中设置：

```env
VUE_APP_API_URL=https://your-api-domain.com
```

## 📦 生成的文件

- ✅ `src/utils/request.js` - uni.request API 封装
- ✅ `src/manifest.json` - 自动更新版本号
- ✅ `src/pages.json` - 自动生成路由
- ✅ `project.config.json` - 自动同步配置

## 🔄 CI/CD 集成

### GitHub Actions

项目包含自动化工作流：`.github/workflows/ci-enhance.yml`

工作流包含：
- 自动运行 CI 增强
- 自动进行代码检查
- 自动构建
- 自动上传构建产物

### 手动触发

```bash
# 手动运行 CI 增强
npm run ci:enhance

# 查看脚本详情
cat scripts/ci-enhance.js
```

## 🐛 故障排除

### 页面未被扫描到

确保：
- 页面目录中有 `index.vue`、`index.ts` 或 `index.js` 文件
- 文件名正确（区分大小写）
- 目录结构：`src/pages/[pageName]/index.vue`

### API 封装未创建

确保：
- `src/utils/` 目录存在
- `request.js` 不存在（如已存在则跳过）
- 有写入权限

### 版本号未同步

检查：
- `package.json` 中 `version` 字段是否正确
- `src/manifest.json` 文件是否存在
- YAML 配置是否有效

## 📝 最佳实践

1. **定期同步**：每次版本更新前运行 `npm run ci:enhance`
2. **提交检查**：用 `npm run release` 完整流程进行发布
3. **自定义路由**：生成 `pages.json` 后，可手动编辑添加额外配置
4. **API 封装**：生成后请根据实际项目调整 BASE_URL 和超时时间

## 🔗 相关文件

- `scripts/ci-enhance.js` - CI 增强脚本主文件
- `.github/workflows/ci-enhance.yml` - GitHub Actions 工作流
- `src/utils/request.js` - API 封装（自动生成）
- `package.json` - NPM 脚本配置

## 📞 支持

遇到问题？查看：
- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- 项目 `docs/` 目录中的其他文档

---

Generated: 2026-04-22
