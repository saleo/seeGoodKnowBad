const ci = require('miniprogram-ci')

async function upload() {
  try {
    console.log('开始上传小程序...')
    
    // 项目配置
    const project = new ci.Project({
      appid: 'wxba340bcd9707423f',
      privateKeyPath: './private.wxba340bcd9707423f.key',
      projectPath: './unpackage/dist/dev/mp-weixin',
      type: 'miniProgram',
      ignores: ['node_modules/**/*']
    })

    // 上传配置
    const uploadOptions = {
      project,
      version: '1.0.1',
      desc: 'auto release',
      setting: {
        es6: true,
        es7: true,
        minify: true,
        autoPrefixWXSS: true
      },
      // 启用登录缓存，避免每次上传都需要重新登录
      login: {
        // 使用 privateKey 登录，不需要扫描二维码
        type: 'privateKey',
        privateKeyPath: './private.wxba340bcd9707423f.key'
      }
    }

    console.log('上传配置:', {
      appid: project.appid,
      projectPath: project.projectPath,
      version: uploadOptions.version,
      desc: uploadOptions.desc
    })

    // 执行上传
    const uploadResult = await ci.upload(uploadOptions)
    console.log('上传成功:', uploadResult)
  } catch (error) {
    console.error('上传失败:', error)
    // 打印详细错误信息
    if (error.stack) {
      console.error('错误堆栈:', error.stack)
    }
    process.exit(1)
  }
}

// 执行上传
upload()

