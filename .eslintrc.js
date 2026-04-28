module.exports = {
  root: true,
  env: {
    node: true,
    es2020: true,
    browser: true
  },
  extends: [
    'eslint:recommended'
  ],
  globals: {
    uni: 'readonly',
    plus: 'readonly',
    wx: 'readonly'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  ignorePatterns: [
    'unpackage/**',
    'miniprogram_npm/**',
    'dist/**'
  ]
}
