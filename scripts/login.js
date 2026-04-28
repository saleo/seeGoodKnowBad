// 加载环境变量并登录 HBuilderX
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// 读取 .env 文件
const envPath = path.resolve(__dirname, '../.env')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      process.env[match[1]] = match[2]
    }
  })
}

const username = process.env.HBX_USERNAME
const password = process.env.HBX_PASSWORD

if (!username || !password) {
  console.error('错误: 请在 .env 文件中设置 HBX_USERNAME 和 HBX_PASSWORD')
  process.exit(1)
}

try {
  console.log('正在登录 HBuilderX...')
  const command = `D:\\elite\\HBuilderX\\cli.exe user login --username ${username} --password ${password}`
  const output = execSync(command, { encoding: 'utf8' })
  console.log('登录成功:', output)
} catch (error) {
  console.error('登录失败:', error.message)
  process.exit(1)
}
