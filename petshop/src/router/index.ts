import { createRouter, createWebHistory } from 'vue-router'
import axios from 'axios' // 添加axios导入
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Cart from '../views/Cart.vue'
import EmptyCart from '../views/EmptyCart.vue'
import User from '../views/User.vue'
import ProductDetail from '../views/ProductDetail.vue'
import StoreDetail from '../views/StoreDetail.vue'
import CategoryProducts from '../views/CategoryProducts.vue'
import AIAssistant from '../views/AIAssistant.vue'
import { TOKEN_KEY } from '../config'

// 后台管理组件
import AdminLayout from '../views/admin/AdminLayout.vue'
import StoreManagement from '../views/admin/StoreManagement.vue'
import UserManagement from '../views/admin/UserManagement.vue'
import OrderManagement from '../views/admin/OrderManagement.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/cart',
      name: 'Cart',
      component: Cart,
      meta: { requiresAuth: true }
    },
    {
      path: '/empty-cart',
      name: 'EmptyCart',
      component: EmptyCart
    },
    {
      path: '/user',
      name: 'User',
      component: User,
      meta: { requiresAuth: true }
    },
    // 后台管理路由
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: '',
          redirect: '/admin/stores'
        },
        {
          path: 'stores',
          name: 'AdminStores',
          component: StoreManagement
        },
        {
          path: 'users',
          name: 'AdminUsers',
          component: UserManagement
        },
        {
          path: 'orders',
          name: 'AdminOrders',
          component: OrderManagement
        }
      ]
    },
    {
      path: '/product/:id',
      name: 'ProductDetail',
      component: ProductDetail
    },
    {
      path: '/store/:id',
      name: 'StoreDetail',
      component: StoreDetail
    },
    {
      path: '/category/:id',
      name: 'CategoryProducts',
      component: CategoryProducts
    },
    {
      path: '/ai-assistant',
      name: 'AIAssistant',
      component: AIAssistant
    },
    {
      path: '/checkout',
      name: 'Checkout',
      component: () => import('../views/Checkout.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/order/:orderNo',
      name: 'OrderDetail',
      component: () => import('../views/OrderDetail.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/payment/:orderNo',
      name: 'Payment',
      component: () => import('../views/Payment.vue'),
      meta: { requiresAuth: true }
    },
    // 路由守卫：重定向到登录页
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

// 全局前置守卫 - 验证用户是否登录和管理员权限
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem(TOKEN_KEY)
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!token) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
    } else {
      // 需要管理员权限的路由
      if (to.matched.some(record => record.meta.requiresAdmin)) {
        try {
          // 每次都从服务器验证用户角色，而不是从localStorage读取
          const response = await axios.get('/api/user/users/me', {
            headers: { Authorization: `Bearer ${token}` }
          })
          
          // 修正：直接从response.data获取role，而不是response.data.user.role
          console.log('路由守卫 - 用户角色验证:', response.data.role)
          
          if (response.data.role === 1) {
            next()
          } else {
            console.log('路由守卫 - 非管理员用户，跳转到首页')
            next({ name: 'Home' })
          }
        } catch (error) {
          console.error('路由守卫 - API调用失败:', error)
          // token无效，清除并跳转到登录页
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem('userId')
          localStorage.removeItem('username')
          // 清除axios默认请求头
          delete axios.defaults.headers.common['Authorization']
          next({ name: 'Login' })
        }
      } else {
        next()
      }
    }
  } else {
    if (token && to.path === '/login') {
      // 如果已登录用户访问登录页，验证token有效性
      try {
        const response = await axios.get('/api/user/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        // 修正：直接从response.data获取role
        if (response.data.role === 1) {
          next({ name: 'AdminStores' })
        } else {
          next({ name: 'Home' })
        }
      } catch (error) {
        // token无效，清除并允许访问登录页
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem('userId')
        localStorage.removeItem('username')
        delete axios.defaults.headers.common['Authorization']
        next()
      }
    } else {
      next()
    }
  }
})

export default router