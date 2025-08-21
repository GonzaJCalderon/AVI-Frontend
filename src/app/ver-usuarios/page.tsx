'use client'

import { Box, Typography, Paper, List, ListItem, ListItemText, Divider } from '@mui/material'
import { useEffect, useState } from 'react'

type Usuario = {
  nombre: string
  email: string
  rol: string
}

export default function VerUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])

  useEffect(() => {
    fetch('http://localhost:8000/api/listar_usuarios.php')
      .then(res => res.json())
      .then(data => setUsuarios(data))
      .catch(err => console.error('Error al cargar usuarios:', err))
  }, [])

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold">
          Listado de usuarios
        </Typography>

        {usuarios.length === 0 ? (
          <Typography mt={2}>No hay usuarios para mostrar.</Typography>
        ) : (
          <List>
            {usuarios.map((user, idx) => (
              <Box key={idx}>
                <ListItem>
                  <ListItemText
                    primary={`${user.nombre} (${user.rol})`}
                    secondary={user.email}
                  />
                </ListItem>
                <Divider />
              </Box>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  )
}
