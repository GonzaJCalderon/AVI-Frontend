'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Snackbar,
  Alert
} from '@mui/material'

export default function CambiarPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [feedback, setFeedback] = useState({ open: false, success: true, message: '' })
  const router = useRouter()

  const handleSubmit = async () => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    if (!token || !user?.id) {
      setFeedback({ open: true, success: false, message: 'Sesión no válida' })
      return
    }

    if (!password || password.length < 6) {
      setFeedback({ open: true, success: false, message: 'La contraseña debe tener al menos 6 caracteres' })
      return
    }

    if (password !== confirmar) {
      setFeedback({ open: true, success: false, message: 'Las contraseñas no coinciden' })
      return
    }

    try {
      const res = await fetch('http://10.100.1.80/avd/api/cambiar_password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, nueva_password: password })
      })

      const data = await res.json()

      if (res.ok) {
        setFeedback({ open: true, success: true, message: 'Contraseña actualizada correctamente' })
        setTimeout(() => router.push('/inicio'), 1500)
      } else {
        throw new Error(data.error || 'Error al cambiar contraseña')
      }
    } catch (err: any) {
      setFeedback({ open: true, success: false, message: err.message })
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
      <Paper sx={{ p: 4, width: 400 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Cambiar contraseña
        </Typography>

        <TextField
          label="Nueva contraseña"
          type="password"
          fullWidth
          sx={{ mb: 2 }}
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <TextField
          label="Confirmar contraseña"
          type="password"
          fullWidth
          sx={{ mb: 2 }}
          value={confirmar}
          onChange={e => setConfirmar(e.target.value)}
        />
        <Button fullWidth variant="contained" onClick={handleSubmit}>
          Guardar nueva contraseña
        </Button>

        <Snackbar
          open={feedback.open}
          autoHideDuration={4000}
          onClose={() => setFeedback(f => ({ ...f, open: false }))}
        >
          <Alert
            severity={feedback.success ? 'success' : 'error'}
            onClose={() => setFeedback(f => ({ ...f, open: false }))}
          >
            {feedback.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  )
}
