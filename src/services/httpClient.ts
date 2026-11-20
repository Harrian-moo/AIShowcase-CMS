import { getStoredLocale } from '../i18n/localeStorage';
import { ApiError, ApiErrorPayload, ApiResponse } from '../types/api';
import { AuthSession } from '../types/cms';
import { API_CONFIG, AUTH_SESSION_STORAGE_KEY } from './config';

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  skipAuth?: boolean;
}

function getStoredAccessToken(): string | null {
  try {
    const raw = window.sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AuthSession>;
    return typeof parsed.accessToken === 'string' ? parsed.accessToken : null;
  } catch {
    return null;
  }
}

function buildUrl(path: string): string {
  if (!API_CONFIG.baseUrl) {
    throw new ApiError(
      getStoredLocale() === 'en'
        ? 'VITE_API_BASE_URL is not configured.'
        : '未配置 VITE_API_BASE_URL 环境变量，无法连接后端服务',
      500,
      'MISSING_API_BASE_URL'
    );
  }
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_CONFIG.baseUrl}${normalizedPath}`;
}

function extractErrorMessage(payload: ApiErrorPayload | null, status: number): string {
  const fallback =
    getStoredLocale() === 'en'
      ? `Request failed (HTTP ${status})`
      : `请求失败 (HTTP ${status})`;
  if (!payload) {
    return fallback;
  }
  if (typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message;
  }
  if (typeof payload.detail === 'string' && payload.detail.trim()) {
    return payload.detail;
  }
  if (Array.isArray(payload.detail) && payload.detail.length > 0) {
    return payload.detail.map((item) => item.message).join('; ');
  }
  return fallback;
}

export async function httpRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, headers, skipAuth = false, ...rest } = options;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), API_CONFIG.timeoutMs);

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const requestHeaders = new Headers(headers);

  if (!isFormData && body !== undefined && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }
  if (!requestHeaders.has('Accept')) {
    requestHeaders.set('Accept', 'application/json');
  }
  if (!requestHeaders.has('Accept-Language')) {
    requestHeaders.set('Accept-Language', getStoredLocale() === 'en' ? 'en' : 'zh-CN');
  }

  if (!skipAuth) {
    const token = getStoredAccessToken();
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  try {
    const response = await fetch(buildUrl(path), {
      ...rest,
      headers: requestHeaders,
      body:
        body === undefined
          ? undefined
          : isFormData
            ? body
            : JSON.stringify(body),
      signal: controller.signal,
    });

    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get('content-type') ?? '';
    const isJson = contentType.includes('application/json');
    const rawPayload = isJson ? await response.json() : null;

    if (!response.ok) {
      const errPayload = rawPayload as ApiErrorPayload | null;
      const details = Array.isArray(errPayload?.detail)
        ? errPayload.detail
        : errPayload?.errors;
      throw new ApiError(
        extractErrorMessage(errPayload, response.status),
        response.status,
        errPayload?.code || `HTTP_${response.status}`,
        details
      );
    }

    // Support both FastAPI direct JSON payloads and { data: T } wrapped envelopes
    if (
      rawPayload &&
      typeof rawPayload === 'object' &&
      'data' in rawPayload &&
      Object.keys(rawPayload).every((key) => key === 'data' || key === 'message')
    ) {
      return (rawPayload as ApiResponse<T>).data;
    }

    return rawPayload as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(
        getStoredLocale() === 'en'
          ? 'Request timed out. Please check backend connectivity.'
          : '请求超时，请检查后端服务状态',
        408,
        'REQUEST_TIMEOUT'
      );
    }
    throw new ApiError(
      getStoredLocale() === 'en'
        ? 'Network connection error. Please try again.'
        : '网络连接异常，请稍后重试',
      0,
      'NETWORK_ERROR'
    );
  } finally {
    window.clearTimeout(timeoutId);
  }
}
