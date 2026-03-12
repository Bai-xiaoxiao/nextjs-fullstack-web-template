---
name: "code-reviewer"
description: "审查代码质量、最佳实践和潜在问题。Invoke when user asks for code review, before merging changes, or when they want to improve code quality."
---

# 代码审查器

## 功能说明

这个技能帮助你审查代码质量，包括：

1. **代码规范** - 检查是否符合项目规范
2. **最佳实践** - 确保使用最佳实践
3. **潜在问题** - 发现可能的 bug 和问题
4. **性能优化** - 提出性能改进建议

## 使用场景

当用户提出以下需求时调用此技能：
- 代码审查请求
- 合并代码前检查
- 代码重构
- 提高代码质量

## 审查清单

### TypeScript/JavaScript

- [ ] 类型定义完整
- [ ] 没有 `any` 类型
- [ ] 正确使用可选链 `?.`
- [ ] 正确使用空值合并 `??`
- [ ] 没有未使用的变量

### React/Next.js

- [ ] 正确使用 Server/Client Component
- [ ] 没有在 Server Component 中使用 hooks
- [ ] 正确使用 `"use client"` 指令
- [ ] 表单有正确的 onSubmit 处理
- [ ] 列表有唯一的 key

### tRPC

- [ ] 输入使用 Zod 验证
- [ ] 受保护的 procedure 使用 `protectedProcedure`
- [ ] 正确处理错误
- [ ] 数据库操作有适当的权限检查

### Prisma

- [ ] ID 字段有默认值
- [ ] 关系字段正确配置
- [ ] 使用 `cuid()` 作为默认 ID
- [ ] 时间字段有默认值

### 样式

- [ ] 使用 Tailwind CSS
- [ ] 没有内联样式
- [ ] 响应式设计
- [ ] 一致的命名规范

### 安全

- [ ] 没有硬编码的敏感信息
- [ ] 输入验证完整
- [ ] 防止 SQL 注入
- [ ] 正确处理用户输入

### 性能

- [ ] 避免不必要的重新渲染
- [ ] 使用 Suspense 查询
- [ ] 合理使用缓存
- [ ] 图片使用 next/image

## 常见问题

### 1. 类型安全问题

```typescript
// ❌ 不安全
const data = await res.json();

// ✅ 安全
const data = await res.json().catch(() => ({})) as { error?: string };
```

### 2. 错误处理

```typescript
// ❌ 没有错误处理
const res = await fetch(...);

// ✅ 有错误处理
try {
  const res = await fetch(...);
} catch (err) {
  setError("网络错误");
}
```

### 3. 表单提交

```typescript
// ❌ 没有防止默认行为
<button onClick={() => handleSubmit()}>

// ✅ 正确处理
<form onSubmit={handleSubmit}>
  <button type="submit">
```

### 4. 状态管理

```typescript
// ❌ 没有加载状态
<button onClick={mutate}>提交</button>

// ✅ 有加载状态
<button disabled={isPending}>{isPending ? "提交中..." : "提交"}</button>
```

### 5. 权限检查

```typescript
// ❌ 没有权限检查
mutation(async ({ ctx, input }) => {
  return ctx.db.post.create({ data: input });
})

// ✅ 有权限检查
mutation(async ({ ctx, input }) => {
  return ctx.db.post.create({
    data: {
      ...input,
      createdBy: { connect: { id: ctx.session.user.id } },
    },
  });
})
```

## 代码规范

### 命名规范

```typescript
// 变量和函数：camelCase
const userName = "John";
const handleSubmit = () => { ... };

// 组件：PascalCase
function MyComponent() { ... }

// 常量：UPPER_SNAKE_CASE
const MAX_COUNT = 10;

// 类型：PascalCase + T 前缀或直接使用名词
type User = { ... };
interface IUser { ... }
```

### 注释规范

```typescript
// ✅ 好的注释
/**
 * 创建用户
 * @param email 用户邮箱
 * @param name 用户姓名
 * @returns 创建的用户对象
 */
async function createUser(email: string, name: string) { ... }

// ❌ 不好的注释
// 创建用户
function createUser(...) { ... }
```

### 导入顺序

```typescript
// 1. React
import { useState } from "react";

// 2. 第三方库
import { createTRPCRouter } from "@/server/api/trpc";

// 3. 本地模块
import { db } from "@/server/db";

// 4. 类型
import { type AppRouter } from "@/server/api/root";
```

## 重构建议

### 1. 提取复杂逻辑

```typescript
// ❌ 组件中包含复杂逻辑
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  // 50 行复杂的验证和处理逻辑
};

// ✅ 提取到单独的函数
const validateAndSubmit = async (data: FormData) => {
  // 验证逻辑
  // 处理逻辑
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  await validateAndSubmit(formData);
};
```

### 2. 使用自定义 hooks

```typescript
// ✅ 提取可复用的逻辑
function useForm(initialValues: {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  
  const handleChange = (e: React.ChangeEvent) => { ... };
  const handleSubmit = (callback: () => void) => { ... };
  
  return { values, errors, handleChange, handleSubmit };
}
```

### 3. 优化数据获取

```typescript
// ❌ 每次渲染都获取数据
const data = api.post.getAll.useQuery();

// ✅ 使用 Suspense 和缓存
const { data } = api.post.getAll.useSuspenseQuery();
```

## 最佳实践

1. **类型安全**
   - 使用 `unknown` 而不是 `any`
   - 正确使用类型断言
   - 启用严格模式

2. **错误处理**
   - 总是处理可能的错误
   - 提供用户友好的错误信息
   - 记录错误日志

3. **用户体验**
   - 添加加载状态
   - 提供反馈
   - 防止重复提交

4. **性能**
   - 使用虚拟化长列表
   - 优化图片加载
   - 合理使用缓存

5. **可维护性**
   - 代码简洁
   - 良好的命名
   - 完整的注释

## 审查报告格式

```
## 代码审查报告

### ✅ 通过项
- 类型定义完整
- 错误处理完善
- 命名规范

### ⚠️ 需改进项
1. **性能优化**
   - 建议：使用 Suspense 查询
   - 原因：避免不必要的重新渲染

2. **错误处理**
   - 建议：添加加载状态
   - 原因：提升用户体验

### 📝 建议
- 考虑提取公共逻辑到自定义 hook
- 添加单元测试
- 完善文档注释
```
