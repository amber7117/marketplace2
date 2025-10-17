# Product Service - Cloudflare Worker

基于 Cloudflare Workers 和 D1 数据库的产品管理服务，支持统一的面额数据管理。

## 🚀 快速开始

### 1. 环境准备
```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login
```

### 2. 数据库设置
```bash
# 创建 D1 数据库
npx wrangler d1 create marketplace-products

# 更新 wrangler.toml 中的 database_id
# 将命令输出的 database_id 复制到 wrangler.toml 中
```

### 3. 导入数据
```bash
# 生成导入文件（如果还没有）
cd ../.. && node scripts/generate-d1-import.js

# 导入数据到 D1
./import-data.sh
```

### 4. 部署
```bash
# 部署到 Cloudflare
npx wrangler deploy

# 本地开发模式
npx wrangler dev
```

## 📡 API 端点

### 基础端点
- `GET /health` - 服务健康检查
- `GET /products` - 获取产品列表
- `GET /products/featured` - 获取推荐产品
- `GET /products/{id}` - 获取单个产品
- `GET /products/{id}/denominations` - 获取产品面额数据

### 管理端点
- `POST /products` - 创建新产品
- `PUT /products/{id}` - 更新产品
- `DELETE /products/{id}` - 删除产品（软删除）
- `PATCH /products/{id}/stock` - 更新库存

## 🎯 面额数据 API

### 获取面额数据
```bash
GET /products/{identifier}/denominations
```

**查询参数:**
- `region` - 按地区过滤 (US, MY, SG, TH)
- `currency` - 按货币过滤 (USD, MYR, SGD, THB)
- `inStockOnly` - 仅显示有库存 (true/false)
- `minPrice` - 最低价格过滤
- `maxPrice` - 最高价格过滤

**响应示例:**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": 1,
      "name": "PlayStation Store Gift Card",
      "slug": "playstation-store-gift-card",
      "category": "PlayStation"
    },
    "denominations": [
      {
        "region": "US",
        "currency": "USD", 
        "denomination": "$10 USD",
        "price": 10.99,
        "discountPrice": 9.99,
        "stock": 500,
        "isAvailable": true,
        "isInstantDelivery": true,
        "displayOrder": 1
      }
    ],
    "availableRegions": {
      "US": {
        "currency": "USD",
        "count": 4,
        "totalStock": 1100
      }
    },
    "priceStats": {
      "minPrice": 9.99,
      "maxPrice": 94.99,
      "avgPrice": 43.11,
      "totalStock": 1100
    },
    "totalDenominations": 9,
    "activeDenominations": 4
  }
}
```

## 🧪 测试示例

### 健康检查
```bash
curl https://your-worker.workers.dev/health
```

### 获取所有产品
```bash
curl "https://your-worker.workers.dev/products?page=1&limit=10"
```

### 按分类过滤
```bash
curl "https://your-worker.workers.dev/products?category=PlayStation&isFeatured=true"
```

### 搜索产品
```bash
curl "https://your-worker.workers.dev/products?search=gift%20card"
```

### 获取美国地区面额
```bash
curl "https://your-worker.workers.dev/products/playstation-store-gift-card/denominations?region=US"
```

### 价格范围过滤
```bash
curl "https://your-worker.workers.dev/products/playstation-store-gift-card/denominations?minPrice=10&maxPrice=50"
```

### 仅显示有库存
```bash
curl "https://your-worker.workers.dev/products/playstation-store-gift-card/denominations?inStockOnly=true"
```

## 🏗️ 数据结构

### 产品表 (products)
- `id` - 自增主键
- `name` - 产品名称
- `slug` - URL 友好标识符
- `description` - 产品描述
- `category` - 产品分类
- `type` - 产品类型 (digital_code, mobile_topup, etc.)
- `is_active` - 是否激活 (0/1)
- `is_featured` - 是否推荐 (0/1)
- `images` - JSON 格式图片数组
- `tags` - JSON 格式标签数组
- `regional_pricing` - JSON 格式面额数据

### 面额数据结构
```json
{
  "region": "US",
  "currency": "USD",
  "denomination": "$10 USD",
  "price": 10.99,
  "discountPrice": 9.99,
  "stock": 500,
  "isAvailable": true,
  "isInstantDelivery": true,
  "platformLogo": "/images/platforms/playstation.png",
  "displayOrder": 1
}
```

## 🔧 配置文件

### wrangler.toml
```toml
name = "virtual-trading-product"
compatibility_date = "2024-10-15"
main = "src/worker.js"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "marketplace-products"
database_id = "your-database-id"
```

## 📊 性能特性

- **全球分布**: Cloudflare 全球边缘网络
- **低延迟**: D1 数据库优化查询
- **自动扩缩**: 无服务器自动扩展
- **成本效益**: 按请求付费模式
- **高可用性**: 99.9%+ 服务可用性

## 🛠️ 开发工具

### 本地开发
```bash
npx wrangler dev
```

### 查看日志
```bash
npx wrangler tail
```

### 数据库管理
```bash
# 查询数据
npx wrangler d1 execute marketplace-products --command="SELECT * FROM products LIMIT 5"

# 备份数据
npx wrangler d1 export marketplace-products --output=backup.sql
```

## 🔒 安全考虑

- CORS 已配置允许跨域请求
- 建议在生产环境中添加身份验证
- 敏感操作需要管理员权限验证
- 使用 Cloudflare 安全功能防护

## 📈 监控和分析

- Cloudflare Analytics 提供请求统计
- Worker Analytics 显示性能指标
- D1 Analytics 监控数据库查询
- 自定义日志记录错误和关键操作

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📝 更新日志

### v1.0.0 (2024-10-17)
- ✅ 基础产品 CRUD 操作
- ✅ 面额数据管理 API
- ✅ 统一的 regionalPricing 数据结构
- ✅ 地区和价格过滤功能
- ✅ 库存管理和可用性检查
- ✅ 完整的 D1 数据导入支持