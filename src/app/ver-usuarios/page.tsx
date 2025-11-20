'use client'

import { useEffect, useState } from 'react'
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
  ListItemAvatar,
  CircularProgress,
  Alert,
} from '@mui/material'

import PersonIcon from '@mui/icons-material/Person'
import StarIcon from '@mui/icons-material/Star'

import { usuarioService } from '@/services/usuarioService'
import { Usuario } from '@/services/usuarioService'

export default function VerUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [usuarioActual, setUsuarioActual] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const lista = await usuarioService.getUsuarios()
        setUsuarios(lista)

        const perfil = await usuarioService.getPerfil()
        setUsuarioActual(perfil.email || '')
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'Ocurrió un error al cargar los usuarios.')
      } finally {
        setLoading(false)
      }
    }

    fetchUsuarios()
  }, [])

  const esUsuarioActual = (email: string) => email === usuarioActual

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Listado de usuarios
        </Typography>

        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && usuarios.length === 0 && !error && (
          <Typography mt={2}>No hay usuarios para mostrar.</Typography>
        )}

        {!loading && usuarios.length > 0 && (
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
                        : 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: esUsuarioActual(user.email)
                          ? 'primary.main'
                          : 'grey.400',
                      }}
                    >
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
                            sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}
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
