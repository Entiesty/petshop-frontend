// API路径配置

// 用户认证相关API
export const AUTH_API = {
  LOGIN: '/api/user/auth/login',       // 登录接口
  REGISTER: '/api/user/auth/register', // 注册接口
  LOGOUT: '/api/user/auth/logout'      // 登出接口
}

// 用户相关API
export const USER_API = {
  PROFILE: '/api/user/profile',           // 获取用户信息
  UPDATE_PROFILE: '/api/user/profile',    // 更新用户信息
  ADDRESSES: '/api/user/addresses',       // 获取地址列表
  ADD_ADDRESS: '/api/user/addresses',     // 添加地址
  UPDATE_ADDRESS: '/api/user/addresses',  // 更新地址
  DELETE_ADDRESS: '/api/user/addresses'   // 删除地址
}

// 商店相关API
export const STORE_API = {
  LIST: '/api/user/stores',       // 获取商店列表
  DETAIL: '/api/user/stores'      // 获取商店详情
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
  CREATE: '/api/user/orders',     // 创建订单
  LIST: '/api/user/orders',       // 获取订单列表
  DETAIL: '/api/user/orders',     // 获取订单详情
  CANCEL: '/api/user/orders'      // 取消订单
} 