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
interface UseUsuariosReturn {
  usuarios: Usuario[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  fetchUsuarios: () => Promise<void>;
  createUsuario: (data: CreateUsuarioData) => Promise<boolean>;
  updateUsuario: (id: number, data: UpdateUsuarioData) => Promise<boolean>;
  deleteUsuario: (id: number) => Promise<boolean>;
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

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usuarioService.getUsuarios();
      if (Array.isArray(data)) {
        setUsuarios(data);
      } else {
        console.warn('La respuesta no es un array:', data);
        setUsuarios([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar usuarios';
      setError(errorMessage);
      console.error('Error fetching usuarios:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUsuario = useCallback(async (data: CreateUsuarioData): Promise<boolean> => {
    setCreating(true);
    setError(null);
    try {
      const newUsuario = await usuarioService.createUsuario(data);
      if (newUsuario && typeof newUsuario.id === 'number') {
        setUsuarios(prev => [...prev, newUsuario]);
        return true;
      } else {
        console.warn('Usuario creado no válido:', newUsuario);
        await fetchUsuarios();
        return true;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al crear usuario';
      setError(errorMessage);
      console.error('Error creating usuario:', err);
      return false;
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

  const deleteUsuario = useCallback(async (id: number): Promise<boolean> => {
    setDeleting(true);
    setError(null);
    try {
      await usuarioService.deleteUsuario(id);
      setUsuarios(prev => prev.filter(u => u.id !== id));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al eliminar usuario';
      setError(errorMessage);
      console.error('Error deleting usuario:', err);
      return false;
    } finally {
      setDeleting(false);
    }
  }, []);

  const toggleUsuarioStatus = useCallback(async (id: number, activo: boolean): Promise<boolean> => {
    setUpdating(true);
    setError(null);
    try {
      const updatedUsuario = await usuarioService.toggleUsuarioStatus(id, activo);
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
  }, []);

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
