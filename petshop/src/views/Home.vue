<template>
  <div class="home-container">
    <h1>萌宠之家 - 首页</h1>
    <p>欢迎来到萌宠之家，这里有最可爱的宠物和最优质的服务！</p>
    <button @click="logout" class="logout-btn">退出登录</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const logout = () => {
  // 清除本地存储的token
  localStorage.removeItem('token')
  // 跳转到登录页
  router.push('/login')
}
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

h1 {
  color: #F77F00;
  margin-bottom: 20px;
}

.logout-btn {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #F77F00;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.logout-btn:hover {
  background-color: #E57100;
}
</style> 