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
      const response = await fetch('https://TU-BACKEND.COM/send-email.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: 'Recuperación de contraseña',
          message: `
            <p>Hola,</p>
            <p>Recibimos una solicitud para restablecer tu contraseña. Si no fuiste vos, ignorá este correo.</p>
            <p>Si querés continuar, hacé clic en el siguiente enlace:</p>
            <p><a href="https://TU-FRONTEND.COM/reset-password?email=${encodeURIComponent(email)}">Restablecer contraseña</a></p>
          `,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setEnviado(true)
      } else {
        setError(result.error || 'Error al enviar el correo')
      }
    } catch (err) {
      setError('No se pudo conectar al servidor')
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
              </Alert>
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
            />

            <Stack spacing={2}>
              <Button
                variant="contained"
                type="submit"
                fullWidth
                disabled={loading}
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
              >
                Volver al inicio
              </Button>
            </Stack>
          </form>
        )}
      </Paper>
    </Box>
  )
}
