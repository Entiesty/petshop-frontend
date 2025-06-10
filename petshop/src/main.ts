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

// 在应用启动时设置默认认证头
const token = localStorage.getItem(TOKEN_KEY)
if (token) {
  console.log('发现已保存的令牌，设置为默认认证头')
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

// 请求拦截器
axios.interceptors.request.use(
  config => {
    console.log('发送请求:', config.method?.toUpperCase(), config.url)
    
    // 每个请求都检查并添加最新的token
    const currentToken = localStorage.getItem(TOKEN_KEY)
    if (currentToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${currentToken}`
      console.log('添加认证头到请求')
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
      
      // 处理401未授权错误（令牌无效或过期）
      if (error.response.status === 401) {
        console.log('检测到401错误，可能是令牌过期，重定向到登录页')
        // 清除本地令牌
        localStorage.removeItem(TOKEN_KEY)
        // 重定向到登录页
        router.push('/login')
      }
      
      // 处理403禁止访问错误
      if (error.response.status === 403) {
        console.log('检测到403错误，权限不足')
      }
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
