---
name: "auth-manager"
description: "管理用户认证和授权，包括 better-auth 配置、会话管理和权限控制。Invoke when user asks about authentication, authorization, login, or user management."
---

# 认证管理器

## 功能说明

这个技能帮助你管理用户认证和授权，包括：

1. **Better-Auth 配置** - 配置邮箱密码、第三方登录
2. **会话管理** - 管理用户会话
3. **权限控制** - 实现受保护的路由和 API
4. **用户管理** - 创建、更新、删除用户

## 使用场景

当用户提出以下需求时调用此技能：
- 配置用户登录/注册
- 添加第三方登录（GitHub、Google 等）
- 实现受保护的 API
- 管理会话和权限

## Better-Auth 配置

### 基础配置

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
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: env.BETTER_AUTH_GITHUB_CLIENT_ID,
      clientSecret: env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
      redirectURI: "http://localhost:3000/api/auth/callback/github",
    },
  },
});

export type Session = typeof auth.$Infer.Session;
```

### 环境变量

```env
# .env
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_GITHUB_CLIENT_ID=your-github-client-id
BETTER_AUTH_GITHUB_CLIENT_SECRET=your-github-client-secret
DATABASE_URL=your-database-url
```

## API 路由配置

### 认证路由

```typescript
// src/app/api/auth/[...all]/route.ts
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/server/better-auth";

export const { GET, POST } = toNextJsHandler(auth.handler);
```

### tRPC 路由集成

```typescript
// src/server/api/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@/server/better-auth";

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

export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });
```

## 会话管理

### 获取会话

```typescript
// Server Component
import { getSession } from "@/server/better-auth/server";

export default async function Page() {
  const session = await getSession();
  
  if (session) {
    console.log(session.user);
  }
}
```

### 获取用户信息

```typescript
// Server Component
import { auth } from "@/server/better-auth";
import { headers } from "next/headers";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (session) {
    const user = session.user;
  }
}
```

## 登录/注册表单

### 注册表单

```typescript
// src/app/user/sign-in/page.tsx
"use client";

import { useState } from "react";
import { api } from "@/trpc/react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  const mutation = api.user.signIn.useMutation({
    onSuccess: () => {
      alert("注册成功");
    },
    onError: (err) => {
      alert(err.message || "注册失败");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ email, password, name });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "注册中..." : "注册"}
      </button>
    </form>
  );
}
```

### 登录表单

```typescript
// 登录 API 调用
const signInMutation = api.user.signIn.useMutation();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  signInMutation.mutate({ email, password });
};
```

### 第三方登录

```typescript
// GitHub 登录
import { auth } from "@/server/better-auth";
import { redirect } from "next/navigation";

export default function Page() {
  return (
    <form>
      <button
        formAction={async () => {
          "use server";
          const res = await auth.api.signInSocial({
            body: {
              provider: "github",
              callbackURL: "/",
            },
          });
          if (!res.url) {
            throw new Error("No URL returned");
          }
          redirect(res.url);
        }}
      >
        使用 Github 登录
      </button>
    </form>
  );
}
```

### 退出登录

```typescript
import { auth } from "@/server/better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default function Page() {
  return (
    <form>
      <button
        formAction={async () => {
          "use server";
          await auth.api.signOut({
            headers: await headers(),
          });
          redirect("/");
        }}
      >
        退出登录
      </button>
    </form>
  );
}
```

## 受保护的 API

### 使用 protectedProcedure

```typescript
// src/server/api/routers/post.ts
export const postRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.create({
        data: {
          name: input.name,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
      where: { createdBy: { id: ctx.session.user.id } },
    });
    return post ?? null;
  }),
});
```

### 前端调用

```typescript
// Client Component
import { api } from "@/trpc/react";

export function MyComponent() {
  const createPost = api.post.create.useMutation();
  
  const handleSubmit = () => {
    createPost.mutate({ name: "test" });
  };
  
  return (
    <button onClick={handleSubmit}>
      创建帖子
    </button>
  );
}
```

## 权限控制

### 基础权限检查

```typescript
// Server Component
import { auth } from "@/server/better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session) {
    redirect("/sign-in");
  }
  
  return <div>受保护的内容</div>;
}
```

### 用户特定数据

```typescript
// Server Component
export default async function UserProfile() {
  const session = await getSession();
  
  if (!session) {
    redirect("/sign-in");
  }
  
  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });
  
  return <div>{user?.name}</div>;
}
```

## 常见模式

### 1. 登录状态检查

```typescript
// Server Component
export default async function Page() {
  const session = await getSession();
  
  if (!session) {
    return <div>请先登录</div>;
  }
  
  return <div>欢迎回来，{session.user.name}</div>;
}
```

### 2. 受保护的 API 路由

```typescript
// src/app/api/posts/route.ts
import { auth } from "@/server/better-auth";
import { headers } from "next/headers";
import { db } from "@/server/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const data = await req.json();
  
  const post = await db.post.create({
    data: {
      ...data,
      createdBy: session.user.id,
    },
  });
  
  return NextResponse.json(post);
}
```

### 3. 会话感知组件

```typescript
// Client Component
import { api } from "@/trpc/react";
import { getSession } from "@/server/better-auth/server";

export async function ServerComponent() {
  const session = await getSession();
  
  return (
    <ClientComponent session={session} />
  );
}

function ClientComponent({ session }: { session: any }) {
  const { data } = api.post.getLatest.useSuspenseQuery();
  
  return (
    <div>
      {session ? (
        <p>已登录: {session.user.name}</p>
      ) : (
        <p>未登录</p>
      )}
      <p>最新帖子: {data?.name}</p>
    </div>
  );
}
```

## 最佳实践

### 1. 安全性

- 使用 HTTPS
- 设置正确的 session 过期时间
- 验证所有用户输入
- 防止 CSRF 攻击

### 2. 会话管理

```typescript
// 配置会话过期
export const auth = betterAuth({
  // ...
  session: {
    expiresIn: 30 * 24 * 60 * 60, // 30 天
  },
});
```

### 3. 错误处理

```typescript
const signInMutation = api.user.signIn.useMutation({
  onError: (error) => {
    if (error.code === "UNAUTHORIZED") {
      setError("邮箱或密码错误");
    } else {
      setError("登录失败，请重试");
    }
  },
});
```

### 4. 用户体验

```typescript
// 加载状态
<button disabled={isPending}>
  {isPending ? "登录中..." : "登录"}
</button>

// 成功反馈
onSuccess: () => {
  alert("登录成功");
  router.push("/dashboard");
}
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm db:generate` | 生成 Prisma Client |
| `pnpm db:push` | 推送 schema 到数据库 |
| `pnpm db:studio` | 启动 Prisma Studio |

## 注意事项

1. **不要在客户端存储敏感信息**
2. **使用 HTTPS 传输**
3. **设置合理的 session 过期时间**
4. **验证所有用户输入**
5. **定期更新依赖**

## 相关技能

- [Prisma Manager](skill://prisma-manager) - 数据库管理
- [tRPC Router](skill://trpc-router) - API 路由
- [Next.js Component](skill://nextjs-component) - 组件开发
