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
  // 👉 Recomendado: poner en .env.local SIN /api y SIN barra final:
  // NEXT_PUBLIC_API_BASE_URL=http://10.100.1.80:3333
  //
  // Si querés tener el path /api fijo, agregalo en el .env:
  // NEXT_PUBLIC_API_BASE_URL=http://10.100.1.80:3333/api
  //
  // Con esto NO forzamos /api aquí y evitamos duplicados.
  const env = process.env.NEXT_PUBLIC_API_BASE_URL;
  return env ? trimSlashes(env) : 'http://10.100.1.80:3333/api';
})();

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
  // 204/205: sin contenido
  if (res.status === 204 || res.status === 205) return undefined as unknown as T;

  const contentType = res.headers.get('content-type') || '';
  // Si es JSON, parseamos; si no, devolvemos texto
  if (contentType.includes('application/json')) {
    return (await res.json()) as T;
  }

  const text = await res.text();
  // Si el caller espera objeto, devolvemos texto como any
  return text as unknown as T;
}

// intenta refrescar el token y devuelve el nuevo access_token
async function tryRefreshToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    // Ajusta el endpoint según tu backend: aquí asumimos /auth/refresh
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

// ✅ función genérica con retry tras refresh
export const apiFetch = async <T = any>(
  endpoint: string,
  options: RequestInit = {},
  _retried = false
): Promise<T> => {
  const token = getAccessToken();

  // Clonamos options para no mutar el objeto recibido
  const opts: RequestInit = { ...options, headers: { ...(options.headers || {}) } };

  // Si el cuerpo es FormData/Blob/ArrayBuffer, NO seteamos Content-Type (el navegador lo hace)
  const isMultipart =
    opts.body instanceof FormData ||
    opts.body instanceof Blob ||
    opts.body instanceof ArrayBuffer;

  // Headers base
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

  // Si 401 y tenemos refresh, intentamos refrescar una vez
  if (res.status === 401 && !_retried) {
    const newAccess = await tryRefreshToken();
    if (newAccess) {
      const retryHeaders = {
        ...headers,
        Authorization: `Bearer ${newAccess}`,
      };
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
    let msg = 'Error en la petición';
    try {
      const data: any = await parseResponse(res);
      msg = data?.message || data?.error || msg;
    } catch {}
    throw new Error(msg);
  }

  return parseResponse<T>(res);
};
