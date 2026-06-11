import { z } from "zod";
import {join} from 'path'
import {writeFile} from 'fs/promises'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { octetInputParser } from '@trpc/server/http'
import { auth } from "@/server/better-auth";

/**
 * 上传模块，trpc好像不能处理formdata的数据类型
 */
export const uploadRouter = createTRPCRouter({
  create: protectedProcedure
    .input(octetInputParser)
    .mutation(async ({ ctx, input }) => {
      console.log(typeof input, 11111);
      const file = input.get('file') as File;
      if(['image/jpeg', 'image/png'].includes(file.type)) return new TRPCError({ code: "BAD_REQUEST", message: "文件类型错误" });
      const path = join(__dirname, 'uploads', file.name);
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes);
      await writeFile(path, buffer)
      return { path };
    }),
});
