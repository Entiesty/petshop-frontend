import axios from 'axios'
import { TOKEN_KEY } from '../config'

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000
})

// 请求拦截器 - 添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 管理员用户管理API
export const adminUserApi = {
  // 获取用户列表
  getUserList: (params: { current: number; size: number }) => {
    return api.get('/api/admin/users', { params })
  },
  // 删除用户
  deleteUser: (userId: number) => {
    return api.delete(`/api/admin/users/${userId}`)
  }
}

// 管理员商店管理API
export const adminStoreApi = {
  // 获取商店列表
  getStoreList: (params: { current: number; size: number }) => {
    return api.get('/api/admin/stores', { params })
  },
  // 创建商店
  createStore: (data: any) => {
    return api.post('/api/admin/stores', data)
  },
  // 更新商店
  updateStore: (storeId: number, data: any) => {
    return api.put(`/api/admin/stores/${storeId}`, data)
  },
  // 删除商店
  deleteStore: (storeId: number) => {
    return api.delete(`/api/admin/stores/${storeId}`)
  }
}

// 管理员商品管理API
export const adminProductApi = {
  // 获取商品列表
  getProductList: (params: { current: number; size: number; storeId?: number; name?: string; categoryId?: number }) => {
    return api.get('/api/admin/products', { params })
  },
  // 创建商品
  createProduct: (data: any) => {
    return api.post('/api/admin/products', data)
  },
  // 更新商品
  updateProduct: (productId: number, data: any) => {
    return api.put(`/api/admin/products/${productId}`, data)
  },
  // 删除商品
  deleteProduct: (productId: number) => {
    return api.delete(`/api/admin/products/${productId}`)
  },
  // 获取商品详情
  getProductDetail: (productId: number) => {
    return api.get(`/api/admin/products/${productId}`)
  }
}

// 管理员订单管理API（需要后端实现）
export const adminOrderApi = {
  // 获取订单列表
  getOrderList: (params: { current: number; size: number; status?: number; keyword?: string }) => {
    return api.get('/api/admin/orders', { params })
  },
  // 获取订单详情
  getOrderDetail: (orderId: number) => {
    return api.get(`/api/admin/orders/${orderId}`)
  },
  // 获取订单商品列表
  getOrderItems: (orderId: number) => {
    return api.get(`/api/admin/orders/${orderId}/items`)
  },
  // 更新订单状态
  updateOrderStatus: (orderId: number, status: number) => {
    return api.put(`/api/admin/orders/${orderId}/status`, { status })
  },
  // 删除订单
  deleteOrder: (orderId: number) => {
    return api.delete(`/api/admin/orders/${orderId}`)
  }
}

// 文件上传API
export const adminFileApi = {
  // 上传图片
  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/api/admin/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  // 上传视频
  uploadVideo: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/api/admin/upload/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}