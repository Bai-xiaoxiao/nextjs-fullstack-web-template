import { z } from "zod";
import {join} from 'path'
import {writeFile, mkdir} from 'fs/promises'
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

/**
 * 上传模块
 */
export const uploadRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.instanceof(FormData))
    .mutation(async ({ ctx, input }) => {
      console.log('[Upload Router] Input type:', typeof input);
      console.log('[Upload Router] Input constructor:', input?.constructor?.name);
      console.log('[Upload Router] Is FormData?:', input instanceof FormData);
      
      try {
        const file = input.get('file') as File | null;
        
        if (!file) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "未找到文件" 
          });
        }

        // 允许的文件类型
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: `不支持的文件类型: ${file.type}。允许的格式: JPEG, PNG, GIF, WebP` 
          });
        }

        // 文件大小限制 (10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "文件大小不能超过 10MB" 
          });
        }

        // 生成唯一文件名
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        const ext = file.name.split('.').pop() ?? 'jpg';
        const fileName = `${timestamp}_${randomString}.${ext}`;
        
        // 确保上传目录存在
        const uploadDir = join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });
        
        const filePath = join(uploadDir, fileName);
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // 返回可访问的 URL 路径
        return { 
          path: `/uploads/${fileName}`,
          originalName: file.name,
          size: file.size,
          type: file.type
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("上传失败:", error);
        throw new TRPCError({ 
          code: "INTERNAL_SERVER_ERROR", 
          message: "文件上传失败" 
        });
      }
    }),
});
