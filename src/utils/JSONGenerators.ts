import type { ApiSuccess, ApiError } from '../types/user.types.js'

export function successResponse(
  message: string,
  data: Record<string, unknown> = {},
): ApiSuccess {
  return {
    success: true,
    message,
    data,
  }
}

export function errorResponse(
  status: number,
  title: string,
  detail: string,
  path: string,
): ApiError {
  return {
    success: false,
    error: {
      status,
      title,
      detail,
    },
    path,
  }
}
