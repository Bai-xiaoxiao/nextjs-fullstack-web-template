---
name: "testing-manager"
description: "管理项目测试，包括单元测试、集成测试和端到端测试。Invoke when user asks about testing, test setup, or writing tests."
---

# 测试管理器

## 功能说明

这个技能帮助你管理项目的测试，包括：

1. **单元测试** - 测试单个函数和组件
2. **集成测试** - 测试模块间交互
3. **端到端测试** - 测试完整用户流程
4. **测试配置** - 设置测试环境和工具

## 使用场景

当用户提出以下需求时调用此技能：
- 编写单元测试
- 设置测试环境
- 运行测试套件
- 调试测试问题

## 测试框架选择

### Jest + React Testing Library

```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.2",
    "@testing-library/react": "^14.2.1",
    "@testing-library/user-event": "^14.5.2",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "@types/jest": "^29.5.12"
  }
}
```

### Vitest（推荐）

```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.2",
    "@testing-library/react": "^14.2.1",
    "@testing-library/user-event": "^14.5.2",
    "vitest": "^1.3.1",
    "@vitejs/plugin-react": "^4.2.1",
    "jsdom": "^24.0.0"
  }
}
```

## 测试配置

### Vitest 配置

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

### 测试设置文件

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// 自动清理
afterEach(() => {
  cleanup();
});
```

### TypeScript 配置

```json
{
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  }
}
```

## 单元测试

### 工具函数测试

```typescript
// src/lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate, validateEmail } from './utils';

describe('工具函数测试', () => {
  describe('formatDate', () => {
    it('应该正确格式化日期', () => {
      const date = new Date('2024-01-01');
      expect(formatDate(date)).toBe('2024年1月1日');
    });

    it('应该处理无效日期', () => {
      expect(formatDate(null)).toBe('');
    });
  });

  describe('validateEmail', () => {
    it('应该验证有效邮箱', () => {
      expect(validateEmail('test@example.com')).toBe(true);
    });

    it('应该拒绝无效邮箱', () => {
      expect(validateEmail('invalid-email')).toBe(false);
    });
  });
});
```

### React 组件测试

```typescript
// src/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button 组件', () => {
  it('应该正确渲染按钮文本', () => {
    render(<Button>点击我</Button>);
    expect(screen.getByText('点击我')).toBeInTheDocument();
  });

  it('应该处理点击事件', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>点击我</Button>);
    
    fireEvent.click(screen.getByText('点击我'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('应该在禁用状态下不响应点击', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>点击我</Button>);
    
    fireEvent.click(screen.getByText('点击我'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('应该显示加载状态', () => {
    render(<Button loading>加载中</Button>);
    expect(screen.getByText('加载中')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### tRPC Procedure 测试

```typescript
// src/server/api/routers/post.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { appRouter } from '../root';
import { createTRPCContext } from '../trpc';
import { db } from '@/server/db';

describe('Post Router', () => {
  let ctx: Awaited<ReturnType<typeof createTRPCContext>>;

  beforeEach(async () => {
    // 创建测试上下文
    ctx = await createTRPCContext({ headers: new Headers() });
  });

  describe('create', () => {
    it('应该创建新帖子', async () => {
      const caller = appRouter.createCaller(ctx);
      
      const post = await caller.post.create({
        name: '测试帖子',
      });

      expect(post).toBeDefined();
      expect(post.name).toBe('测试帖子');
      expect(post.id).toBeDefined();
    });

    it('应该验证输入', async () => {
      const caller = appRouter.createCaller(ctx);
      
      await expect(caller.post.create({ name: '' })).rejects.toThrow();
    });
  });

  describe('getLatest', () => {
    it('应该获取最新帖子', async () => {
      const caller = appRouter.createCaller(ctx);
      
      // 先创建一个帖子
      await caller.post.create({ name: '测试帖子' });
      
      const latest = await caller.post.getLatest();
      
      expect(latest).toBeDefined();
      expect(latest?.name).toBe('测试帖子');
    });
  });
});
```

## 集成测试

### API 路由测试

```typescript
// src/app/api/posts/route.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { POST, GET } from './route';
import { auth } from '@/server/better-auth';
import { db } from '@/server/db';

describe('Posts API', () => {
  beforeEach(async () => {
    // 清理测试数据
    await db.post.deleteMany();
  });

  describe('POST /api/posts', () => {
    it('应该创建新帖子', async () => {
      const mockSession = {
        user: { id: 'test-user-id', email: 'test@example.com' },
      };

      // Mock 认证
      vi.spyOn(auth.api, 'getSession').mockResolvedValue(mockSession as any);

      const request = new Request('http://localhost:3000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: '测试帖子' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe('测试帖子');
    });

    it('应该拒绝未认证的请求', async () => {
      vi.spyOn(auth.api, 'getSession').mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: '测试帖子' }),
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
    });
  });
});
```

### 数据库操作测试

```typescript
// src/server/db.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from './db';

describe('数据库操作', () => {
  beforeEach(async () => {
    // 清理测试数据
    await db.user.deleteMany();
    await db.post.deleteMany();
  });

  it('应该创建用户', async () => {
    const user = await db.user.create({
      data: {
        id: 'test-user-id',
        name: '测试用户',
        email: 'test@example.com',
      },
    });

    expect(user).toBeDefined();
    expect(user.name).toBe('测试用户');
    expect(user.email).toBe('test@example.com');
  });

  it('应该创建帖子并关联用户', async () => {
    // 先创建用户
    const user = await db.user.create({
      data: {
        id: 'test-user-id',
        name: '测试用户',
        email: 'test@example.com',
      },
    });

    // 创建帖子
    const post = await db.post.create({
      data: {
        name: '测试帖子',
        createdById: user.id,
      },
    });

    expect(post).toBeDefined();
    expect(post.name).toBe('测试帖子');
    expect(post.createdById).toBe(user.id);
  });
});
```

## 端到端测试

### Playwright 配置

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 登录流程测试

```typescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('登录流程', () => {
  test('应该成功登录', async ({ page }) => {
    // 访问登录页面
    await page.goto('/user/sign-in');

    // 填写表单
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');

    // 提交表单
    await page.click('button[type="submit"]');

    // 等待导航
    await page.waitForURL('/');

    // 验证登录成功
    await expect(page.locator('text=欢迎')).toBeVisible();
  });

  test('应该显示错误信息', async ({ page }) => {
    await page.goto('/user/sign-in');

    // 填写错误的凭据
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');

    // 提交表单
    await page.click('button[type="submit"]');

    // 验证错误信息
    await expect(page.locator('text=邮箱或密码错误')).toBeVisible();
  });
});
```

### 用户管理测试

```typescript
// e2e/user-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('用户管理', () => {
  test.beforeEach(async ({ page }) => {
    // 先登录
    await page.goto('/user/sign-in');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('应该能够查看用户列表', async ({ page }) => {
    await page.goto('/admin/user-manage');

    // 验证用户表格存在
    await expect(page.locator('table')).toBeVisible();
    
    // 验证至少有一个用户
    await expect(page.locator('tbody tr')).toHaveCountGreaterThan(0);
  });

  test('应该能够编辑用户', async ({ page }) => {
    await page.goto('/admin/user-manage');

    // 点击编辑按钮
    await page.click('button:has-text("编辑")');

    // 填写新信息
    await page.fill('input[name="name"]', '新用户名');
    
    // 保存
    await page.click('button:has-text("保存")');

    // 验证更新成功
    await expect(page.locator('text=更新成功')).toBeVisible();
  });
});
```

## Mock 和 Stub

### API Mock

```typescript
// src/test/mocks/api.ts
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

export const handlers = [
  http.get('/api/posts', () => {
    return HttpResponse.json([
      { id: '1', name: '测试帖子1' },
      { id: '2', name: '测试帖子2' },
    ]);
  }),

  http.post('/api/posts', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: '3',
      name: (body as any).name,
    });
  }),
];

export const server = setupServer(...handlers);
```

### 数据库 Mock

```typescript
// src/test/mocks/db.ts
import { vi } from 'vitest';

export const mockDb = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  post: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

// 在测试中使用
vi.mock('@/server/db', () => ({
  db: mockDb,
}));
```

## 测试覆盖率

### 覆盖率配置

```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

### 覆盖率报告

```bash
# 运行测试并生成覆盖率报告
pnpm test:coverage

# 查看 HTML 报告
open coverage/index.html
```

## CI/CD 集成

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
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
        
      - name: Run tests
        run: pnpm test
        
      - name: Run E2E tests
        run: pnpm test:e2e
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

## 最佳实践

### 1. 测试命名规范

```typescript
// 好的测试命名
it('应该创建新用户当提供有效数据时', () => {});
it('应该抛出错误当邮箱格式无效时', () => {});

// 避免的命名
it('测试1', () => {});
it('应该工作', () => {});
```

### 2. 测试结构

```typescript
describe('组件名称', () => {
  describe('功能模块', () => {
    it('应该行为描述', () => {
      // 准备
      // 执行
      // 断言
    });
  });
});
```

### 3. 测试隔离

```typescript
// 每个测试都应该独立
beforeEach(() => {
  // 重置状态
  cleanup();
  vi.clearAllMocks();
});
```

### 4. 有意义的断言

```typescript
// 好的断言
expect(screen.getByText('欢迎回来')).toBeInTheDocument();
expect(mockFunction).toHaveBeenCalledWith('expected-value');

// 避免的断言
expect(true).toBe(true);
expect(1).toBe(1);
```

## 常用命令

```bash
# 运行所有测试
pnpm test

# 运行测试并监视变化
pnpm test:watch

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 运行 E2E 测试
pnpm test:e2e

# 运行特定测试文件
pnpm test Button.test.tsx

# 运行测试 UI
pnpm test:ui
```

## 相关技能

- [Code Reviewer](skill://code-reviewer) - 代码审查
- [Debugging](skill://debugging) - 调试管理
- [Project Setup](skill://project-setup) - 项目配置
