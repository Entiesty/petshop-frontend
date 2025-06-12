// 重构页面路由配置
import type { RouteRecordRaw } from 'vue-router'

// 懒加载重构页面组件
const HomeRedesigned = () => import('../views/HomeRedesigned.vue')
const LoginRedesigned = () => import('../views/LoginRedesigned.vue')
const CartRedesigned = () => import('../views/CartRedesigned.vue')

// 重构页面路由配置
export const redesignedRoutes: RouteRecordRaw[] = [
  {
    path: '/redesigned',
    name: 'Redesigned',
    redirect: '/redesigned/home'
  },
  {
    path: '/redesigned/home',
    name: 'HomeRedesigned',
    component: HomeRedesigned,
    meta: {
      title: '首页 - macOS版',
      requiresAuth: false
    }
  },
  {
    path: '/redesigned/login',
    name: 'LoginRedesigned',
    component: LoginRedesigned,
    meta: {
      title: '登录 - macOS版',
      requiresAuth: false,
      hideNavigation: true
    }
  },
  {
    path: '/redesigned/cart',
    name: 'CartRedesigned',
    component: CartRedesigned,
    meta: {
      title: '购物车 - macOS版',
      requiresAuth: true
    }
  },
  // 用户中心和商品详情页暂时使用原组件，后续会创建重构版本
]

// 页面映射配置，用于在原始页面和重构页面之间切换
export const pageMapping = {
  '/': '/redesigned/home',
  '/home': '/redesigned/home',
  '/login': '/redesigned/login',
  '/cart': '/redesigned/cart',
  '/user': '/redesigned/user',
  '/product': '/redesigned/product'
}

// 获取重构版本的路径
export function getRedesignedPath(originalPath: string): string {
  const basePath = originalPath.split('/')[1] ? `/${originalPath.split('/')[1]}` : '/'
  return pageMapping[basePath as keyof typeof pageMapping] || originalPath
}

// 检查是否是重构页面
export function isRedesignedPage(path: string): boolean {
  return path.startsWith('/redesigned')
} 