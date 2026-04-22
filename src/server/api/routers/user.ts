import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { auth } from "@/server/better-auth";

export const userRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

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
      return ctx.db.user.findMany({
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

  signInByBetterAuth: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return auth.api.signUpEmail({
        body: {
          name: input.name,
          email: input.email,
          password: input.password,
        },
      });
    }),

  resetPassword: protectedProcedure
    .input(
      z.object({
        password: z.string().min(8),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log(input.password, 999);
      return auth.api.resetPassword({
        body: {
          newPassword: input.password,
        },
      });
    }),

  signInByDb: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // const user = await ctx.db.user.create({
      //     data: {
      //       email: input.email,
      //       password: input.password,
      //       name: input.name,
      //     },
      //   })
      return ctx.db.user
        .create({
          data: {
            email: input.email,
            password: input.password,
            name: input.name,
          },
        })
        .catch((error: any) => {
          if (error.code === "P2002") {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "该邮箱已被注册",
            });
          }
        });
    }),
});
