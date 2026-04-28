const ci = require('miniprogram-ci');
const fs = require('fs');
const path = require('path');

// 设置 Node.js 代理
process.env.HTTP_PROXY = process.env.HTTP_PROXY || 'http://127.0.0.1:7892';
process.env.HTTPS_PROXY = process.env.HTTPS_PROXY || 'http://127.0.0.1:7892';

// 云开发环境 ID
const CLOUD_ENV = process.env.WX_CLOUD_ENV || 'jhzf-d3go85m0635364285';

const project = new ci.Project({
  appid: 'wxba340bcd9707423f',
  type: 'miniProgram',
  projectPath: '.',
  privateKeyPath: './private.wxba340bcd9707423f.key',
  ignores: ['node_modules/**/*', '.git/**/*'],
});

const cloudfunctionRoot = './cloudfunctions';

async function deployCloudFunctions() {
  if (!CLOUD_ENV) {
    console.error('错误: 未设置云开发环境 ID');
    process.exit(1);
  }

  const functions = fs.readdirSync(cloudfunctionRoot)
    .filter(name => fs.statSync(path.join(cloudfunctionRoot, name)).isDirectory());

  console.log('云开发环境:', CLOUD_ENV);
  console.log('发现云函数:', functions);

  for (const funcName of functions) {
    try {
      console.log(`正在部署云函数: ${funcName}...`);
      await ci.cloud.uploadFunction({
        project,
        env: CLOUD_ENV,
        name: funcName,
        path: path.join(cloudfunctionRoot, funcName),
        remoteNpmInstall: true,
      });
      console.log(`✅ 云函数 ${funcName} 部署成功`);
    } catch (error) {
      console.error(`❌ 云函数 ${funcName} 部署失败:`, error.message);
      process.exit(1);
    }
  }
}

(async () => {
  try {
    await deployCloudFunctions();
    console.log('所有云函数部署完成');
  } catch (error) {
    console.error('部署失败:', error);
    process.exit(1);
  }
})();
