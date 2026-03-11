/**
 * 您可能不需要编辑此文件，除非：
 * 1. 您想修改请求上下文（参见第 1 部分）。
 * 2. 您想创建新的中间件或过程类型（参见第 3 部分）。
 *
 * 简而言之 - 这里是创建和配置所有 tRPC 服务端代码的地方。您需要使用的部分在文档中已明确标注。
 */

import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { auth } from "@/server/better-auth";
import { db } from "@/server/db";

/**
 * 1. 上下文 (CONTEXT)
 *
 * 这部分定义了后端 API 中可用的"上下文"。
 *
 * 这些允许您在处理请求时访问内容，如数据库、会话等。
 *
 * 此辅助函数生成 tRPC 上下文的"内部"实现。API 处理程序和 RSC 客户端各自
 * 包装此函数并提供所需的上下文。
 *
 * @see https://trpc.io/docs/server/context
 */
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

/**
 * 2. 初始化 (INITIALIZATION)
 *
 * 这里初始化了 tRPC API，连接了上下文和转换器。我们还解析了 ZodErrors，
 * 这样如果您的过程由于后端验证错误而失败，您在前端也能获得类型安全。
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 创建服务端调用者。
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. 路由器和过程 (ROUTER & PROCEDURE) (重要部分)
 *
 * 这些是您用于构建 tRPC API 的部分。您应该在
 * "/src/server/api/routers" 目录中大量使用它们。
 */

/**
 * 这是您在 tRPC API 中创建新路由器和子路由器的方式。
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * 用于计时过程执行并在开发中添加人工延迟的中间件。
 *
 * 如果您不喜欢这个功能，可以删除它，但它可以通过模拟生产环境中会出现
 * 但在本地开发中不会出现的网络延迟，帮助您捕获不想要的水falls。
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // 开发环境中的延迟
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} 执行耗时 ${end - start}ms`);

  return result;
});

/**
 * 公共（未认证）过程
 *
 * 这是您用于构建 tRPC API 中新的查询和变更的基础部分。它不保证
 * 查询的用户已授权，但如果您已登录，您仍然可以访问用户会话数据。
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * 受保护（已认证）过程
 *
 * 如果您希望查询或变更仅对已登录用户可访问，请使用此方法。它验证
 * 会话有效并保证 `ctx.session.user` 不为空。
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        // 推断 `session` 为非空值
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });
