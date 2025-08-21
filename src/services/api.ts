// src/services/api.ts
export const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`
  : 'http://10.100.1.80:3333/api';

const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

function getAccessToken() {
  if (typeof window === 'undefined') return null;
  // prioridad al access_token, fallback a "token"
  return localStorage.getItem(ACCESS_KEY) || localStorage.getItem('token');
}

function getRefreshToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

function setTokens(access?: string | null, refresh?: string | null) {
  if (typeof window === 'undefined') return;
  if (access) {
    localStorage.setItem(ACCESS_KEY, access);
  }
  if (refresh) {
    localStorage.setItem(REFRESH_KEY, refresh);
  }
}

function clearAuthAndRedirect() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.assign('/login');
}

// intenta refrescar el token y devuelve el nuevo access_token
async function tryRefreshToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    // Ajusta si tu backend pide otro método/endpoint/payload
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', accept: '*/*' },
      body: JSON.stringify({ refresh_token: refresh })
    });

    if (!res.ok) return null;

    const data = await res.json().catch(() => ({}));
    const newAccess =
      data?.access_token || data?.accessToken || data?.token || null;
    const newRefresh = data?.refresh_token || data?.refreshToken || null;

    if (newAccess) setTokens(newAccess, newRefresh ?? refresh);
    return newAccess;
  } catch {
    return null;
  }
}

// ✅ función genérica con retry tras refresh
export const apiFetch = async <T = any>(
  endpoint: string,
  options: RequestInit = {},
  _retried = false
): Promise<T> => {
  const token = getAccessToken();

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  // Si 401 y tenemos refresh, intentamos refrescar una vez
  if (res.status === 401 && !_retried) {
    const newAccess = await tryRefreshToken();
    if (newAccess) {
      const res2 = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newAccess}`,
          ...(options.headers || {})
        }
      });
      if (!res2.ok) {
        if (res2.status === 401) clearAuthAndRedirect();
        let msg = 'Error en la petición';
        try {
          const data2 = await res2.json();
          msg = data2?.message || msg;
        } catch {}
        throw new Error(msg);
      }
      try {
        return (await res2.json()) as T;
      } catch {
        return {} as T;
      }
    } else {
      // no se pudo refrescar
      clearAuthAndRedirect();
      throw new Error('Sesión expirada. Iniciá sesión nuevamente.');
    }
  }

  if (!res.ok) {
    if (res.status === 401) clearAuthAndRedirect();
    let msg = 'Error en la petición';
    try {
      const data = await res.json();
      msg = data?.message || msg;
    } catch {}
    throw new Error(msg);
  }

  try {
    return (await res.json()) as T;
  } catch {
    return {} as T;
  }
};
