import { TRPCClientError } from "@trpc/client";

/**
 * 获取错误消息
 * @param error tRPC 错误
 * @returns 错误消息
 */
export function getErrorMessage(error: unknown): string | null {
  if (error instanceof TRPCClientError) {
    // tRPC 错误
    if (error.data?.zodError?.fieldErrors) {
      // Zod 验证错误
      const fieldErrors = error.data.zodError.fieldErrors;
      const firstError = Object.values(fieldErrors).find((errors) => errors && errors.length > 0);
      if (firstError && firstError.length > 0) {
        return firstError[0];
      }
    }
    
    if (error.message) {
      return error.message;
    }
    
    if (error.data?.message) {
      return error.data.message;
    }
  } else if (error instanceof Error) {
    // 普通错误
    return error.message;
  }
  
  return null;
}

/**
 * 获取表单验证错误
 * @param error tRPC 错误
 * @returns 表单字段错误
 */
export function getFormErrors(error: unknown): Record<string, string[]> | null {
  if (error instanceof TRPCClientError) {
    if (error.data?.zodError?.fieldErrors) {
      return error.data.zodError.fieldErrors;
    }
  }
  return null;
}
