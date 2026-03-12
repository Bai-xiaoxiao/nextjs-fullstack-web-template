---
name: "debugging"
description: "调试代码问题，包括控制台错误、网络请求和状态管理。Invoke when user reports errors, bugs, or needs help debugging code."
---

# 调试管理器

## 功能说明

这个技能帮助你调试代码问题，包括：

1. **错误分析** - 分析和解决错误
2. **网络请求** - 调试 API 请求
3. **状态管理** - 调试 React 状态
4. **性能问题** - 识别和解决性能问题

## 使用场景

当用户提出以下需求时调用此技能：
- 报告错误或 bug
- 调试代码问题
- 分析控制台错误
- 优化性能

## 常见错误类型

### 1. TypeScript 错误

```bash
# 运行类型检查
pnpm check

# 常见错误
- TS2304: Cannot find name 'xxx'
- TS2339: Property 'xxx' does not exist on type 'xxx'
- TS2532: Object is possibly 'undefined'
```

### 2. Next.js 错误

```bash
# 开发服务器错误
pnpm dev

# 构建错误
pnpm build

# 常见错误
- Error: Cannot find module 'xxx'
- Error: Invalid value for environment variable
```

### 3. Prisma 错误

```bash
# 数据库错误
pnpm db:push

# 常见错误
- PrismaClientKnownRequestError
- PrismaClientValidationError
- PrismaClientInitializationError
```

## 调试技巧

### 1. 控制台调试

```typescript
// 使用 console.log
console.log("变量值:", variable);

// 使用 console.error
console.error("错误信息:", error);

// 使用 console.table
console.table(arrayOfObjects);

// 使用 console.trace
console.trace("调用栈");
```

### 2. 错误边界

```typescript
// Client Component
"use client";

import { useState } from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h1>出错了</h1>;
    }

    return this.props.children;
  }
}
```

### 3. 错误处理

```typescript
// API 调用
try {
  const res = await fetch("/api/endpoint");
  const data = await res.json();
} catch (error) {
  console.error("请求失败:", error);
  setError(error.message);
}

// tRPC mutation
const mutation = api.endpoint.useMutation({
  onError: (error) => {
    console.error("Mutation 失败:", error);
    setError(error.message);
  },
});
```

## 网络请求调试

### 1. 浏览器开发者工具

```
1. 打开开发者工具 (F12)
2. 切换到 Network 标签
3. 刷新页面
4. 查看请求和响应
```

### 2. tRPC 调试

```typescript
// 启用 loggerLink
import { loggerLink } from "@trpc/client";

const client = api.createClient({
  links: [
    loggerLink({
      enabled: (op) =>
        process.env.NODE_ENV === "development" ||
        (op.direction === "down" && op.result instanceof Error),
    }),
    // ... 其他 links
  ],
});
```

### 3. Fetch 调试

```typescript
const res = await fetch("/api/endpoint");
console.log("Status:", res.status);
console.log("Headers:", res.headers);
const data = await res.json();
console.log("Data:", data);
```

## 状态调试

### 1. React DevTools

```
1. 安装 React DevTools 扩展
2. 打开开发者工具
3. 切换到 Components 标签
4. 查看组件状态
```

### 2. Zustand 调试

```typescript
import { create } from "zustand";

const useStore = create(
  devtools((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
  }))
);
```

### 3. tRPC 缓存调试

```typescript
const utils = api.useUtils();

// 查看缓存
console.log(utils.post.getAll);

// 刷新缓存
await utils.post.invalidate();
```

## 性能调试

### 1. React 性能

```typescript
// 使用 React.memo
const MyComponent = React.memo(({ prop }) => {
  return <div>{prop}</div>;
});

// 使用 useMemo
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

// 使用 useCallback
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

### 2. Next.js 性能

```typescript
// 使用 next/image
import Image from "next/image";

<Image
  src="/image.jpg"
  alt="Description"
  width={500}
  height={300}
/>

// 使用 next/script
import Script from "next/script";

<Script
  src="https://example.com/script.js"
  strategy="lazyOnload"
/>
```

### 3. 数据库性能

```typescript
// 添加索引
model User {
  id        String   @id @default(cuid())
  email     String   @unique  // 自动添加索引
  name      String
  createdAt DateTime @default(now())
}

// 优化查询
const users = await db.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
  },
  take: 10,
  orderBy: {
    createdAt: "desc",
  },
});
```

## 常见问题解决

### 1. 组件不渲染

```typescript
// 检查是否是 Server Component
// 添加 "use client" 指令

// 检查是否正确导出
export default function Component() { ... }

// 检查是否正确导入
import Component from "@/components/Component";
```

### 2. API 请求失败

```typescript
// 检查 API 路由是否存在
// src/app/api/endpoint/route.ts

// 检查请求方法
GET, POST, PUT, DELETE

// 检查请求 URL
console.log("URL:", "/api/endpoint");
```

### 3. 数据未获取

```typescript
// 检查 tRPC query
const { data, isLoading, error } = api.endpoint.useQuery();

// 检查数据库查询
const data = await db.model.findMany();

// 检查权限
if (!ctx.session?.user) {
  throw new TRPCError({ code: "UNAUTHORIZED" });
}
```

### 4. 状态未更新

```typescript
// 使用 setState 正确更新
setCount((prev) => prev + 1);

// 使用 tRPC invalidate
await utils.endpoint.invalidate();

// 强制重新渲染
const [, forceUpdate] = useState({});
forceUpdate({});
```

## 调试工具

### 1. Next.js 调试

```bash
# 开发模式
pnpm dev

# 构建模式
pnpm build

# 生产模式
pnpm start
```

### 2. Prisma 调试

```bash
# 查看查询日志
pnpm db:studio

# 查看迁移状态
pnpm db:migrate status

# 生成客户端
pnpm db:generate
```

### 3. 浏览器调试

```
1. 打开开发者工具 (F12)
2. Console 标签 - 查看日志和错误
3. Network 标签 - 查看网络请求
4. Sources 标签 - 调试 JavaScript
5. Application 标签 - 查看存储和缓存
```

## 最佳实践

### 1. 错误处理

```typescript
// 始终处理错误
try {
  const data = await fetchData();
} catch (error) {
  console.error("Error:", error);
  setError(error.message);
}

// 使用错误边界
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

### 2. 日志记录

```typescript
// 开发环境
console.log("Debug:", data);

// 生产环境
if (process.env.NODE_ENV === "development") {
  console.log("Debug:", data);
}
```

### 3. 测试

```typescript
// 单元测试
test("function should return correct value", () => {
  expect(function()).toBe(expected);
});

// 集成测试
it("should render component", () => {
  render(<Component />);
  expect(screen.getByText("text")).toBeInTheDocument();
});
```

## 调试流程

### 1. 识别问题

```
1. 复现问题
2. 查看错误信息
3. 检查控制台
4. 分析错误堆栈
```

### 2. 定位问题

```
1. 检查相关代码
2. 添加调试日志
3. 检查依赖
4. 检查配置
```

### 3. 解决问题

```
1. 修复代码
2. 测试修复
3. 检查其他影响
4. 添加测试
```

## 常见错误代码

### tRPC 错误

```typescript
import { TRPCError } from "@trpc/server";

// 未授权
throw new TRPCError({ code: "UNAUTHORIZED" });

// bad request
throw new TRPCError({ code: "BAD_REQUEST" });

// not found
throw new TRPCError({ code: "NOT_FOUND" });

// internal server error
throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
```

### Prisma 错误

```typescript
import { PrismaClientValidationError } from "@prisma/client/runtime/library";

// 验证错误
throw new PrismaClientValidationError("Invalid input");

// not found
const user = await db.user.findUnique({ where: { id } });
if (!user) {
  throw new Error("User not found");
}
```

## 相关技能

- [Code Reviewer](skill://code-reviewer) - 代码审查
- [Project Setup](skill://project-setup) - 项目配置
- [Database Migrator](skill://database-migrator) - 数据库管理
