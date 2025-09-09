'use client'

import { useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Fade,
  Avatar,
  Stack,
} from '@mui/material'
import LockResetIcon from '@mui/icons-material/LockReset'
import EmailIcon from '@mui/icons-material/Email'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useRouter } from 'next/navigation'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://10.100.1.80:3333/api'

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviado(false)
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      })

      const contentType = response.headers.get('content-type') || ''
      let result: any = {}
      
      if (contentType.includes('application/json')) {
        try {
          result = await response.json()
        } catch {
          result = {}
        }
      }

      if (response.ok) {
        setEnviado(true)
      } else {
        // Manejo de errores más específico
        let errorMessage = result?.message || result?.error || `Error ${response.status}: ${response.statusText}`
        
        if (response.status === 404) {
          errorMessage = 'No se encontró una cuenta con ese correo electrónico.'
        } else if (response.status === 429) {
          errorMessage = 'Demasiadas solicitudes. Intenta nuevamente en unos minutos.'
        } else if (response.status >= 500) {
          errorMessage = 'Error del servidor. Intenta nuevamente más tarde.'
        }
        
        setError(errorMessage)
      }
    } catch (err) {
      console.error('Error al solicitar recuperación:', err)
      setError('No se pudo conectar al servidor. Verifica tu conexión e intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        px: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 5,
          borderRadius: 4,
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <Avatar sx={{ bgcolor: '#6d44b8', width: 56, height: 56, mx: 'auto', mb: 2 }}>
          <LockResetIcon fontSize="large" />
        </Avatar>

        <Typography variant="h5" fontWeight="bold" gutterBottom>
          ¿Olvidaste tu contraseña?
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Ingresá tu correo electrónico y te enviaremos un enlace para restablecerla.
        </Typography>

        <Fade in={!!error}>
          <div>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          </div>
        </Fade>

        <Fade in={enviado}>
          <div>
            {enviado && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Si el correo está registrado, te enviamos un enlace para recuperar tu contraseña. 
                Revisa tu bandeja de entrada y spam.
              </Alert>
            )}

        {enviado && (
          <Stack spacing={2} sx={{ mt: 3 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                setEnviado(false)
                setEmail('')
                setError('')
              }}
            >
              Enviar otro correo
            </Button>
            
            <Button
              variant="contained"
              fullWidth
              onClick={() => router.push('/login')}
              sx={{
                backgroundColor: '#6d44b8',
                '&:hover': { backgroundColor: '#5934a2' },
              }}
            >
              Ir al Login
            </Button>
          </Stack>
        )}
          </div>
        </Fade>

        {!enviado && (
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Correo electrónico"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: <EmailIcon sx={{ mr: 1, color: '#6d44b8' }} />,
              }}
              sx={{ mb: 3 }}
              disabled={loading}
            />

            <Stack spacing={2}>
              <Button
                variant="contained"
                type="submit"
                fullWidth
                disabled={loading || !email.trim()}
                sx={{
                  backgroundColor: '#6d44b8',
                  '&:hover': { backgroundColor: '#5934a2' },
                }}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LockResetIcon />}
              >
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </Button>

              <Button
                variant="outlined"
                fullWidth
                onClick={() => router.push('/login')}
                startIcon={<ArrowBackIcon />}
                disabled={loading}
              >
                Volver al inicio
              </Button>
            </Stack>
          </form>
        )}

        {enviado && (
          <Stack spacing={2} sx={{ mt: 3 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                setEnviado(false)
                setEmail('')
                setError('')
              }}
            >
              Enviar otro correo
            </Button>
            
            <Button
              variant="contained"
              fullWidth
              onClick={() => router.push('/login')}
              sx={{
                backgroundColor: '#6d44b8',
                '&:hover': { backgroundColor: '#5934a2' },
              }}
            >
              Ir al Login
            </Button>
          </Stack>
        )}
      </Paper>
    </Box>
  )
}