'use client'

import {
  Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Select, MenuItem, TextField, Chip,
  Tooltip, TableContainer, Typography, Box
} from '@mui/material'

import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon
} from '@mui/icons-material'

import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import LockResetIcon from '@mui/icons-material/LockReset'

import { Usuario } from '@/services/usuarioService'

type Props = {
  usuarios: Usuario[]
  busqueda: string
  editandoId: number | null
  editForm: { nombre: string; email: string; rol: 'admin' | 'user' }
  onEdit: (user: Usuario) => void
  onCancel: () => void
  onSave: (id: number) => void
  onDelete: (id: number) => void
  onToggleActivo: (id: number) => void
  onResetPassword: (user: Usuario) => void
  onBusquedaChange: (value: string) => void
  onEditFormChange: (form: { nombre: string; email: string; rol: 'admin' | 'user' }) => void
}

export default function TablaUsuarios({
  usuarios,
  busqueda,
  editandoId,
  editForm,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  onToggleActivo,
  onResetPassword,
  onBusquedaChange,
  onEditFormChange
}: Props) {
  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" mb={2}>
        Lista de usuarios
      </Typography>

      <TableContainer>
        <Table>
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
            {usuarios.map((user: Usuario) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>

                <TableCell>
                  {editandoId === user.id ? (
                    <TextField
                      size="small"
                      value={editForm.nombre}
                      onChange={(e) =>
                        onEditFormChange({ ...editForm, nombre: e.target.value })
                      }
                    />
                  ) : user.nombre}
                </TableCell>

                <TableCell>
                  {editandoId === user.id ? (
                    <TextField
                      size="small"
                      value={editForm.email}
                      onChange={(e) =>
                        onEditFormChange({ ...editForm, email: e.target.value })
                      }
                    />
                  ) : user.email}
                </TableCell>

                <TableCell>
                  {editandoId === user.id ? (
                    <Select
                      value={editForm.rol}
                      size="small"
                      onChange={(e) =>
                        onEditFormChange({
                          ...editForm,
                          rol: e.target.value as 'admin' | 'user',
                        })
                      }
                    >
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="user">Usuario</MenuItem>
                    </Select>
                  ) : (
                    user.rol
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
                        <IconButton onClick={() => onSave(user.id)}>
                          <SaveIcon color="primary" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Cancelar">
                        <IconButton onClick={onCancel}>
                          <CancelIcon color="inherit" />
                        </IconButton>
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      <Tooltip title="Editar usuario">
                        <IconButton onClick={() => onEdit(user)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={user.activo ? 'Bloquear usuario' : 'Desbloquear usuario'}>
                        <IconButton onClick={() => onToggleActivo(user.id)}>
                          {user.activo ? (
                            <LockIcon color="warning" />
                          ) : (
                            <LockOpenIcon color="success" />
                          )}
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Reiniciar contraseña">
                        <IconButton onClick={() => onResetPassword(user)}>
                          <LockResetIcon />
                        </IconButton>
                      </Tooltip>

                      {/* <Tooltip title="Eliminar usuario">
                        <IconButton
                          onClick={() => onDelete(user.id)}
                          disabled={user.rol === 'admin'}
                        >
                          <DeleteIcon
                            color={user.rol === 'admin' ? 'disabled' : 'error'}
                          />
                        </IconButton>
                      </Tooltip> */}
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {usuarios.length === 0 && (
        <Typography mt={3} textAlign="center">
          No se encontraron usuarios.
        </Typography>
      )}
    </Box>
  )
}
