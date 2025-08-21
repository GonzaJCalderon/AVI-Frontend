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
} from '@mui/material'

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
    <Box sx={{ p: 4, maxWidth: 500, mx: 'auto' }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Recuperar contraseña
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {enviado && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña.
          </Alert>
        )}

        {!enviado && (
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Correo electrónico"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              fullWidth
              type="submit"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </Button>
          </form>
        )}
      </Paper>
    </Box>
  )
}
