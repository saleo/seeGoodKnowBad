import App from './App'

// 初始化云开发环境
// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import * as Pinia from 'pinia'

export function createApp() {
  // 初始化云开发环境
  uni.cloud.init({
    env: 'jhzf-d3go85m0635364285', // 对应 manifest.json 中的 envId
    traceUser: true
  })

  const app = createSSRApp(App)
  app.use(Pinia.createPinia())
  return {
    app,
    Pinia
  }
}
// #endif
