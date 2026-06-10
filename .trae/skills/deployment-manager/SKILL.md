---
name: "deployment-manager"
description: "管理项目部署流程，包括构建优化、环境变量配置和部署策略。Invoke when user asks about deployment, production setup, or hosting configuration."
---

# 部署管理器

## 功能说明

这个技能帮助你管理项目的部署流程，包括：

1. **构建优化** - 优化生产构建配置
2. **环境变量** - 配置生产环境变量
3. **部署策略** - 选择合适的部署平台
4. **性能监控** - 配置性能监控和分析

## 使用场景

当用户提出以下需求时调用此技能：
- 部署到生产环境
- 优化构建配置
- 配置环境变量
- 设置性能监控

## 构建配置

### Next.js 构建优化

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用静态页面优化
  experimental: {
    optimizePackageImports: ["antd", "@ant-design/icons"],
  },
  
  // 图片优化
  images: {
    domains: ['example.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // 压缩优化
  compress: true,
  
  // 启用 React Strict Mode
  reactStrictMode: true,
  
  // 自定义 Webpack 配置
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;
```

### 环境变量配置

```env
# .env.production
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/dbname
BETTER_AUTH_SECRET=your-production-secret
BETTER_AUTH_GITHUB_CLIENT_ID=your-github-client-id
BETTER_AUTH_GITHUB_CLIENT_SECRET=your-github-client-secret
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 部署平台配置

### Vercel 部署

#### vercel.json 配置

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

#### 环境变量设置

在 Vercel 控制面板中设置：
- `DATABASE_URL` - 生产数据库连接
- `BETTER_AUTH_SECRET` - 认证密钥
- `BETTER_AUTH_GITHUB_CLIENT_ID` - GitHub OAuth ID
- `BETTER_AUTH_GITHUB_CLIENT_SECRET` - GitHub OAuth Secret

### Docker 部署

#### Dockerfile

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

# Generate Prisma Client
RUN pnpm db:generate

# Build application
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
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/generated ./generated

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/app
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
      - BETTER_AUTH_GITHUB_CLIENT_ID=${BETTER_AUTH_GITHUB_CLIENT_ID}
      - BETTER_AUTH_GITHUB_CLIENT_SECRET=${BETTER_AUTH_GITHUB_CLIENT_SECRET}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=app
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  postgres_data:
```

### Railway 部署

#### railway.toml

```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "pnpm start"
healthcheckPath = "/"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

## 性能优化

### 代码分割

```typescript
// 动态导入组件
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false,
});

export default function Page() {
  return <HeavyComponent />;
}
```

### 图片优化

```typescript
import Image from 'next/image';

// 优化图片加载
<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority
  quality={75}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
/>
```

### 字体优化

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

## 监控和分析

### 错误监控

```typescript
// lib/error-monitoring.ts
import * as Sentry from '@sentry/nextjs';

export function initErrorMonitoring() {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 1.0,
    });
  }
}

// 在应用中捕获错误
try {
  // 可能出错的代码
} catch (error) {
  Sentry.captureException(error);
}
```

### 性能监控

```typescript
// lib/performance-monitoring.ts
export function reportWebVitals(metric: any) {
  if (process.env.NODE_ENV === 'production') {
    // 发送性能数据到分析服务
    fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        id: metric.id,
      }),
    });
  }
}
```

## 安全配置

### 安全头信息

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // 安全头信息
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  );
  
  return response;
}

export const config = {
  matcher: '/:path*',
};
```

### 环境变量验证

```typescript
// src/env.js
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_GITHUB_CLIENT_ID: z.string(),
    BETTER_AUTH_GITHUB_CLIENT_SECRET: z.string(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_GITHUB_CLIENT_ID: process.env.BETTER_AUTH_GITHUB_CLIENT_ID,
    BETTER_AUTH_GITHUB_CLIENT_SECRET: process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
```

## 部署检查清单

### 部署前检查

- [ ] 所有环境变量已正确配置
- [ ] 数据库迁移已应用
- [ ] 构建成功无错误
- [ ] 类型检查通过
- [ ] 代码格式化完成
- [ ] 安全头信息已配置
- [ ] 错误监控已设置
- [ ] 性能监控已配置

### 部署后验证

- [ ] 网站可以正常访问
- [ ] 所有功能正常工作
- [ ] 数据库连接正常
- [ ] 认证系统工作正常
- [ ] API 端点响应正常
- [ ] 静态资源加载正常
- [ ] 移动端适配正常

## 常用命令

### 构建和启动

```bash
# 生产构建
pnpm build

# 启动生产服务器
pnpm start

# 预览构建结果
pnpm preview
```

### 数据库操作

```bash
# 生成 Prisma Client
pnpm db:generate

# 应用生产迁移
pnpm db:migrate deploy

# 推送 schema（开发环境）
pnpm db:push
```

### 代码质量

```bash
# 类型检查
pnpm typecheck

# 代码检查
pnpm lint

# 代码格式化
pnpm format:write
```

## 故障排除

### 常见问题

#### 1. 构建失败

```bash
# 清理缓存
rm -rf .next
rm -rf node_modules
pnpm install
pnpm build
```

#### 2. 环境变量未加载

```bash
# 检查环境变量文件
ls -la .env*

# 重启应用
pnpm start
```

#### 3. 数据库连接失败

```bash
# 测试数据库连接
pnpm db:studio

# 检查迁移状态
pnpm db:migrate status
```

#### 4. 内存不足

```dockerfile
# Dockerfile 中增加内存限制
ENV NODE_OPTIONS="--max-old-space-size=4096"
```

## 最佳实践

### 1. 环境隔离

- 开发环境：本地开发
- 测试环境：自动化测试
- 预生产环境：最终测试
- 生产环境：正式服务

### 2. 持续集成

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Type check
        run: pnpm typecheck
        
      - name: Lint
        run: pnpm lint
        
      - name: Build
        run: pnpm build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### 3. 备份策略

- 定期备份数据库
- 版本控制配置文件
- 文档化部署流程
- 监控告警设置

## 相关技能

- [Project Setup](skill://project-setup) - 项目配置
- [Database Migrator](skill://database-migrator) - 数据库管理
- [Auth Manager](skill://auth-manager) - 认证管理
