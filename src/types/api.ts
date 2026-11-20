/**
 * Unified API response envelope and error definitions.
 * Designed to align cleanly with Python FastAPI REST JSON responses.
 */

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiErrorPayload {
  code?: string;
  message?: string;
  detail?: string | ApiErrorDetail[];
  errors?: ApiErrorDetail[];
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: ApiErrorDetail[];

  constructor(
    message: string,
    status = 500,
    code = 'INTERNAL_ERROR',
    details?: ApiErrorDetail[]
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function normalizeApiError(error: unknown, fallbackMessage = '请求失败，请稍后重试'): ApiError {
  if (error instanceof ApiError) {
    return error;
  }
  if (error instanceof Error) {
    return new ApiError(error.message || fallbackMessage, 500, 'CLIENT_ERROR');
  }
  return new ApiError(fallbackMessage, 500, 'UNKNOWN_ERROR');
}
