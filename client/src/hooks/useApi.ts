import { useAuthStore } from '../store/authStore';

export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const { accessToken, refreshToken, logout } = useAuthStore.getState();

  const headers = new Headers(options.headers);
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  let response = await fetch(`/api${url}`, { ...options, headers, credentials: 'include' });

  // Auto-refresh on 401
  if (response.status === 401 || response.status === 403) {
    try {
      await refreshToken();
      const newToken = useAuthStore.getState().accessToken;
      if (newToken) {
        headers.set('Authorization', `Bearer ${newToken}`);
        response = await fetch(`/api${url}`, { ...options, headers, credentials: 'include' });
      }
    } catch {
      await logout();
      throw new Error('Session expired');
    }
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || `HTTP ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}
