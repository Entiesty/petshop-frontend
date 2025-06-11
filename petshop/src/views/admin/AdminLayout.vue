<template>
  <div class="admin-layout">
    <div class="admin-header">
      <h1>宠物商城后台管理</h1>
      <div class="admin-user">
        <span>管理员</span>
        <button @click="logout" class="logout-btn">退出登录</button>
      </div>
    </div>
    
    <div class="admin-container">
      <div class="admin-sidebar">
        <nav class="admin-nav">
          <router-link to="/admin/stores" class="nav-item" active-class="active">
            <span class="nav-icon">🏪</span>
            <span>商店商品管理</span>
          </router-link>
          <router-link to="/admin/users" class="nav-item" active-class="active">
            <span class="nav-icon">👥</span>
            <span>用户管理</span>
          </router-link>
          <router-link to="/admin/orders" class="nav-item" active-class="active">
            <span class="nav-icon">📋</span>
            <span>订单管理</span>
          </router-link>
        </nav>
      </div>
      
      <div class="admin-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { TOKEN_KEY } from '../../config'

const router = useRouter()

const logout = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem('userRole')
  router.push('/login')
}
</script>

<style scoped>
/* 重置样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 主布局容器 - 占满整个视口 */
.admin-layout {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #f0f2f5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 顶部导航栏 */
.admin-header {
  position: relative;
  z-index: 1001;
  height: 64px;
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
}

.admin-header h1 {
  color: #262626;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.admin-user {
  display: flex;
  align-items: center;
  gap: 16px;
}

.admin-user span {
  color: #595959;
  font-size: 14px;
}

.logout-btn {
  height: 32px;
  padding: 0 16px;
  background: #ff4d4f;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.logout-btn:hover {
  background: #ff7875;
  transform: translateY(-1px);
}

/* 主内容区域 */
.admin-container {
  display: flex;
  flex: 1;
  height: calc(100vh - 64px);
  overflow: hidden;
}

/* 侧边栏 */
.admin-sidebar {
  width: 256px;
  background: #ffffff;
  border-right: 1px solid #e8e8e8;
  flex-shrink: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 导航菜单 */
.admin-nav {
  padding: 16px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 24px;
  color: #595959;
  text-decoration: none;
  transition: all 0.3s;
  gap: 12px;
  border-left: 3px solid transparent;
  position: relative;
}

.nav-item:hover {
  background: #f5f5f5;
  color: #262626;
}

.nav-item.active {
  background: #e6f7ff;
  color: #1890ff;
  border-left-color: #1890ff;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #1890ff;
}

.nav-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

/* 内容区域 */
.admin-content {
  flex: 1;
  background: #f0f2f5;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px;
  position: relative;
}

/* 滚动条样式 */
.admin-sidebar::-webkit-scrollbar,
.admin-content::-webkit-scrollbar {
  width: 6px;
}

.admin-sidebar::-webkit-scrollbar-track,
.admin-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.admin-sidebar::-webkit-scrollbar-thumb,
.admin-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.admin-sidebar::-webkit-scrollbar-thumb:hover,
.admin-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-sidebar {
    width: 200px;
  }
  
  .admin-content {
    padding: 16px;
  }
  
  .nav-item {
    padding: 0 16px;
  }
}

@media (max-width: 576px) {
  .admin-header {
    padding: 0 16px;
  }
  
  .admin-header h1 {
    font-size: 18px;
  }
  
  .admin-sidebar {
    width: 180px;
  }
  
  .admin-content {
    padding: 12px;
  }
}
</style>