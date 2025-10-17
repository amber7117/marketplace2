# Order Service

订单管理微服务，负责处理订单创建、支付、发货和订单生命周期管理。

## 📦 功能特性

### 核心功能
- ✅ 订单创建与验证
- ✅ 多支付方式支持（钱包、Stripe、Razer Gold、FPX、USDT）
- ✅ 自动库存预留
- ✅ 自动发货（数字商品）
- ✅ 订单状态管理
- ✅ 订单查询与筛选
- ✅ 订单取消与退款
- ✅ 支付回调处理
- ✅ 订单统计分析

### 订单状态流程
```
pending → paid → delivering → delivered → completed
   ↓
cancelled / refunded
```

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库和服务URL
```

### 启动服务
```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

### 填充测试数据
```bash
node seed.js
```

## 📡 API 端点

### 创建订单
```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "product": "507f1f77bcf86cd799439011",
      "quantity": 2
    }
  ],
  "payment": {
    "method": "wallet",  // wallet, stripe, razer, fpx, usdt
    "currency": "USD"
  }
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "orderNumber": "VTP-ABC123",
    "user": "507f191e810c19729de860ea",
    "items": [...],
    "status": "paid",
    "totals": {
      "total": 90.00
    }
  },
  "message": "Order created successfully"
}
```

### 获取订单列表
```http
GET /orders?page=1&limit=10&status=completed
Authorization: Bearer <token>

Query Parameters:
- page (int): 页码，默认 1
- limit (int): 每页数量，默认 10
- status (enum): pending, paid, delivered, completed, cancelled
- orderNumber (string): 订单号筛选
- startDate (date): 开始日期
- endDate (date): 结束日期
```

### 获取单个订单
```http
GET /orders/:id
Authorization: Bearer <token>
```

### 通过订单号获取订单
```http
GET /orders/number/:orderNumber
Authorization: Bearer <token>
```

### 取消订单
```http
POST /orders/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Changed my mind"
}
```

### 更新订单状态（管理员）
```http
PATCH /orders/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "delivered"
}
```

### 支付回调（Webhook）
```http
POST /orders/callback/:gateway
Content-Type: application/json

// Gateway-specific payload
```

### 获取订单统计（管理员）
```http
GET /orders/stats
Authorization: Bearer <admin_token>
```

## 🔄 订单流程

### 1. 创建订单
- 验证商品存在性和库存
- 计算订单总价
- 创建订单记录

### 2. 处理支付
**钱包支付:**
- 从用户钱包扣款
- 立即标记为已支付
- 触发自动发货

**第三方支付:**
- 创建支付意图
- 返回支付URL
- 等待支付回调

### 3. 库存管理
- 支付成功后预留库存
- 取消订单后释放库存
- 与 Product Service 通信

### 4. 自动发货
- 支持即时发货（instant）
- 生成数字码或激活码
- 发送发货通知邮件

### 5. 订单完成
- 用户确认收货
- 标记为已完成
- 更新商品销售统计

## 🔗 服务依赖

Order Service 需要与以下服务通信：

### Product Service
- 获取商品信息
- 更新库存数量
- URL: `http://localhost:3002`

### Wallet Service
- 钱包扣款
- 退款处理
- URL: `http://localhost:3004`

### Payment Service
- 创建支付
- 处理支付回调
- URL: `http://localhost:3005`

### Notification Service
- 发送订单通知
- 发送发货通知
- URL: `http://localhost:3006`

## 📊 数据模型

### Order Schema
```javascript
{
  orderNumber: String (unique),        // VTP-ABC123
  user: ObjectId,                      // 用户ID
  userEmail: String,                   // 用户邮箱
  items: [{
    product: ObjectId,                 // 商品ID
    productName: String,               // 商品名称
    quantity: Number,                  // 数量
    unitPrice: Number,                 // 单价
    totalPrice: Number,                // 总价
    deliveryCode: String               // 发货码
  }],
  status: String,                      // 订单状态
  payment: {
    method: String,                    // 支付方式
    transactionId: String,             // 交易ID
    amount: Number,                    // 支付金额
    currency: String,                  // 货币
    status: String,                    // 支付状态
    paidAt: Date                       // 支付时间
  },
  delivery: {
    method: String,                    // 发货方式
    status: String,                    // 发货状态
    deliveredAt: Date,                 // 发货时间
    codes: [String]                    // 发货码列表
  },
  totals: {
    subtotal: Number,                  // 小计
    tax: Number,                       // 税费
    discount: Number,                  // 折扣
    total: Number                      // 总计
  },
  expiresAt: Date,                     // 过期时间
  completedAt: Date,                   // 完成时间
  cancelledAt: Date,                   // 取消时间
  cancellationReason: String           // 取消原因
}
```

## ⚙️ 环境变量

```env
PORT=3003
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/virtual-trading-order

# Service URLs
PRODUCT_SERVICE_URL=http://localhost:3002
WALLET_SERVICE_URL=http://localhost:3004
PAYMENT_SERVICE_URL=http://localhost:3005
NOTIFICATION_SERVICE_URL=http://localhost:3006

# Order Settings
ORDER_NUMBER_PREFIX=VTP
ORDER_EXPIRY_MINUTES=30
ENABLE_AUTO_DELIVERY=true
```

## 🧪 测试

### 手动测试订单创建
```bash
# 1. 先登录获取 token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# 2. 创建订单
TOKEN="your_jwt_token"
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "items": [
      {"product":"507f1f77bcf86cd799439011","quantity":1}
    ],
    "payment": {"method":"wallet"}
  }'

# 3. 查看订单
curl http://localhost:3000/api/orders \
  -H "Authorization: Bearer $TOKEN"
```

## 🔒 安全性

- ✅ JWT 认证验证
- ✅ 用户权限检查（只能查看自己的订单）
- ✅ 管理员权限验证
- ✅ 订单金额验证
- ✅ 库存验证
- ✅ 支付回调签名验证（待实现）

## 📈 性能优化

- ✅ MongoDB 索引优化
- ✅ 订单号索引
- ✅ 用户+状态复合索引
- ✅ 自动过期索引（pending 订单）
- 🔄 Redis 缓存（待集成）
- 🔄 消息队列（待集成）

## 🐛 常见问题

### 订单创建失败
- 检查商品是否存在且有库存
- 检查 Product Service 是否运行
- 检查用户钱包余额是否充足

### 自动发货失败
- 检查 `ENABLE_AUTO_DELIVERY` 环境变量
- 检查 Notification Service 是否运行
- 查看发货错误日志

### 支付回调未触发
- 检查 Webhook URL 配置
- 验证支付网关配置
- 检查防火墙设置

## 📚 相关文档

- [API 完整文档](../../API_DOCUMENTATION.md)
- [项目架构](../../README.md)
- [开发计划](../../DEVELOPMENT_PLAN.md)

---

**服务端口**: 3003  
**数据库**: MongoDB (`virtual-trading-order`)  
**状态**: ✅ 已完成  
**最后更新**: 2025-10-15
