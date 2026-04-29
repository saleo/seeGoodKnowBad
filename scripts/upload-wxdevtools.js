// 使用微信开发者工具上传小程序
const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

// 微信开发者工具路径
const wxDevToolsPath = '"C:\\Program Files (x86)\\Tencent\\微信web开发者工具2.0\\cli.bat"'

// 构建产物路径（与 upload-system-ci.js 保持一致）
const projectPath = path.resolve(__dirname, '../dist/build/mp-weixin')

// 版本号和描述（从 src/manifest.json 读取）
const srcManifestPath = path.resolve(__dirname, '../src/manifest.json')
let version = '1.0.0'
let desc = 'auto release'

if (fs.existsSync(srcManifestPath)) {
  try {
    const manifest = JSON.parse(fs.readFileSync(srcManifestPath, 'utf8'))
    version = manifest.versionName || version
    console.log(`从 src/manifest.json 读取版本: ${version}`)
  } catch (e) {
    console.warn('无法读取 src/manifest.json 版本，使用默认版本')
  }
}

try {
  console.log('开始上传小程序...')
  console.log(`项目路径: ${projectPath}`)
  console.log(`版本号: ${version}`)
  console.log(`描述: ${desc}`)
  console.log('')
  
  // 检查构建产物是否存在
  if (!fs.existsSync(projectPath)) {
    console.error(`错误: 构建产物目录不存在: ${projectPath}`)
    process.exit(1)
  }
  
  // 执行上传命令
  // 注意：微信开发者工具的命令行上传需要先登录，且可能需要在开发者工具中开启命令行权限
  const command = `${wxDevToolsPath} upload --project ${projectPath} --version ${version} --desc "${desc}"`
  console.log(`执行命令: ${command}`)
  console.log('---')
  
  const output = execSync(command, { encoding: 'utf8' })
  console.log('---')
  console.log('上传成功:', output)
  console.log('')
  console.log('请登录微信小程序后台查看版本：')
  console.log('1. 访问 https://mp.weixin.qq.com')
  console.log('2. 进入"管理" -> "版本管理"')
  console.log('3. 在"开发版本"中查看上传的版本')
} catch (error) {
  console.error('---')
  console.error('上传失败:', error.message)
  console.error('')
  console.error('排查建议:')
  console.error('1. 确保微信开发者工具已启动并登录')
  console.error('2. 确保微信开发者工具中已开启命令行权限')
  console.error('3. 检查项目路径是否正确')
  process.exit(1)
}
