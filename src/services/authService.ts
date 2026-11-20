import { mockBackend } from '../mocks/mockBackend';
import { AuthSession, LoginRequestPayload } from '../types/cms';
import { API_CONFIG, AUTH_SESSION_STORAGE_KEY } from './config';
import { httpRequest } from './httpClient';

function persistSession(session: AuthSession | null): void {
  try {
    if (session) {
      window.sessionStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      window.sessionStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    }
  } catch {
    // Ignore sessionStorage restrictions
  }
}

export const authService = {
  getStoredSession(): AuthSession | null {
    try {
      const raw = window.sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as AuthSession;
      if (parsed?.accessToken && parsed?.user?.username) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  },

  async login(payload: LoginRequestPayload): Promise<AuthSession> {
    const session = API_CONFIG.useMockApi
      ? await mockBackend.login(payload)
      : await httpRequest<AuthSession>('/auth/login', {
          method: 'POST',
          body: payload,
          skipAuth: true,
        });

    persistSession(session);
    return session;
  },

  async logout(): Promise<void> {
    try {
      if (API_CONFIG.useMockApi) {
        await mockBackend.logout();
      } else {
        await httpRequest<void>('/auth/logout', { method: 'POST' });
      }
    } finally {
      persistSession(null);
    }
  },
};
