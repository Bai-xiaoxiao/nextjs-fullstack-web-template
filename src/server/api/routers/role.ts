import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { auth } from "@/server/better-auth";

export const roleRouter = createTRPCRouter({
  /**
   * 获取用户列表
   */
  getList: publicProcedure
    .input(
      z.object({
        username: z.string().optional(),
        page: z.number().optional().default(1),
        pageSize: z.number().optional().default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.role.findMany({
        where: {
          name: {
            contains: input.username,
          },
        },
        orderBy: {
          id: "asc",
        },
        // 跳过 (page - 1) * pageSize 条记录
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        // userIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.role.create({
        data: {
          name: input.name,
          // users: { 
          //   connect: input.userIds.map((id) => ({ id }))
          // },
        },
      });
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: {
          id: input.id,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    }),
});
