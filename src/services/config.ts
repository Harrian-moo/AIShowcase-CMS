/**
 * Centralized API environment configuration.
 * All external service addresses are provided via Vite environment variables
 * (never hardcoded in source code).
 */

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').trim();

export const API_CONFIG = {
  baseUrl: rawBaseUrl.replace(/\/+$/, ''),
  useMockApi: import.meta.env.VITE_USE_MOCK_API !== 'false',
  timeoutMs: 15000,
} as const;

export const AUTH_SESSION_STORAGE_KEY = 'remy_martin_cms_auth_session_v1';
