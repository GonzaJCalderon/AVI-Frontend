'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
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
  InputAdornment,
  IconButton,
} from '@mui/material'
import LockResetIcon from '@mui/icons-material/LockReset'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://10.100.1.80:3333/api'

export default function RestablecerPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<{
    isValid: boolean
    message: string
  }>({ isValid: false, message: '' })

  useEffect(() => {
    if (!token) {
      setError('El enlace no es válido o está incompleto. Falta el token de autenticación.')
    }
  }, [token])

  // Validador de contraseña
  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) {
      return { isValid: false, message: 'La contraseña debe tener al menos 8 caracteres' }
    }
    if (!/[A-Z]/.test(pwd)) {
      return { isValid: false, message: 'Debe contener al menos una mayúscula' }
    }
    if (!/[a-z]/.test(pwd)) {
      return { isValid: false, message: 'Debe contener al menos una minúscula' }
    }
    if (!/\d/.test(pwd)) {
      return { isValid: false, message: 'Debe contener al menos un número' }
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      return { isValid: false, message: 'Debe contener al menos un carácter especial (!@#$%^&*...)' }
    }
    return { isValid: true, message: 'Contraseña segura ✓' }
  }

  useEffect(() => {
    if (password) {
      setPasswordStrength(validatePassword(password))
    } else {
      setPasswordStrength({ isValid: false, message: '' })
    }
  }, [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validaciones
    if (!passwordStrength.isValid) {
      setError('La contraseña no cumple con los requisitos de seguridad.')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    if (!token) {
      setError('Token de autenticación no válido.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      })

      const contentType = res.headers.get('content-type') || ''
      let result: any = {}
      
      if (contentType.includes('application/json')) {
        try {
          result = await res.json()
        } catch {
          result = {}
        }
      }

      if (res.ok) {
        setSuccess('Tu contraseña ha sido actualizada correctamente. Serás redirigido al login en unos segundos...')
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        const errorMessage = result?.message || result?.error || `Error ${res.status}: ${res.statusText}`
        
        // Mensajes de error más específicos
        if (res.status === 400 && errorMessage.toLowerCase().includes('token')) {
          setError('El enlace ha expirado o ya fue utilizado. Solicita un nuevo enlace de recuperación.')
        } else if (res.status === 404) {
          setError('Token no encontrado o inválido.')
        } else {
          setError(errorMessage)
        }
      }
    } catch (err) {
      console.error('Error al restablecer contraseña:', err)
      setError('No se pudo conectar al servidor. Por favor, intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  // Si ya fue exitoso, mostrar mensaje y botón para ir al login
  if (success) {
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
          <Avatar sx={{ bgcolor: '#4caf50', width: 56, height: 56, mx: 'auto', mb: 2 }}>
            <CheckCircleIcon fontSize="large" />
          </Avatar>

          <Typography variant="h5" fontWeight="bold" gutterBottom>
            ¡Contraseña actualizada!
          </Typography>

          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>

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
        </Paper>
      </Box>
    )
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
          maxWidth: 450,
          width: '100%',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Avatar sx={{ bgcolor: '#6d44b8', width: 56, height: 56, mx: 'auto', mb: 2 }}>
            <LockResetIcon fontSize="large" />
          </Avatar>

          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Restablecer contraseña
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {email ? `Para: ${email}` : 'Ingresá tu nueva contraseña'}
          </Typography>
        </Box>

        <Fade in={!!error}>
          <div>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          </div>
        </Fade>

        {!success && token && (
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Nueva contraseña"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={password.length > 0 && !passwordStrength.isValid}
                helperText={password.length > 0 ? passwordStrength.message : 'Mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Confirmar nueva contraseña"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={confirmPassword.length > 0 && password !== confirmPassword}
                helperText={
                  confirmPassword.length > 0 && password !== confirmPassword
                    ? 'Las contraseñas no coinciden'
                    : ''
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                variant="contained"
                type="submit"
                fullWidth
                disabled={loading || !passwordStrength.isValid || password !== confirmPassword}
                sx={{
                  backgroundColor: '#6d44b8',
                  '&:hover': { backgroundColor: '#5934a2' },
                  py: 1.5,
                }}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LockResetIcon />}
              >
                {loading ? 'Actualizando...' : 'Actualizar contraseña'}
              </Button>

              <Button
                variant="outlined"
                fullWidth
                onClick={() => router.push('/login')}
                startIcon={<ArrowBackIcon />}
              >
                Volver al login
              </Button>
            </Stack>
          </form>
        )}

        {!token && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Este enlace no es válido. Por favor, solicita un nuevo enlace de recuperación de contraseña.
          </Alert>
        )}
      </Paper>
    </Box>
  )
}