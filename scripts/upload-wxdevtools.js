// 使用微信开发者工具上传小程序
const { execSync } = require('child_process')
const path = require('path')

// 微信开发者工具路径
const wxDevToolsPath = '"C:\\Program Files (x86)\\Tencent\\微信web开发者工具2.0\\cli.bat"'

// 构建产物路径
const projectPath = path.resolve(__dirname, '../unpackage/dist/dev/mp-weixin')

// 版本号和描述
const version = '1.0.1'
const desc = 'auto release'

try {
  console.log('开始上传小程序...')
  
  // 执行上传命令
  // 注意：微信开发者工具的命令行上传需要先登录，且可能需要在开发者工具中开启命令行权限
  const command = `${wxDevToolsPath} upload --project ${projectPath} --version ${version} --desc "${desc}"`
  console.log(`执行命令: ${command}`)
  
  const output = execSync(command, { encoding: 'utf8' })
  console.log('上传成功:', output)
} catch (error) {
  console.error('上传失败:', error.message)
  process.exit(1)
}
