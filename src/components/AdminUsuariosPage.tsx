'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useUsuarioActual } from '@/hooks/useUsuarios';
import { useRouter } from 'next/navigation';
import TablaUsuarios from '@/components/TablaUsuarios';
import { Usuario } from '@/components/types';
import { logger } from '@/lib/logger';

export default function AdminUsuariosPage() {
  const router = useRouter();

  // ✅ Hook para saber el usuario logueado
  const { usuario, loading } = useUsuarioActual();

  /** ==========================
   *  Estado de usuarios
   *  ========================== */
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  // ✅ editForm ahora respeta el tipo 'user' | 'admin'
  const [editForm, setEditForm] = useState<{
    nombre: string;
    email: string;
    rol: 'user' | 'admin';
  }>({
    nombre: '',
    email: '',
    rol: 'user',
  });

  const [busqueda, setBusqueda] = useState('');

  /** ==========================
   *  Redirección por permisos
   *  ========================== */
  useEffect(() => {
    if (loading) return;
    if (!usuario || !usuario.rol) {
      logger.info('Usuario sin sesión, redirigiendo a login');
      router.push('/login');
      return;
    }
    if (usuario.rol !== 'admin') {
      logger.info('Usuario sin permisos de admin, redirigiendo a /usuario', {
        rol: usuario.rol,
      });
      router.push('/usuario');
    }
  }, [usuario, loading, router]);

  /** ==========================
   *  Datos mock iniciales
   *  ========================== */
  useEffect(() => {
    const mock: Usuario[] = [
      {
        id: 1,
        nombre: 'Juan Pérez',
        email: 'juan@correo.com',
        rol: 'admin',
        activo: true,
      },
      {
        id: 2,
        nombre: 'Ana López',
        email: 'ana@correo.com',
        rol: 'user',
        activo: false,
      },
    ];
    setUsuarios(mock);
    logger.info('Usuarios mock cargados', { cantidad: mock.length });
  }, []);

  /** ==========================
   *  Funciones CRUD
   *  ========================== */
  const handleEditar = (user: Usuario) => {
    logger.info('Editando usuario', { id: user.id, email: user.email });
    setEditandoId(user.id);
    setEditForm({
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
    });
  };

  const cancelarEdicion = () => {
    logger.info('Edición cancelada');
    setEditandoId(null);
  };

  const guardarCambios = (id: number) => {
    setUsuarios((prev: Usuario[]) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              ...editForm,
            }
          : u
      )
    );
    logger.info('Cambios guardados en usuario', { id, ...editForm });
    setEditandoId(null);
  };

  const eliminarUsuario = (id: number) => {
    const user = usuarios.find((u) => u.id === id);
    if (user?.rol === 'admin') {
      logger.info('Intento bloqueado de eliminar usuario admin', { id });
      alert('❌ No puedes eliminar un usuario con rol de administrador.');
      return;
    }
    if (!confirm('¿Eliminar este usuario?')) return;

    setUsuarios((prev) => prev.filter((u) => u.id !== id));
    logger.info('Usuario eliminado', { id });
  };

  const toggleActivo = (id: number) => {
    setUsuarios((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, activo: !u.activo } : u
      )
    );
    logger.info('Estado activo cambiado', { id });
  };

  const reiniciarPassword = (user: Usuario) => {
    alert(`🔐 Se ha bloqueado la contraseña para: ${user.email}`);
    logger.info('Password reseteada (mock)', { email: user.email });
  };

  /** ==========================
   *  Render
   *  ========================== */
  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Panel de administración de usuarios
        </Typography>

        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => {
            logger.info('Redirigiendo a creación de usuario');
            router.push('/admin/crear-usuario');
          }}
        >
          ➕ Crear nuevo usuario
        </Button>
      </Paper>

      <TablaUsuarios
        usuarios={usuarios}
        busqueda={busqueda}
        editandoId={editandoId}
        editForm={editForm}
        onEdit={handleEditar}
        onCancel={cancelarEdicion}
        onSave={guardarCambios}
        onDelete={eliminarUsuario}
        onToggleActivo={toggleActivo}
        onResetPassword={reiniciarPassword}
        onBusquedaChange={setBusqueda}
        onEditFormChange={setEditForm}
      />
    </Box>
  );
}
