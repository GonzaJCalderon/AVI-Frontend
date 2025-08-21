'use client'

import { Box, Typography, Paper } from '@mui/material'
import useUsuario from '@/hooks/useUsuario'

export default function PerfilUsuarioPage() {
  const usuario = useUsuario()

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Perfil de Usuario
        </Typography>
        <Typography><strong>Nombre:</strong> {usuario.nombre}</Typography>
        <Typography><strong>Email:</strong> {usuario.email}</Typography>
        <Typography><strong>Rol:</strong> {usuario.rol}</Typography>
      </Paper>
    </Box>
  )
}
