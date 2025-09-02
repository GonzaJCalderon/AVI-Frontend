'use client'

import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  Chip,
  Avatar,
  ListItemAvatar
} from '@mui/material'
import { useEffect, useState } from 'react'
import PersonIcon from '@mui/icons-material/Person'
import StarIcon from '@mui/icons-material/Star'

type Usuario = {
  nombre: string
  email: string
  rol: string
}

export default function VerUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [usuarioActual, setUsuarioActual] = useState<string>('')

  useEffect(() => {
    // Cargar usuarios
    fetch('http://localhost:8000/api/listar_usuarios.php')
      .then(res => res.json())
      .then(data => setUsuarios(data))
      .catch(err => console.error('Error al cargar usuarios:', err))

    // Obtener el usuario actual desde localStorage (siguiendo tu estructura de login)
    try {
      const userDataString = localStorage.getItem('user')
      if (userDataString) {
        const userData = JSON.parse(userDataString)
        if (userData && userData.email) {
          setUsuarioActual(userData.email)
        }
      }
    } catch (error) {
      console.error('Error al obtener usuario actual:', error)
      // Fallback: intentar obtener desde token si tienes el email en el payload
      const token = localStorage.getItem('access_token') || localStorage.getItem('token')
      if (token) {
        // Aquí podrías decodificar el JWT si contiene el email
        // Por ahora dejamos el manejo básico
      }
    }
  }, [])

  const esUsuarioActual = (email: string) => email === usuarioActual

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Listado de usuarios
        </Typography>

        {usuarios.length === 0 ? (
          <Typography mt={2}>No hay usuarios para mostrar.</Typography>
        ) : (
          <List>
            {usuarios.map((user, idx) => (
              <Box key={idx}>
                <ListItem
                  sx={{
                    backgroundColor: esUsuarioActual(user.email) 
                      ? 'rgba(25, 118, 210, 0.08)' 
                      : 'transparent',
                    borderRadius: esUsuarioActual(user.email) ? 2 : 0,
                    mb: esUsuarioActual(user.email) ? 1 : 0,
                    border: esUsuarioActual(user.email) 
                      ? '2px solid' 
                      : '1px solid transparent',
                    borderColor: esUsuarioActual(user.email) 
                      ? 'primary.main' 
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: esUsuarioActual(user.email)
                        ? 'rgba(25, 118, 210, 0.12)'
                        : 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ 
                      bgcolor: esUsuarioActual(user.email) 
                        ? 'primary.main' 
                        : 'grey.400' 
                    }}>
                      {esUsuarioActual(user.email) ? <StarIcon /> : <PersonIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {user.nombre} ({user.rol})
                        </Typography>
                        {esUsuarioActual(user.email) && (
                          <Chip
                            label="Tu cuenta"
                            size="small"
                            color="primary"
                            variant="filled"
                            sx={{ 
                              fontSize: '0.75rem',
                              fontWeight: 'bold'
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography 
                        variant="body2" 
                        color={esUsuarioActual(user.email) ? 'primary.dark' : 'text.secondary'}
                        fontWeight={esUsuarioActual(user.email) ? 'medium' : 'normal'}
                      >
                        {user.email}
                      </Typography>
                    }
                  />
                </ListItem>
                {!esUsuarioActual(user.email) && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  )
}