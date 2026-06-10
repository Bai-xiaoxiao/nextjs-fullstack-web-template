---
name: "performance-optimizer"
description: "优化应用性能，包括代码分割、缓存策略、图片优化和加载性能。Invoke when user asks about performance optimization, loading speed, or application efficiency."
---

# 性能优化器

## 功能说明

这个技能帮助你优化应用性能，包括：

1. **代码分割** - 优化 bundle 大小和加载策略
2. **缓存策略** - 配置有效的缓存机制
3. **图片优化** - 优化图片加载和显示
4. **加载性能** - 提升首屏加载速度

## 使用场景

当用户提出以下需求时调用此技能：
- 优化页面加载速度
- 减少 bundle 大小
- 配置缓存策略
- 优化图片加载

## 代码分割优化

### 动态导入

```typescript
// 组件级别动态导入
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <div className="animate-pulse h-64 bg-gray-200 rounded"></div>,
  ssr: false, // 如果不需要服务端渲染
});

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  loading: () => <div>地图加载中...</div>,
  ssr: false,
});

export default function Page() {
  return (
    <div>
      <h1>页面标题</h1>
      <HeavyChart />
      <MapComponent />
    </div>
  );
}
```

### 路由级别代码分割

```typescript
// app/dashboard/page.tsx - 自动代码分割
export default function DashboardPage() {
  return <div>仪表板内容</div>;
}

// app/settings/page.tsx - 自动代码分割
export default function SettingsPage() {
  return <div>设置内容</div>;
}
```

### 第三方库优化

```typescript
// 优化大型库的导入
import { Button, Form, Input } from 'antd'; // 按需导入
// 而不是 import { Button } from 'antd/lib/button';

// 使用 babel-plugin-import 配置
// .babelrc 或 babel.config.js
{
  "plugins": [
    ["import", {
      "libraryName": "antd",
      "libraryDirectory": "es",
      "style": true
    }]
  ]
}
```

## 图片优化

### Next.js Image 组件

```typescript
import Image from 'next/image';

// 基本用法
<Image
  src="/hero.jpg"
  alt="英雄图"
  width={1200}
  height={600}
  priority // 优先加载
  quality={75} // 图片质量
/>

// 响应式图片
<Image
  src="/responsive.jpg"
  alt="响应式图片"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  fill
  style={{ objectFit: 'cover' }}
/>

// 外部图片
<Image
  src="https://example.com/image.jpg"
  alt="外部图片"
  width={800}
  height={600}
  unoptimized // 如果不需要优化
/>
```

### 图片配置

```typescript
// next.config.js
const nextConfig = {
  images: {
    domains: ['example.com', 'cdn.example.com'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30天
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};
```

### 懒加载图片

```typescript
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

export function LazyImage({ src, alt, ...props }: any) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative">
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      <Image
        src={src}
        alt={alt}
        onLoadingComplete={() => setIsLoaded(true)}
        {...props}
      />
    </div>
  );
}
```

## 缓存策略

### tRPC 查询缓存

```typescript
"use client";

import { api } from "@/trpc/react";

export function CachedData() {
  // 默认缓存策略
  const { data } = api.post.getAll.useQuery();

  // 自定义缓存时间
  const { data: staleData } = api.post.getAll.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5分钟内认为数据是新鲜的
    gcTime: 10 * 60 * 1000,   // 10分钟后从缓存中移除
  });

  // 禁用缓存
  const { data: noCache } = api.post.getAll.useQuery(undefined, {
    staleTime: 0,
    gcTime: 0,
  });

  return <div>{data?.length}</div>;
}
```

### 服务端缓存

```typescript
// Server Component 中的缓存
export default async function Page() {
  // Next.js 会自动缓存 fetch 请求
  const data = await fetch('https://api.example.com/data', {
    next: {
      revalidate: 3600, // 1小时后重新验证
      tags: ['posts'],   // 用于手动重新验证
    },
  }).then(res => res.json());

  return <div>{data.title}</div>;
}
```

### 手动缓存控制

```typescript
"use client";

import { api } from "@/trpc/react";

export function ManualCacheControl() {
  const utils = api.useUtils();

  // 使特定查询失效
  const invalidatePost = async (id: string) => {
    await utils.post.getById.invalidate({ id });
  };

  // 使所有帖子查询失效
  const invalidateAllPosts = async () => {
    await utils.post.invalidate();
  };

  // 预取数据
  const prefetchPosts = async () => {
    await utils.post.getAll.prefetch();
  };

  return (
    <div>
      <button onClick={invalidateAllPosts}>刷新数据</button>
      <button onClick={prefetchPosts}>预取数据</button>
    </div>
  );
}
```

## 字体优化

### Google Fonts 优化

```typescript
// app/layout.tsx
import { Inter, Noto_Sans_SC } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-noto-sans-sc',
  weight: ['400', '500', '700'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${notoSansSC.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

### 本地字体

```typescript
// app/layout.tsx
import localFont from 'next/font/local';

const myFont = localFont({
  src: [
    {
      path: './fonts/MyFont-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/MyFont-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-my-font',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={myFont.variable}>
      <body className="font-my-font">{children}</body>
    </html>
  );
}
```

## Bundle 优化

### 分析 Bundle 大小

```bash
# 安装 bundle analyzer
pnpm add -D @next/bundle-analyzer

# 创建分析脚本
# scripts/analyze.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({});
```

### 优化依赖导入

```typescript
// ❌ 不好的做法 - 导入整个库
import _ from 'lodash';
_.debounce(() => {}, 300);

// ✅ 好的做法 - 按需导入
import debounce from 'lodash/debounce';
debounce(() => {}, 300);

// ✅ 更好的做法 - 使用原生方法
const debouncedFn = (() => {
  let timeout: NodeJS.Timeout;
  return (fn: Function, delay: number) => {
    clearTimeout(timeout);
    timeout = setTimeout(fn, delay);
  };
})();
```

### Tree Shaking 优化

```typescript
// package.json
{
  "sideEffects": [
    "*.css",
    "*.scss"
  ]
}
```

## 加载性能优化

### 预加载关键资源

```typescript
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 预加载关键资源 */}
        <link
          rel="preload"
          href="/fonts/inter-var-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 骨架屏

```typescript
"use client";

export function PostSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="flex space-x-4 p-4 border rounded">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  );
}
```

### 渐进式加载

```typescript
"use client";

import { Suspense } from 'react';
import { api } from "@/trpc/react";

function PostList() {
  const { data } = api.post.getAll.useSuspenseQuery();
  
  return (
    <div>
      {data?.map(post => (
        <div key={post.id}>{post.name}</div>
      ))}
    </div>
  );
}

export default function Page() {
  return (
    <div>
      <h1>帖子列表</h1>
      <Suspense fallback={<PostSkeleton />}>
        <PostList />
      </Suspense>
    </div>
  );
}
```

## 网络优化

### API 请求优化

```typescript
"use client";

import { api } from "@/trpc/react";

export function OptimizedQueries() {
  // 并行查询
  const { data: posts } = api.post.getAll.useQuery();
  const { data: users } = api.user.getAll.useQuery();
  
  // 依赖查询
  const { data: userPosts } = api.post.getByUser.useQuery(
    { userId: users?.[0]?.id },
    { enabled: !!users?.[0]?.id } // 只有在用户数据加载完成后才执行
  );
  
  // 无限滚动
  const { data, fetchNextPage, hasNextPage } = api.post.getInfinite.useInfiniteQuery(
    { limit: 10 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );
  
  return <div>内容</div>;
}
```

### 请求去重

```typescript
"use client";

import { api } from "@/trpc/react";
import { useMemo } from 'react';

export function DedupedQueries() {
  // tRPC 自动去重相同参数的查询
  const { data: posts1 } = api.post.getAll.useQuery();
  const { data: posts2 } = api.post.getAll.useQuery(); // 不会发起新请求
  
  // 使用 useMemo 避免不必要的重新渲染
  const processedData = useMemo(() => {
    return posts1?.map(post => ({
      ...post,
      processedName: post.name.toUpperCase(),
    }));
  }, [posts1]);
  
  return <div>内容</div>;
}
```

## 内存优化

### 组件卸载清理

```typescript
"use client";

import { useEffect, useRef } from 'react';

export function CleanupComponent() {
  const intervalRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    // 设置定时器
    intervalRef.current = setInterval(() => {
      console.log('定时任务');
    }, 1000);
    
    // 清理函数
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  return <div>组件内容</div>;
}
```

### 大列表优化

```typescript
"use client";

import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

export function VirtualizedList({ items }: { items: any[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5,
  });
  
  return (
    <div ref={parentRef} style={{ height: 400, overflow: 'auto' }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 性能监控

### Web Vitals 监控

```typescript
// app/layout.tsx
export function reportWebVitals(metric: any) {
  if (process.env.NODE_ENV === 'production') {
    // 发送到分析服务
    fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        id: metric.id,
      }),
    });
  }
}

// 在根布局中使用
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
```

### 自定义性能指标

```typescript
// lib/performance.ts
export function measurePerformance(name: string, fn: () => void) {
  const start = performance.now();
  fn();
  const end = performance.now();
  
  console.log(`${name} 耗时: ${end - start}ms`);
  
  // 发送到监控系统
  if (process.env.NODE_ENV === 'production') {
    navigator.sendBeacon('/api/performance', JSON.stringify({
      name,
      duration: end - start,
      timestamp: Date.now(),
    }));
  }
}
```

## 最佳实践

### 1. 性能预算

```json
{
  "performance-budget": {
    "first-contentful-paint": 1800,
    "largest-contentful-paint": 2500,
    "cumulative-layout-shift": 0.1,
    "first-input-delay": 100,
    "bundle-size": {
      "javascript": 250000,
      "css": 50000
    }
  }
}
```

### 2. 定期性能审计

```bash
# Lighthouse CI
pnpm add -D @lhci/cli@latest

# lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
      },
    },
  },
};
```

### 3. 持续监控

- 设置性能告警
- 监控核心 Web 指标
- 定期性能回归测试
- 用户真实性能数据收集

## 常用工具

### 性能分析工具

```bash
# Chrome DevTools Performance tab
# Lighthouse
npx lighthouse http://localhost:3000

# WebPageTest
# https://webpagetest.org

# Bundle analysis
ANALYZE=true pnpm build
```

## 相关技能

- [Deployment Manager](skill://deployment-manager) - 部署管理
- [Code Reviewer](skill://code-reviewer) - 代码审查
- [Debugging](skill://debugging) - 调试管理
