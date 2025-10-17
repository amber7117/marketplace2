# 数据库初始化脚本使用指南

## 📦 安装依赖

在项目根目录运行：

```bash
npm install mongoose dotenv
```

## 🚀 运行脚本

### 方式 1: 直接运行（推荐）

```bash
cd /Users/herbertlim/Downloads/virtual-trading-platform
node scripts/seed-database.js
```

### 方式 2: 使用 npm 脚本

在 `package.json` 添加：

```json
{
  "scripts": {
    "seed": "node scripts/seed-database.js"
  }
}
```

然后运行：

```bash
npm run seed
```

## 📊 导入的数据内容

### 分类 (5个)

| 图标 | 分类名称 | 英文名称 | 产品数量 |
|------|----------|----------|----------|
| 🎮 | 游戏点卡 | Game Credits | 4 |
| 🎁 | 礼品卡 | Gift Cards | 4 |
| 📱 | 手机充值 | Mobile Top-up | 2 |
| 📺 | 流媒体服务 | Streaming Services | 2 |
| 💻 | 软件激活码 | Software Keys | 2 |

**总计**: 5 个分类，14 个产品

### 产品列表

#### 🎮 游戏点卡 (4个)

1. **Mobile Legends Diamonds (100)** - $2.99
   - ⭐ 特色产品
   - 📦 库存: 1,000
   - ⭐ 评分: 4.8 (2,456 评论)
   - 💰 已售: 15,234

2. **PUBG Mobile UC (60+6)** - $0.99
   - ⭐ 特色产品
   - 📦 库存: 5,000
   - ⭐ 评分: 4.9 (8,934 评论)
   - 💰 已售: 45,678

3. **Genshin Impact Genesis Crystals (980)** - $14.99
   - ⭐ 特色产品
   - 📦 库存: 800
   - ⭐ 评分: 4.7 (5,623 评论)
   - 💰 已售: 28,901

4. **Free Fire Diamonds (100)** - $1.49
   - 📦 库存: 3,000
   - ⭐ 评分: 4.6 (3,421 评论)
   - 💰 已售: 19,876

#### 🎁 礼品卡 (4个)

5. **Steam Gift Card $10 (US)** - $10.50
   - ⭐ 特色产品
   - 📦 库存: 500
   - ⭐ 评分: 4.9 (12,456 评论)
   - 💰 已售: 67,890

6. **Google Play Gift Card $25** - $25.00
   - ⭐ 特色产品
   - 📦 库存: 600
   - ⭐ 评分: 4.8 (9,876 评论)
   - 💰 已售: 54,321

7. **iTunes Gift Card $15** - $15.00
   - 📦 库存: 400
   - ⭐ 评分: 4.7 (6,543 评论)
   - 💰 已售: 38,765

8. **PlayStation Network Card $20** - $20.00
   - 📦 库存: 350
   - ⭐ 评分: 4.8 (7,890 评论)
   - 💰 已售: 42,109

#### 📱 手机充值 (2个)

9. **Malaysia Mobile Top-up (RM30)** - $7.50
   - 📦 库存: 999
   - ⭐ 评分: 4.9 (4,321 评论)
   - 💰 已售: 25,678

10. **Thailand Mobile Top-up (100 THB)** - $3.00
    - 📦 库存: 999
    - ⭐ 评分: 4.7 (3,210 评论)
    - 💰 已售: 18,765

#### 📺 流媒体服务 (2个)

11. **Netflix Premium Gift Card 1 Month** - $15.99
    - ⭐ 特色产品
    - 📦 库存: 200
    - ⭐ 评分: 4.9 (8,765 评论)
    - 💰 已售: 34,567

12. **Spotify Premium 3 Months** - $29.99
    - 📦 库存: 150
    - ⭐ 评分: 4.8 (6,543 评论)
    - 💰 已售: 28,901

#### 💻 软件激活码 (2个)

13. **Microsoft Office 365 Personal 1 Year** - $69.99
    - ⭐ 特色产品
    - 📦 库存: 100
    - ⭐ 评分: 4.9 (5,432 评论)
    - 💰 已售: 21,098

14. **Windows 11 Pro Product Key** - $39.99
    - 📦 库存: 75
    - ⭐ 评分: 4.7 (4,321 评论)
    - 💰 已售: 16,789

## 📈 数据统计

- **总产品数**: 14 个
- **特色产品**: 7 个
- **总库存**: 13,174 件
- **平均评分**: 4.79 / 5.0
- **总评论数**: 89,665 条
- **总销售量**: 437,871 件

## ✅ 预期输出

运行脚本后，您应该看到：

```
🔌 连接到 MongoDB...
✅ MongoDB 已连接

🗑️  清空现有数据...
✅ 数据已清空

📁 插入分类数据...
✅ 已插入 5 个分类

📦 准备产品数据...
📦 插入产品数据...
✅ 已插入 14 个产品

📊 数据库统计:
   分类总数: 5
   产品总数: 14
   特色产品: 7
   总库存量: 13174

🎉 数据导入成功！

可用的产品分类:
   🎮 Game Credits (4 个产品)
   🎁 Gift Cards (4 个产品)
   📱 Mobile Top-up (2 个产品)
   📺 Streaming Services (2 个产品)
   💻 Software Keys (2 个产品)

🔥 热门产品:
   • Mobile Legends Diamonds (100) - $2.99 (库存: 1000)
   • PUBG Mobile UC (60+6) - $0.99 (库存: 5000)
   • Genshin Impact Genesis Crystals (980) - $14.99 (库存: 800)
   • Steam Gift Card $10 (US) - $10.5 (库存: 500)
   • Google Play Gift Card $25 - $25 (库存: 600)
   • Netflix Premium Gift Card 1 Month - $15.99 (库存: 200)
   • Microsoft Office 365 Personal 1 Year - $69.99 (库存: 100)

👋 数据库连接已关闭
```

## 🔍 验证数据

### 使用 MongoDB Compass

1. 连接字符串: `mongodb+srv://client2:5252Meimei@cluster0.bkbwpfb.mongodb.net/marketplace`
2. 查看 `categories` 集合 - 应有 5 条记录
3. 查看 `products` 集合 - 应有 14 条记录

### 使用 Mongo Shell

```bash
mongosh "mongodb+srv://client2:5252Meimei@cluster0.bkbwpfb.mongodb.net/marketplace"

# 查看分类数量
db.categories.countDocuments()

# 查看产品数量
db.products.countDocuments()

# 查看特色产品
db.products.find({ isFeatured: true }).pretty()

# 查看某个分类的产品
db.products.find({ categoryName: "Game Credits" }).pretty()
```

## 🛠️ 故障排除

### 问题 1: 连接失败

**错误**: `MongoNetworkError: connection timed out`

**解决方案**:
- 检查网络连接
- 确认 MongoDB Atlas IP 白名单设置
- 验证 `.env` 文件中的 `MONGO_URI`

### 问题 2: 认证失败

**错误**: `MongoServerError: bad auth`

**解决方案**:
- 验证数据库用户名和密码
- 确认用户有写入权限

### 问题 3: 重复键错误

**错误**: `E11000 duplicate key error`

**解决方案**:
- 脚本会先清空数据库，再次运行即可
- 或手动删除集合后重新运行

## 🎯 下一步

数据导入成功后：

1. **启动后端服务**:
   ```bash
   cd /Users/herbertlim/Downloads/virtual-trading-platform
   npm run dev
   ```

2. **启动前端**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **访问网站**:
   - 首页: http://localhost:3001/en
   - 产品列表: http://localhost:3001/en/products
   - 购物车: http://localhost:3001/en/cart

4. **测试功能**:
   - ✅ 浏览产品分类
   - ✅ 搜索产品
   - ✅ 添加到购物车
   - ✅ 查看产品详情
   - ✅ 多语言切换
   - ✅ 多货币显示

## 📞 需要帮助？

如果遇到问题，请检查：
1. MongoDB Atlas 连接状态
2. 环境变量配置
3. Node.js 版本 (建议 18+)
4. 网络连接状态

---

**数据生成时间**: 2025-10-15  
**脚本版本**: 1.0.0  
**数据库**: MongoDB Atlas
