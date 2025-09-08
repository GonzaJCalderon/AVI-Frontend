// services/usuarioService.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://10.100.1.80:3333/api';

// services/usuarioService.ts (arriba del todo o dentro de la clase como métodos estáticos)
const toBool = (v: any): boolean => {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v === 1;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (['1', 'true', 'sí', 'si', 'activo'].includes(s)) return true;
    if (['0', 'false', 'no', 'inactivo', 'bloqueado'].includes(s)) return false;
  }
  return false; // default seguro: no asumir true
};

const toRol = (v: any): 'admin' | 'user' => {
  const s = String(v ?? '').trim().toLowerCase();
  if (s === 'admin' || s === 'administrator' || s === 'adm') return 'admin';
  return 'user';
};

// services/usuarioService.ts

const normalizeUsuario = (raw: any): Usuario => ({
  id: Number(raw.id),
  nombre: raw.nombre ?? raw.name ?? '',
  email: raw.email ?? '',
  rol: toRol(raw.rol),
  activo: toBool(raw.activo ?? raw.enabled ?? raw.isActive),
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
});


// ✅ Lee token desde varias claves comunes
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return (
    localStorage.getItem('access_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('ACCESS_TOKEN') ||
    null
  );
};

// ✅ Headers con auth
const getAuthHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Tipos
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'admin' | 'user';
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
  [k: string]: any;
}

export interface CreateUsuarioData {
  nombre: string;
  apellido: string;
  email: string;
  rol: 'admin' | 'usuario'; // se mapea a 'admin' | 'user' en el payload
  password?: string;
}

export interface UpdateUsuarioData {
  nombre?: string;
  email?: string;
  rol?: 'admin' | 'user';
  activo?: boolean; // ✅ permitir enviar activo
  // password?: string;
}


export interface Perfil {
  id?: number | string;
  nombre?: string;
  email?: string;
  rol?: string;
  avatarUrl?: string;
  [k: string]: any;
}

class UsuarioService {
  // ✅ Manejo de respuesta robusto (sin doble .json(), soporta 204/empty)
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type') || '';
    const hasJson = contentType.includes('application/json');

    let data: any = null;
    if (hasJson) {
      try {
        data = await response.json();
      } catch {
        data = null;
      }
    }

    if (!response.ok) {
      const msg =
        data?.error ||
        data?.message ||
        `Error ${response.status}: ${response.statusText}`;
      throw new Error(msg);
    }

    // Si no hay body (204) devolvemos undefined as T
    return (data ?? (undefined as unknown)) as T;
  }

  // =========== PERFIL ===========
  async getPerfil(): Promise<Perfil> {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    // algunos backends envuelven en {success, data}
    const json = await this.handleResponse<any>(res);
    return json?.data ?? json;
  }

  // =========== USUARIOS (CRUD) ===========
 // services/usuarioService.ts
async getUsuarios(opts?: { includeInactivos?: boolean }): Promise<Usuario[]> {
  const headers = getAuthHeaders();

  // Si pedimos inactivos, probamos distintas variantes comunes
  if (opts?.includeInactivos) {
    // Variante 1: ?includeInactivos=1
    try {
      const r1 = await fetch(`${API_BASE_URL}/usuarios?includeInactivos=1`, { headers });
      const j1 = await this.handleResponse<any>(r1);
      const arr1 = Array.isArray(j1?.data) ? j1.data : (Array.isArray(j1) ? j1 : []);
      if (Array.isArray(arr1)) return arr1.map(normalizeUsuario);
    } catch {}

    // Variante 2: ?activo=all
    try {
      const r2 = await fetch(`${API_BASE_URL}/usuarios?activo=all`, { headers });
      const j2 = await this.handleResponse<any>(r2);
      const arr2 = Array.isArray(j2?.data) ? j2.data : (Array.isArray(j2) ? j2 : []);
      if (Array.isArray(arr2)) return arr2.map(normalizeUsuario);
    } catch {}

    // Variante 3: ?includeInactive=1 (en inglés)
    try {
      const r3 = await fetch(`${API_BASE_URL}/usuarios?includeInactive=1`, { headers });
      const j3 = await this.handleResponse<any>(r3);
      const arr3 = Array.isArray(j3?.data) ? j3.data : (Array.isArray(j3) ? j3 : []);
      if (Array.isArray(arr3)) return arr3.map(normalizeUsuario);
    } catch {}
  }

  // Fallback: endpoint base
  const r = await fetch(`${API_BASE_URL}/usuarios`, { headers });
  const j = await this.handleResponse<any>(r);
  const data = Array.isArray(j?.data) ? j.data : (Array.isArray(j) ? j : []);
  return data.map(normalizeUsuario);
}


 async createUsuario(data: CreateUsuarioData): Promise<Usuario> {
  // ⚠️ EL BACKEND SOLO ACEPTA ESTOS 4 CAMPOS EXACTOS
  const payload = {
    email: data.email,
    password: data.password || 'TempPass123!', // asegúrate que cumpla la policy
    nombre: `${data.nombre} ${data.apellido}`.trim(),
    rol: data.rol, // 'usuario' | 'admin' tal cual, SIN mapear a 'user'
  };

  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: getAuthHeaders(), // no molesta si se envía auth
    body: JSON.stringify(payload),
  });

  // Si el backend devuelve error de validación, mostrémoslo tal cual
  const contentType = res.headers.get('content-type') || '';
  let json: any = null;
  if (contentType.includes('application/json')) {
    try { json = await res.json(); } catch { /* ignore */ }
  }
  if (!res.ok) {
    const msg =
      json?.message ||
      json?.error ||
      `Error ${res.status}: ${res.statusText}`;
    throw new Error(msg);
  }

  // Algunos backends devuelven el user directo, otros {data: {...}}
  const raw = json?.data ?? json;

  // Normalizamos por si cambian nombres
  const created: Usuario = {
    id: Number(raw.id),
    nombre: raw.nombre ?? '',
    email: raw.email ?? payload.email,
    rol: raw.rol === 'admin' ? 'admin' : 'usuario' === raw.rol ? 'user' as any : (raw.rol ?? 'user'),
    // si el registro no devuelve activo, asumimos true (o ajusta según tu API)
    activo: typeof raw.activo === 'boolean' ? raw.activo : true,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };

  return created;
}


async updateUsuario(id: number, data: UpdateUsuarioData): Promise<Usuario> {
  const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const json = await this.handleResponse<any>(response);
  const raw = json?.data ?? json;
  return normalizeUsuario(raw);
}

  async deleteUsuario(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    await this.handleResponse<void>(response);
  }

 async toggleUsuarioStatus(id: number, activo: boolean): Promise<Usuario> {
  const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ activo }),
  });

  const json = await this.handleResponse<any>(response);
  const raw = json?.data ?? json;
  return normalizeUsuario(raw);
}

  async resetPassword(id: number): Promise<{ temporaryPassword: string }> {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}/reset-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    return this.handleResponse<{ temporaryPassword: string }>(response);
  }

  // =========== CAMBIO DE CONTRASEÑA ===========
  /**
   * Cambia la contraseña del usuario.
   * Intenta primero PATCH /usuarios/:id/password
   * Fallback a POST /auth/change-password si el primero no existe (404).
   *
   * Se envían ambos juegos de claves para máxima compatibilidad:
   * { currentPassword, newPassword } y { actual, nueva }
   */
  async changePassword(
    id: number,
    payload: { currentPassword: string; newPassword: string }
  ): Promise<{ success?: boolean; message?: string }> {
    // 1) Intento endpoint específico de usuarios
    try {
      const res = await fetch(`${API_BASE_URL}/usuarios/${id}/password`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          // nombres comunes
          currentPassword: payload.currentPassword,
          newPassword: payload.newPassword,
          // alias frecuentes en APIs en español
          actual: payload.currentPassword,
          nueva: payload.newPassword,
        }),
      });

      if (!res.ok) {
        // si es 404, probamos fallback
        if (res.status === 404) throw new Error('__FALLBACK__');
        const data = await res.json().catch(() => ({}));
        const msg = data?.message || data?.error || `Error ${res.status}`;
        throw new Error(msg);
      }

      return this.handleResponse<{ success?: boolean; message?: string }>(res);
    } catch (e: any) {
      if (e?.message !== '__FALLBACK__') throw e;
      // 2) Fallback endpoint global: /auth/change-password
      const res2 = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          currentPassword: payload.currentPassword,
          newPassword: payload.newPassword,
        }),
      });
      return this.handleResponse<{ success?: boolean; message?: string }>(res2);
    }
  }
}

export const usuarioService = new UsuarioService();
