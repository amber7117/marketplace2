# 🚀 启动指南 / Getting Started Guide

## 📋 前置要求 / Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

## 🛠️ 安装步骤 / Installation Steps

### 1. 安装依赖 / Install Dependencies

```bash
cd admin
npm install
```

### 2. 环境配置 / Environment Configuration

复制 `.env.example` 文件并重命名为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置后端 API 地址：

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000
```

### 3. 启动开发服务器 / Start Development Server

```bash
npm run dev
```

访问: http://localhost:5173

### 4. 构建生产版本 / Build for Production

```bash
npm run build
```

构建产物位于 `dist/` 目录

## 📁 项目结构概览 / Project Structure

```
admin/
├── src/
│   ├── components/        # 组件目录
│   │   └── Layout/       # 布局组件
│   │       ├── Sidebar.tsx
│   │       ├── Header.tsx
│   │       └── MainLayout.tsx
│   ├── pages/            # 页面目录
│   │   ├── Auth/         # 认证页面
│   │   ├── Dashboard/    # 仪表盘
│   │   ├── Products/     # 商品管理
│   │   ├── Orders/       # 订单管理
│   │   ├── Users/        # 用户管理
│   │   └── Wallets/      # 钱包管理
│   ├── router/           # 路由配置
│   ├── store/            # Zustand 状态管理
│   ├── hooks/            # 自定义 Hooks
│   ├── services/         # API 服务
│   ├── types/            # TypeScript 类型定义
│   ├── utils/            # 工具函数
│   ├── locales/          # 国际化配置 (EN/ZH/TH)
│   ├── App.tsx           # 应用根组件
│   └── main.tsx          # 应用入口
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🎯 核心功能 / Core Features

### ✅ 已实现功能 / Implemented Features

1. **认证系统 / Authentication**
   - 登录/登出
   - JWT Token 管理
   - 权限控制 (RBAC)

2. **商品管理 / Product Management**
   - 商品列表展示
   - 多地区定价支持
   - 商品创建/编辑表单

3. **订单管理 / Order Management**
   - 订单列表
   - 订单详情查看
   - 订单状态跟踪

4. **用户管理 / User Management**
   - 用户列表
   - 用户角色管理

5. **国际化 / i18n**
   - 英文 (English)
   - 中文 (简体)
   - 泰语 (ไทย)

6. **多币种支持 / Multi-Currency**
   - MYR, THB, USD, VND, PHP

### 🔄 待完善功能 / TODO Features

- [ ] 商品批量导入
- [ ] 钱包交易管理
- [ ] 数据报表图表
- [ ] 商品分类管理
- [ ] 支付方式配置
- [ ] 系统设置页面

## 🔑 默认账户 / Default Account

开发环境默认登录账户：

```
Email: admin@topupforme.com
Password: admin123456
```

**注意：** 需要后端 API 服务运行在 `http://localhost:3000`

## 📚 技术栈 / Tech Stack

- **框架**: React 18 + Vite 5
- **UI 库**: Ant Design v5
- **状态管理**: Zustand 4
- **路由**: React Router v6
- **数据请求**: Axios + TanStack React Query
- **国际化**: react-i18next
- **图表**: Recharts
- **语言**: TypeScript

## 🐛 常见问题 / Common Issues

### 1. API 连接失败

**问题**: 登录或数据加载失败，显示网络错误

**解决方案**:
- 确保后端服务运行在 `http://localhost:3000`
- 检查 `.env` 文件中的 `VITE_API_BASE_URL` 配置
- 检查 CORS 配置

### 2. TypeScript 编译错误

**问题**: 开发时出现大量类型错误

**解决方案**:
```bash
npm install  # 重新安装依赖
npm run type-check  # 检查类型错误
```

### 3. Vite 代理配置

如果后端 API 不在同一域名，修改 `vite.config.ts`:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://your-backend-url:3000',
      changeOrigin: true,
    },
  },
},
```

## 📞 联系支持 / Support

如有问题，请查看项目 README.md 获取更多详细信息。

---

**祝您开发愉快！ / Happy Coding!** 🎉
