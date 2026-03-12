import { postRouter } from "@/server/api/routers/post";
import { userRouter } from "@/server/api/routers/user";

import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * 这是服务器的主要路由器。
 *
 * 所有在 /api/routers 中添加的路由器都应手动添加到这里。
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  user: userRouter,
});

// 导出 API 的类型定义
export type AppRouter = typeof appRouter;

/**
 * 为 tRPC API 创建服务端调用者。
 * @示例
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
