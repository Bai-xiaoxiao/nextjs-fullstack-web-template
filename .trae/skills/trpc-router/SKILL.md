---
name: "trpc-router"
description: "创建和管理 tRPC 路由器，包括 procedure 定义、输入验证和数据库操作。Invoke when user asks to create new API endpoints, modify existing routers, or add tRPC procedures."
---

# tRPC 路由器管理器

## 功能说明

这个技能帮助你创建和管理 tRPC 路由器，包括：

1. **Router 创建** - 创建新的路由器和子路由器
2. **Procedure 定义** - 定义查询（query）和变更（mutation）
3. **输入验证** - 使用 Zod 进行类型安全的输入验证
4. **权限控制** - 使用 publicProcedure 和 protectedProcedure

## 使用场景

当用户提出以下需求时调用此技能：
- 创建新的 API 端点
- 修改现有的路由器
- 添加新的 procedure
- 需要类型安全的 API 调用

## 项目结构规范

```
src/
├── server/
│   └── api/
│       ├── trpc.ts          # tRPC 配置和上下文
│       ├── root.ts          # 根路由器
│       └── routers/
│           ├── post.ts      # 帖子相关路由
│           └── user.ts      # 用户相关路由
```

## Procedure 类型

### publicProcedure（公共过程）

```typescript
publicProcedure
  .input(z.object({ text: z.string() }))
  .query(({ input }) => {
    return { greeting: `Hello ${input.text}` };
  })
```

**适用场景**：不需要认证的 API

### protectedProcedure（受保护过程）

```typescript
protectedProcedure
  .input(z.object({ name: z.string().min(1) }))
  .mutation(async ({ ctx, input }) => {
    return ctx.db.post.create({
      data: {
        name: input.name,
        createdBy: { connect: { id: ctx.session.user.id } },
      },
    });
  })
```

**适用场景**：需要用户认证的 API

## 输入验证规范

### 字符串验证

```typescript
z.object({
  text: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6),
})
```

### 可选字段

```typescript
z.object({
  name: z.string().optional(),
  description: z.string().nullable(),
})
```

### 数组验证

```typescript
z.object({
  ids: z.array(z.string()),
})
```

## 数据库操作规范

### 创建记录

```typescript
mutation(async ({ ctx, input }) => {
  return ctx.db.model.create({
    data: {
      field: input.value,
      relation: { connect: { id: ctx.session.user.id } },
    },
  });
})
```

### 查询记录

```typescript
query(async ({ ctx }) => {
  return ctx.db.model.findFirst({
    where: { userId: ctx.session.user.id },
    orderBy: { createdAt: "desc" },
  });
})
```

### 更新记录

```typescript
mutation(async ({ ctx, input }) => {
  return ctx.db.model.update({
    where: { id: input.id },
    data: { field: input.value },
  });
})
```

### 删除记录

```typescript
mutation(async ({ ctx, input }) => {
  return ctx.db.model.delete({
    where: { id: input.id },
  });
})
```

## 完整示例

```typescript
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const exampleRouter = createTRPCRouter({
  // 公共查询
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  // 受保护的创建
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.example.create({
        data: {
          name: input.name,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  // 受保护的查询
  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const item = await ctx.db.example.findFirst({
      orderBy: { createdAt: "desc" },
      where: { createdBy: { id: ctx.session.user.id } },
    });
    return item ?? null;
  }),
});
```

## 在根路由器中注册

```typescript
// src/server/api/root.ts
import { exampleRouter } from "@/server/api/routers/example";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

export const appRouter = createTRPCRouter({
  example: exampleRouter,
  // ... 其他路由器
});

export type AppRouter = typeof appRouter;
```

## 前端使用

```typescript
// Client Component
import { api } from "@/trpc/react";

export function MyComponent() {
  // 查询
  const { data, isLoading } = api.example.hello.useQuery({ text: "world" });
  
  // 变更
  const createMutation = api.example.create.useMutation();
  
  const handleSubmit = () => {
    createMutation.mutate({ name: "test" });
  };
  
  // 批量查询
  const utils = api.useUtils();
  const invalidate = () => utils.example.invalidate();
}
```

## 最佳实践

1. **输入验证**：始终使用 Zod 进行输入验证
2. **权限控制**：需要认证的 API 使用 `protectedProcedure`
3. **错误处理**：利用 tRPC 的类型安全错误处理
4. **数据过滤**：查询时始终过滤用户权限
5. **关系处理**：使用 Prisma 的关系功能
