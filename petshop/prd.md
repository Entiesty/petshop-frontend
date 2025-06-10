# 宠物商店项目需求分析文档

## 1. 项目概述

本项目旨在开发一个功能完善的“宠物商店”B2C电商平台。系统需支持普通用户（游客、会员）和后台管理员。用户可以通过系统浏览和购买宠物及相关商品，并享受地图搜索、智能问答等特色服务。

## 2. 功能性需求

### 2.1 前端模块

| **模块**       | **功能点**                                                   | **优先级** | **备注**                                                     |
| -------------- | ------------------------------------------------------------ | ---------- | ------------------------------------------------------------ |
| **用户中心**   | 1. 支持用户名/密码注册与登录。                               | 高         |                                                              |
|                | 2. 支持第三方账号（如微信、QQ）登录。                        | 中         |                                                              |
|                | 3. 个人信息（昵称、头像等）查看与修改。                      | 高         |                                                              |
|                | 4. 管理多个收货地址，并可设置一个为默认。                    | 高         |                                                              |
|                | 5. 指纹/人脸识别登录。                                       | 低 (选做)  | 调用设备或第三方服务。                                       |
| **商店与商品** | 1. 游客/会员均可浏览商店和商品信息。                         | 高         |                                                              |
|                | 2. 地图模式：在地图上展示附近商店，并可导航。                | 高         | 数据源为本地数据库，调用高德/百度地图API。**使用 MySQL 的地理空间功能。** |
|                | 3. 商品分为两类：宠物（唯一，无库存概念）和宠物周边（有库存）。 | 高         |                                                              |
|                | 4. 商品详情页包含视频介绍。                                  | 高         |                                                              |
| **订单与购物** | 1. 会员可将商品加入购物车。                                  | 高         |                                                              |
|                | 2. 会员可从购物车生成订单，模拟支付。                        | 高         |                                                              |
|                | 3. 会员可查看自己的订单列表及详情。                          | 高         |                                                              |
|                | 4. 会员可以对已完成的订单进行评价。                          | 中         |                                                              |
| **特色功能**   | 1. 视频中心：浏览宠物视频列表，点击播放。                    | 中         | 视频中可内嵌商品链接。视频可由AI模型生成。                   |
|                | 2. AI智能问答助手：提供客服、宠物推荐、饲养知识问答。        | 高         | 调用大模型API。                                              |
|                | 3. 消息推送：接收系统或商家的推广信息。                      | 低 (选做)  |                                                              |

### 2.2 后端模块

| **模块**     | **功能点**                                      | **优先级** | **备注**                        |
| ------------ | ----------------------------------------------- | ---------- | ------------------------------- |
| **管理后台** | 1. 商店信息管理（增删改查）。                   | 高         |                                 |
|              | 2. 商品信息管理（增删改查、上下架）。           | 高         |                                 |
|              | 3. 会员列表查看。                               | 高         |                                 |
|              | 4. 视频资源上传与管理。                         | 中         |                                 |
| **核心服务** | 1. 用户认证与授权：提供安全的API接口。          | 高         |                                 |
|              | 2. 数据校验：所有接收到的数据必须进行后端校验。 | 高         |                                 |
|              | 3. 地理位置服务：提供“附近商店”的查询接口。     | 高         | **使用 MySQL 的地理空间功能。** |
|              | 4. AI接口封装：提供调用大模型API的统一接口。    | 高         |                                 |

## 3. 非功能性需求

| **类别**     | **需求描述**                                                 | **技术栈**                                 |
| ------------ | ------------------------------------------------------------ | ------------------------------------------ |
| **技术栈**   | 前端：Vue 3 / uni-app；后端：Spring Boot；数据库：MySQL；缓存：Redis。 | Vue 3 / uni-app, Spring Boot, MySQL, Redis |
| **代码质量** | 1. Java代码需通过工具扫描，无高危漏洞。&lt;br>2. 遵循国标GB/T 34944编码规范。 | -                                          |
| **项目管理** | 1. 使用Gitee进行代码版本控制，需有清晰的提交记录。&lt;br>2. 使用禅道进行任务管理，需有完整的开发记录。 | Gitee, 禅道                                |
| **文档**     | 需交付需求文档、设计文档、测试报告、API文档、PPT等。         | -                                          |

## 系统架构图

![0c05795f554cd20e5d32aaae4eca334](C:\Users\86139\Documents\WeChat Files\wxid_cguitjd0a59122\FileStorage\Temp\0c05795f554cd20e5d32aaae4eca334.png)

![4a33e073d006a8ea7f628c28844bce4](C:\Users\86139\Documents\WeChat Files\wxid_cguitjd0a59122\FileStorage\Temp\4a33e073d006a8ea7f628c28844bce4.png)

## 上面这张图是用例图



![9c3fb62ac8269a5e7295aec07e768fe](C:\Users\86139\Documents\WeChat Files\wxid_cguitjd0a59122\FileStorage\Temp\9c3fb62ac8269a5e7295aec07e768fe.png)



## 4. 数据库设计 (MySQL)

### 4.1 `users` 表 (用户表)

SQL

```
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(50) NOT NULL UNIQUE COMMENT '用户名',
  `password` varchar(255) NOT NULL COMMENT '加密后的密码',
  `nickname` varchar(50) DEFAULT NULL COMMENT '昵称',
  `avatar_url` varchar(255) DEFAULT NULL COMMENT '头像URL',
  `openid` varchar(100) DEFAULT NULL UNIQUE COMMENT '第三方登录ID',
  `role` tinyint(1) NOT NULL DEFAULT '0' COMMENT '角色 (0-会员, 1-管理员)',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB COMMENT='用户表';
```

### 4.2 `address` 表 (收货地址表)

SQL

```
CREATE TABLE `address` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '地址ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `contact_name` varchar(50) NOT NULL COMMENT '联系人',
  `phone` varchar(20) NOT NULL COMMENT '手机号',
  `province` varchar(50) NOT NULL COMMENT '省份',
  `city` varchar(50) NOT NULL COMMENT '城市',
  `district` varchar(50) NOT NULL COMMENT '区/县',
  `street` varchar(255) NOT NULL COMMENT '街道/详细地址',
  `is_default` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否为默认地址',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='收货地址表';
```

### 4.3 `stores` 表 (商店表 - **新增地理位置字段**)

SQL

```
CREATE TABLE `stores` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '商店ID',
  `name` varchar(100) NOT NULL COMMENT '商店名称',
  `address_text` varchar(255) NOT NULL COMMENT '文本地址',
  `logo_url` varchar(255) DEFAULT NULL COMMENT '商店Logo',
  `contact_phone` varchar(20) DEFAULT NULL COMMENT '联系电话',
  `latitude` decimal(9,6) NULL COMMENT '纬度',  -- 新增纬度字段
  `longitude` decimal(9,6) NULL COMMENT '经度', -- 新增经度字段
  -- 或者使用 POINT 类型，但需要确保 MySQL 版本支持，且Java ORM框架有良好支持
  -- `location` POINT NULL COMMENT '地理位置坐标 (经度, 纬度)',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  -- 为地理位置字段创建空间索引，提高查询效率
  -- 如果使用 POINT 类型，可以创建 SPATIAL INDEX
  -- SPATIAL INDEX(`location`) 
  -- 如果使用 decimal(9,6) 经纬度，可以创建普通索引辅助范围查询，但不如空间索引高效
  KEY `idx_latitude_longitude` (`latitude`, `longitude`) 
) ENGINE=InnoDB COMMENT='商店表';
```

**说明：**

- **`latitude` 和 `longitude` 字段：** 这是最兼容、最通用的方式来存储地理位置信息。它将纬度和经度分别存储为浮点数。
- **`POINT` 类型 (可选):** MySQL 5.7+ 版本支持 `POINT` 等空间数据类型。如果使用 `POINT` 类型，可以创建 `SPATIAL INDEX` 来优化地理空间查询。但需要确保你的 Java ORM 框架（如 Hibernate）能很好地映射和操作这种类型。
- 地理空间查询：
  - **使用 `latitude` 和 `longitude`：** 可以通过计算两点间的距离（Haversine 公式）来查找附近商店，或使用 MBR (Minimum Bounding Rectangle) 过滤初步结果。这通常需要后端代码进行计算。
  - **使用 `POINT` 和 `SPATIAL INDEX`：** MySQL 提供了一些空间函数，如 `ST_Distance_Sphere()` (MySQL 8.0+) 或 `ST_Distance()` 结合索引来执行更高效的地理空间查询。

### 4.4 `products` 表 (商品表)

SQL

```
CREATE TABLE `products` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '商品ID',
  `store_id` bigint NOT NULL COMMENT '所属商店ID',
  `name` varchar(100) NOT NULL COMMENT '商品名称',
  `description` text COMMENT '商品描述',
  `price` decimal(10,2) NOT NULL COMMENT '价格',
  `product_type` tinyint(1) NOT NULL COMMENT '商品类型 (1-宠物, 2-周边)',
  `stock` int NOT NULL DEFAULT '1' COMMENT '库存 (宠物为1, 周边>0)',
  `main_image_url` varchar(255) DEFAULT NULL COMMENT '主图URL',
  `video_url` varchar(255) DEFAULT NULL COMMENT '介绍视频URL',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_store_id` (`store_id`),
  FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`)
) ENGINE=InnoDB COMMENT='商品表';
```

### 4.5 `orders` 表 (订单表)

SQL

```
CREATE TABLE `orders` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `order_no` varchar(64) NOT NULL UNIQUE COMMENT '订单号',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `total_amount` decimal(10,2) NOT NULL COMMENT '订单总金额',
  `status` int NOT NULL DEFAULT '10' COMMENT '订单状态(10-待付款, 20-待发货, 30-待收货, 40-已完成, 0-已取消)',
  `address_id` bigint NOT NULL COMMENT '收货地址ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `payment_time` datetime DEFAULT NULL COMMENT '支付时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_order_no` (`order_no`)
) ENGINE=InnoDB COMMENT='订单表';
```

### 4.6 `order_items` 表 (订单项表)

SQL

```
CREATE TABLE `order_items` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '订单项ID',
  `order_id` bigint NOT NULL COMMENT '订单ID',
  `product_id` bigint NOT NULL COMMENT '商品ID',
  `quantity` int NOT NULL COMMENT '购买数量',
  `unit_price` decimal(10,2) NOT NULL COMMENT '购买时单价',
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='订单项表';
```

## 5. 缓存设计 (Redis)

Redis 主要用于提高系统性能，减少数据库压力。

- **用户会话缓存:** 存储用户登录凭证（如 JWT Token、Session ID）及相关用户信息，加速认证授权过程。
- **商品热点数据缓存:** 缓存热门商品、促销商品、最新商品等经常访问的数据，减少MySQL查询。
- **验证码缓存:** 存储手机验证码、邮箱验证码等有时效性的数据。
- **排行榜/统计数据缓存:** 缓存实时性要求不高的统计数据或排行榜，如商品销量榜、用户活跃榜等。

## 6. 安全性考虑

- **密码加密:** 用户密码必须进行加盐哈希存储（如 bcrypt），禁止明文存储。
- API 接口安全:
  - 使用 HTTPS 加密传输。
  - 对所有敏感操作进行权限校验。
  - 防止 SQL 注入、XSS、CSRF 等常见Web攻击。
  - 限制接口访问频率，防止恶意请求。
- **数据备份与恢复:** 制定完善的数据备份策略，并定期演练数据恢复。

## 7. 部署与运维

- **容器化:** 推荐使用 Docker 对前后端应用进行容器化部署。
- **服务编排:** 对于多服务架构，使用 Kubernetes 进行服务编排和管理，实现自动化部署、伸缩和故障恢复。
- **日志系统:** 搭建集中式日志系统（如 ELK Stack 或 Loki + Grafana），便于问题排查和监控。
- **监控告警:** 部署监控系统（如 Prometheus + Grafana），对系统各项指标（CPU、内存、网络、磁盘、API响应时间、错误率等）进行实时监控和告警。

------