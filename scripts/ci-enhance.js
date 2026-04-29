#!/usr/bin/env node
/**
 * CI 增强脚本
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');

function readJSON(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, '');
  try {
    return JSON.parse(content);
  } catch (e) {
    throw new Error(`文件 ${path.basename(filePath)} 解析失败: ${e.message}`);
  }
}

function incrementVersion() {
  const pkgPath = path.join(ROOT, 'package.json');
  if (!fs.existsSync(pkgPath)) return null;

  const pkg = readJSON(pkgPath);
  const oldVersion = pkg.version;
  
  // 版本号递增逻辑：x.y.z → x.y.z+1
  const versionParts = oldVersion.split('.').map(Number);
  if (versionParts.length === 3) {
    versionParts[2] += 1;
    pkg.version = versionParts.join('.');
    
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    console.log(`✅ package.json 版本: ${oldVersion} → ${pkg.version}`);
    return pkg.version;
  }
  return null;
}

function updateManifestVersion() {
  const pkgPath = path.join(ROOT, 'package.json');
  const manifestPath = path.join(SRC, 'manifest.json');

  if (!fs.existsSync(pkgPath) || !fs.existsSync(manifestPath)) return false;

  const pkg = readJSON(pkgPath);
  const manifest = readJSON(manifestPath);

  const oldVersion = manifest.versionName;
  manifest.versionName = pkg.version;
  manifest.versionCode = String(parseInt(manifest.versionCode || 1) + 1);

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`✅ manifest.json 版本: ${oldVersion} → ${pkg.version}`);
  return true;
}

function validatePages() {
  const pagesJsonPath = path.join(SRC, 'pages.json');
  
  if (!fs.existsSync(pagesJsonPath)) {
    console.error('❌ pages.json 不存在');
    return false;
  }

  const pagesJson = readJSON(pagesJsonPath);
  let success = true;

  if (!pagesJson.pages || !Array.isArray(pagesJson.pages)) {
    console.error('❌ pages.json 中缺少 pages 数组');
    return false;
  }

  console.log(`📋 验证 ${pagesJson.pages.length} 个注册页面...`);

  for (const pageConfig of pagesJson.pages) {
    const pagePath = pageConfig.path || pageConfig;
    const vueFilePath = path.join(SRC, `${pagePath}.vue`);
    const pageDirPath = path.join(SRC, pagePath);

    const fileExists = fs.existsSync(vueFilePath);
    const dirExists = fs.existsSync(pageDirPath);

    if (!fileExists && !dirExists) {
      console.error(`❌ 页面 ${pagePath} 不存在!`);
      console.error(`   期望路径: ${vueFilePath}`);
      success = false;
    }
  }

  if (pagesJson.subPackages && Array.isArray(pagesJson.subPackages)) {
    for (const subPackage of pagesJson.subPackages) {
      if (subPackage.pages && Array.isArray(subPackage.pages)) {
        for (const pagePath of subPackage.pages) {
          const vueFilePath = path.join(SRC, `${subPackage.root}/${pagePath}.vue`);
          if (!fs.existsSync(vueFilePath)) {
            console.error(`❌ 分包页面 ${subPackage.root}/${pagePath} 不存在!`);
            success = false;
          }
        }
      }
    }
  }

  if (success) {
    console.log('✅ 所有页面验证通过');
  }
  return success;
}

function generatePages() {
  const pagesDir = path.join(SRC, 'pages');
  const pagesJsonPath = path.join(SRC, 'pages.json');

  if (!fs.existsSync(pagesDir)) return false;

  let pagesJson = { pages: [], globalStyle: {}, tabBar: {} };
  if (fs.existsSync(pagesJsonPath)) {
    pagesJson = readJSON(pagesJsonPath);
  }

  const existingPaths = new Set(pagesJson.pages.map(p => p.path || p));
  const pages = [...pagesJson.pages];
  const addedPages = [];

  function scanPages(dir, prefix) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = `${prefix}/${entry.name}`;
        const hasIndex = fs.existsSync(path.join(fullPath, 'index.vue')) ||
                         fs.existsSync(path.join(fullPath, 'index.ts')) ||
                         fs.existsSync(path.join(fullPath, 'index.js'));
        if (hasIndex) {
          const pagePath = `${relativePath}/index`;
          if (!existingPaths.has(pagePath)) {
            pages.push({ path: pagePath, style: { navigationBarTitleText: '' } });
            addedPages.push(pagePath);
          }
        } else {
          scanPages(fullPath, relativePath);
        }
      }
    }
  }

  scanPages(pagesDir, 'pages');
  
  if (addedPages.length > 0) {
    fs.writeFileSync(pagesJsonPath, JSON.stringify(pagesJson, null, 2) + '\n');
    console.log(`✅ 路由: 新增 ${addedPages.length} 个页面`);
    addedPages.forEach(p => console.log(`   + ${p}`));
    return true;
  } else {
    console.log('✅ 路由: 无需更新');
    return false;
  }
}

function setupApiWrapper() {
  const apiPath = path.join(SRC, 'utils', 'request.js');
  const apiDir = path.dirname(apiPath);

  if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir, { recursive: true });
  if (fs.existsSync(apiPath)) {
    console.log('✅ API 封装已存在');
    return true;
  }

  const template = `/**
 * uni.request API 封装
 */

const BASE_URL = process.env.VUE_APP_API_URL || 'https://api.example.com';
const TIMEOUT = 30000;

export function request(config) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: config.url.startsWith('http') ? config.url : BASE_URL + config.url,
      method: config.method || 'GET',
      data: config.data || {},
      header: { 'Content-Type': 'application/json', ...config.header },
      timeout: config.timeout || TIMEOUT,
      success: (res) => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(res.data);
        } else {
          reject({ code: res.statusCode, message: res.data?.message || '请求失败' });
        }
      },
      fail: (err) => reject({ code: -1, message: err.errMsg || '网络错误' }),
    });
  });
}

export const get = (url, data, config) => request({ url, method: 'GET', data, ...config });
export const post = (url, data, config) => request({ url, method: 'POST', data, ...config });
export const put = (url, data, config) => request({ url, method: 'PUT', data, ...config });
export const del = (url, data, config) => request({ url, method: 'DELETE', data, ...config });
`;

  fs.writeFileSync(apiPath, template);
  console.log('✅ API 封装已创建');
  return true;
}

function syncProjectConfig() {
  const pkgPath = path.join(ROOT, 'package.json');
  const manifestPath = path.join(SRC, 'manifest.json');
  const projectConfigPath = path.join(ROOT, 'project.config.json');

  if (!fs.existsSync(projectConfigPath)) return false;

  const pkg = readJSON(pkgPath);
  const manifest = readJSON(manifestPath);
  const projectConfig = readJSON(projectConfigPath);

  const oldVersion = projectConfig.version;
  projectConfig.version = pkg.version;
  if (manifest.name) projectConfig.projectname = manifest.name;
  if (!projectConfig.setting) projectConfig.setting = {};
  Object.assign(projectConfig.setting, { es6: true, minify: true, postcss: true });

  fs.writeFileSync(projectConfigPath, JSON.stringify(projectConfig, null, 2) + '\n');
  console.log(`✅ 项目配置: 版本 ${oldVersion} → ${pkg.version}`);
  return true;
}

function syncCIPreview() {
  const pkgPath = path.join(ROOT, 'package.json');
  const ciPreviewPath = path.join(ROOT, 'ci-preview.js');

  if (!fs.existsSync(ciPreviewPath)) return false;

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  let ciContent = fs.readFileSync(ciPreviewPath, 'utf-8');

  ciContent = ciContent.replace(/version:\s*['"][^'"]+['"]/, `version: '${pkg.version}'`);
  fs.writeFileSync(ciPreviewPath, ciContent);
  console.log(`✅ CI 预览版本: ${pkg.version}`);
  return true;
}

async function main() {
  console.log('\n🚀 CI 增强流程启动...\n');
  
  console.log('📋 验证页面路由配置...');
  if (!validatePages()) {
    console.error('\n❌ 页面验证失败，请检查 pages.json 配置');
    process.exit(1);
  }
  
  try {
    console.log('\n📋 递增版本号...');
    const newVersion = incrementVersion();
    if (newVersion) {
      console.log(`✅ 版本号已更新: ${newVersion}`);
    } else {
      console.log('⚠️  版本号格式不正确，跳过递增');
    }
  } catch (error) {
    console.error(`❌ 版本号递增失败: ${error.message}`);
  }
  
  const tasks = [
    { name: '更新 manifest.json 版本号', fn: updateManifestVersion },
    { name: '生成 pages.json 路由', fn: generatePages },
    { name: '补全 uni.request API 封装', fn: setupApiWrapper },
    { name: '同步 project.config.json', fn: syncProjectConfig },
    { name: '同步 CI 预览版本号', fn: syncCIPreview },
  ];

  let success = 0;
  let hasError = false;
  for (const task of tasks) {
    try {
      console.log(`\n📋 ${task.name}...`);
      if (task.fn()) success++;
    } catch (error) {
      console.error(`❌ ${task.name} 失败: ${error.message}`);
      hasError = true;
    }
  }

  console.log(`\n✨ 完成! (${success}/${tasks.length} 项成功)\n`);
  return hasError ? 1 : 0;
}

if (require.main === module) main().then((code) => process.exit(code));
module.exports = { updateManifestVersion, generatePages, setupApiWrapper, syncProjectConfig };
