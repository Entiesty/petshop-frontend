import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import axios from 'axios'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { API_BASE_URL, TIMEOUT, TOKEN_KEY } from './config'

// 后端API的基础URL
console.log('API基础URL设置为:', API_BASE_URL)

// axios全局配置
axios.defaults.baseURL = API_BASE_URL
axios.defaults.timeout = TIMEOUT

// 请求拦截器
axios.interceptors.request.use(
  config => {
    console.log('发送请求:', config.method?.toUpperCase(), config.url)
    
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
axios.interceptors.response.use(
  response => {
    console.log('收到响应:', response.status, response.config.url)
    return response
  },
  error => {
    console.error('响应错误:', error.message)
    if (error.response) {
      console.error('响应状态:', error.response.status)
      console.error('响应数据:', error.response.data)
    }
    return Promise.reject(error)
  }
)

// 创建应用实例
const app = createApp(App)

// 注册全局组件和插件
app.use(router)
app.use(ElementPlus, {
  locale: zhCn
})

// 挂载应用
app.mount('#app')
