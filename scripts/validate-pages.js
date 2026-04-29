const fs = require('fs');
const path = require('path');

const PAGES_JSON_PATH = path.join(__dirname, '../src/pages.json');
const SRC_DIR = path.join(__dirname, '../src');

function validatePages() {
  let success = true;
  const errors = [];

  try {
    const pagesJsonContent = fs.readFileSync(PAGES_JSON_PATH, 'utf8');
    const pagesJson = JSON.parse(pagesJsonContent);

    if (!pagesJson.pages || !Array.isArray(pagesJson.pages)) {
      errors.push('ERROR: pages.json 中缺少 pages 数组');
      success = false;
      return { success, errors };
    }

    console.log(`\n📋 开始验证 pages.json 中注册的页面...`);
    console.log(`📄 共发现 ${pagesJson.pages.length} 个注册页面\n`);

    pagesJson.pages.forEach((pageConfig) => {
      const pagePath = pageConfig.path || pageConfig;
      const vueFilePath = path.join(SRC_DIR, `${pagePath}.vue`);
      const pageDirPath = path.join(SRC_DIR, pagePath);

      const fileExists = fs.existsSync(vueFilePath);
      const dirExists = fs.existsSync(pageDirPath);

      if (!fileExists && !dirExists) {
        errors.push(`❌ 页面 ${pagePath} 未找到！`);
        errors.push(`   期望路径: ${vueFilePath}`);
        success = false;
      } else {
        console.log(`✅ 页面 ${pagePath} - 已验证`);
      }
    });

    if (pagesJson.subPackages && Array.isArray(pagesJson.subPackages)) {
      console.log(`\n📋 开始验证分包页面...`);
      
      pagesJson.subPackages.forEach((subPackage) => {
        if (subPackage.pages && Array.isArray(subPackage.pages)) {
          subPackage.pages.forEach((pagePath) => {
            const vueFilePath = path.join(SRC_DIR, `${subPackage.root}/${pagePath}.vue`);
            const pageDirPath = path.join(SRC_DIR, subPackage.root, pagePath);

            const fileExists = fs.existsSync(vueFilePath);
            const dirExists = fs.existsSync(pageDirPath);

            if (!fileExists && !dirExists) {
              errors.push(`❌ 分包页面 ${subPackage.root}/${pagePath} 未找到！`);
              errors.push(`   期望路径: ${vueFilePath}`);
              success = false;
            } else {
              console.log(`✅ 分包页面 ${subPackage.root}/${pagePath} - 已验证`);
            }
          });
        }
      });
    }

  } catch (error) {
    errors.push(`ERROR: 读取或解析 pages.json 失败 - ${error.message}`);
    success = false;
  }

  if (success) {
    console.log('\n🎉 所有页面验证通过！');
  } else {
    console.log('\n❌ 页面验证失败，存在缺失的页面文件:');
    errors.forEach(err => console.log(err));
  }

  return { success, errors };
}

if (require.main === module) {
  const { success } = validatePages();
  process.exit(success ? 0 : 1);
}

module.exports = validatePages;
