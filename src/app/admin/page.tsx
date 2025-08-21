'use client';

import { useEffect, useState } from 'react';
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
  Tooltip
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import LockResetIcon from '@mui/icons-material/LockReset';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import LockOpenIcon from '@mui/icons-material/LockOpen';

import FormularioCrearUsuario from '@/components/FormularioCrearUsuario';

type Usuario = {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
};

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ nombre: string; email: string; rol: string }>({
    nombre: '',
    email: '',
    rol: 'user'
  });
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const mock: Usuario[] = [
      { id: 1, nombre: 'Juan Pérez', email: 'juan@correo.com', rol: 'admin', activo: true },
      { id: 2, nombre: 'Ana López', email: 'ana@correo.com', rol: 'user', activo: false }
    ];
    setUsuarios(mock);
  }, []);

  const handleEditar = (user: Usuario) => {
    setEditandoId(user.id);
    setEditForm({ nombre: user.nombre, email: user.email, rol: user.rol });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
  };

  const guardarCambios = (id: number) => {
    setUsuarios(prev => prev.map(u => (u.id === id ? { ...u, ...editForm } : u)));
    setEditandoId(null);
  };

  const eliminarUsuario = (id: number) => {
    const usuario = usuarios.find(u => u.id === id);
    if (usuario?.rol === 'admin') {
      alert('No puedes eliminar un usuario con rol de administrador.');
      return;
    }
    if (!confirm('¿Eliminar este usuario?')) return;
    setUsuarios(prev => prev.filter(u => u.id !== id));
  };

  const toggleActivo = (id: number) => {
    setUsuarios(prev => prev.map(u => (u.id === id ? { ...u, activo: !u.activo } : u)));
  };

  const reiniciarPassword = (user: Usuario) => {
    alert(`🔐 Se ha bloqueado la contraseña para: ${user.email}`);
  };

  const usuariosFiltrados = usuarios.filter(u =>
    `${u.nombre} ${u.email}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Panel de administración de usuarios
      </Typography>

      <Box mb={4}>
        <FormularioCrearUsuario />
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
            Lista de usuarios
          </Typography>

          <Box sx={{ width: { xs: '100%', md: '300px' } }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Buscar por nombre o correo"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Box>
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
                        onChange={e => setEditForm({ ...editForm, nombre: e.target.value })}
                      />
                    ) : (
                      user.nombre
                    )}
                  </TableCell>

                  <TableCell>
                    {editandoId === user.id ? (
                      <TextField
                        size="small"
                        value={editForm.email}
                        onChange={e => setEditForm({ ...editForm, email: e.target.value })}
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
                        onChange={e => setEditForm({ ...editForm, rol: e.target.value })}
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
                          <IconButton onClick={() => guardarCambios(user.id)}>
                            <SaveIcon color="success" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancelar edición">
                          <IconButton onClick={cancelarEdicion}>
                            <CancelIcon color="warning" />
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
                        <Tooltip title={user.activo ? 'Bloquear usuario' : 'Desbloquear usuario'}>
                          <IconButton onClick={() => toggleActivo(user.id)}>
                            {user.activo ? (
                              <LockIcon color="warning" />
                            ) : (
                              <LockOpenIcon color="success" />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reiniciar contraseña">
                          <IconButton onClick={() => reiniciarPassword(user)}>
                            <LockResetIcon color="primary" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip
                          title={
                            user.rol === 'admin'
                              ? 'No puedes eliminar a un administrador'
                              : 'Eliminar usuario'
                          }
                        >
                          <span>
                            <IconButton
                              onClick={() => eliminarUsuario(user.id)}
                              disabled={user.rol === 'admin'}
                            >
                              <DeleteIcon color={user.rol === 'admin' ? 'disabled' : 'error'} />
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
          <Typography mt={3} textAlign="center">
            No se encontraron usuarios.
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
