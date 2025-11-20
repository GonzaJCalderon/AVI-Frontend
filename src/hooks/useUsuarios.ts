// hooks/useUsuarios.ts
import { useState, useEffect, useCallback } from 'react';
import { usuarioService, Usuario, CreateUsuarioData, UpdateUsuarioData } from '@/services/usuarioService';

// ---- NUEVO: hook para el usuario actual (perfil) ----
export type UsuarioMin = Pick<Usuario, 'id' | 'nombre' | 'email' | 'rol'>;
export const USER_STORAGE_KEY = 'user';

export const useUsuarioActual = () => {
  const [usuario, setUsuario] = useState<UsuarioMin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sólo del lado del cliente
    if (typeof window === 'undefined') return;

    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Fallbacks por si vienen con otro nombre de campo
        const u: UsuarioMin = {
          id: parsed.id ?? parsed.userId ?? undefined,
          nombre: parsed.nombre ?? parsed.name ?? '',
          email: parsed.email ?? '',
          rol: parsed.rol ?? parsed.role ?? '',
        };
        setUsuario(u);
      } else {
        setUsuario(null);
      }
    } catch {
      setUsuario(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { usuario, loading };
};

// ---- Hook existente para la lista de usuarios ----
// hooks/useUsuarios.ts
// interface UseUsuariosReturn {
interface UseUsuariosReturn {
  usuarios: Usuario[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  fetchUsuarios: () => Promise<void>;

  // ⬇️ antes: Promise<boolean>
  createUsuario: (
    data: CreateUsuarioData
  ) => Promise<{ ok: boolean; temporaryPassword?: string }>;

  // ⬇️ antes: Promise<boolean>
  updateUsuario: (id: number, data: UpdateUsuarioData) => Promise<boolean>;

  // ⬇️ antes: Promise<boolean>
  deleteUsuario: (id: number) => Promise<{ ok: boolean; message?: string }>;

  // ⬇️ antes: Promise<boolean>
  toggleUsuarioStatus: (id: number, activo: boolean) => Promise<boolean>;

  resetPassword: (id: number) => Promise<{ temporaryPassword: string } | null>;
  clearError: () => void;
}



export const useUsuarios = (): UseUsuariosReturn => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

 // hooks/useUsuarios.ts
const fetchUsuarios = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    // fetchUsuarios
const data = await usuarioService.getUsuarios(); // ✅

const visibles = (Array.isArray(data) ? data : []).filter((u) => {
  const eliminado = u.deleted === true || u.eliminado === true || !!u.deletedAt;
  const nombreVacio = String(u.nombre ?? '').trim() === '';
  const emailVacio = String(u.email ?? '').trim() === '';
  return !eliminado && !nombreVacio && !emailVacio;
});



    setUsuarios(visibles);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar usuarios';
    setError(errorMessage);
    setUsuarios([]);
    console.error('Error fetching usuarios:', err);
  } finally {
    setLoading(false);
  }
}, []);



// hooks/useUsuarios.ts
// hooks/useUsuarios.ts

const createUsuario = useCallback(async (
  data: CreateUsuarioData
): Promise<{ ok: boolean; temporaryPassword?: string }> => {
  setCreating(true);
  setError(null);
  try {
    const res = await usuarioService.createUsuario(data);
    if (res?.user && typeof res.user.id === 'number') {
      setUsuarios(prev => [...prev, res.user]);
    }
    await fetchUsuarios();
    return { ok: true, temporaryPassword: res.temporaryPassword };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido al crear usuario';
    setError(msg);                      // 👈 esto alimenta tu <Alert/ Snackbar/>
    console.error('Error creating usuario:', err);
    return { ok: false };
  } finally {
    setCreating(false);
  }
}, [fetchUsuarios]);





  const updateUsuario = useCallback(async (id: number, data: UpdateUsuarioData): Promise<boolean> => {
    setUpdating(true);
    setError(null);
    try {
      const updatedUsuario = await usuarioService.updateUsuario(id, data);
      if (updatedUsuario && updatedUsuario.id === id) {
        setUsuarios(prev => prev.map(u => (u.id === id ? updatedUsuario : u)));
        return true;
      } else {
        console.warn('Usuario actualizado no válido:', updatedUsuario);
        await fetchUsuarios();
        return true;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al actualizar usuario';
      setError(errorMessage);
      console.error('Error updating usuario:', err);
      return false;
    } finally {
      setUpdating(false);
    }
  }, [fetchUsuarios]);

// hooks/useUsuarios.ts
const deleteUsuario = useCallback(async (
  id: number
): Promise<{ ok: boolean; message?: string }> => {
  setDeleting(true);
  setError(null);
  try {
    const { success, message } = await usuarioService.deleteUsuario(id);
    if (success) {
      setUsuarios(prev => prev.filter(u => u.id !== id));
    }
    return { ok: success, message };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido al eliminar usuario';
    setError(msg);
    console.error('Error deleting usuario:', err);
    return { ok: false, message: msg };
  } finally {
    setDeleting(false);
  }
}, []);



  const toggleUsuarioStatus = useCallback(async (id: number, activo: boolean): Promise<boolean> => {
  setUpdating(true);
  setError(null);
  try {
    // ✅ Tomar el usuario actual de la lista para enviar campos requeridos
    const current = usuarios.find(u => u.id === id);
    const payload: UpdateUsuarioData = {
      activo,
      ...(current?.nombre ? { nombre: current.nombre } : {}),
      ...(current?.email ? { email: current.email } : {}),
      ...(current?.rol ? { rol: current.rol } : {}),
    };

    // ✅ Usar updateUsuario (más flexible) en vez de toggleUsuarioStatus directo
    const updatedUsuario = await usuarioService.updateUsuario(id, payload);

    if (!updatedUsuario || typeof updatedUsuario.id !== 'number') {
      throw new Error('Usuario actualizado no válido');
    }

    setUsuarios(prev => prev.map(u => (u.id === id ? updatedUsuario : u)));
    return true;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cambiar estado del usuario';
    setError(errorMessage);
    console.error('Error toggling usuario status:', err);
    return false;
  } finally {
    setUpdating(false);
  }
}, [usuarios]);


  const resetPassword = useCallback(async (id: number): Promise<{ temporaryPassword: string } | null> => {
    setUpdating(true);
    setError(null);
    try {
      const result = await usuarioService.resetPassword(id);
      return result ?? null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al reiniciar contraseña';
      setError(errorMessage);
      console.error('Error resetting password:', err);
      return null;
    } finally {
      setUpdating(false);
    }
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  useEffect(() => {
    console.log('Hook: Lista de usuarios cambió:', usuarios.length, usuarios);
  }, [usuarios]);

  return {
    usuarios,
    loading,
    error,
    creating,
    updating,
    deleting,
    fetchUsuarios,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    toggleUsuarioStatus,
    resetPassword,
    clearError,
  };
};
