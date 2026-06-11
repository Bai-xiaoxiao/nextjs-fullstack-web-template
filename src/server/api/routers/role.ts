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
        keyword: z.string().optional(),
        page: z.number().optional().default(1),
        pageSize: z.number().optional().default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      // 本来role表里面没有users字段，这里只是为了演示如何关联查询
      return ctx.db.role.findMany({
        // 除了使用 select，还可以使用 omit排除
        // omit: {
        //   name: true,
        // },
        select: {
          id: true,
          name: true,
          // 这里不选择users的话，关联查询也不会生效，前端拿不到users数据
          users: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        // 这里演示了一个或的查询关系，前端传入keyword，会同时查询name和users.name、users.email
        where: {
          OR: [
            {
              name: {
                contains: input.keyword,
              },
            },
            {
              users: {
                some: {
                  name: {
                    contains: input.keyword,
                  },
                },
              },
            },
            {
              users: {
                some: {
                  email: {
                    contains: input.keyword,
                  },
                },
              },
            },
          ]
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
        userIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.role.create({
        data: {
          name: input.name,
          users: { 
            connect: input.userIds.map((id) => ({ id }))
          },
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        userIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.role.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          users: {
            set: input.userIds.map((id) => ({ id })),
          },
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
