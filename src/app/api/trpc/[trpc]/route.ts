import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { env } from "@/env";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

/**
 * 这个函数包装了 `createTRPCContext` 辅助函数，为 tRPC API 提供了所需的上下文，
 * 用于处理 HTTP 请求（例如，当您从客户端组件发出请求时）。
 */
const createContext = async (req: NextRequest) => {
  return createTRPCContext({
    headers: req.headers,
  });
};

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC 在 ${path ?? "<无路径>"} 处失败: ${error.message}`
            );
          }
        : undefined,
  });

export { handler as GET, handler as POST };
