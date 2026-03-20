import {
  defaultShouldDehydrateQuery,
  QueryClient,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import SuperJSON from "superjson";
import { getErrorMessage } from "./error-handler";
import { message } from 'antd';

export const createQueryClient = () =>
  new QueryClient({
    queryCache: new QueryCache({
      onError(error, query) {
        console.error("tRPC query error:", error);
        const msg = getErrorMessage(error);
        if (msg) {
          message.error(msg);
        }
      },
    }),
    mutationCache: new MutationCache({
      onError(error, mutation) {
        console.error("tRPC mutation error:", error);
        const msg = getErrorMessage(error);
        if (msg) {
          message.error(msg);
        }
      },
    }),
    defaultOptions: {
      queries: {
        // 使用 SSR 时，通常设置 staleTime 大于 0，以避免客户端立即重新获取
        staleTime: 30 * 1000,
      },
      mutations: {
       
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
    },
  });
