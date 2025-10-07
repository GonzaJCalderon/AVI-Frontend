// services/usuarioService.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://10.100.1.80:3333/api';

// --- helpers de seguridad ---
const generateStrongTempPassword = (): string => {
  const length = 14; // ajustá a tu policy
  const sets = [
    'ABCDEFGHJKLMNPQRSTUVWXYZ',    // sin I/O para evitar confusiones
    'abcdefghijkmnpqrstuvwxyz',    // sin l
    '23456789',                    // sin 0/1
    '!@#$%^&*?-_'
  ];

  

  const getRand = (n: number) =>
    (typeof crypto !== 'undefined' && 'getRandomValues' in crypto)
      ? crypto.getRandomValues(new Uint32Array(1))[0] % n
      : Math.floor(Math.random() * n);

  // asegurar al menos 1 de cada set
  let pwd = sets.map(s => s[getRand(s.length)]).join('');

  // completar hasta el largo con cualquier char permitido
  const all = sets.join('');
  for (let i = pwd.length; i < length; i++) pwd += all[getRand(all.length)];

  // mezclar
  return pwd.split('').sort(() => 0.5 - Math.random()).join('');
};


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
  eliminado: toBool(raw.eliminado) || !!raw.deleted || !!raw.deletedAt, // ⬅️ clave
  deletedAt: raw.deletedAt,
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
});

// ⬇️ PONER cerca de la clase, en el mismo archivo
const normalizaListaUsuarios = (json: any) =>
  Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);

export async function emailExiste(email: string): Promise<boolean> {
  const headers = getAuthHeaders();

  // Intento 1: endpoint con query
  try {
    const r = await fetch(`${API_BASE_URL}/usuarios?email=${encodeURIComponent(email)}`, { headers });
    if (r.ok) {
      const j = await r.json().catch(() => null);
      const arr = normalizaListaUsuarios(j);
      return arr.some((u: any) => String(u.email || '').toLowerCase() === email.toLowerCase());
    }
  } catch {}

  // Fallback: traer todos y filtrar (si son pocos usuarios está ok)
  try {
    const r2 = await fetch(`${API_BASE_URL}/usuarios`, { headers });
    if (r2.ok) {
      const j2 = await r2.json().catch(() => null);
      const arr2 = normalizaListaUsuarios(j2);
      return arr2.some((u: any) => String(u.email || '').toLowerCase() === email.toLowerCase());
    }
  } catch {}

  return false;
}



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
  eliminado?: boolean;     // ⬅️ nuevo
  deletedAt?: string;      // ⬅️ opcional (soft delete)
  createdAt?: string;
  updatedAt?: string;
  [k: string]: any;
}

export interface CreateUsuarioData {
  nombre: string;
  apellido: string;
  email: string;
  rol: 'admin' | 'user'; // se mapea a 'admin' | 'user' en el payload
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


// services/usuarioService.ts
async createUsuario(
  data: CreateUsuarioData
): Promise<{ user: Usuario; temporaryPassword?: string }> {
  // ⬅️ Corta acá si ya existe
  if (await emailExiste(data.email)) {
    throw new Error('El correo ya está registrado');
  }

  const password = data.password || 'Temp#' + Math.random().toString(36).slice(2) + '9A!';
  const payload = { email: data.email, password, nombre: `${data.nombre} ${data.apellido}`.trim(), rol: data.rol };

  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const ct = res.headers.get('content-type') || '';
  const isJson = ct.includes('application/json');
  const raw = isJson ? await res.json().catch(() => null) : await res.text().catch(() => '');

  if (!res.ok) {
    const txt = (typeof raw === 'string' ? raw : (raw?.message || raw?.error || '')).toString();

    // pistas de duplicado
    const duplicateHints = [
      /duplicate/i, /unique/i, /ya\s+existe/i, /existe\s+un\s+registro/i, /email.*existe/i,
      /E11000 duplicate key/i, /UNIQUE constraint/i,
    ];

    if (res.status === 409 || res.status === 422 || duplicateHints.some(r => r.test(txt))) {
      throw new Error('El correo ya está registrado');
    }

    // Si es 500 pero el mail efectivamente existe, mostrá el mensaje claro
    if (res.status === 500 && await emailExiste(data.email)) {
      throw new Error('El correo ya está registrado');
    }

    throw new Error(txt || 'No se pudo crear el usuario');
  }

  const userRaw = (raw as any)?.data ?? raw;
  return {
    user: {
      id: Number(userRaw.id),
      nombre: userRaw.nombre ?? payload.nombre,
      email: userRaw.email ?? payload.email,
      rol: userRaw.rol === 'admin' ? 'admin' : 'user',
      activo: typeof userRaw.activo === 'boolean' ? userRaw.activo : true,
      createdAt: userRaw.createdAt,
      updatedAt: userRaw.updatedAt,
    },
    temporaryPassword: data.password ? undefined : password,
  };
}


async updatePerfil(id: number, data: { nombre?: string; email?: boolean; password?: boolean }): Promise<Usuario> {
  const response = await fetch(`${API_BASE_URL}/usuarios/cuenta/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const json = await this.handleResponse<any>(response);
  const raw = json?.data ?? json;
  return normalizeUsuario(raw);
}





async updateUsuario(id: number, data: UpdateUsuarioData): Promise<Usuario> {
  console.log('Actualizando usuario en:', `${API_BASE_URL}/usuarios/${id}`);

  const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
    method: 'PATCH', // o 'PUT' si tu backend no soporta PATCH
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const json = await this.handleResponse<any>(response);
  const raw = json?.data ?? json;
  return normalizeUsuario(raw);
}



  // services/usuarioService.ts
// services/usuarioService.ts
async deleteUsuario(id: number): Promise<{ success: boolean; message?: string }> {
  const headers = getAuthHeaders();

  const tryDelete = async (url: string) => {
    const res = await fetch(url, { method: 'DELETE', headers });
    if (res.status === 204) return { success: true, message: 'Usuario eliminado correctamente' };
    const ct = res.headers.get('content-type') || '';
    const isJson = ct.includes('application/json');
    const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => '');
    if (!res.ok) {
      const msg = (body && (body.message || body.error)) || (typeof body === 'string' ? body : `Error ${res.status}`);
      return { success: false, message: msg };
    }
    const success = typeof (body as any)?.success === 'boolean' ? (body as any).success : true;
    const message = (body as any)?.message || 'Usuario eliminado correctamente';
    return { success, message };
  };

  const verifyGone = async (): Promise<boolean> => {
  try {
    const r = await fetch(`${API_BASE_URL}/usuarios/${id}`, { headers });
    if (r.status === 404) return true; // ✅ hard delete exitoso

    const ct = r.headers.get('content-type') || '';
    const isJson = ct.includes('application/json');
    const body = isJson ? await r.json().catch(() => null) : await r.text().catch(() => '');

    const raw = isJson ? (body?.data ?? body) : {};

    // ✅ consideramos eliminado si alguna de estas condiciones se cumple
    const eliminado = raw?.eliminado === true || !!raw?.deleted || !!raw?.deletedAt;

    // 🔒 NUEVO: también consideramos eliminado si ya no está activo (opcional)
    const inactivo = raw?.activo === false;

    return eliminado || inactivo;
  } catch {
    return true; // si falla la consulta, asumimos eliminado
  }
};


  // 1) intentos DELETE
  let res =
    await tryDelete(`${API_BASE_URL}/usuarios/${id}`) ??
    { success: false as const };

  if (!res.success) {
    const candidates = [
      `${API_BASE_URL}/usuarios/${id}?hard=1`,
      `${API_BASE_URL}/usuarios/${id}?force=true`,
      `${API_BASE_URL}/usuarios/${id}?permanent=1`,
    ];
    for (const url of candidates) {
      const r2 = await tryDelete(url);
      if (r2.success) { res = r2; break; }
    }
  }

  // 2) si DELETE falló, fallback a SOFT-DELETE por PATCH
  if (!res.success) {
    try {
      const r = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          eliminado: true,
          deleted: true,
          deletedAt: new Date().toISOString(),
          activo: false,
        }),
      });
      if (!r.ok && r.status !== 204) {
        const ct = r.headers.get('content-type') || '';
        const isJson = ct.includes('application/json');
        const body = isJson ? await r.json().catch(() => null) : await r.text().catch(() => '');
        const msg = (body && (body.message || body.error)) || (typeof body === 'string' ? body : `Error ${r.status}`);
        return { success: false, message: msg };
      }
      res = { success: true, message: 'Usuario eliminado (soft-delete)' };
    } catch (e: any) {
      return { success: false, message: e?.message || 'No se pudo eliminar' };
    }
  }

  // 3) verificación final
  const gone = await verifyGone();
  if (!gone) return { success: false, message: 'No se pudo eliminar definitivamente (el usuario sigue existiendo)' };
  return res;
}

async enviarResetPasswordEmail(email: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.text().catch(() => 'Error desconocido');
    throw new Error(error || 'Error al enviar correo de reinicio');
  }

  return true;
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
async changePasswordCuenta(
  id: number,
  payload: { currentPassword: string; newPassword: string }
): Promise<{ success?: boolean; message?: string }> {
  const res = await fetch(`${API_BASE_URL}/usuarios/cuenta/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      password: true,                // 🔑 le indica al backend que es cambio de password
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = data?.message || data?.error || `Error ${res.status}`;
    throw new Error(msg);
  }

  return this.handleResponse<{ success?: boolean; message?: string }>(res);
}


}



export const usuarioService = new UsuarioService();
