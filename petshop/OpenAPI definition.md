# OpenAPI definition
[toc]
## 1	环境变量

### Generated server url
| 参数名 | 字段值 |
| ------ | ------ |
|baseUrl|http://localhost:8080|


## 2	OpenAPI definition

##### 说明
> 



##### 联系方式
- **联系人：**
- **邮箱：**
- **网址：**//

##### 文档版本
```
v0
```


## 3	uploadFile

> POST  /api/admin/files/upload
### 请求体(Request Body)
| 参数名称 | 数据类型 | 默认值 | 不为空 | 描述 |
| ------ | ------ | ------ | ------ | ------ |
| file|string||true||
### 响应体
● 200 响应数据格式：JSON

##### 接口描述
> 




## 4	用户订单模块

## 4.1	分页获取当前用户的历史订单

> GET  /api/user/orders
### 请求参数(Query Param)
| 参数名称 | 默认值 | 描述 |
| ------ | ------ | ------ |
|current||当前页码|
|size||每页显示数量|
### 响应体
● 200 响应数据格式：JSON
| 参数名称 | 类型 | 默认值 | 不为空 | 描述 |
| ------ | ------ | ------ | ------ | ------ |
| records|array[object]||false||
|⇥ id|int32||false||
|⇥ orderNo|string||false||
|⇥ userId|int32||false||
|⇥ totalAmount|number||false||
|⇥ status|int32||false||
|⇥ addressId|int32||false||
|⇥ createdAt|string||false||
|⇥ paymentTime|string||false||
|⇥ updatedAt|string||false||
| total|int32||false||
| size|int32||false||
| current|int32||false||
| orders|array[object]||false||
|⇥ column|string||false||
|⇥ asc|boolean||false||
| optimizeCountSql|object||false||
| searchCount|object||false||
| optimizeJoinOfCountSql|boolean||false||
| maxLimit|int32||false||
| countId|string||false||
| pages|int32||false||

##### 接口描述
> 




## 4.2	从购物车创建订单

> POST  /api/user/orders
### 请求体(Request Body)
| 参数名称 | 数据类型 | 默认值 | 不为空 | 描述 |
| ------ | ------ | ------ | ------ | ------ |
| addressId|int32||false||
| cartItemIds|array[int32]||false||
| remark|string||false||
### 响应体
● 200 响应数据格式：JSON

##### 接口描述
> 根据选择的购物车项和地址创建新订单




## 4.3	根据订单号获取订单详情

> GET  /api/user/orders/{orderNo}
### 地址参数（Path Variable）
| 参数名称 | 默认值 | 描述 |
| ------ | ------ | ------ |
|orderNo||订单的唯一编号|
### 响应体
● 200 响应数据格式：JSON
| 参数名称 | 类型 | 默认值 | 不为空 | 描述 |
| ------ | ------ | ------ | ------ | ------ |
| id|int32||false||
| orderNo|string||false||
| totalAmount|number||false||
| status|int32||false||
| createdAt|string||false||
| contactName|string||false||
| phone|string||false||
| fullAddress|string||false||
| items|array[object]||false||
|⇥ productId|int32||false||
|⇥ name|string||false||
|⇥ mainImageUrl|string||false||
|⇥ unitPrice|number||false||
|⇥ quantity|int32||false||

##### 接口描述
> 




## 5	getUserList

> GET  /api/admin/users
### 请求参数(Query Param)
| 参数名称 | 默认值 | 描述 |
| ------ | ------ | ------ |
|current|||
|size|||
### 响应体
● 200 响应数据格式：JSON
| 参数名称 | 类型 | 默认值 | 不为空 | 描述 |
| ------ | ------ | ------ | ------ | ------ |
| records|array[object]||false||
|⇥ id|int32||false||
|⇥ username|string||false||
|⇥ nickname|string||false||
|⇥ avatarUrl|string||false||
|⇥ role|int32||false||
|⇥ createdAt|string||false||
| total|int32||false||
| size|int32||false||
| current|int32||false||
| orders|array[object]||false||
|⇥ column|string||false||
|⇥ asc|boolean||false||
| optimizeCountSql|object||false||
| searchCount|object||false||
| optimizeJoinOfCountSql|boolean||false||
| maxLimit|int32||false||
| countId|string||false||
| pages|int32||false||

##### 接口描述
> 




## 6	后台-商品管理模块

## 6.1	根据ID获取商品详情

> GET  /api/admin/products/{id}
### 地址参数（Path Variable）
| 参数名称 | 默认值 | 描述 |
| ------ | ------ | ------ |
|id||商品的唯一ID|
### 响应体
● 200 响应数据格式：JSON
| 参数名称 | 类型 | 默认值 | 不为空 | 描述 |
| ------ | ------ | ------ | ------ | ------ |
| id|int32||false||
| storeId|int32||false||
| name|string||false||
| description|string||false||
| price|number||false||
| productType|int32||false||
| stock|int32||false||
| mainImageUrl|string||false||
| videoUrl|string||false||
| createdAt|string||false||
| updatedAt|string||false||

##### 接口描述
> 




## 6.2	删除指定ID的商品

> DELETE  /api/admin/products/{id}
### 地址参数（Path Variable）
| 参数名称 | 默认值 | 描述 |
| ------ | ------ | ------ |
|id||商品的唯一ID|
### 响应体
● 200 响应数据格式：JSON

##### 接口描述
> 




## 6.3	更新指定ID的商品信息

> PUT  /api/admin/products/{id}
### 地址参数（Path Variable）
| 参数名称 | 默认值 | 描述 |
| ------ | ------ | ------ |
|id||商品的唯一ID|
### 请求体(Request Body)
| 参数名称 | 数据类型 | 默认值 | 不为空 | 描述 |
| ------ | ------ | ------ | ------ | ------ |
| storeId|int32||false||
| name|string||false||
| description|string||false||
| price|number||false||
| productType|int32||false||
| stock|int32||false||
| mainImageUrl|string||false||
| videoUrl|string||false||
### 响应体
● 200 响应数据格式：JSON

##### 接口描述
> 




## 6.4	分页并按条件查询商品列表

> GET  /api/admin/products
### 请求参数(Query Param)
| 参数名称 | 默认值 | 描述 |
| ------ | ------ | ------ |
|current||当前页码|
|size||每页显示数量|
|storeId||所属商店ID (可选, 用于筛选)|
|name||商品名称 (可选, 用于模糊查询)|
### 响应体
● 200 响应数据格式：JSON
| 参数名称 | 类型 | 默认值 | 不为空 | 描述 |
| ------ | ------ | ------ | ------ | ------ |
| records|array[object]||false||
|⇥ id|int32||false||
|⇥ storeId|int32||false||
|⇥ name|string||false||
|⇥ description|string||false||
|⇥ price|number||false||
|⇥ productType|int32||false||
|⇥ stock|int32||false||
|⇥ mainImageUrl|string||false||
|⇥ videoUrl|string||false||
|⇥ createdAt|string||false||
|⇥ updatedAt|string||false||
| total|int32||false||
| size|int32||false||
| current|int32||false||
| orders|array[object]||false||
|⇥ column|string||false||
|⇥ asc|boolean||false||
| optimizeCountSql|object||false||
| searchCount|object||false||
| optimizeJoinOfCountSql|boolean||false||
| maxLimit|int32||false||
| countId|string||false||
| pages|int32||false||

##### 接口描述
> 




## 6.5	新增商品

> POST  /api/admin/products
### 请求体(Request Body)
| 参数名称 | 数据类型 | 默认值 | 不为空 | 描述 |
| ------ | ------ | ------ | ------ | ------ |
| storeId|int32||false||
| name|string||false||
| description|string||false||
| price|number||false||
| productType|int32||false||
| stock|int32||false||
| mainImageUrl|string||false||
| videoUrl|string||false||
### 响应体
● 200 响应数据格式：JSON

##### 接口描述
> 创建一个新的商品记录




## 7	商店浏览模块

## 7.1	查询附近的宠物商店

> GET  /api/user/stores/nearby
### 请求参数(Query Param)
| 参数名称 | 默认值 | 描述 |
| ------ | ------ | ------ |
|lng||查询中心的经度|
|lat||查询中心的纬度|
|distance||搜索半径（公里）|
### 响应体
● 200 响应数据格式：JSON

##### 接口描述
> 这是一个公开接口，无需登录即可访问




## 8	用户收货地址模块

## 8.1	删除指定ID的收货地址

> DELETE  /api/user/addresses/{id}
### 地址参数（Path Variable）
| 参数名称 | 默认值 | 描述 |
| ------ | ------ | ------ |
|id||要删除的地址ID|
### 响应体
● 200 响应数据格式：JSON

##### 接口描述
> 




## 8.2	更新指定ID的收货地址

> PUT  /api/user/addresses/{id}
### 地址参数（Path Variable）
| 参数名称 | 默认值 | 描述 |
| ------ | ------ | ------ |
|id||要更新的地址ID|
### 请求体(Request Body)
| 参数名称 | 数据类型 | 默认值 | 不为空 | 描述 |
| ------ | ------ | ------ | ------ | ------ |
| id|int32||false|地址唯一ID (更新时需要)|
| userId|int32||false|所属用户的ID (由后端自动填充)|
| contactName|string||true|联系人姓名|
| phone|string||true|手机号码|
| province|string||true|省份|
| city|string||true|城市|
| district|string||true|区/县|
| street|string||true|详细街道地址|
| isDefault|boolean||false|是否为默认地址 (true/false)|
| createdAt|string||false|创建时间 (由后端自动填充)|
| updatedAt|string||false|更新时间 (由后端自动填充)|
### 响应体
● 200 响应数据格式：JSON
| 参数名称 | 类型 | 默认值 | 不为空 | 描述 |
| ------ | ------ | ------ | ------ | ------ |
| id|int32||false|地址唯一ID (更新时需要)|
| userId|int32||false|所属用户的ID (由后端自动填充)|
| contactName|string||true|联系人姓名|
| phone|string||true|手机号码|
| province|string||true|省份|
| city|string||true|城市|
| district|string||true|区/县|
| street|string||true|详细街道地址|
| isDefault|boolean||false|是否为默认地址 (true/false)|
| createdAt|string||false|创建时间 (由后端自动填充)|
| updatedAt|string||false|更新时间 (由后端自动填充)|

##### 接口描述
> 




## 8.3	获取当前用户的所有收货地址

> GET  /api/user/addresses
### 响应体
● 200 响应数据格式：JSON

##### 接口描述
> 




## 8.4	为当前用户新增收货地址

> POST  /api/user/addresses
### 请求体(Request Body)
| 参数名称 | 数据类型 | 默认值 | 不为空 | 描述 |
| ------ | ------ | ------ | ------ | ------ |
| id|int32||false|地址唯一ID (更新时需要)|
| userId|int32||false|所属用户的ID (由后端自动填充)|
| contactName|string||true|联系人姓名|
| phone|string||true|手机号码|
| province|string||true|省份|
| city|string||true|城市|
| district|string||true|区/县|
| street|string||true|详细街道地址|
| isDefault|boolean||false|是否为默认地址 (true/false)|
| createdAt|string||false|创建时间 (由后端自动填充)|
| updatedAt|string||false|更新时间 (由后端自动填充)|
### 响应体
● 200 响应数据格式：JSON
| 参数名称 | 类型 | 默认值 | 不为空 | 描述 |
| ------ | ------ | ------ | ------ | ------ |
| id|int32||false|地址唯一ID (更新时需要)|
| userId|int32||false|所属用户的ID (由后端自动填充)|
| contactName|string||true|联系人姓名|
| phone|string||true|手机号码|
| province|string||true|省份|
| city|string||true|城市|
| district|string||true|区/县|
| street|string||true|详细街道地址|
| isDefault|boolean||false|是否为默认地址 (true/false)|
| createdAt|string||false|创建时间 (由后端自动填充)|
| updatedAt|string||false|更新时间 (由后端自动填充)|

##### 接口描述
> 




## 8.5	设置指定ID的地址为默认地址

> PATCH  /api/user/addresses/{id}/default
### 地址参数（Path Variable）
| 参数名称 | 默认值 | 描述 |
| ------ | ------ | ------ |
|id||要设为默认的地址ID|
### 响应体
● 200 响应数据格式：JSON

##### 接口描述
> 




## 9	后台-商店管理模块

## 9.1	删除指定ID的商店

> DELETE  /api/admin/stores/{id}
### 地址参数（Path Variable）
| 参数名称 | 默认值 | 描述 |
| ------ | ------ | ------ |
|id||商店的唯一ID|
### 响应体
● 200 响应数据格式：JSON

##### 接口描述
> 




## 9.2	更新指定ID的商店信息

> PUT  /api/admin/stores/{id}
### 地址参数（Path Variable）
| 参数名称 | 默认值 | 描述 |
| ------ | ------ | ------ |
|id||商店的唯一ID|
### 请求体(Request Body)
| 参数名称 | 数据类型 | 默认值 | 不为空 | 描述 |
| ------ | ------ | ------ | ------ | ------ |
| name|string||false||
| addressText|string||false||
| logoUrl|string||false||
| contactPhone|string||false||
| longitude|number||false||
| latitude|number||false||
### 响应体
● 200 响应数据格式：JSON

##### 接口描述
> 




## 9.3	分页查询商店列表

> GET  /api/admin/stores
### 请求参数(Query Param)
| 参数名称 | 默认值 | 描述 |
| ------ | ------ | ------ |
|current||当前页码|
|size||每页显示数量|
### 响应体
● 200 响应数据格式：JSON
| 参数名称 | 类型 | 默认值 | 不为空 | 描述 |
| ------ | ------ | ------ | ------ | ------ |
| records|array[object]||false||
|⇥ id|int32||false||
|⇥ name|string||false||
|⇥ addressText|string||false||
|⇥ logoUrl|string||false||
|⇥ contactPhone|string||false||
|⇥ createdAt|string||false||
|⇥ updatedAt|string||false||
| total|int32||false||
| size|int32||false||
| current|int32||false||
| orders|array[object]||false||
|⇥ column|string||false||
|⇥ asc|boolean||false||
| optimizeCountSql|object||false||
| searchCount|object||false||
| optimizeJoinOfCountSql|boolean||false||
| maxLimit|int32||false||
| countId|string||false||
| pages|int32||false||

##### 接口描述
> 




## 9.4	新增宠物商店

> POST  /api/admin/stores
### 请求体(Request Body)
| 参数名称 | 数据类型 | 默认值 | 不为空 | 描述 |
| ------ | ------ | ------ | ------ | ------ |
| name|string||false||
| addressText|string||false||
| logoUrl|string||false||
| contactPhone|string||false||
| longitude|number||false||
| latitude|number||false||
### 响应体
● 200 响应数据格式：JSON

##### 接口描述
> 




## 10	用户购物车模块

## 10.1	添加或更新购物车中的商品数量

> POST  /api/user/cart/items
### 请求体(Request Body)
| 参数名称 | 数据类型 | 默认值 | 不为空 | 描述 |
| ------ | ------ | ------ | ------ | ------ |
| productId|int32||false||
| quantity|int32||false||
### 响应体
● 200 响应数据格式：JSON

##### 接口描述
> 




## 10.2	获取我的购物车详情

> GET  /api/user/cart
### 响应体
● 200 响应数据格式：JSON
| 参数名称 | 类型 | 默认值 | 不为空 | 描述 |
| ------ | ------ | ------ | ------ | ------ |
| items|array[object]||false||
|⇥ productId|int32||false||
|⇥ name|string||false||
|⇥ mainImageUrl|string||false||
|⇥ price|number||false||
|⇥ quantity|int32||false||
|⇥ stock|int32||false||
| totalPrice|number||false||

##### 接口描述
> 




## 10.3	从购物车中移除指定商品

> DELETE  /api/user/cart/items/{productId}
### 地址参数（Path Variable）
| 参数名称 | 默认值 | 描述 |
| ------ | ------ | ------ |
|productId||要移除的商品ID|
### 响应体
● 200 响应数据格式：JSON

##### 接口描述
> 




## 11	用户个人信息模块

## 11.1	获取当前登录用户的个人信息

> GET  /api/user/users/me
### 响应体
● 200 响应数据格式：JSON
| 参数名称 | 类型 | 默认值 | 不为空 | 描述 |
| ------ | ------ | ------ | ------ | ------ |
| id|int32||false||
| username|string||false||
| nickname|string||false||
| avatarUrl|string||false||
| role|int32||false||

##### 接口描述
> 




## 12	用户认证模块

## 12.1	用户注册

> POST  /api/user/auth/register
### 请求体(Request Body)
| 参数名称 | 数据类型 | 默认值 | 不为空 | 描述 |
| ------ | ------ | ------ | ------ | ------ |
| username|string||true|用户名|
| password|string||true|密码|
| nickname|string||false|昵称|
### 响应体
● 200 响应数据格式：JSON

##### 接口描述
> 




## 12.2	用户登出

> POST  /api/user/auth/logout
### 响应体
● 200 响应数据格式：JSON

##### 接口描述
> 需要携带有效的Token来访问此接口，用于让当前Token失效




## 12.3	用户登录

> POST  /api/user/auth/login
### 请求体(Request Body)
| 参数名称 | 数据类型 | 默认值 | 不为空 | 描述 |
| ------ | ------ | ------ | ------ | ------ |
| username|string||true|用户名|
| password|string||true|密码|
### 响应体
● 200 响应数据格式：JSON
| 参数名称 | 类型 | 默认值 | 不为空 | 描述 |
| ------ | ------ | ------ | ------ | ------ |
| accessToken|string||false|访问令牌 (Access Token)|

##### 接口描述
> 登录成功后返回JWT访问令牌



