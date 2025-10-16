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
  Pagination,
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
import TablaUsuarios from '@/components/TablaUsuarios'
import { usuarioService } from '@/services/usuarioService'


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

  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [pagina, setPagina] = useState(1)
  const USUARIOS_POR_PAGINA = 10

  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activos' | 'bloqueados'>('todos')

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
        setRefreshTrigger(prev => prev + 1)
        
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
      setNotification({ open: true, message: 'No puedes eliminar un usuario administrador', severity: 'error' })
      return
    }
    if (!confirm('¿Eliminar este usuario definitivamente?')) return

    const res = await deleteUsuario(id)
    if (res.ok) {
      setNotification({ open: true, message: res.message || 'Usuario eliminado correctamente', severity: 'success' })
      await fetchUsuarios()
      setRefreshTrigger(prev => prev + 1)
    } else {
      setNotification({ open: true, message: res.message || 'Error al eliminar usuario', severity: 'error' })
    }
  }

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
      await usuarioService.enviarResetPasswordEmail(user.email)
      setNotification({
        open: true,
        message: `Se envió un email de restablecimiento a ${user.email}`,
        severity: 'success',
      })
    } catch (error: any) {
      console.error('Error al enviar email de restablecimiento:', error)
      setNotification({
        open: true,
        message: error.message || 'Error al enviar el correo',
        severity: 'error',
      })
    }
  }

  const usuariosFiltrados = usuarios
    .filter(u => `${u.nombre} ${u.email}`.toLowerCase().includes(busqueda.toLowerCase()))
    .filter(u => {
      if (filtroEstado === 'activos') return u.activo
      if (filtroEstado === 'bloqueados') return !u.activo
      return true
    })

  const totalPaginas = Math.ceil(usuariosFiltrados.length / USUARIOS_POR_PAGINA)

  const usuariosPaginados = usuariosFiltrados.slice(
    (pagina - 1) * USUARIOS_POR_PAGINA,
    pagina * USUARIOS_POR_PAGINA
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

  const handleCambiarPagina = (event: React.ChangeEvent<unknown>, value: number) => {
    setPagina(value)
  }

  useEffect(() => {
    const rawUser = localStorage.getItem('user')
    const user = rawUser ? JSON.parse(rawUser) : null

    if (!user || user.rol !== 'admin') {
      alert('Acceso denegado. Solo administradores pueden acceder.')
      router.push('/inicio')
    }
  }, [])

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

          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} flex={1} maxWidth={{ md: '60%' }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Buscar por nombre o correo"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value)
                setPagina(1) // Volver a página 1 al buscar
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <Box display="flex" alignItems="center" gap={1} whiteSpace="nowrap">
              <Typography variant="body2">Estado:</Typography>
              <Select
                size="small"
                value={filtroEstado}
                onChange={(e) => {
                  setFiltroEstado(e.target.value as 'todos' | 'activos' | 'bloqueados')
                  setPagina(1)
                }}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="activos">Activos</MenuItem>
                <MenuItem value="bloqueados">Bloqueados</MenuItem>
              </Select>
            </Box>
          </Box>
        </Box>

        <TablaUsuarios
          usuarios={usuariosPaginados}
          busqueda={busqueda}
          editandoId={editandoId}
          editForm={editForm}
          onEdit={handleEditar}
          onCancel={cancelarEdicion}
          onSave={guardarCambios}
          onDelete={(id) => eliminarUsuario(id, 'user')}
          onToggleActivo={(id) => {
            const user = usuarios.find(u => u.id === id)
            if (user) toggleActivo(id, user.activo)
          }}
          onResetPassword={reiniciarPassword}
          onBusquedaChange={setBusqueda}
          onEditFormChange={setEditForm}
        />

        {usuariosFiltrados.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              No se encontraron usuarios que coincidan con la búsqueda.
            </Typography>
          </Box>
        )}

        {/* ✅ PAGINACIÓN */}
        {usuariosFiltrados.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 3,
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Mostrando {(pagina - 1) * USUARIOS_POR_PAGINA + 1} -{' '}
              {Math.min(pagina * USUARIOS_POR_PAGINA, usuariosFiltrados.length)} de{' '}
              {usuariosFiltrados.length} usuarios
            </Typography>

            <Pagination
              count={totalPaginas}
              page={pagina}
              onChange={handleCambiarPagina}
              color="primary"
              showFirstButton
              showLastButton
              siblingCount={1}
              boundaryCount={1}
            />
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