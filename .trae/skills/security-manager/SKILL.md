---
name: "security-manager"
description: "管理应用安全，包括认证授权、数据验证、安全防护和漏洞预防。Invoke when user asks about security, authentication, authorization, or vulnerability prevention."
---

# 安全管理器

## 功能说明

这个技能帮助你管理应用安全，包括：

1. **认证授权** - 实现安全的用户认证和权限控制
2. **数据验证** - 确保输入数据的安全性和有效性
3. **安全防护** - 防止常见安全攻击
4. **漏洞预防** - 识别和修复安全漏洞

## 使用场景

当用户提出以下需求时调用此技能：
- 实现用户认证
- 配置权限控制
- 防止安全攻击
- 审计安全漏洞

## 认证安全

### Better-Auth 安全配置

```typescript
// src/server/better-auth/config.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { env } from "@/env";
import { db } from "@/server/db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "sqlite",
  }),
  
  // 密码安全配置
  emailAndPassword: {
    enabled: true,
    autoLogin: false,
    requireEmailVerification: true, // 要求邮箱验证
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  
  // 会话安全
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7天
    updateAge: 60 * 60 * 24, // 每天更新
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5分钟
    },
  },
  
  // 速率限制
  rateLimit: {
    enabled: true,
    window: 15 * 60, // 15分钟
    max: 100, // 最大请求数
  },
  
  // 社交登录安全
  socialProviders: {
    github: {
      clientId: env.BETTER_AUTH_GITHUB_CLIENT_ID,
      clientSecret: env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
      redirectURI: "http://localhost:3000/api/auth/callback/github",
    },
  },
});
```

### 环境变量安全

```typescript
// src/env.js
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // 敏感信息必须设置
    BETTER_AUTH_SECRET: process.env.NODE_ENV === "production" 
      ? z.string().min(32) // 生产环境要求更长的密钥
      : z.string().optional(),
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },
  client: {
    // 客户端变量需要 NEXT_PUBLIC_ 前缀
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  runtimeEnv: {
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
```

## 授权控制

### tRPC 权限中间件

```typescript
// src/server/api/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@/server/better-auth";
import { db } from "@/server/db";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth.api.getSession({
    headers: opts.headers,
  });
  return {
    db,
    session,
    ...opts,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create();

// 管理员权限检查
const isAdminMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  
  // 这里可以添加角色检查逻辑
  // const user = await ctx.db.user.findUnique({
  //   where: { id: ctx.session.user.id },
  //   select: { role: true }
  // });
  // if (user?.role !== 'ADMIN') {
  //   throw new TRPCError({ code: "FORBIDDEN" });
  // }
  
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const adminProcedure = t.procedure.use(isAdminMiddleware);
```

### 资源级权限控制

```typescript
// src/server/api/routers/post.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "@/server/api/trpc";

export const postRouter = createTRPCRouter({
  // 只有作者可以编辑自己的帖子
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({
        where: { id: input.id },
      });
      
      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      
      // 检查是否为作者
      if (post.createdById !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      
      return ctx.db.post.update({
        where: { id: input.id },
        data: { name: input.name },
      });
    }),
    
  // 只有管理员可以删除帖子
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.delete({
        where: { id: input.id },
      });
    }),
});
```

## 输入验证

### Zod 验证模式

```typescript
import { z } from "zod";

// 基础验证
const userSchema = z.object({
  name: z.string()
    .min(1, "姓名不能为空")
    .max(50, "姓名不能超过50个字符")
    .regex(/^[a-zA-Z\u4e00-\u9fa5\s]+$/, "姓名只能包含中文、英文和空格"),
    
  email: z.string()
    .email("请输入有效的邮箱地址")
    .toLowerCase()
    .trim(),
    
  password: z.string()
    .min(8, "密码长度不能少于8位")
    .max(128, "密码长度不能超过128位")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "密码必须包含大小写字母和数字"),
    
  age: z.number()
    .int("年龄必须是整数")
    .min(1, "年龄必须大于0")
    .max(150, "年龄不能超过150"),
});

// 复杂对象验证
const postSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(10).max(50000),
  tags: z.array(z.string().max(20)).max(10),
  published: z.boolean().default(false),
  publishDate: z.date().optional(),
});

// 自定义验证
const phoneSchema = z.string().regex(/^1[3-9]\d{9}$/, "请输入有效的手机号");

// 联合类型验证
const statusSchema = z.enum(["draft", "published", "archived"]);
```

### API 输入验证

```typescript
// src/server/api/routers/user.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const userRouter = createTRPCRouter({
  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(50).optional(),
      email: z.string().email().optional(),
      image: z.string().url().optional(),
    }).refine(data => Object.keys(data).length > 0, {
      message: "至少需要提供一个要更新的字段",
    }))
    .mutation(async ({ ctx, input }) => {
      // 防止更新关键字段
      const { id, ...updateData } = input;
      
      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: updateData,
      });
    }),
});
```

## 安全防护

### XSS 防护

```typescript
// lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'title', 'target'],
    ALLOW_DATA_ATTR: false,
  });
}

// 在组件中使用
"use client";

import { sanitizeHtml } from '@/lib/sanitize';

export function SafeContent({ html }: { html: string }) {
  const sanitized = sanitizeHtml(html);
  
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

### CSRF 防护

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 检查 CSRF token
  if (request.method === 'POST') {
    const csrfToken = request.headers.get('x-csrf-token');
    const sessionToken = request.cookies.get('auth_session_token')?.value;
    
    if (!csrfToken || csrfToken !== sessionToken) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }
  }
  
  return NextResponse.next();
}
```

### SQL 注入防护

```typescript
// Prisma 自动防止 SQL 注入，但仍需注意
// ❌ 不安全的做法
const user = await db.$queryRaw`SELECT * FROM users WHERE name = ${ userInput }`;

// ✅ 安全的做法
const user = await db.user.findFirst({
  where: {
    name: userInput, // Prisma 会自动转义
  },
});
```

### 速率限制

```typescript
// lib/rate-limit.ts
import { LRUCache } from 'lru-cache';

const rateLimitCache = new LRUCache<string, number>({
  max: 1000,
  ttl: 15 * 60 * 1000, // 15分钟
});

export function rateLimit(key: string, maxRequests = 100, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const requests = rateLimitCache.get(key) || 0;
  
  if (requests >= maxRequests) {
    return false;
  }
  
  rateLimitCache.set(key, requests + 1);
  return true;
}

// 在 API 路由中使用
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  
  if (!rateLimit(ip, 10, 60 * 1000)) { // 每分钟最多10次
    return Response.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  // 处理请求...
}
```

## 数据安全

### 敏感数据脱敏

```typescript
// lib/data-sanitization.ts
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  
  const maskedLocal = local.length > 2 
    ? `${local[0]}***${local[local.length - 1]}`
    : '***';
    
  return `${maskedLocal}@${domain}`;
}

export function maskPhone(phone: string): string {
  if (phone.length !== 11) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(7)}`;
}

export function maskIdCard(idCard: string): string {
  if (idCard.length !== 18) return idCard;
  return `${idCard.slice(0, 6)}********${idCard.slice(14)}`;
}
```

### 数据加密

```typescript
// lib/encryption.ts
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';
const IV_LENGTH = 16;

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted.toString();
}
```

## 安全头信息

### Next.js 安全头配置

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
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://api.example.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  );
  
  return response;
}

export const config = {
  matcher: '/:path*',
};
```

## 漏洞扫描

### 依赖安全检查

```bash
# 检查已知漏洞
pnpm audit

# 自动修复安全漏洞
pnpm audit fix

# 生成安全报告
pnpm audit --json > security-report.json
```

### 自动化安全测试

```typescript
// __tests__/security.test.ts
import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from '@/lib/sanitize';

describe('安全测试', () => {
  it('应该防止 XSS 攻击', () => {
    const maliciousHtml = '<script>alert("XSS")</script>';
    const sanitized = sanitizeHtml(maliciousHtml);
    expect(sanitized).not.toContain('<script>');
  });
  
  it('应该验证邮箱格式', () => {
    const invalidEmail = 'invalid-email';
    const result = z.string().email().safeParse(invalidEmail);
    expect(result.success).toBe(false);
  });
});
```

## 安全最佳实践

### 1. 密码安全

```typescript
// Better-Auth 已经处理了密码哈希，但需要注意：
// - 强制要求强密码
// - 实施账户锁定策略
// - 定期提醒用户更改密码
```

### 2. 会话安全

```typescript
// 会话配置
session: {
  expiresIn: 60 * 60 * 24 * 7, // 7天过期
  updateAge: 60 * 60 * 24,     // 每天刷新
  cookieCache: {
    enabled: true,
    maxAge: 5 * 60,             // 5分钟缓存
  },
}
```

### 3. 错误处理

```typescript
// 不要泄露敏感信息
try {
  // 可能出错的操作
} catch (error) {
  if (process.env.NODE_ENV === 'development') {
    console.error('详细错误:', error);
  } else {
    console.error('发生错误');
  }
  
  // 返回通用错误信息
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: '服务器内部错误',
  });
}
```

### 4. 日志记录

```typescript
// lib/security-logger.ts
export function logSecurityEvent(event: string, details: any) {
  if (process.env.NODE_ENV === 'production') {
    // 发送到安全监控系统
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      event,
      details,
      ip: details.ip,
      userAgent: details.userAgent,
    }));
  }
}

// 使用示例
logSecurityEvent('LOGIN_ATTEMPT', {
  email: userInput.email,
  success: false,
  ip: request.ip,
  userAgent: request.headers['user-agent'],
});
```

## 安全审计清单

### 定期检查项目

- [ ] 依赖包安全更新
- [ ] 环境变量安全配置
- [ ] 认证授权逻辑审查
- [ ] 输入验证完整性
- [ ] 输出编码正确性
- [ ] 会话管理安全性
- [ ] 错误信息泄露检查
- [ ] 安全头信息配置
- [ ] 数据库访问权限
- [ ] API 端点权限控制

### 自动化安全检查

```yaml
# .github/workflows/security.yml
name: Security Check
on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run security audit
        run: pnpm audit --audit-level=high
        
      - name: Run SAST scan
        uses: github/codeql-action/init@v2
        with:
          languages: javascript
          
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2
```

## 相关技能

- [Auth Manager](skill://auth-manager) - 认证管理
- [Code Reviewer](skill://code-reviewer) - 代码审查
- [Deployment Manager](skill://deployment-manager) - 部署管理
