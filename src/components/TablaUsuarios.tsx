'use client'

import {
  Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Select, MenuItem, TextField, Chip,
  Tooltip, InputAdornment, TableContainer, Typography, Box, Button
} from '@mui/material'

import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Search as SearchIcon
} from '@mui/icons-material'

import { Usuario } from './types'

type Props = {
  usuarios: Usuario[]
  busqueda: string
  editandoId: number | null
  editForm: { nombre: string; email: string; rol: string }
  onEdit: (user: Usuario) => void
  onCancel: () => void
  onSave: (id: number) => void
  onDelete: (id: number) => void
  onToggleActivo: (id: number) => void
  onResetPassword: (user: Usuario) => void
  onBusquedaChange: (value: string) => void
  onEditFormChange: (form: { nombre: string; email: string; rol: string }) => void
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
  const usuariosFiltrados = usuarios.filter(u =>
    `${u.nombre} ${u.email}`.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <Box>
      <Box
        display="flex"
        flexDirection={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems="center"
        gap={2}
        mb={2}
      >
        <Typography variant="h6" fontWeight="bold">
          Lista de usuarios
        </Typography>
        <TextField
          size="small"
          placeholder="Buscar por nombre o correo"
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
      </Box>

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
            {usuariosFiltrados.map(user => (
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
                        onEditFormChange({ ...editForm, rol: e.target.value })
                      }
                    >
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="user">Usuario</MenuItem>
                    </Select>
                  ) : user.rol}
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
                    <Button size="small" onClick={() => onSave(user.id)}>
                      Guardar
                    </Button>
                  ) : (
                    <IconButton onClick={() => onEdit(user)}>
                      <EditIcon />
                    </IconButton>
                  )}
                  <IconButton onClick={() => onToggleActivo(user.id)}>
                    {user.activo ? (
                      <LockIcon color="warning" />
                    ) : (
                      <LockOpenIcon color="success" />
                    )}
                  </IconButton>
                  <IconButton onClick={() => onResetPassword(user)}>
                    🔐
                  </IconButton>
                  <IconButton
                    onClick={() => onDelete(user.id)}
                    disabled={user.rol === 'admin'}
                  >
                    <DeleteIcon color={user.rol === 'admin' ? 'disabled' : 'error'} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {usuariosFiltrados.length === 0 && (
        <Typography mt={3} textAlign="center">
          No se encontraron usuarios.
        </Typography>
      )}
    </Box>
  )
}
