---
name: "nextjs-component"
description: "创建符合 Next.js App Router 规范的 React 组件，包括 Server/Client Component 选择、状态管理和样式规范。Invoke when user asks to create new components, modify existing ones, or need UI implementation."
---

# Next.js 组件管理器

## 功能说明

这个技能帮助你创建和管理符合 Next.js App Router 规范的 React 组件，包括：

1. **组件类型选择** - Server Component vs Client Component
2. **状态管理** - useState、useReducer、zustand 等
3. **数据获取** - Server-side Rendering、Client-side Rendering
4. **样式规范** - Tailwind CSS 使用规范

## 使用场景

当用户提出以下需求时调用此技能：
- 创建新的页面组件
- 创建可复用的 UI 组件
- 修改现有组件
- 需要实现特定的 UI 功能

## Server Component vs Client Component

### Server Component（服务器组件）

**特点**：
- 默认使用
- 不能使用 useState、useEffect 等 hooks
- 直接访问后端资源
- 更好的性能和 SEO

**使用场景**：
- 页面布局
- 数据获取和渲染
- 不需要交互的组件

```typescript
// page.tsx (Server Component)
import { api } from "@/trpc/server";

export default async function Page() {
  const data = await api.post.getLatest();
  
  return (
    <div>
      <h1>页面标题</h1>
      <p>{data?.content}</p>
    </div>
  );
}
```

### Client Component（客户端组件）

**特点**：
- 需要添加 `"use client"` 指令
- 可以使用所有 React hooks
- 可以处理用户交互
- 会发送到客户端执行

**使用场景**：
- 表单组件
- 交互式组件
- 需要状态管理的组件

```typescript
// component.tsx (Client Component)
"use client";

import { useState } from "react";

export function MyComponent() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}
```

## 组件结构规范

### 基本结构

```typescript
"use client";

import { useState } from "react";

import { api } from "@/trpc/react";

export function ComponentName() {
  // 状态管理
  const [state, setState] = useState(initialValue);
  
  // tRPC hooks
  const mutation = api.endpoint.mutation.useMutation();
  
  // 事件处理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 处理逻辑
  };
  
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}
```

### 组件导出

```typescript
// 命名导出（推荐）
export function MyComponent() { ... }

// 默认导出（用于页面）
export default function Page() { ... }
```

## 状态管理规范

### useState（简单状态）

```typescript
const [count, setCount] = useState(0);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### tRPC Mutation（异步操作）

```typescript
const createPost = api.post.create.useMutation({
  onSuccess: () => {
    // 成功后刷新数据
    utils.post.invalidate();
    // 重置表单
    setName("");
  },
  onError: (error) => {
    setError(error.message);
  },
});

const handleSubmit = () => {
  createPost.mutate({ name });
};
```

### tRPC Query（数据获取）

```typescript
// Suspense 模式
const { data } = api.post.getLatest.useSuspenseQuery();

// Hook 模式
const { data, isLoading, error } = api.post.getLatest.useQuery();

// 缓存失效
const utils = api.useUtils();
await utils.post.invalidate();
```

## 样式规范

### Tailwind CSS

```typescript
// 基础样式
<div className="flex items-center justify-center">
<div className="rounded-lg bg-white p-4 shadow-md">
<div className="w-full max-w-md px-4">

// 交互状态
<button 
  disabled={isLoading}
  className="disabled:opacity-50 disabled:cursor-not-allowed"
>
<div className="hover:bg-white/20 transition">

// 响应式
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
<input className="w-full rounded-lg bg-white/10 px-4 py-3 text-white">
```

### 组件样式

```typescript
// 表单
<form onSubmit={handleSubmit} className="flex flex-col gap-4">
  <div>
    <label htmlFor="name" className="mb-2 block text-sm font-medium">
      标签
    </label>
    <input
      id="name"
      type="text"
      required
      className="w-full rounded-lg bg-white/10 px-4 py-3 text-white"
    />
  </div>
</form>

// 按钮
<button
  type="submit"
  disabled={isPending}
  className="w-full rounded-lg bg-white/10 py-3 font-semibold transition hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isPending ? "提交中..." : "提交"}
</button>

// 错误提示
{error && (
  <div className="mb-4 rounded-lg bg-red-500/20 p-4 text-red-200">
    {error}
  </div>
)}
```

## 常见组件模式

### 表单组件

```typescript
"use client";

import { useState } from "react";
import { api } from "@/trpc/react";

export function FormComponent() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const mutation = api.post.create.useMutation({
    onSuccess: () => {
      setName("");
      setError(null);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ name });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg bg-white/10 px-4 py-2 text-white"
      />
      {error && <div className="text-red-200">{error}</div>}
      <button
        type="submit"
        disabled={mutation.isPending}
        className="rounded-lg bg-white/10 px-4 py-2 font-semibold"
      >
        {mutation.isPending ? "提交中..." : "提交"}
      </button>
    </form>
  );
}
```

### 列表组件

```typescript
"use client";

import { api } from "@/trpc/react";

export function ListComponent() {
  const { data, isLoading } = api.post.getAll.useSuspenseQuery();

  if (isLoading) {
    return <div>加载中...</div>;
  }

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.id} className="rounded-lg bg-white/10 p-4">
          {item.name}
        </div>
      ))}
    </div>
  );
}
```

### 带刷新的组件

```typescript
"use client";

import { api } from "@/trpc/react";

export function RefreshableComponent() {
  const utils = api.useUtils();
  const [name, setName] = useState("");
  
  const createMutation = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      setName("");
    },
  });

  return (
    <div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={() => createMutation.mutate({ name })}>
        添加
      </button>
    </div>
  );
}
```

## 最佳实践

1. **选择合适的组件类型**
   - Server Component：默认使用，除非需要交互
   - Client Component：需要 useState、useEffect 时使用

2. **状态管理**
   - 简单状态：useState
   - 异步操作：tRPC mutation
   - 共享状态：考虑 zustand 或 context

3. **错误处理**
   - 使用 mutation 的 onError 回调
   - 显示用户友好的错误信息
   - 记录错误日志

4. **性能优化**
   - 使用 Suspense 查询
   - 合理使用缓存失效
   - 避免不必要的重新渲染

5. **用户体验**
   - 添加加载状态
   - 禁用按钮防止重复提交
   - 提供清晰的反馈
