'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Select,
  MenuItem,
  TextField,
  Chip,
  InputAdornment,
  TableContainer,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material'

import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import LockIcon from '@mui/icons-material/Lock'
import LockResetIcon from '@mui/icons-material/LockReset'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import SearchIcon from '@mui/icons-material/Search'
import LockOpenIcon from '@mui/icons-material/LockOpen'

import FormularioCrearUsuario from '@/components/FormularioCrearUsuario'
import { useUsuarios } from '@/hooks/useUsuarios'
import { Usuario } from '@/services/usuarioService'

export default function AdminUsuariosPage() {
  const router = useRouter();

  const {
    usuarios,
    fetchUsuarios,
    updating,
    deleting,
    updateUsuario,
    deleteUsuario,
    toggleUsuarioStatus,
    resetPassword,
    error,
    clearError,
  } = useUsuarios()

  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<{ nombre: string; email: string; rol: 'admin' | 'user' }>({
    nombre: '',
    email: '',
    rol: 'user',
  })

  const [busqueda, setBusqueda] = useState('')
  const [notification, setNotification] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error'
  }>({ open: false, message: '', severity: 'success' })

  // Forzar re-render cuando usuarios cambie
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleEditar = (user: Usuario) => {
    setEditandoId(user.id)
    setEditForm({ nombre: user.nombre, email: user.email, rol: user.rol })
  }

  const cancelarEdicion = () => {
    setEditandoId(null)
    setEditForm({ nombre: '', email: '', rol: 'user' })
  }

  const guardarCambios = async (id: number) => {
    try {
      const success = await updateUsuario(id, editForm)
      if (success) {
        setNotification({ open: true, message: 'Usuario actualizado exitosamente', severity: 'success' })
        setEditandoId(null)
        setEditForm({ nombre: '', email: '', rol: 'user' })
        
        // Forzar actualización visual
        setRefreshTrigger(prev => prev + 1)
        
        // Opcional: recargar lista completa para garantizar sincronización
        setTimeout(() => {
          fetchUsuarios()
        }, 100)
        
      } else {
        setNotification({ open: true, message: 'Error al actualizar usuario', severity: 'error' })
      }
    } catch (error) {
      console.error('Error guardando cambios:', error)
      setNotification({ open: true, message: 'Error inesperado al actualizar', severity: 'error' })
    }
  }

  const eliminarUsuario = async (id: number, rol: string) => {
  if (rol === 'admin') {
    setNotification({ open: true, message: 'No puedes eliminar un usuario administrador', severity: 'error' });
    return;
  }
  if (!confirm('¿Eliminar este usuario definitivamente?')) return;

  const res = await deleteUsuario(id);   // ahora devuelve { ok, message }
  if (res.ok) {
    setNotification({ open: true, message: res.message || 'Usuario eliminado correctamente', severity: 'success' });
    await fetchUsuarios();               // ⬅️ IMPORTANTE: volver a leer del backend
    setRefreshTrigger(prev => prev + 1);
  } else {
    setNotification({ open: true, message: res.message || 'Error al eliminar usuario', severity: 'error' });
  }
};


  const toggleActivo = async (id: number | undefined, activo: boolean) => {
    if (!id) {
      console.error('toggleActivo fue llamado con id undefined')
      return
    }

    const success = await toggleUsuarioStatus(id, !activo)
    if (success) {
      setNotification({
        open: true,
        message: `Usuario ${!activo ? 'activado' : 'bloqueado'} exitosamente`,
        severity: 'success',
      })
      setRefreshTrigger(prev => prev + 1)
    }
  }

  const reiniciarPassword = async (user: Usuario) => {
    try {
      const result = await resetPassword(user.id)
      if (result?.temporaryPassword) {
        alert(`Nueva contraseña para ${user.email}: ${result.temporaryPassword}`)
        setNotification({ 
          open: true, 
          message: 'Contraseña reiniciada exitosamente', 
          severity: 'success' 
        })
      } else {
        setNotification({ open: true, message: 'Error al reiniciar contraseña', severity: 'error' })
      }
    } catch (error) {
      console.error('Error reiniciando contraseña:', error)
      setNotification({ open: true, message: 'Error al reiniciar contraseña', severity: 'error' })
    }
  }

  const usuariosFiltrados = usuarios.filter((u) =>
    `${u.nombre} ${u.email}`.toLowerCase().includes(busqueda.toLowerCase())
  )
const handleUserCreated = (tempPassword?: string) => {
  setNotification({
    open: true,
    message: tempPassword
      ? `Usuario creado. Contraseña temporal: ${tempPassword}`
      : 'Usuario creado exitosamente',
    severity: 'success',
  })
  fetchUsuarios()
  setRefreshTrigger(prev => prev + 1)
}

  useEffect(() => {
  const rawUser = localStorage.getItem('user')
  const user = rawUser ? JSON.parse(rawUser) : null

  if (!user || user.rol !== 'admin') {
    alert('Acceso denegado. Solo administradores pueden acceder.')
    router.push('/inicio') // O la ruta segura que uses
  }
}, [])


  // Efecto para detectar cambios en usuarios
  useEffect(() => {
    console.log('Lista de usuarios actualizada:', usuarios.length)
  }, [usuarios, refreshTrigger])
  

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Panel de administración de usuarios
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      <Box mb={4}>
        <FormularioCrearUsuario onUserCreated={handleUserCreated} />
      </Box>

      <Paper sx={{ p: 4 }}>
        <Box
          display="flex"
          flexDirection={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', md: 'center' }}
          gap={2}
          mb={2}
        >
          <Typography variant="h6" fontWeight="bold">
            Lista de usuarios ({usuariosFiltrados.length})
          </Typography>

          <TextField
            size="small"
            fullWidth
            placeholder="Buscar por nombre o correo"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <TableContainer>
          <Table key={refreshTrigger}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usuariosFiltrados
                .filter((user) => typeof user.id === 'number' && !isNaN(user.id))
                .map((user) => (
                  <TableRow key={`${user.id}-${refreshTrigger}`}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>
                      {editandoId === user.id ? (
                        <TextField
                          size="small"
                          value={editForm.nombre}
                          onChange={(e) =>
                            setEditForm({ ...editForm, nombre: e.target.value })
                          }
                          autoFocus
                        />
                      ) : (
                        user.nombre
                      )}
                    </TableCell>
                    <TableCell>
                      {editandoId === user.id ? (
                        <TextField
                          size="small"
                          type="email"
                          value={editForm.email}
                          onChange={(e) =>
                            setEditForm({ ...editForm, email: e.target.value })
                          }
                        />
                      ) : (
                        user.email
                      )}
                    </TableCell>
                    <TableCell>
                      {editandoId === user.id ? (
                        <Select
                          size="small"
                          value={editForm.rol}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              rol: e.target.value as 'admin' | 'user',
                            })
                          }
                        >
                          <MenuItem value="admin">Admin</MenuItem>
                          <MenuItem value="user">Usuario</MenuItem>
                        </Select>
                      ) : (
                        <Chip 
                          label={user.rol === 'admin' ? 'Admin' : 'Usuario'}
                          color={user.rol === 'admin' ? 'secondary' : 'default'}
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {user.activo ? (
                        <Chip label="Activo" color="success" size="small" />
                      ) : (
                        <Chip label="Bloqueado" color="error" size="small" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {editandoId === user.id ? (
                        <>
                          <Tooltip title="Guardar cambios">
                            <IconButton 
                              onClick={() => guardarCambios(user.id)}
                              disabled={updating}
                              color="success"
                            >
                              {updating ? (
                                <CircularProgress size={20} />
                              ) : (
                                <SaveIcon />
                              )}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancelar edición">
                            <IconButton 
                              onClick={cancelarEdicion}
                              disabled={updating}
                              color="warning"
                            >
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <>
                          <Tooltip title="Editar usuario">
                            <IconButton onClick={() => handleEditar(user)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={user.activo ? 'Bloquear usuario' : 'Activar usuario'}>
                            <IconButton
                              onClick={() => toggleActivo(user.id, user.activo)}
                              disabled={updating}
                            >
                              {user.activo ? (
                                <LockIcon color="warning" />
                              ) : (
                                <LockOpenIcon color="success" />
                              )}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reiniciar contraseña">
                            <IconButton 
                              onClick={() => reiniciarPassword(user)}
                              disabled={updating}
                            >
                              <LockResetIcon color="primary" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip
                            title={
                              user.rol === 'admin'
                                ? 'No puedes eliminar a un admin'
                                : 'Eliminar usuario'
                            }
                          >
                            <span>
                              <IconButton
                                onClick={() => eliminarUsuario(user.id, user.rol)}
                                disabled={user.rol === 'admin' || deleting}
                                color="error"
                              >
                                {deleting ? (
                                  <CircularProgress size={20} />
                                ) : (
                                  <DeleteIcon />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        {usuariosFiltrados.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              No se encontraron usuarios que coincidan con la búsqueda.
            </Typography>
          </Box>
        )}
      </Paper>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={notification.severity}
          onClose={() => setNotification({ ...notification, open: false })}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}