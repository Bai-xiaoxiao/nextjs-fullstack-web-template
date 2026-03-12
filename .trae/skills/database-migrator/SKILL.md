---
name: "database-migrator"
description: "管理数据库迁移，包括创建迁移文件、应用迁移和处理数据库版本控制。Invoke when user asks about database migrations, schema changes, or deployment."
---

# 数据库迁移管理器

## 功能说明

这个技能帮助你管理数据库迁移，包括：

1. **迁移创建** - 创建新的迁移文件
2. **迁移应用** - 应用迁移到数据库
3. **版本控制** - 管理数据库版本
4. **问题解决** - 处理迁移冲突

## 使用场景

当用户提出以下需求时调用此技能：
- 创建新的数据库迁移
- 应用迁移到生产环境
- 解决迁移冲突
- 重置数据库

## Prisma 迁移命令

### 开发环境

```bash
# 推送 schema 到数据库（快速同步）
pnpm db:push

# 创建并应用迁移
pnpm db:migrate dev
```

### 生产环境

```bash
# 应用迁移（无提示）
pnpm db:migrate deploy

# 生成 Prisma Client
pnpm db:generate
```

### 数据库操作

```bash
# 启动 Prisma Studio（查看数据）
pnpm db:studio

# 重置数据库（开发环境）
pnpm db:reset
```

## 迁移工作流程

### 1. 修改 Schema

```prisma
// prisma/schema.prisma
model User {
  id            String    @id @default(cuid())
  name          String
  email         String
  emailVerified Boolean   @default(false)  // 新增字段
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @default(now()) @updatedAt
  
  posts Post[]
  
  @@unique([email])
}
```

### 2. 创建迁移

```bash
pnpm db:migrate dev
```

这会：
- 检测 schema 变更
- 创建迁移文件（`prisma/migrations/xxx`）
- 应用迁移到数据库
- 更新 Prisma Client

### 3. 查看迁移

```bash
# 查看迁移历史
pnpm db:migrate status

# 查看迁移 SQL
pnpm db:migrate diff
```

## 迁移文件结构

```
prisma/
├── migrations/
│   ├── 20240101000000_create_users/
│   │   ├── migration.sql
│   │   └── migration_timestamp.json
│   └── migration_lock.toml
└── schema.prisma
```

### migration.sql 示例

```sql
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
```

## 常见场景

### 1. 添加新表

```prisma
model Post {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  
  createdBy   User   @relation(fields: [createdById], references: [id])
  createdById String
  
  @@index([name])
}
```

执行：
```bash
pnpm db:migrate dev
```

### 2. 添加字段

```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  email         String
  role          String    @default("USER")  // 新增字段
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @default(now()) @updatedAt
  
  @@unique([email])
}
```

执行：
```bash
pnpm db:migrate dev
```

### 3. 修改字段

```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  email         String
  emailVerified Boolean   @default(false)
  role          Role      @default("USER")  // 修改为枚举类型
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @default(now()) @updatedAt
  
  @@unique([email])
}

// 添加枚举
enum Role {
  USER
  ADMIN
}
```

执行：
```bash
pnpm db:migrate dev
```

### 4. 删除字段

```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  email         String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @default(now()) @updatedAt
  
  @@unique([email])
}
```

执行：
```bash
pnpm db:migrate dev
```

## 生产环境部署

### 1. 生成 Prisma Client

```bash
pnpm db:generate
```

### 2. 应用迁移

```bash
pnpm db:migrate deploy
```

### 3. 验证迁移

```bash
pnpm db:migrate status
```

## 问题解决

### 1. Drift Detected（检测到漂移）

**错误信息**：
```
Drift detected: Your database schema is not in sync with your migration history.
```

**解决方案**：
```bash
# 方案 1：重置数据库（开发环境）
pnpm db:reset

# 方案 2：手动同步
pnpm db:push
```

### 2. 迁移冲突

**错误信息**：
```
The name of the migration is already in use
```

**解决方案**：
```bash
# 删除冲突的迁移文件
rm prisma/migrations/xxx

# 重新创建迁移
pnpm db:migrate dev
```

### 3. 数据库被锁定

**错误信息**：
```
EPERM: operation not permitted
```

**解决方案**：
```bash
# 关闭所有数据库连接
# 然后重试
pnpm db:generate
```

## 最佳实践

### 1. 开发环境

```bash
# 修改 schema
# 创建迁移
pnpm db:migrate dev

# 或者快速同步
pnpm db:push
```

### 2. 生产环境

```bash
# 1. 生成客户端
pnpm db:generate

# 2. 应用迁移
pnpm db:migrate deploy

# 3. 验证
pnpm db:migrate status
```

### 3. 团队协作

```bash
# 1. 拉取最新代码
git pull

# 2. 应用迁移
pnpm db:migrate dev

# 3. 生成客户端
pnpm db:generate
```

## 迁移策略

### 1. 增量迁移

```bash
# 每次 schema 变更都创建新迁移
pnpm db:migrate dev
```

### 2. 版本控制

```bash
# 查看迁移历史
pnpm db:migrate history

# 回滚到特定版本
pnpm db:migrate resolve --migration xxx
```

### 3. 备份策略

```bash
# 迁移前备份数据库
# 应用迁移
pnpm db:migrate deploy

# 验证
pnpm db:migrate status
```

## 常用命令速查

| 命令 | 说明 | 环境 |
|------|------|------|
| `pnpm db:push` | 推送 schema | 开发 |
| `pnpm db:migrate dev` | 创建并应用迁移 | 开发 |
| `pnpm db:migrate deploy` | 应用迁移 | 生产 |
| `pnpm db:generate` | 生成客户端 | 所有 |
| `pnpm db:studio` | 查看数据 | 开发 |
| `pnpm db:reset` | 重置数据库 | 开发 |
| `pnpm db:migrate status` | 查看状态 | 所有 |
| `pnpm db:migrate diff` | 查看差异 | 所有 |

## 注意事项

1. **不要删除已应用的迁移**
2. **在开发环境测试迁移**
3. **生产环境使用 `db:migrate deploy`**
4. **定期备份数据库**
5. **团队协作时同步迁移文件**
