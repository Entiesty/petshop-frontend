# 萌宠之家 API 接口文档

## 1. 基础信息

- 基础URL: `/api`
- 所有响应格式均为 JSON
- 鉴权方式: Bearer Token（JWT）
- 响应状态码:
  - 200: 请求成功
  - 400: 请求参数错误
  - 401: 未授权
  - 403: 禁止访问
  - 404: 资源不存在
  - 500: 服务器内部错误

## 2. 通用响应格式

```json
{
  "code": 200,       // 状态码
  "message": "操作成功", // 消息
  "data": {          // 数据，根据接口不同而不同
    // 具体数据
  }
}
```

## 3. 用户认证

### 3.1 用户登录

- **URL**: `/api/user/login`
- **方法**: POST
- **请求参数**:

| 参数名   | 类型   | 是否必须 | 描述   |
| -------- | ------ | -------- | ------ |
| username | string | 是       | 用户名 |
| password | string | 是       | 密码   |

- **请求示例**:

```json
{
  "username": "test_user",
  "password": "password123"
}
```

- **成功响应**:

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "test_user",
      "nickname": "测试用户",
      "avatar_url": "http://example.com/avatar.jpg",
      "role": 0
    }
  }
}
```

- **失败响应**:

```json
{
  "code": 401,
  "message": "用户名或密码错误",
  "data": null
}
```

### 3.2 用户注册

- **URL**: `/api/user/register`
- **方法**: POST
- **请求参数**:

| 参数名   | 类型   | 是否必须 | 描述     |
| -------- | ------ | -------- | -------- |
| username | string | 是       | 用户名   |
| email    | string | 是       | 邮箱     |
| password | string | 是       | 密码     |

- **请求示例**:

```json
{
  "username": "new_user",
  "email": "user@example.com",
  "password": "password123"
}
```

- **成功响应**:

```json
{
  "code": 200,
  "message": "注册成功",
  "data": null
}
```

- **失败响应**:

```json
{
  "code": 400,
  "message": "用户名已存在",
  "data": null
}
```

### 3.3 第三方登录 - 微信

- **URL**: `/api/user/oauth/wechat`
- **方法**: POST
- **请求参数**:

| 参数名 | 类型   | 是否必须 | 描述       |
| ------ | ------ | -------- | ---------- |
| code   | string | 是       | 微信授权码 |

- **请求示例**:

```json
{
  "code": "wx_auth_code"
}
```

- **成功响应**:

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 2,
      "username": "wx_user_123",
      "nickname": "微信用户",
      "avatar_url": "http://example.com/wx_avatar.jpg",
      "role": 0
    }
  }
}
```

### 3.4 第三方登录 - 手机号

- **URL**: `/api/user/oauth/phone`
- **方法**: POST
- **请求参数**:

| 参数名 | 类型   | 是否必须 | 描述     |
| ------ | ------ | -------- | -------- |
| phone  | string | 是       | 手机号   |
| code   | string | 是       | 验证码   |

- **请求示例**:

```json
{
  "phone": "13800138000",
  "code": "123456"
}
```

- **成功响应**:

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 3,
      "username": "phone_13800138000",
      "nickname": "手机用户",
      "avatar_url": null,
      "role": 0
    }
  }
}
```

### 3.5 忘记密码

- **URL**: `/api/user/forgot-password`
- **方法**: POST
- **请求参数**:

| 参数名      | 类型   | 是否必须 | 描述       |
| ----------- | ------ | -------- | ---------- |
| email       | string | 是       | 注册邮箱   |
| captcha     | string | 是       | 验证码     |
| new_password | string | 是       | 新密码     |

- **请求示例**:

```json
{
  "email": "user@example.com",
  "captcha": "123456",
  "new_password": "new_password123"
}
```

- **成功响应**:

```json
{
  "code": 200,
  "message": "密码重置成功",
  "data": null
}
```

## 4. 用户信息

### 4.1 获取当前用户信息

- **URL**: `/api/user/info`
- **方法**: GET
- **请求头**: 
  - Authorization: Bearer {token}
- **成功响应**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "username": "test_user",
    "nickname": "测试用户",
    "avatar_url": "http://example.com/avatar.jpg",
    "role": 0
  }
}
```

### 4.2 更新用户信息

- **URL**: `/api/user/info`
- **方法**: PUT
- **请求头**: 
  - Authorization: Bearer {token}
- **请求参数**:

| 参数名    | 类型   | 是否必须 | 描述     |
| --------- | ------ | -------- | -------- |
| nickname  | string | 否       | 昵称     |
| avatar_url | string | 否       | 头像URL  |

- **请求示例**:

```json
{
  "nickname": "新昵称",
  "avatar_url": "http://example.com/new_avatar.jpg"
}
```

- **成功响应**:

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 1,
    "username": "test_user",
    "nickname": "新昵称",
    "avatar_url": "http://example.com/new_avatar.jpg",
    "role": 0
  }
}
```

## 5. 数据结构

### 5.1 用户

```sql
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

## 6. 安全性要求

1. 所有API必须经过HTTPS传输。
2. 用户密码必须使用bcrypt等安全的哈希算法加密存储。
3. 所有敏感操作必须进行权限校验。
4. 实现CSRF防护和XSS防护。
5. 实现请求频率限制，防止恶意请求。

## 7. 开发注意事项

1. 后端框架使用Spring Boot。
2. 数据库使用MySQL。
3. 遵循RESTful API设计规范。
4. 所有接口必须有完整的错误处理和日志记录。
5. 接口应尽可能幂等，避免重复请求导致数据问题。
