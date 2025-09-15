// src/services/api.ts

// Helpers
function trimSlashes(s: string) {
  return s.replace(/\/+$/, '');
}
function ensureLeadingSlash(s: string) {
  return s.startsWith('/') ? s : `/${s}`;
}
function joinUrl(base: string, endpoint: string) {
  const b = trimSlashes(base);
  const e = ensureLeadingSlash(endpoint);
  return `${b}${e}`.replace(/([^:]\/)\/+/g, '$1'); // evita // dobles
}

export const API_URL = (() => {
  const env = process.env.NEXT_PUBLIC_API_BASE_URL;
  return env ? trimSlashes(env) : 'http://10.100.1.80:3333/api';
})();

const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_KEY) || localStorage.getItem('token');
}

function getRefreshToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

function setTokens(access?: string | null, refresh?: string | null) {
  if (typeof window === 'undefined') return;
  if (access) localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

function clearAuthAndRedirect() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.assign('/login');
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (res.status === 204 || res.status === 205) return undefined as unknown as T;

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return (await res.json()) as T;
  }

  const text = await res.text();
  return text as unknown as T;
}

async function tryRefreshToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const url = joinUrl(API_URL, '/auth/refresh');
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', accept: '*/*' },
      body: JSON.stringify({ refresh_token: refresh }),
    });

    if (!res.ok) return null;

    const data: any = await parseResponse(res);
    const newAccess = data?.access_token || data?.accessToken || data?.token || null;
    const newRefresh = data?.refresh_token || data?.refreshToken || null;

    if (newAccess) setTokens(newAccess, newRefresh ?? refresh);
    return newAccess;
  } catch {
    return null;
  }
}

export const apiFetch = async <T = any>(
  endpoint: string,
  options: RequestInit = {},
  _retried = false
): Promise<T> => {
  const token = getAccessToken();
  const opts: RequestInit = { ...options, headers: { ...(options.headers || {}) } };

  const isMultipart =
    opts.body instanceof FormData ||
    opts.body instanceof Blob ||
    opts.body instanceof ArrayBuffer;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(isMultipart ? {} : { 'Content-Type': 'application/json' }),
    ...(opts.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = joinUrl(API_URL, endpoint);
  const res = await fetch(url, { ...opts, headers });

  // refresh si hay 401
  if (res.status === 401 && !_retried) {
    const newAccess = await tryRefreshToken();
    if (newAccess) {
      const retryHeaders = { ...headers, Authorization: `Bearer ${newAccess}` };
      const res2 = await fetch(url, { ...opts, headers: retryHeaders });
      if (!res2.ok) {
        if (res2.status === 401) clearAuthAndRedirect();
        let msg = 'Error en la petición';
        try {
          const data2: any = await parseResponse(res2);
          msg = data2?.message || data2?.error || msg;
        } catch {}
        throw new Error(msg);
      }
      return parseResponse<T>(res2);
    } else {
      clearAuthAndRedirect();
      throw new Error('Sesión expirada. Iniciá sesión nuevamente.');
    }
  }

  if (!res.ok) {
    if (res.status === 401) clearAuthAndRedirect();

    const raw = await res.clone().text();
    console.error("❌ Backend raw response:", raw);

    let msg = `HTTP ${res.status} - ${res.statusText}`;
    try {
      const data: any = await parseResponse(res);
      console.error("❌ Backend parsed error:", data);

      if (typeof data === "string") {
        msg = data;
      } else if (typeof data === "object") {
        msg = data?.message || data?.error || JSON.stringify(data);
      }
    } catch (e) {
      console.error("❌ Error parseando respuesta del backend:", e);
    }

    throw new Error(msg);
  }

  return parseResponse<T>(res);
};
