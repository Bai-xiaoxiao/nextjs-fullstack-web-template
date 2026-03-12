import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  signIn: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(1), name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // const user = await ctx.db.user.create({
      //     data: {
      //       email: input.email,
      //       password: input.password,
      //       name: input.name,
      //     },
      //   })
      return ctx.db.user.create({
          data: {
            email: input.email,
            password: input.password,
            name: input.name,
          },
        }).catch((error: any) => {
          if (error.code === "P2002") {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "该邮箱已被注册",
            });
          }
        })
    }),
});
