# 🎮 topupforme Admin Panel

**topupforme 风格数字商品平台** - 管理后台系统

基于 React + Vite + TypeScript + Ant Design 构建的现代化管理后台，支持多币种、多地区、多语言的数字商品交易平台管理。

---

## 📋 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [环境配置](#环境配置)
- [核心模块](#核心模块)
- [权限控制](#权限控制)
- [国际化](#国际化)
- [部署说明](#部署说明)

---

## ✨ 功能特性

### 🔐 认证与授权
- ✅ JWT 令牌认证
- ✅ 角色权限控制 (Admin / Manager / Support)
- ✅ 登录 / 登出 / 密码重置
- ✅ Protected Routes 路由保护

### 📦 商品管理
- ✅ 商品 CRUD 操作
- ✅ **多区域定价** (每个商品支持多个地区价格)
- ✅ 多语言名称与描述 (EN / CN / TH)
- ✅ 批量导入 (CSV/Excel)
- ✅ 批量导出
- ✅ 图片上传
- ✅ 库存管理
- ✅ 分类与标签

### 📋 订单管理
- ✅ 订单列表与详情
- ✅ 订单状态管理 (Pending → Paid → Delivered → Completed)
- ✅ 支付记录追踪
- ✅ 退款操作
- ✅ 手动发货
- ✅ 订单搜索与筛选

### 👥 用户管理
- ✅ 用户列表与详情
- ✅ 用户角色管理
- ✅ 账户激活/冻结
- ✅ 用户资料编辑

### 💰 钱包管理
- ✅ 余额查看
- ✅ 充值/扣款操作 (管理员)
- ✅ 交易记录追踪
- ✅ 钱包冻结/解冻
- ✅ 多币种支持 (MYR, THB, USD, VND, PHP)

### 📊 报表分析
- ✅ Dashboard 仪表盘
- ✅ 销售额趋势图 (Recharts)
- ✅ 订单量统计
- ✅ 活跃用户数
- ✅ 各币种销售分布
- ✅ 热销商品排行
- ✅ 报表导出

---

## 🛠️ 技术栈

### 核心框架
- **React 18** - UI 框架
- **Vite 5** - 构建工具
- **TypeScript** - 类型安全

### UI 组件库
- **Ant Design 5** - UI 组件
- **@ant-design/icons** - 图标库
- **Recharts** - 图表库

### 路由与状态管理
- **React Router 6** - 路由管理
- **Zustand** - 状态管理

### 数据请求
- **Axios** - HTTP 客户端
- **TanStack Query (React Query)** - 数据获取与缓存

### 国际化
- **react-i18next** - 国际化框架
- **i18next** - i18n 核心
- **i18next-browser-languagedetector** - 语言自动检测

### 工具库
- **dayjs** - 日期处理
- **lodash-es** - 工具函数
- **file-saver** - 文件下载
- **xlsx** - Excel 导入导出

### 代码规范
- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **TypeScript ESLint** - TS 规则

---

## 📁 项目结构

```
admin/
├── src/
│   ├── main.tsx                 # 应用入口
│   ├── App.tsx                  # 根组件
│   ├── router/                  # 路由配置
│   │   ├── index.tsx            # 路由定义
│   │   └── ProtectedRoute.tsx   # 路由保护
│   ├── pages/                   # 页面组件
│   │   ├── Dashboard/           # 仪表盘
│   │   ├── Products/            # 商品管理
│   │   │   ├── ProductList.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   └── ProductImport.tsx
│   │   ├── Orders/              # 订单管理
│   │   │   ├── OrderList.tsx
│   │   │   └── OrderDetail.tsx
│   │   ├── Users/               # 用户管理
│   │   │   ├── UserList.tsx
│   │   │   └── UserDetail.tsx
│   │   ├── Wallets/             # 钱包管理
│   │   │   ├── WalletList.tsx
│   │   │   └── TransactionList.tsx
│   │   ├── Reports/             # 报表分析
│   │   │   └── Dashboard.tsx
│   │   └── Auth/                # 认证页面
│   │       ├── Login.tsx
│   │       └── ResetPassword.tsx
│   ├── components/              # 公共组件
│   │   ├── Layout/              # 布局组件
│   │   │   ├── Sidebar.tsx      # 侧边栏
│   │   │   ├── Header.tsx       # 顶部导航
│   │   │   └── MainLayout.tsx   # 主布局
│   │   ├── Table/               # 表格组件
│   │   │   └── DataTable.tsx
│   │   ├── Form/                # 表单组件
│   │   │   ├── FormField.tsx
│   │   │   └── UploadImage.tsx
│   │   └── Chart/               # 图表组件
│   │       ├── LineChart.tsx
│   │       ├── BarChart.tsx
│   │       └── PieChart.tsx
│   ├── store/                   # 状态管理
│   │   ├── authStore.ts         # 认证状态
│   │   ├── userStore.ts         # 用户状态
│   │   └── globalStore.ts       # 全局状态
│   ├── hooks/                   # 自定义 Hooks
│   │   ├── useAuth.ts           # 认证 Hook
│   │   ├── useTable.ts          # 表格 Hook
│   │   └── useExport.ts         # 导出 Hook
│   ├── services/                # API 服务
│   │   ├── api.ts               # Axios 配置
│   │   ├── auth.ts              # 认证 API
│   │   ├── product.ts           # 商品 API
│   │   ├── order.ts             # 订单 API
│   │   ├── user.ts              # 用户 API
│   │   ├── wallet.ts            # 钱包 API
│   │   └── report.ts            # 报表 API
│   ├── types/                   # TypeScript 类型
│   │   └── index.ts             # 类型定义
│   ├── utils/                   # 工具函数
│   │   ├── date.ts              # 日期工具
│   │   ├── format.ts            # 格式化工具
│   │   ├── storage.ts           # 本地存储
│   │   ├── validation.ts        # 验证工具
│   │   └── index.ts             # 工具导出
│   ├── locales/                 # 国际化文件
│   │   ├── en.json              # 英文
│   │   ├── zh.json              # 中文
│   │   ├── th.json              # 泰文
│   │   └── i18n.ts              # i18n 配置
│   ├── styles/                  # 样式文件
│   │   ├── global.css           # 全局样式
│   │   └── variables.css        # CSS 变量
│   └── assets/                  # 静态资源
│       └── images/
├── public/                      # 公共资源
├── package.json                 # 项目配置
├── vite.config.ts               # Vite 配置
├── tsconfig.json                # TypeScript 配置
├── .eslintrc.cjs                # ESLint 配置
├── .prettierrc                  # Prettier 配置
├── .env.example                 # 环境变量模板
└── README.md                    # 项目文档
```

---

## 🚀 快速开始

### 1. 前置要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- 后端 API 运行在 `http://localhost:3000`

### 2. 安装依赖

```bash
cd admin
npm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env`:

```bash
cp .env.example .env
```

编辑 `.env` 文件:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=topupforme Admin Panel
VITE_DEFAULT_LANGUAGE=en
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问: `http://localhost:5173`

### 5. 默认登录账号

```
管理员账号:
Email: admin@topupforme.com
Password: Admin123456

经理账号:
Email: manager@topupforme.com
Password: Manager123

客服账号:
Email: support@topupforme.com
Password: Support123
```

---

## ⚙️ 环境配置

### 开发环境

```bash
npm run dev          # 启动开发服务器
npm run type-check   # TypeScript 类型检查
npm run lint         # ESLint 检查
npm run lint:fix     # 自动修复 ESLint 错误
npm run format       # Prettier 格式化代码
```

### 生产构建

```bash
npm run build        # 构建生产版本
npm run preview      # 预览生产构建
```

### 环境变量说明

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_API_BASE_URL` | 后端 API 地址 | `http://localhost:3000` |
| `VITE_APP_NAME` | 应用名称 | `topupforme Admin Panel` |
| `VITE_DEFAULT_LANGUAGE` | 默认语言 | `en` |
| `VITE_TOKEN_KEY` | Token 存储键名 | `admin_token` |
| `VITE_MAX_UPLOAD_SIZE` | 最大上传大小 | `5242880` (5MB) |
| `VITE_DEFAULT_PAGE_SIZE` | 默认分页大小 | `20` |

---

## 📦 核心模块

### 1. 商品管理模块

#### 多区域定价功能

每个商品可以在多个地区设置不同的价格、库存和上架状态:

```typescript
interface ProductRegionPrice {
  region: string;      // MY, TH, US, VN, PH
  currency: string;    // MYR, THB, USD, VND, PHP
  price: number;       // 价格
  stock: number;       // 库存
  isActive: boolean;   // 是否上架
}
```

**示例**: Steam 礼品卡在不同地区的定价

| 地区 | 货币 | 价格 | 库存 | 状态 |
|------|------|------|------|------|
| 马来西亚 (MY) | MYR | RM 50.00 | 1000 | ✅ 上架 |
| 泰国 (TH) | THB | ฿350.00 | 500 | ✅ 上架 |
| 美国 (US) | USD | $10.00 | 2000 | ✅ 上架 |
| 越南 (VN) | VND | ₫200,000 | 300 | ❌ 下架 |
| 菲律宾 (PH) | PHP | ₱500.00 | 800 | ✅ 上架 |

#### API 端点

```typescript
// 获取商品列表 (支持多区域过滤)
GET /api/products?region=MY&currency=MYR&page=1&pageSize=20

// 创建商品 (包含多区域定价)
POST /api/products
{
  "name": { "en": "Steam Card", "zh": "Steam 卡", "th": "บัตร Steam" },
  "regionalPricing": [
    { "region": "MY", "currency": "MYR", "price": 50, "stock": 1000 },
    { "region": "TH", "currency": "THB", "price": 350, "stock": 500 }
  ]
}

// 更新单个地区的库存
PATCH /api/products/:id/stock
{ "region": "MY", "stock": 1500 }

// 批量导入商品
POST /api/products/import
FormData: file (CSV/Excel)
```

---

### 2. 订单管理模块

#### 订单状态流转

```
pending (待支付)
   ↓
paid (已支付)
   ↓
processing (处理中)
   ↓
delivered (已发货)
   ↓
completed (已完成)

↓ (取消/退款)
cancelled / refunded
```

#### 支付方式

- **Wallet** - 钱包余额
- **Stripe** - 信用卡/借记卡
- **Razer Gold** - 游戏充值卡
- **FPX** - 马来西亚银行转账
- **USDT** - 加密货币

#### API 端点

```typescript
// 获取订单列表
GET /api/orders?status=paid&page=1

// 更新订单状态
PATCH /api/orders/:id/status
{ "status": "delivered" }

// 手动发货
POST /api/orders/:id/deliver
{ "codes": ["XXXX-YYYY-ZZZZ"] }

// 退款
POST /api/orders/:id/refund
{ "reason": "Customer request" }
```

---

### 3. 用户与钱包模块

#### 钱包结构

```typescript
interface Wallet {
  balance: number;           // 总余额
  frozenBalance: number;     // 冻结余额
  availableBalance: number;  // 可用余额 = balance - frozenBalance
  currency: string;          // 币种
  status: 'active' | 'frozen' | 'closed';
}
```

#### 交易类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `deposit` | 充值 | 用户充值 $100 |
| `withdraw` | 提现 | 用户提现 $50 |
| `deduct` | 扣款 | 购买商品扣款 $10 |
| `refund` | 退款 | 订单取消退款 $10 |
| `fee` | 手续费 | 提现手续费 $1 |
| `bonus` | 奖励 | 注册奖励 $5 |
| `adjustment` | 调整 | 管理员调整余额 |

#### API 端点

```typescript
// 获取用户钱包
GET /api/wallet/:userId

// 充值 (管理员操作)
POST /api/wallet/:userId/deposit
{ "amount": 100, "description": "Manual deposit" }

// 提现 (管理员操作)
POST /api/wallet/:userId/withdraw
{ "amount": 50, "description": "Manual withdraw" }

// 冻结/解冻钱包
POST /api/wallet/:userId/freeze
POST /api/wallet/:userId/unfreeze
```

---

### 4. 报表分析模块

#### Dashboard 统计指标

```typescript
interface DashboardSummary {
  totalSales: number;       // 总销售额
  totalOrders: number;      // 总订单数
  activeUsers: number;      // 活跃用户数
  pendingOrders: number;    // 待处理订单
  todaySales: number;       // 今日销售额
  todayOrders: number;      // 今日订单数
  salesGrowth: number;      // 销售增长率 (%)
  ordersGrowth: number;     // 订单增长率 (%)
}
```

#### 图表类型

1. **销售趋势图** (折线图)
   - X 轴: 日期
   - Y 轴: 销售额/订单量

2. **币种分布图** (饼图)
   - 显示各币种销售占比

3. **热销商品排行** (柱状图)
   - Top 10 商品

4. **地区收入分布** (地图 / 表格)
   - 各地区销售额

#### API 端点

```typescript
// 获取 Dashboard 摘要
GET /api/reports/summary?startDate=2024-01-01&endDate=2024-12-31

// 获取销售图表数据
GET /api/reports/sales?groupBy=day

// 获取币种分布
GET /api/reports/currency

// 导出报表
GET /api/reports/sales/export?format=csv
```

---

## 🔐 权限控制

### 角色定义

| 角色 | 权限 | 菜单访问 |
|------|------|---------|
| **admin** | 全部权限 | 全部菜单 |
| **manager** | 商品 + 订单管理 | Dashboard, Products, Orders |
| **support** | 查看订单 + 用户 | Dashboard, Orders (只读), Users (只读) |

### 实现方式

#### 1. 路由保护

```tsx
// router/ProtectedRoute.tsx
<Route element={<ProtectedRoute allowedRoles={['admin']} />}>
  <Route path="/users" element={<UserList />} />
</Route>
```

#### 2. 组件级权限

```tsx
// 使用 useAuth Hook
const { user, hasPermission } = useAuth();

{hasPermission(['admin', 'manager']) && (
  <Button>Edit Product</Button>
)}
```

#### 3. API 层权限

```typescript
// services/api.ts
// 后端通过 JWT Token 验证用户角色
headers: {
  Authorization: `Bearer ${token}`
}
```

---

## 🌍 国际化 (i18n)

### 支持语言

| 语言 | 代码 | 翻译键数 | 完成度 |
|------|------|---------|--------|
| English | `en` | 200+ | ✅ 100% |
| 中文 | `zh` | 200+ | ✅ 100% |
| ไทย | `th` | 200+ | ✅ 100% |

### 使用方式

#### 1. 在组件中使用

```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <Button onClick={() => i18n.changeLanguage('zh')}>
        {t('common.chinese')}
      </Button>
    </div>
  );
};
```

#### 2. 翻译键结构

```json
// locales/en.json
{
  "common": {
    "welcome": "Welcome",
    "save": "Save",
    "cancel": "Cancel"
  },
  "product": {
    "title": "Products",
    "addProduct": "Add Product"
  }
}
```

#### 3. 语言切换

```tsx
// components/Layout/Header.tsx
<Select value={i18n.language} onChange={(lang) => i18n.changeLanguage(lang)}>
  <Option value="en">English</Option>
  <Option value="zh">中文</Option>
  <Option value="th">ไทย</Option>
</Select>
```

### 自动语言检测

```typescript
// locales/i18n.ts
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector) // 自动检测浏览器语言
  .init({
    fallbackLng: 'en',
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator'],
    },
  });
```

---

## 📦 核心依赖说明

### UI 组件

```json
{
  "antd": "^5.12.0",              // Ant Design 组件库
  "@ant-design/icons": "^5.2.6",  // 图标库
  "recharts": "^2.10.3"            // 图表库
}
```

### 路由与状态

```json
{
  "react-router-dom": "^6.20.0",      // 路由
  "zustand": "^4.4.7"                 // 状态管理
}
```

### 数据请求

```json
{
  "axios": "^1.6.2",                     // HTTP 客户端
  "@tanstack/react-query": "^5.14.0"    // 数据获取与缓存
}
```

### 国际化

```json
{
  "react-i18next": "^13.5.0",
  "i18next": "^23.7.6",
  "i18next-browser-languagedetector": "^7.2.0"
}
```

### 工具库

```json
{
  "dayjs": "^1.11.10",        // 日期处理
  "lodash-es": "^4.17.21",    // 工具函数
  "file-saver": "^2.0.5",     // 文件下载
  "xlsx": "^0.18.5"           // Excel 操作
}
```

---

## 🚀 部署说明

### 1. 构建生产版本

```bash
npm run build
```

生成文件在 `dist/` 目录。

### 2. Nginx 配置

```nginx
server {
    listen 80;
    server_name admin.topupforme.com;
    root /var/www/admin/dist;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # SPA 路由配置
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# 构建镜像
docker build -t topupforme-admin .

# 运行容器
docker run -d -p 80:80 \
  -e VITE_API_BASE_URL=https://api.topupforme.com \
  topupforme-admin
```

### 4. 环境变量配置

生产环境的环境变量:

```env
VITE_API_BASE_URL=https://api.topupforme.com
VITE_APP_NAME=topupforme Admin Panel
VITE_DEFAULT_LANGUAGE=en
VITE_ENABLE_DEBUG=false
```

---

## 🧪 测试

### 单元测试

```bash
npm run test          # 运行测试
npm run test:coverage # 测试覆盖率
```

### E2E 测试

```bash
npm run test:e2e      # Cypress E2E 测试
```

---

## 📝 开发规范

### 代码风格

- 使用 **ESLint** 进行代码检查
- 使用 **Prettier** 进行代码格式化
- 遵循 **Airbnb React Style Guide**

### Git 提交规范

```
feat: 新功能
fix: 修复 Bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具相关
```

### 命名规范

- **组件**: PascalCase (例: `ProductList.tsx`)
- **Hook**: camelCase with `use` prefix (例: `useAuth.ts`)
- **常量**: UPPER_SNAKE_CASE (例: `API_BASE_URL`)
- **函数**: camelCase (例: `formatCurrency`)

---

## 🐛 常见问题

### 1. 端口冲突

```bash
# 修改端口
vite.config.ts → server.port: 5174
```

### 2. API 跨域问题

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}
```

### 3. 环境变量不生效

- 确保变量以 `VITE_` 开头
- 重启开发服务器

---

## 📄 许可证

MIT License

---

## 👥 贡献者

- **开发者**: topupforme Team
- **UI/UX**: Based on Ant Design

---

## 📞 联系方式

- **项目地址**: https://github.com/topupforme/admin-panel
- **文档地址**: https://docs.topupforme.com/admin
- **Bug 反馈**: https://github.com/topupforme/admin-panel/issues

---

**🎉 感谢使用 topupforme Admin Panel！**
