// API路径配置

// 用户认证相关API
export const AUTH_API = {
  LOGIN: '/api/user/auth/login',       // 登录接口
  REGISTER: '/api/user/auth/register', // 注册接口
  LOGOUT: '/api/user/auth/logout',     // 登出接口
  SEND_CODE: '/api/user/auth/send-code', // 发送邮箱验证码
  LOGIN_BY_CODE: '/api/user/auth/login-by-code' // 邮箱验证码登录
}

// 用户相关API
export const USER_API = {
  PROFILE: '/api/user/users/me',           // 获取用户信息
  UPDATE_PROFILE: '/api/user/users/me',    // 更新用户信息
  ADDRESSES: '/api/user/addresses',       // 获取地址列表
  ADD_ADDRESS: '/api/user/addresses',     // 添加地址
  UPDATE_ADDRESS: '/api/user/addresses',  // 更新地址
  DELETE_ADDRESS: '/api/user/addresses'   // 删除地址
}

// 商店相关API
export const STORE_API = {
  LIST: '/api/user/stores',       // 获取商店列表
  DETAIL: '/api/user/stores',     // 获取商店详情
  NEARBY: '/api/user/stores/nearby' // 获取附近商店
}

// 购物车相关API
export const CART_API = {
  LIST: '/api/user/cart',         // 获取购物车列表
  ADD: '/api/user/cart',          // 添加商品到购物车
  UPDATE: '/api/user/cart',       // 更新购物车商品
  DELETE: '/api/user/cart',       // 删除购物车商品
  CLEAR: '/api/user/cart/clear'   // 清空购物车
}

// 订单相关API
export const ORDER_API = {
  CREATE: '/api/user/orders',
  LIST: '/api/user/orders',
  DETAIL: '/api/user/orders',
  CANCEL: '/api/user/orders'
}

// 后台管理API
export const ADMIN_API = {
  // 商店管理
  STORES: {
    LIST: '/api/admin/stores',
    CREATE: '/api/admin/stores',
    UPDATE: '/api/admin/stores',
    DELETE: '/api/admin/stores',
    DETAIL: '/api/admin/stores'
  },
  // 商品管理
  PRODUCTS: {
    LIST: '/api/admin/products',
    CREATE: '/api/admin/products',
    UPDATE: '/api/admin/products',
    DELETE: '/api/admin/products',
    DETAIL: '/api/admin/products'
  },
  // 用户管理
  USERS: {
    LIST: '/api/admin/users',
    DELETE: '/api/admin/users',
    ADDRESSES: '/api/admin/users' // 添加这一行
  },
  // 订单管理（需要后端实现）
  ORDERS: {
    LIST: '/api/admin/orders',
    UPDATE_STATUS: '/api/admin/orders',
    DELETE: '/api/admin/orders'
  },
  // 文件上传
  UPLOAD: '/api/admin/upload'
}

// 订单状态枚举
export const ORDER_STATUS = {
  PENDING_PAYMENT: 0, // 待付款
  PENDING_SHIPMENT: 1, // 待发货
  PENDING_RECEIPT: 2, // 待收货
  COMPLETED: 3, // 已完成
  CANCELLED: 4 // 已取消
}

// 订单状态文本映射
export const ORDER_STATUS_TEXT = {
  [ORDER_STATUS.PENDING_PAYMENT]: '待付款',
  [ORDER_STATUS.PENDING_SHIPMENT]: '待发货',
  [ORDER_STATUS.PENDING_RECEIPT]: '待收货',
  [ORDER_STATUS.COMPLETED]: '已完成',
  [ORDER_STATUS.CANCELLED]: '已取消'
}
