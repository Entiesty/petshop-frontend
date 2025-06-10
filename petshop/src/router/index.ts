import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import { TOKEN_KEY } from '../config'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('../views/Home.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// 全局前置守卫 - 验证用户是否登录
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem(TOKEN_KEY)
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 需要登录的页面
    if (!isAuthenticated) {
      next({ name: 'login' })
    } else {
      next()
    }
  } else {
    // 不需要登录的页面
    if (isAuthenticated && to.path === '/login') {
      next({ name: 'home' })
    } else {
      next()
    }
  }
})

export default router 