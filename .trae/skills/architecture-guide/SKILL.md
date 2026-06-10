---
name: "architecture-guide"
description: "提供项目架构指导，包括技术选型、模块设计、代码组织和最佳实践。Invoke when user asks about project architecture, design patterns, or code organization."
---

# 架构指南

## 功能说明

这个技能提供项目架构指导，包括：

1. **技术选型** - 选择合适的技术栈和工具
2. **模块设计** - 设计清晰的模块结构
3. **代码组织** - 组织可维护的代码结构
4. **最佳实践** - 遵循行业最佳实践

## 使用场景

当用户提出以下需求时调用此技能：
- 了解项目架构
- 设计新功能模块
- 重构现有代码
- 技术选型决策

## 项目技术栈

### 核心技术

```json
{
  "framework": "Next.js 15",
  "language": "TypeScript",
  "styling": "Tailwind CSS + Ant Design",
  "database": "Prisma + SQLite/PostgreSQL",
  "auth": "Better-Auth",
  "api": "tRPC",
  "state": "React Query",
  "validation": "Zod"
}
```

### 技术选型理由

#### Next.js 15
- **服务端渲染**: 提升首屏加载性能和SEO
- **App Router**: 现代化的路由系统
- **服务器组件**: 减少客户端JavaScript bundle
- **自动代码分割**: 优化加载性能

#### TypeScript
- **类型安全**: 编译时错误检测
- **开发体验**: 更好的IDE支持
- **代码维护**: 提高代码可读性和可维护性
- **团队协作**: 减少沟通成本

#### tRPC
- **端到端类型安全**: 前后端共享类型定义
- **自动验证**: 基于Zod的输入验证
- **简化API开发**: 无需手动定义API契约
- **错误处理**: 统一的错误处理机制

#### Prisma
- **类型安全查询**: 编译时SQL检查
- **直观API**: 简洁的数据库操作
- **迁移管理**: 自动化数据库版本控制
- **多数据库支持**: 轻松切换数据库

#### Better-Auth
- **现代化认证**: 支持多种认证方式
- **安全性**: 内置安全防护
- **易用性**: 简单的API设计
- **扩展性**: 支持自定义插件

## 项目结构

### 目录结构规范

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 认证相关页面组
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (admin)/           # 管理后台页面组
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── user-manage/
│   ├── api/               # API路由
│   │   ├── auth/          # 认证API
│   │   └── trpc/          # tRPC API
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # 可复用组件
│   ├── ui/               # UI组件
│   ├── forms/            # 表单组件
│   └── layouts/          # 布局组件
├── lib/                  # 工具函数库
│   ├── utils.ts          # 通用工具
│   ├── validators.ts     # 验证函数
│   └── constants.ts      # 常量定义
├── server/               # 服务端代码
│   ├── api/              # tRPC路由器
│   │   ├── routers/      # 具体路由器
│   │   ├── root.ts       # 根路由器
│   │   └── trpc.ts       # tRPC配置
│   ├── better-auth/      # 认证配置
│   └── db.ts             # 数据库实例
├── styles/               # 样式文件
│   └── globals.css       # 全局样式
├── trpc/                 # tRPC客户端配置
│   ├── react.tsx         # React客户端
│   ├── server.ts         # 服务端客户端
│   └── query-client.ts   # 查询客户端配置
└── env.js                # 环境变量配置
```

### 模块设计原则

#### 1. 单一职责原则

```typescript
// ❌ 不好的做法 - 一个组件承担多个职责
export function UserManagement() {
  // 用户列表
  // 用户编辑
  // 用户删除
  // 权限管理
  // ... 太多职责
}

// ✅ 好的做法 - 拆分为小组件
export function UserList() { /* 只负责显示列表 */ }
export function UserEditForm() { /* 只负责编辑表单 */ }
export function UserDeleteButton() { /* 只负责删除操作 */ }
```

#### 2. 关注点分离

```typescript
// 业务逻辑层 - server/api/routers/user.ts
export const userRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findMany();
  }),
});

// 表现层 - components/UserList.tsx
export function UserList() {
  const { data } = api.user.getAll.useQuery();
  return <div>{/* 渲染用户列表 */}</div>;
}
```

#### 3. 依赖倒置原则

```typescript
// 定义接口
interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
}

// 实现接口
class PrismaUserRepository implements UserRepository {
  constructor(private db: PrismaClient) {}
  
  async findById(id: string) {
    return this.db.user.findUnique({ where: { id } });
  }
  
  async save(user: User) {
    return this.db.user.upsert({
      where: { id: user.id },
      update: user,
      create: user,
    });
  }
}
```

## 代码组织模式

### 1. 特性文件夹结构

```
features/
├── user-management/
│   ├── components/
│   │   ├── UserList.tsx
│   │   ├── UserEditForm.tsx
│   │   └── UserDeleteButton.tsx
│   ├── hooks/
│   │   └── useUserManagement.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts
├── post-management/
│   ├── components/
│   ├── hooks/
│   └── types/
```

### 2. 共享组件库

```
components/
├── ui/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── index.ts
│   ├── Input/
│   ├── Modal/
│   └── Table/
├── forms/
│   ├── LoginForm/
│   ├── RegisterForm/
│   └── SearchForm/
└── layouts/
    ├── AdminLayout/
    ├── AuthLayout/
    └── MainLayout/
```

### 3. 工具函数组织

```
lib/
├── utils/
│   ├── string.ts      # 字符串处理
│   ├── date.ts        # 日期处理
│   ├── validation.ts  # 验证函数
│   └── format.ts      # 格式化函数
├── constants/
│   ├── routes.ts      # 路由常量
│   ├── messages.ts    # 消息常量
│   └── config.ts      # 配置常量
└── services/
    ├── api.ts         # API服务
    ├── auth.ts        # 认证服务
    └── storage.ts     # 存储服务
```

## 设计模式应用

### 1. 工厂模式

```typescript
// lib/factories/user-factory.ts
export class UserFactory {
  static createAdmin(data: Partial<User>): User {
    return {
      ...data,
      role: 'ADMIN',
      permissions: ['read', 'write', 'delete'],
    } as User;
  }
  
  static createRegularUser(data: Partial<User>): User {
    return {
      ...data,
      role: 'USER',
      permissions: ['read'],
    } as User;
  }
}
```

### 2. 观察者模式

```typescript
// lib/events/event-emitter.ts
type EventCallback = (data: any) => void;

export class EventEmitter {
  private events: Map<string, EventCallback[]> = new Map();
  
  on(event: string, callback: EventCallback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)?.push(callback);
  }
  
  emit(event: string, data: any) {
    this.events.get(event)?.forEach(callback => callback(data));
  }
  
  off(event: string, callback: EventCallback) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      this.events.set(
        event,
        callbacks.filter(cb => cb !== callback)
      );
    }
  }
}
```

### 3. 策略模式

```typescript
// lib/strategies/auth-strategy.ts
interface AuthStrategy {
  authenticate(credentials: any): Promise<boolean>;
}

class EmailAuthStrategy implements AuthStrategy {
  async authenticate(credentials: { email: string; password: string }) {
    // 邮箱密码认证逻辑
    return true;
  }
}

class GithubAuthStrategy implements AuthStrategy {
  async authenticate(credentials: { code: string }) {
    // GitHub OAuth认证逻辑
    return true;
  }
}

class AuthContext {
  constructor(private strategy: AuthStrategy) {}
  
  setStrategy(strategy: AuthStrategy) {
    this.strategy = strategy;
  }
  
  async authenticate(credentials: any) {
    return this.strategy.authenticate(credentials);
  }
}
```

## 状态管理架构

### 1. 服务端状态（tRPC + React Query）

```typescript
// 查询状态
const { data, isLoading, error } = api.user.getAll.useQuery();

// 变更状态
const mutation = api.user.create.useMutation({
  onSuccess: () => {
    utils.user.invalidate(); // 刷新数据
  },
});
```

### 2. 客户端状态（React State）

```typescript
// 简单状态
const [isOpen, setIsOpen] = useState(false);
const [searchTerm, setSearchTerm] = useState('');

// 复杂状态
const [formState, dispatch] = useReducer(formReducer, initialState);
```

### 3. 全局状态（Context + Zustand）

```typescript
// Context for theme
const ThemeContext = createContext<ThemeContextType>(defaultTheme);

// Zustand for complex global state
const useStore = create<StoreState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
```

## 性能优化架构

### 1. 代码分割策略

```typescript
// 路由级别自动分割
// app/dashboard/page.tsx - 单独chunk

// 组件级别动态导入
const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false,
});
```

### 2. 缓存策略

```typescript
// tRPC查询缓存
const { data } = api.post.getAll.useQuery(undefined, {
  staleTime: 5 * 60 * 1000, // 5分钟
  gcTime: 10 * 60 * 1000,   // 10分钟
});

// 服务端缓存
const data = await fetch('/api/data', {
  next: { revalidate: 3600 } // 1小时重新验证
});
```

### 3. 图片优化

```typescript
<Image
  src="/image.jpg"
  alt="描述"
  width={800}
  height={600}
  priority // 关键图片优先加载
  quality={75} // 压缩质量
/>
```

## 安全架构

### 1. 认证流程

```
用户登录 → Better-Auth验证 → 生成Session → 设置Cookie → 受保护路由访问
```

### 2. 授权流程

```
请求到达 → Session验证 → 权限检查 → 资源访问控制 → 返回结果
```

### 3. 数据流安全

```
前端输入 → Zod验证 → tRPC处理 → Prisma查询 → 数据库操作 → 结果返回
```

## 测试架构

### 1. 测试金字塔

```
    E2E Tests (少量)
   /           \
Integration Tests (适量)
 /               \
Unit Tests (大量)
```

### 2. 测试文件组织

```
__tests__/
├── unit/
│   ├── components/
│   ├── utils/
│   └── hooks/
├── integration/
│   ├── api/
│   └── database/
└── e2e/
    ├── login.spec.ts
    └── user-management.spec.ts
```

## 部署架构

### 1. 环境分离

```
Development → Staging → Production
    ↓            ↓           ↓
  本地开发    测试环境     生产环境
```

### 2. CI/CD流程

```
Code Push → Lint & Test → Build → Security Scan → Deploy
```

### 3. 监控告警

```
Application → Logging → Monitoring → Alerting → Incident Response
```

## 最佳实践总结

### 1. 代码质量

- 使用TypeScript严格模式
- 实施代码审查流程
- 编写单元测试
- 遵循编码规范

### 2. 性能优化

- 实施代码分割
- 优化图片加载
- 合理使用缓存
- 监控性能指标

### 3. 安全保障

- 输入验证和清理
- 适当的权限控制
- 安全的会话管理
- 定期安全审计

### 4. 可维护性

- 清晰的代码结构
- 完整的文档
- 一致的命名规范
- 模块化设计

## 技术债务管理

### 1. 识别技术债务

- 复杂的代码逻辑
- 重复的代码片段
- 过时的依赖包
- 缺失的测试覆盖

### 2. 偿还策略

- 定期重构计划
- 渐进式改进
- 自动化测试保护
- 文档更新维护

## 相关技能

- [Project Setup](skill://project-setup) - 项目配置
- [Code Reviewer](skill://code-reviewer) - 代码审查
- [Performance Optimizer](skill://performance-optimizer) - 性能优化
- [Security Manager](skill://security-manager) - 安全管理
