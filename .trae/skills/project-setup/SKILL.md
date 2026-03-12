---
name: "project-setup"
description: "配置项目环境、依赖和开发工具。Invoke when user asks about project setup, dependencies, environment variables, or development environment configuration."
---

# 项目配置管理器

## 功能说明

这个技能帮助你配置项目环境，包括：

1. **环境变量** - 配置和验证环境变量
2. **依赖管理** - 安装和管理项目依赖
3. **开发环境** - 配置开发服务器
4. **构建配置** - 配置构建和部署

## 使用场景

当用户提出以下需求时调用此技能：
- 项目初始化
- 环境变量配置
- 依赖安装
- 开发环境配置

## 环境变量配置

### 环境变量架构

```typescript
// src/env.js
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  // 服务器端环境变量
  server: {
    BETTER_AUTH_SECRET: process.env.NODE_ENV === "production" 
      ? z.string() 
      : z.string().optional(),
    BETTER_AUTH_GITHUB_CLIENT_ID: z.string(),
    BETTER_AUTH_GITHUB_CLIENT_SECRET: z.string(),
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },
  
  // 客户端环境变量（需要 NEXT_PUBLIC_ 前缀）
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },
  
  // 运行时环境变量
  runtimeEnv: {
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_GITHUB_CLIENT_ID: process.env.BETTER_AUTH_GITHUB_CLIENT_ID,
    BETTER_AUTH_GITHUB_CLIENT_SECRET: process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
  },
  
  // 跳过验证（Docker 等场景）
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  
  // 空字符串视为 undefined
  emptyStringAsUndefined: true,
});
```

### .env 文件

```env
# .env.local (不要提交到 git)
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_GITHUB_CLIENT_ID=your-github-client-id
BETTER_AUTH_GITHUB_CLIENT_SECRET=your-github-client-secret
DATABASE_URL=file:./dev.db
NODE_ENV=development
```

## 依赖管理

### 常用命令

```bash
# 安装依赖
pnpm install

# 添加依赖
pnpm add <package-name>

# 添加开发依赖
pnpm add -D <package-name>

# 删除依赖
pnpm remove <package-name>

# 更新依赖
pnpm update <package-name>

# 更新所有依赖
pnpm update
```

### 项目依赖结构

```json
{
  "dependencies": {
    "@auth/prisma-adapter": "^2.7.2",
    "@prisma/client": "^6.6.0",
    "@t3-oss/env-nextjs": "^0.12.0",
    "@tanstack/react-query": "^5.69.0",
    "@trpc/client": "^11.0.0",
    "@trpc/react-query": "^11.0.0",
    "@trpc/server": "^11.0.0",
    "better-auth": "^1.3",
    "next": "^15.2.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "server-only": "^0.0.1",
    "superjson": "^2.2.1",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3.3.1",
    "@tailwindcss/postcss": "^4.0.15",
    "@types/node": "^20.14.10",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "eslint": "^9.23.0",
    "eslint-config-next": "^15.2.3",
    "postcss": "^8.5.3",
    "prettier": "^3.5.3",
    "prettier-plugin-tailwindcss": "^0.6.11",
    "prisma": "^6.6.0",
    "tailwindcss": "^4.0.15",
    "typescript": "^5.8.2",
    "typescript-eslint": "^8.27.0"
  }
}
```

## 开发环境

### 启动开发服务器

```bash
pnpm dev
```

### 构建项目

```bash
pnpm build
```

### 启动生产服务器

```bash
pnpm start
```

### 类型检查

```bash
pnpm check
pnpm typecheck
```

### 代码检查

```bash
pnpm lint
pnpm lint:fix
```

### 代码格式化

```bash
pnpm format:check
pnpm format:write
```

## Prisma 命令

```bash
# 生成 Prisma Client
pnpm db:generate

# 推送 schema 到数据库
pnpm db:push

# 执行迁移
pnpm db:migrate dev

# 启动 Prisma Studio
pnpm db:studio

# 重置数据库
pnpm db:reset
```

## 构建配置

### Next.js 配置

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 配置选项
  reactStrictMode: true,
  images: {
    domains: ['example.com'],
  },
};

export default nextConfig;
```

### Prettier 配置

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### ESLint 配置

```json
// .eslintrc.json
{
  "extends": "next/core-web-vitals"
}
```

## Docker 配置

### Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/app
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=app
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 环境变量验证

### 开发环境

```bash
# .env.local (本地开发)
BETTER_AUTH_SECRET=dev-secret
DATABASE_URL=file:./dev.db
NODE_ENV=development
```

### 测试环境

```bash
# .env.test (测试)
BETTER_AUTH_SECRET=test-secret
DATABASE_URL=file:./test.db
NODE_ENV=test
```

### 生产环境

```bash
# .env.production (生产)
BETTER_AUTH_SECRET=production-secret
DATABASE_URL=postgresql://user:password@host:5432/db
NODE_ENV=production
```

## 项目结构

```
d:\个人项目\nextjs-fullstack-web-template\
├── .env.local              # 本地环境变量（不提交）
├── .env.example            # 环境变量示例
├── .gitignore            # Git 忽略文件
├── package.json          # 依赖配置
├── next.config.js        # Next.js 配置
├── tsconfig.json         # TypeScript 配置
├── prisma/
│   ├── schema.prisma     # Prisma schema
│   └── migrations/       # 迁移文件
├── src/
│   ├── app/              # App Router 页面
│   ├── server/           # 服务端代码
│   ├── trpc/             # tRPC 代码
│   └── styles/           # 样式文件
└── public/               # 静态资源
```

## 最佳实践

### 1. 环境变量

- 使用 `.env.local` 存储敏感信息
- 不要将 `.env.local` 提交到 git
- 使用 `.env.example` 作为模板
- 在代码中验证环境变量

### 2. 依赖管理

- 使用 `pnpm install` 而不是 `pnpm add` 安装依赖
- 定期更新依赖
- 使用 `pnpm-lock.yaml` 锁定版本

### 3. 开发环境

- 使用 `pnpm dev` 启动开发服务器
- 使用 `pnpm check` 进行类型检查
- 使用 `pnpm lint:fix` 自动修复代码

### 4. 生产环境

- 使用 `pnpm build` 构建
- 使用 `pnpm start` 启动生产服务器
- 设置 `NODE_ENV=production`

## 常见问题

### 1. 环境变量未加载

```bash
# 确保文件名正确
.env.local  # ✅
.env        # ⚠️ 所有环境都会加载

# 重启开发服务器
pnpm dev
```

### 2. 依赖安装失败

```bash
# 清理缓存
pnpm store prune
rm -rf node_modules pnpm-lock.yaml

# 重新安装
pnpm install
```

### 3. 类型错误

```bash
# 运行类型检查
pnpm check

# 清理缓存
rm -rf .next
pnpm dev
```

## 项目初始化

### 新项目设置

```bash
# 1. 克隆项目
git clone <repo-url>
cd <project-name>

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local

# 4. 生成 Prisma Client
pnpm db:generate

# 5. 推送数据库
pnpm db:push

# 6. 启动开发服务器
pnpm dev
```

## 相关技能

- [Prisma Manager](skill://prisma-manager) - 数据库管理
- [Auth Manager](skill://auth-manager) - 认证管理
- [Code Reviewer](skill://code-reviewer) - 代码审查
