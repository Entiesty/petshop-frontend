# 萌宠情报局 (Pet Shop) — 宠物商城前端前端

## 📖 项目概述

萌宠情报局是一个基于 Vue 3 + TypeScript 构建的 B2C 宠物电商平台前端项目。系统采用标准单页面应用（SPA）架构，为终端用户（C端）与平台管理员提供流畅的交互体验。业务完整覆盖了宠物活体与周边商品的浏览、购物车、订单结算，并深度集成了 **LBS 地图定位导航** 与 **大模型 AI 智能问答** 等现代电商特色功能。

## 🛠️ 技术栈与工程化选型

| 模块 | 技术选型 | 版本 | 核心用途 |
| --- | --- | --- | --- |
| **核心框架** | Vue 3 (Composition API) | 3.5.13 | 渐进式前端视图层 |
| **语言** | TypeScript | ~5.8.0 | 提供强类型约束，提升代码可维护性 |
| **构建工具** | Vite | 6.2.4 | 极速冷启动与 HMR 热更新，API 代理转发 |
| **状态管理** | Pinia | 3.0.3 | 扁平化的全局状态管理（替代 Vuex） |
| **路由** | Vue Router | 4.5.1 | SPA 路由控制、按需懒加载、全局导航守卫 |
| **UI 组件库** | Element Plus | 2.10.1 | 企业级中后台及前台标准化组件 |
| **HTTP 客户端** | Axios | 1.9.0 | 封装请求/响应拦截器，统一处理 JWT 与异常 |

## ✨ 核心特色功能

### 1. 动态双引擎 UI 切换 (macOS 风格)

项目不仅实现了标准的电商交互，还额外实现了一套基于 macOS 视觉风格的重构版 UI。

* **无缝切换：** 通过 `VersionToggle.vue` 组件，结合 `redesignedRoutes.ts` 路由映射表，用户可以在不刷新页面的情况下，一键热切换全局 UI 风格，保持 SPA 状态不丢失。

### 2. LBS 空间检索与地图导航

结合高德/百度地图 API，为用户提供线下的门店指引。

* 前端通过浏览器 Geolocation 获取用户当前坐标，调用后端的 `/stores/nearby` 空间检索接口，在地图上动态渲染特定半径内的门店标记（Marker）与导航规划路线。

### 3. AI 智能问答助手

内置 `AIAssistant.vue` 模块，通过 SSE（Server-Sent Events）或轮询对接后端封装的大语言模型流式接口，实现打字机效果的宠物饲养知识问答与智能导购。

### 4. 严密的双重路由鉴权机制

利用 Vue Router 的 `beforeEach` 全局前置守卫，构建了极高安全性的前端路由拦截：

* **登录态拦截 (`meta.requiresAuth`)：** 校验 LocalStorage 中的 JWT Token，失效或缺失直接重定向至 `/login`。
* **RBAC 角色拦截 (`meta.requiresAdmin`)：** 进入 `/admin/*` 路由时，校验当前用户角色权限，防止普通用户越权访问后台管理面板。

## 📂 项目工程结构

```text
petshop/
├── index.html               → Vite 入口 HTML
├── vite.config.ts           → 构建与开发代理配置 (Proxy :5173 → :8080)
├── src/
│   ├── main.ts              → 应用实例创建、插件挂载、全局配置
│   ├── App.vue              → 根组件，全局 <router-view />
│   ├── config.ts            → 全局环境变量与基础常量
│   ├── api/                 → Axios 实例与接口集中管理层
│   │   ├── config.ts        → 业务端 API 封装
│   │   └── admin.ts         → 管理端 API 封装 (含独立拦截器)
│   ├── router/
│   │   ├── index.ts         → 主路由表与导航守卫逻辑
│   │   └── redesignedRoutes.ts → macOS 重构版路由映射
│   ├── store/               → Pinia 状态模块
│   ├── views/               → 页面级视图组件
│   │   ├── Home.vue         → 首页 (分类、推荐、限时折扣)
│   │   ├── ProductDetail.vue→ 商品详情 (视频/图文渲染)
│   │   ├── Checkout.vue     → 订单结算页
│   │   ├── AIAssistant.vue  → AI 对话面板
│   │   └── admin/           → 后台管理微系统
│   └── components/          → 复用型业务组件 (UI 切换、地图组件等)

```

## 🚀 启动与部署

### 1. 本地开发环境

```bash
# 1. 安装依赖
npm install

# 2. 启动 Vite 开发服务器 (默认端口 5173)
# 内部已配置 Proxy 代理，会将 /api 请求转发至本地 Spring Boot (localhost:8080)
npm run dev

```

### 2. 生产环境构建

```bash
# 1. 执行 TypeScript 类型检查
npm run type-check

# 2. 打包构建
npm run build

```

*构建产物将输出至 `dist/` 目录。在生产环境部署时，需在 Nginx 中配置反向代理（Reverse Proxy），将前端请求指向 `index.html`（解决 History 路由 404 问题），并将 `/api` 路径转发至实际的后端服务集群。*

## 🔒 认证与会话管理 (JWT)

项目实现了纯无状态的 JWT 认证体系：

1. **获取 Token：** 登录成功后，前端捕获响应中的 `accessToken` 并持久化存储至 `localStorage`。
2. **请求携带：** Axios 请求拦截器会在所有的 HTTP Request Header 中自动注入 `Authorization: Bearer <token>`。
3. **失效处理：** Axios 响应拦截器统一捕获 `401 Unauthorized` 状态码，自动清除本地失效 Token 并强制拉起登录弹窗或跳转至登录页。

---

这样修改后，不仅剔除了尴尬的机器生成痕迹，还将“双 UI 切换”、“LBS”和“路由守卫”这些能体现你前端硬实力的东西提到了最显眼的位置，非常适合直接挂在 GitHub 上展示！
