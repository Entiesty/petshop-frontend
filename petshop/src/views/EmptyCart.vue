<template>
  <div class="empty-cart-container">
    <header class="header">
      <h1>购物车</h1>
    </header>
    
    <div class="empty-content">
      <div class="cart-icon">
        <el-icon :size="80" color="#909399"><ShoppingCart /></el-icon>
      </div>
      <p class="empty-tip">购物车还是空的哦，快去选购吧~</p>
      <button class="shopping-btn" @click="goShopping">快去选购</button>
    </div>
    
    <!-- 底部导航 -->
    <div class="bottom-nav">
      <div class="nav-item">
        <router-link to="/">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </router-link>
      </div>
      <div class="nav-item active">
        <el-icon><ShoppingCart /></el-icon>
        <span>购物车</span>
      </div>
      <div class="nav-item">
        <router-link to="/user">
          <el-icon><User /></el-icon>
          <span>个人中心</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ShoppingCart, HomeFilled, User } from '@element-plus/icons-vue'

const router = useRouter()

const goShopping = () => {
  router.push('/')
}
</script>

<style scoped>
.empty-cart-container {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  background-color: #fff;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: white;
  padding: 15px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.header h1 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.empty-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.cart-icon {
  width: 120px;
  height: 120px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.empty-tip {
  color: #666;
  font-size: 16px;
  margin-bottom: 30px;
}

.shopping-btn {
  padding: 10px 30px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

/* 底部导航 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  background-color: white;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
  color: #666;
}

.nav-item.active {
  color: #409eff;
}

.nav-item i, .nav-item .el-icon {
  font-size: 24px;
  margin-bottom: 3px;
}

.nav-item a {
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
}

@media (max-width: 768px) {
  .empty-cart-container {
    padding-bottom: 60px;
  }
}

@media (min-width: 768px) {
  .bottom-nav {
    display: none; /* 在桌面版上隐藏底部导航 */
  }
  
  .empty-cart-container {
    width: 100%;
    padding-bottom: 0;
  }
  
  .empty-content {
    max-width: 1200px;
    padding-bottom: 60px;
  }
}
</style> 