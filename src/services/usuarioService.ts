// services/usuarioService.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://10.100.1.80:3333/api';

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
  // si tu backend acepta password aquí, podrías agregarlo: password?: string;
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
  async getUsuarios(): Promise<Usuario[]> {
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      headers: getAuthHeaders(),
    });

    // Esperamos { success: boolean; data: Usuario[] }
    const json = await this.handleResponse<{ success?: boolean; data?: Usuario[] }>(response);

    if (Array.isArray(json?.data)) {
      return json.data;
    } else if (Array.isArray(json)) {
      // por si el backend devuelve directamente el array
      return json as unknown as Usuario[];
    } else {
      console.warn('Formato inesperado en la respuesta de getUsuarios:', json);
      return [];
    }
  }

  async createUsuario(data: CreateUsuarioData): Promise<Usuario> {
    const payload = {
      email: data.email,
      password: data.password || 'TempPass123!',
      nombre: `${data.nombre} ${data.apellido}`,
      rol: data.rol === 'usuario' ? 'user' : 'admin',
    };

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    return this.handleResponse<Usuario>(response);
  }

  async updateUsuario(id: number, data: UpdateUsuarioData): Promise<Usuario> {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<Usuario>(response);
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

    return this.handleResponse<Usuario>(response);
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
