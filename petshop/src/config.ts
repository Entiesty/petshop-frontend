// 全局配置

// 后端API的基础URL
// 开发环境下使用相对路径，由 Vite 代理转发
// 如果设置了环境变量VITE_API_BASE_URL，则使用环境变量值
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// JWT Token的本地存储键名
export const TOKEN_KEY = 'token'

// 记住用户名的本地存储键名
export const REMEMBERED_USERNAME_KEY = 'rememberedUsername'

// 超时设置（毫秒）
export const TIMEOUT = 10000 