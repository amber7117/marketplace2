# 🚀 topupforme 风格前端商城 - 安装指南

## 项目完成度: 75%

已完成：
- ✅ Next.js 15 项目结构 (App Router)
- ✅ TypeScript 类型定义 (15+ 接口)
- ✅ Zustand 状态管理 (Cart, User, Locale)
- ✅ 国际化支持 (5 种语言：EN/ZH/TH/MY/VI)
- ✅ 货币系统 (5 种货币：USD/MYR/THB/VND/PHP)
- ✅ 核心组件 (Navbar, Footer, ProductCard, Pagination)
- ✅ 布局系统 (RootLayout with middleware)
- ✅ 首页 (轮播图、特色商品、Why Choose Us)
- ✅ 商品列表页 (搜索、分页)
- ✅ 登录页
- ✅ 购物车页

待完成 (25%):
- 🔄 商品详情页
- 🔄 注册页
- 🔄 结算页
- 🔄 订单页
- 🔄 钱包页
- 🔄 用户资料页

## 📦 安装步骤

### 1. 安装依赖
```bash
cd frontend
npm install
```

### 2. 配置环境变量
```bash
cp .env.example .env.local
```

编辑 `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_NAME=topupforme
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_DEFAULT_CURRENCY=USD
```

### 3. 启动开发服务器
```bash
npm run dev
```

访问: http://localhost:3001

## �� URL 结构

应用现在使用国际化路由：
- 英文: http://localhost:3001/en
- 中文: http://localhost:3001/zh  
- 泰文: http://localhost:3001/th
- 马来文: http://localhost:3001/my
- 越南文: http://localhost:3001/vi

所有页面都在 `/[locale]` 路径下：
- 首页: `/[locale]`
- 商品: `/[locale]/products`
- 购物车: `/[locale]/cart`
- 登录: `/[locale]/login`

## 🛠 已知问题

1. **TypeScript 错误**: 运行 `npm install` 后会自动解决
2. **API 连接**: 需要启动后端 API (port 3000)
3. **Product 类型**: 部分字段需要调整 (image vs images)

## 📝 下一步开发建议

### 优先级 1 - 商品详情页
```bash
创建: app/[locale]/products/[slug]/page.tsx
功能: 图片画廊、添加到购物车、产品描述、相关产品
```

### 优先级 2 - 注册页
```bash
创建: app/[locale]/register/page.tsx
功能: 注册表单、邮箱验证、密码强度检查
```

### 优先级 3 - 结算页
```bash
创建: app/[locale]/checkout/page.tsx
功能: 支付方式选择、订单确认、地址信息
```

## 🎨 UI 组件库

已集成 Shadcn UI 组件:
- Button
- Card  
- Input
- DropdownMenu

需要添加更多组件时:
```bash
npx shadcn-ui@latest add <component-name>
```

## 🔧 开发命令

```bash
npm run dev      # 开发模式
npm run build    # 构建生产版本
npm run start    # 运行生产版本
npm run lint     # 检查代码
```

## 📚 技术栈

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS 3.4
- **State**: Zustand 4.4
- **i18n**: next-intl 3.19
- **UI**: Radix UI + Shadcn
- **Icons**: Lucide React
- **HTTP**: Axios 1.6
- **Carousel**: Swiper 11.0

## 🎉 项目亮点

1. **完整的国际化**: 5 种语言，150+ 翻译键值
2. **多货币支持**: 实时货币转换和格式化
3. **类型安全**: 严格的 TypeScript 类型定义
4. **状态持久化**: Zustand persist 中间件
5. **响应式设计**: 移动端优先的 UI
6. **SEO 优化**: Next.js App Router SSR/ISR

继续开发时，请参考 README.md 获取完整的 API 使用示例和最佳实践！
