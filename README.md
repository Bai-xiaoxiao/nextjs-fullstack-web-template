# 项目说明文档

## 技术栈

这是一个基于 **T3 Stack** 的全栈 Web 应用项目，主要使用以下技术：

### 前端
- **Next.js 15** - React 框架（App Router）
- **React 19** - UI 库
- **Tailwind CSS 4** - CSS 框架
- **TypeScript 5** - 类型安全

### 后端
- **tRPC** - 端到端类型安全的 API
- **Better Auth** - 身份认证（支持邮箱+密码、GitHub OAuth）
- **Prisma** - ORM 数据库工具

### 数据库
- **SQLite** - 本地数据库（可通过环境变量切换）

## 项目结构

```
nextjs-fullstack-web-template/
├── prisma/                 # Prisma 配置
│   └── schema.prisma      # 数据库 schema
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/          # API 路由
│   │   │   ├── auth/     # Better Auth 路由
│   │   │   └── trpc/     # tRPC 路由
│   │   ├── layout.tsx    # 根布局
│   │   └── page.tsx      # 首页
│   ├── server/           # 服务端代码
│   │   ├── api/         # tRPC API
│   │   │   ├── routers/ # 路由器
│   │   │   ├── root.ts  # 根路由
│   │   │   └── trpc.ts  # tRPC 配置
│   │   ├── better-auth/ # Better Auth 配置
│   │   └── db.ts        # Prisma 客户端
│   ├── trpc/            # tRPC 客户端
│   └── env.js           # 环境变量验证
├── .env                 # 环境变量（已忽略）
├── package.json
└── tsconfig.json
```

## 功能特性

### 已实现
- ✅ 用户认证（Better Auth）
  - 邮箱+密码登录
  - GitHub OAuth 登录
- ✅ 数据库模型（Prisma）
  - User（用户）
  - Session（会话）
  - Account（第三方账户）
  - Post（帖子）
- ✅ tRPC API
  - publicProcedure（公开接口）
  - protectedProcedure（认证保护接口）
- ✅ 类型安全
  - TypeScript 全栈类型推导
  - 环境变量验证（Zod）

## 环境变量

在项目根目录创建 `.env` 文件，配置以下变量：

```env
# Better Auth
BETTER_AUTH_SECRET="your-secret-key"           # 认证密钥（32字节base64）
BETTER_AUTH_GITHUB_CLIENT_ID=""                # GitHub OAuth Client ID
BETTER_AUTH_GITHUB_CLIENT_SECRET=""            # GitHub OAuth Client Secret

# 数据库
DATABASE_URL="file:./db.sqlite"                # SQLite 数据库路径
```

## 开发命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 类型检查
pnpm typecheck
pnpm check          # 类型检查 + ESLint

# 代码格式化
pnpm format:check   # 检查格式
pnpm format:write   # 自动格式化

# ESLint
pnpm lint
pnpm lint:fix

# 数据库迁移
pnpm db:generate    # 生成迁移文件
pnpm db:migrate     # 执行迁移
pnpm db:push        # 推送 schema 到数据库
pnpm db:studio      # 启动 Prisma Studio
```

## 数据库模型

### User（用户）
- id: String (主键)
- name: String
- email: String (唯一)
- emailVerified: Boolean
- image?: String
- createdAt: DateTime
- updatedAt: DateTime

### Session（会话）
- id: String (主键)
- token: String (唯一)
- userId: String (外键)
- expiresAt: DateTime
- ipAddress?: String
- userAgent?: String
- createdAt: DateTime
- updatedAt: DateTime

### Account（第三方账户）
- id: String (主键)
- accountId: String
- providerId: String
- userId: String (外键)
- accessToken?: String
- refreshToken?: String
- idToken?: String
- createdAt: DateTime
- updatedAt: DateTime

### Post（帖子）
- id: String (主键)
- name: String
- createdById: String (外键)
- createdAt: DateTime
- updatedAt: DateTime

## 认证流程

1. **邮箱登录**: 使用 `auth.api.signInEmail` API
2. **GitHub OAuth**: 访问 `/api/auth/callback/github` 重定向到 GitHub 授权
3. **会话管理**: 通过 `getSession()` 获取当前会话
4. **保护路由**: 使用 `protectedProcedure` 确保用户已认证

## 部署

参考 [T3 Stack 部署指南](https://create.t3.gg/en/deployment)

主要平台：
- Vercel
- Netlify
- Docker

## 学习资源

- [T3 Stack 官方文档](https://create.t3.gg/)
- [Next.js 文档](https://nextjs.org/docs)
- [Better Auth 文档](https://better-auth.com/docs)
- [Prisma 文档](https://www.prisma.io/docs)
- [tRPC 文档](https://trpc.io/docs)
