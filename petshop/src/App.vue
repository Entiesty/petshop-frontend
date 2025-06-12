<script setup lang="ts">
// App.vue - 根组件
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: #333;
  background-color: #fff;
  line-height: 1.5;
  width: 100%;
  overflow-x: hidden; /* 防止水平滚动 */
}

a {
  text-decoration: none;
  color: inherit;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>
