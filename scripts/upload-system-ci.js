// 使用系统全局安装的 Mini-Program CI 上传小程序
const { execSync, spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

// 设置代理（避免网络连接超时）
process.env.HTTP_PROXY = process.env.HTTP_PROXY || 'http://127.0.0.1:7892'
process.env.HTTPS_PROXY = process.env.HTTPS_PROXY || 'http://127.0.0.1:7892'
console.log(`使用代理: ${process.env.HTTPS_PROXY}`)

// 构建产物路径（uni-app CLI 构建输出目录）
const projectPath = path.resolve(__dirname, '../dist/build/mp-weixin')

// 版本号和描述（可从环境变量或 manifest.json 读取）
const manifestPath = path.resolve(__dirname, '../manifest.json')
let version = '1.0.0'
let desc = 'auto release'

// 尝试从 src/manifest.json 读取版本（与 ci-enhance.js 保持一致）
const srcManifestPath = path.resolve(__dirname, '../src/manifest.json')
if (fs.existsSync(srcManifestPath)) {
  try {
    const manifest = JSON.parse(fs.readFileSync(srcManifestPath, 'utf8'))
    version = manifest.versionName || version
    console.log(`从 src/manifest.json 读取版本: ${version}`)
  } catch (e) {
    console.warn('无法读取 src/manifest.json 版本，使用默认版本')
  }
} else if (fs.existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    version = manifest.versionName || version
    console.log(`从 manifest.json 读取版本: ${version}`)
  } catch (e) {
    console.warn('无法读取 manifest.json 版本，使用默认版本')
  }
}

// 支持通过环境变量覆盖
if (process.env.RELEASE_VERSION) {
  version = process.env.RELEASE_VERSION
}
if (process.env.RELEASE_DESC) {
  desc = process.env.RELEASE_DESC
}

// 小程序配置
const appid = 'wxba340bcd9707423f'
const privateKeyPath = path.resolve(__dirname, '../private.wxba340bcd9707423f.key')

// 检查构建产物是否存在
if (!fs.existsSync(projectPath)) {
  console.error(`错误: 构建产物目录不存在: ${projectPath}`)
  console.error('请先运行 npm run build:mp-weixin 进行构建')
  process.exit(1)
}

// 检查 app.json 是否存在（确认是有效的小程序项目）
const appJsonPath = path.join(projectPath, 'app.json')
if (!fs.existsSync(appJsonPath)) {
  console.error(`错误: 构建产物无效，缺少 app.json: ${appJsonPath}`)
  process.exit(1)
}

// 检查私钥文件
if (!fs.existsSync(privateKeyPath)) {
  console.error(`错误: 私钥文件不存在: ${privateKeyPath}`)
  console.error('请从微信小程序后台下载上传密钥并放置到项目根目录')
  process.exit(1)
}

// 查找系统全局安装的 miniprogram-ci
let globalCliPath = null

// 已知的系统安装路径（用户确认）
const knownPaths = [
  path.resolve(__dirname, '../node_modules/miniprogram-ci/bin/miniprogram-ci.js'),
  path.resolve(__dirname, '../node_modules/miniprogram-ci/bin/cli.js'),
  'C:\\Program Files\\nodejs\\node_modules\\miniprogram-ci\\bin\\miniprogram-ci.js',
  'C:\\Program Files\\nodejs\\node_modules\\miniprogram-ci\\bin\\cli.js',
]

for (const p of knownPaths) {
  if (fs.existsSync(p)) {
    globalCliPath = p
    break
  }
}

// 如果找不到，尝试获取全局 npm 路径
if (!globalCliPath) {
  try {
    const globalNodePath = execSync('npm root -g', { encoding: 'utf8' }).trim()
    const possiblePaths = [
      path.join(globalNodePath, 'miniprogram-ci', 'bin', 'miniprogram-ci.js'),
      path.join(globalNodePath, 'miniprogram-ci', 'bin', 'cli.js'),
    ]

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        globalCliPath = p
        break
      }
    }
  } catch (e) {
    console.warn('无法获取全局 npm 路径:', e.message)
  }
}

// 最后尝试其他常见路径
if (!globalCliPath) {
  const commonPaths = [
    'C:\\Users\\%USERNAME%\\AppData\\Roaming\\npm\\node_modules\\miniprogram-ci',
    'C:\\Program Files (x86)\\nodejs\\node_modules\\miniprogram-ci',
  ]

  for (const p of commonPaths) {
    const expandedPath = p.replace('%USERNAME%', process.env.USERNAME || '')
    const cliPath = path.join(expandedPath, 'bin', 'miniprogram-ci.js')
    if (fs.existsSync(cliPath)) {
      globalCliPath = cliPath
      break
    }
  }
}

console.log('')
console.log('开始上传小程序...')
console.log(`项目路径: ${projectPath}`)
console.log(`版本号: ${version}`)
console.log(`描述: ${desc}`)
console.log('')

// 使用系统全局安装的 miniprogram-ci CLI 命令
// 这样可以避免 Node.js v25 与项目本地 miniprogram-ci 的兼容性问题
let command
let args

// 使用 Node.js v20 (LTS) 运行 miniprogram-ci，避免 Node.js v25 的兼容性问题
const node20Path = 'C:\\Users\\euse\\AppData\\Roaming\\nvm\\v20.19.0\\node.exe'

if (globalCliPath && fs.existsSync(node20Path)) {
  // 使用全局安装的 miniprogram-ci 的 CLI，配合 Node.js v20
  console.log(`使用全局安装的 miniprogram-ci: ${globalCliPath}`)
  console.log(`使用 Node.js v20: ${node20Path}`)
  command = node20Path
  args = [
    globalCliPath,
    'upload',
    '--appid', appid,
    '--private-key-path', privateKeyPath,
    '--project-path', projectPath,
    '--upload-version', version,
    '--upload-description', desc,
    '--enable-es6',
    '--enable-minify'
  ]
} else if (globalCliPath) {
  // 回退到默认 node
  console.log(`使用全局安装的 miniprogram-ci: ${globalCliPath}`)
  command = 'node'
  args = [
    globalCliPath,
    'upload',
    '--appid', appid,
    '--private-key-path', privateKeyPath,
    '--project-path', projectPath,
    '--upload-version', version,
    '--upload-description', desc,
    '--enable-es6',
    '--enable-minify'
  ]
} else {
  // 尝试直接使用系统命令
  console.log('尝试使用系统 miniprogram-ci 命令...')
  command = 'miniprogram-ci'
  args = [
    'upload',
    '--appid', appid,
    '--private-key-path', privateKeyPath,
    '--project-path', projectPath,
    '--upload-version', version,
    '--upload-description', desc,
    '--enable-es6',
    '--enable-minify'
  ]
}

console.log(`执行: ${command} ${args.join(' ')}`)
console.log('---')

const child = spawn(command, args, {
  stdio: 'inherit',
  shell: false
})

child.on('close', (code) => {
  if (code === 0) {
    console.log('---')
    console.log('上传命令执行完成')
    console.log('')
    console.log('提示: 请登录微信小程序后台查看版本：')
    console.log('1. 访问 https://mp.weixin.qq.com')
    console.log('2. 进入"管理" -> "版本管理"')
    console.log('3. 在"开发版本"中查看上传的版本')
    console.log('')
    console.log('注意: 上传的版本默认是"开发版本"，需要设置为"体验版"或提交审核后才能被用户访问')
  } else {
    console.error(`---`)
    console.error(`上传命令退出，退出码: ${code}`)
    console.error('')
    console.error('排查建议:')
  console.error('1. 确认私钥文件正确（从微信小程序后台下载）')
  console.error('2. 确认 appid 正确: wxba340bcd9707423f')
  console.error('3. 确认小程序后台已开启 CI 上传权限')
  console.error('4. 检查网络连接')
  console.error('5. 确认使用的是系统全局安装的 miniprogram-ci（不是项目本地版本）')
  console.error('6. 如果错误包含 "invalid ip"，需要在微信小程序后台添加 IP 白名单')
  console.error('   访问: https://mp.weixin.qq.com -> 开发 -> 开发管理 -> 开发设置 -> IP 白名单')
  console.error('')
  console.error('如需安装全局 miniprogram-ci，请运行:')
  console.error('  npm install -g miniprogram-ci')
    process.exit(1)
  }
})

child.on('error', (error) => {
  console.error('')
  console.error('启动上传命令失败:', error.message)
  console.error('')
  console.error('请确保 miniprogram-ci 已全局安装:')
  console.error('  npm install -g miniprogram-ci')
  process.exit(1)
})
