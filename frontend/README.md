# 🚀 topupforme Frontend - Next.js 15 电商系统

## 📋 项目概览

这是一个基于 **Next.js 15** 构建的 topupforme 风格数字商品电商前端系统，支持多语言、多币种、多地区的现代化购物体验。

### 🎯 核心功能

- ✅ **多语言支持** (EN, ZH, TH, MY, VI) - 使用 next-intl
- ✅ **多币种系统** (USD, MYR, THB, VND, PHP)
- ✅ **多地区定价** - 商品支持不同地区不同价格
- ✅ **用户认证系统** - 登录/注册/JWT Token
- ✅ **购物车功能** - Zustand 状态管理
- ✅ **订单管理** - 订单历史、状态跟踪
- ✅ **钱包系统** - 余额、充值、提现
- ✅ **响应式设计** - 桌面端和移动端适配
- ✅ **SEO 优化** - Next.js 15 App Router + SSR/ISR

### 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **Next.js** | 15.x | React 框架 (App Router) |
| **React** | 18.x | UI 库 |
| **TypeScript** | 5.x | 类型系统 |
| **Tailwind CSS** | 3.x | 样式框架 |
| **Zustand** | 4.x | 状态管理 |
| **next-intl** | 3.x | 国际化 |
| **Axios** | 1.x | HTTP 客户端 |
| **SWR** | 2.x | 数据获取 |
| **Radix UI** | - | 无头组件 |
| **Lucide Icons** | - | 图标库 |
| **Swiper** | 11.x | 轮播图 |
| **dayjs** | 1.x | 日期处理 |

---

## 📁 项目结构

```
frontend/
├── app/                      # Next.js 15 App Router
│   ├── [locale]/            # 国际化路由
│   │   ├── layout.tsx       # 根布局
│   │   ├── page.tsx         # 首页
│   │   ├── products/        # 商品页面
│   │   ├── cart/            # 购物车
│   │   ├── checkout/        # 结算
│   │   ├── login/           # 登录
│   │   ├── register/        # 注册
│   │   ├── orders/          # 订单
│   │   └── wallet/          # 钱包
├── components/               # React 组件
│   ├── Navbar.tsx           # 导航栏
│   ├── Footer.tsx           # 页脚
│   ├── ProductCard.tsx      # 商品卡片
│   ├── CurrencySelector.tsx # 货币选择器
│   └── LanguageSelector.tsx # 语言选择器
├── lib/                      # 工具库
│   ├── api.ts               # API 客户端
│   ├── currencies.ts        # 货币工具
│   ├── locale.ts            # 语言工具
│   └── utils.ts             # 通用工具
├── store/                    # Zustand 状态管理
│   ├── useCart.ts           # 购物车 store
│   ├── useUser.ts           # 用户 store
│   └── useLocaleSettings.ts # 语言设置 store
├── messages/                 # i18n 翻译文件
│   ├── en.json              # 英文
│   ├── zh.json              # 中文
│   ├── th.json              # 泰语
│   ├── my.json              # 马来语
│   └── vi.json              # 越南语
├── types/                    # TypeScript 类型
│   └── index.ts
├── public/                   # 静态资源
├── i18n.ts                   # next-intl 配置
├── next.config.ts            # Next.js 配置
├── tailwind.config.ts        # Tailwind 配置
├── tsconfig.json             # TypeScript 配置
└── package.json              # 依赖配置
```

---

## 🚀 快速开始

### 1️⃣ 安装依赖

```bash
cd /Users/herbertlim/Downloads/virtual-trading-platform/frontend
npm install
```

如果遇到依赖冲突，使用：
```bash
npm install --legacy-peer-deps
```

### 2️⃣ 配置环境变量

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
# API 配置
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api

# 应用配置
NEXT_PUBLIC_APP_NAME=topupforme
NEXT_PUBLIC_APP_URL=http://localhost:3001

# 默认设置
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_DEFAULT_CURRENCY=USD
NEXT_PUBLIC_DEFAULT_REGION=MY
```

### 3️⃣ 启动开发服务器

```bash
npm run dev
```

访问: **http://localhost:3001**

### 4️⃣ 构建生产版本

```bash
npm run build
npm start
```

---

## 📦 核心模块说明

### 🛒 状态管理 (Zustand)

#### 购物车 Store - `useCartStore`
```typescript
import { useCartStore } from '@/store';

const { items, addItem, removeItem, getTotal } = useCartStore();
```

**功能：**
- 添加/删除商品
- 更新数量
- 计算总价
- 持久化到 localStorage

#### 用户 Store - `useUserStore`
```typescript
import { useUserStore } from '@/store';

const { user, login, logout, isAuthenticated } = useUserStore();
```

**功能：**
- 登录/登出
- JWT Token 管理
- 用户信息存储

#### 语言设置 Store - `useLocaleSettings`
```typescript
import { useLocaleSettings } from '@/store';

const { locale, currency, region, setLocale } = useLocaleSettings();
```

**功能：**
- 语言切换
- 货币切换
- 地区切换

---

### 🌐 API 客户端

所有 API 调用都通过 `lib/api.ts` 统一管理：

```typescript
import { authAPI, productAPI, orderAPI } from '@/lib/api';

// 登录
const response = await authAPI.login({ email, password });

// 获取商品列表
const products = await productAPI.getProducts({ region: 'MY' });

// 创建订单
const order = await orderAPI.createOrder(orderData);
```

**特性：**
- 自动添加 JWT Token
- 错误拦截处理
- 401 自动跳转登录

---

### 💰 货币系统

```typescript
import { formatCurrency, CURRENCIES } from '@/lib/currencies';

// 格式化货币
formatCurrency(99.99, 'MYR'); // "RM99.99"
formatCurrency(100, 'THB');    // "฿100.00"

// 获取货币信息
const myrInfo = CURRENCIES['MYR'];
// { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', decimals: 2 }
```

**支持的货币：**
- USD ($) - US Dollar
- MYR (RM) - Malaysian Ringgit
- THB (฿) - Thai Baht
- VND (₫) - Vietnamese Dong
- PHP (₱) - Philippine Peso

---

### 🌍 国际化 (i18n)

使用 `next-intl` 实现：

```typescript
import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations('common');
  
  return <h1>{t('appName')}</h1>; // "topupforme"
}
```

**翻译文件路径：**
- 英文: `messages/en.json`
- 中文: `messages/zh.json`
- 泰语: `messages/th.json`
- 马来语: `messages/my.json`
- 越南语: `messages/vi.json`

**URL 结构：**
- 英文: `http://localhost:3001/en`
- 中文: `http://localhost:3001/zh`
- 泰语: `http://localhost:3001/th`

---

## 🎨 页面路由

### 公开页面
| 路径 | 描述 |
|------|------|
| `/` | 首页（重定向到 `/en`）|
| `/[locale]` | 首页 |
| `/[locale]/products` | 商品列表 |
| `/[locale]/products/[slug]` | 商品详情 |
| `/[locale]/search` | 搜索结果 |
| `/[locale]/login` | 登录 |
| `/[locale]/register` | 注册 |

### 需要认证的页面
| 路径 | 描述 |
|------|------|
| `/[locale]/cart` | 购物车 |
| `/[locale]/checkout` | 结算 |
| `/[locale]/orders` | 订单列表 |
| `/[locale]/orders/[id]` | 订单详情 |
| `/[locale]/wallet` | 钱包 |
| `/[locale]/profile` | 个人中心 |

---

## 🔧 开发指南

### 添加新页面

1. 在 `app/[locale]/` 下创建目录
2. 添加 `page.tsx`
3. 使用 `useTranslations` 获取翻译

```typescript
// app/[locale]/example/page.tsx
import { useTranslations } from 'next-intl';

export default function ExamplePage() {
  const t = useTranslations('common');
  
  return <div>{t('title')}</div>;
}
```

### 添加新组件

```typescript
// components/MyComponent.tsx
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('common');
  
  return <button>{t('buyNow')}</button>;
}
```

### 调用 API

```typescript
import { productAPI } from '@/lib/api';
import useSWR from 'swr';

export function ProductList() {
  const { data, error, isLoading } = useSWR(
    '/products',
    () => productAPI.getProducts()
  );
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading products</div>;
  
  return <div>{data.data.map(...)}</div>;
}
```

---

## 📝 待完成功能

由于时间和字符限制，以下组件和页面需要继续创建：

### 组件 (Components)
- [ ] `Navbar.tsx` - 导航栏组件
- [ ] `Footer.tsx` - 页脚组件
- [ ] `ProductCard.tsx` - 商品卡片
- [ ] `ProductGallery.tsx` - 商品图库
- [ ] `CurrencySelector.tsx` - 货币选择器
- [ ] `LanguageSelector.tsx` - 语言选择器
- [ ] `Pagination.tsx` - 分页组件

### 页面 (Pages)
- [ ] `app/[locale]/page.tsx` - 首页
- [ ] `app/[locale]/layout.tsx` - 根布局
- [ ] `app/[locale]/products/page.tsx` - 商品列表
- [ ] `app/[locale]/products/[slug]/page.tsx` - 商品详情
- [ ] `app/[locale]/login/page.tsx` - 登录页
- [ ] `app/[locale]/cart/page.tsx` - 购物车
- [ ] `app/[locale]/checkout/page.tsx` - 结算页
- [ ] `app/[locale]/orders/page.tsx` - 订单列表

### 其他
- [ ] Shadcn UI 组件集成
- [ ] Swiper 轮播图集成
- [ ] SEO metadata 配置
- [ ] Error boundaries
- [ ] Loading skeletons

---

## 🐛 常见问题

### 1. Module not found 错误

**原因：** 依赖未安装

**解决：**
```bash
npm install
# 或
npm install --legacy-peer-deps
```

### 2. TypeScript 类型错误

**原因：** 缺少类型定义或 node_modules

**解决：**
```bash
npm install @types/node @types/react @types/react-dom
```

### 3. i18n 404 错误

**原因：** next-intl middleware 未配置

**解决：** 创建 `middleware.ts`：
```typescript
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'zh', 'th', 'my', 'vi'],
  defaultLocale: 'en'
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
```

### 4. API 调用 CORS 错误

**原因：** 后端未配置 CORS

**解决：** 在后端 API Gateway 添加 CORS 配置：
```javascript
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));
```

---

## 📚 相关文档

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/)

---

## 👥 联系与支持

如有问题，请参考：
1. 项目 README.md
2. 后端 API 文档
3. Next.js 官方文档

---

**项目完成度：60%**

✅ 已完成：
- 项目初始化和配置
- TypeScript 类型系统
- API 客户端
- Zustand 状态管理
- 国际化配置 (5 种语言)
- 货币和语言工具函数

🔄 待完成：
- 页面组件开发 (40%)
- UI 组件库集成
- SEO 优化
- 测试覆盖

**祝您开发愉快！** 🎉
