const ci = require('miniprogram-ci');

const project = new ci.Project({
  appid: 'wxba340bcd9707423f',
  type: 'miniProgram',
  projectPath: '.',
  privateKeyPath: './private.wxba340bcd9707423f.key',
  ignores: ['node_modules/**/*', '.git/**/*'],
});

(async () => {
  try {
    const result = await ci.preview({
      project,
      version: '0.1.27',
      desc: 'Test preview',
      setting: {
        es6: true,
        minify: true,
        autoPrefixWXSS: true,
      },
      qrcodeFormat: 'image',
      qrcodeOutputDest: './preview-qrcode.jpg',
    });
    console.log('Preview result:', result);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();