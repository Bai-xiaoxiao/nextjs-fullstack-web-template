---
name: "prisma-manager"
description: "管理 Prisma 数据库操作，包括 schema 修改、迁移生成和数据库同步。Invoke when user asks about database operations, schema changes, or Prisma commands."
---

# Prisma 数据库管理器

## 功能说明

这个技能帮助你管理和操作 Prisma 数据库，包括：

1. **Schema 管理** - 修改和验证 Prisma schema
2. **数据库同步** - 推送或迁移数据库结构
3. **客户端生成** - 生成 Prisma Client

## 使用场景

当用户提出以下需求时调用此技能：
- 修改数据库 schema
- 添加新表或字段
- 执行数据库迁移
- 生成或更新 Prisma Client
- 查询或操作数据库

## 标准操作流程

### 1. 修改 Schema 后同步数据库

```bash
pnpm db:push
```

**适用场景**：开发环境，快速同步 schema 变更

### 2. 创建迁移文件（生产环境）

```bash
pnpm db:migrate dev
```

**适用场景**：需要保留数据，创建迁移文件用于版本控制

### 3. 生成 Prisma Client

```bash
pnpm db:generate
```

**适用场景**：修改 schema 后需要重新生成类型定义

## 常用命令

| 命令 | 说明 | 适用环境 |
|------|------|----------|
| `pnpm db:push` | 直接推送 schema 到数据库 | 开发 |
| `pnpm db:migrate dev` | 创建并应用迁移 | 开发 |
| `pnpm db:migrate deploy` | 应用迁移（无提示） | 生产 |
| `pnpm db:generate` | 生成 Prisma Client | 所有 |
| `pnpm db:studio` | 启动 Prisma Studio 查看数据 | 开发 |

## Prisma Schema 规范

### ID 字段

```prisma
id String @id @default(cuid())
```

- 使用 `cuid()` 生成唯一 ID
- 不使用自增（autoincrement）

### 时间字段

```prisma
createdAt DateTime @default(now())
updatedAt DateTime @default(now()) @updatedAt
```

### 关系字段

```prisma
// 一对多
user User @relation(fields: [userId], references: [id], onDelete: Cascade)

// 多对一
posts Post[]
```

## 注意事项

1. **开发环境**：优先使用 `pnpm db:push`，快速直接
2. **生产环境**：必须使用 `pnpm db:migrate`，保护数据
3. **修改 schema 后**：记得运行 `pnpm db:generate` 重新生成客户端
4. **数据丢失警告**：`db:push` 会删除并重建表，仅用于开发环境

## 示例

### 添加新表

```prisma
model Comment {
  id        String   @id @default(cuid())
  content   String
  createdAt DateTime @default(now())
  
  postId    String
  post      Post     @relation(fields: [postId], references: [id])
  
  userId    String
  user      User     @relation(fields: [userId], references: [id])
}
```

执行：
```bash
pnpm db:push
```

### 修改现有表

```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  email         String
  emailVerified Boolean   @default(false)  # 新增字段
  # ... 其他字段
}
```

执行：
```bash
pnpm db:push
```
