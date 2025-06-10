import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Cart from '../views/Cart.vue'
import EmptyCart from '../views/EmptyCart.vue'
import User from '../views/User.vue'
import ProductDetail from '../views/ProductDetail.vue'
import StoreDetail from '../views/StoreDetail.vue'
import { TOKEN_KEY } from '../config'

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

// 全局前置守卫 - 验证用户是否登录
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem(TOKEN_KEY)
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 需要登录的页面
    if (!isAuthenticated) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
    } else {
      next()
    }
  } else {
    // 不需要登录的页面
    if (isAuthenticated && to.path === '/login') {
      next({ name: 'Home' })
    } else {
      next()
    }
  }
})

export default router 