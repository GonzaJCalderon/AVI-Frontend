'use client'

import { 
  Box, Typography, Paper, Avatar, Button, Chip, Grid, Card, CardContent,
  IconButton, Skeleton, Alert, TextField, Stack, Snackbar, CircularProgress
} from '@mui/material'
import { 
  Edit as EditIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  Security as SecurityIcon,
  CalendarToday as CalendarIcon,
  VerifiedUser as VerifiedIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Lock as LockIcon
} from '@mui/icons-material'
import { useUsuarioActual } from '@/hooks/useUsuarios'
import { usuarioService } from '@/services/usuarioService'
import { useEffect, useMemo, useState } from 'react'

type PerfilView = {
  nombre: string
  email: string
  rol?: string
}

export default function PerfilUsuarioPage() {
  const { usuario: usuarioHook, loading } = useUsuarioActual()
  const [usuario, setUsuario] = useState<PerfilView | null>(null)

  // Edición de email
  const [editEmail, setEditEmail] = useState(false)
  const [email, setEmail] = useState('')

  // Cambio de password
  const [editPassword, setEditPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [savingEmail, setSavingEmail] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const [snack, setSnack] = useState<{open: boolean; type: 'success'|'error'|'warning'|'info'; msg: string}>({
    open: false, type: 'info', msg: ''
  })

  const userId = useMemo(() => {
    const fromHook: any = usuarioHook as any
    if (fromHook?.id !== undefined && fromHook?.id !== null) return Number(fromHook.id)
    try {
      const raw = localStorage.getItem('user')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.id !== undefined && parsed?.id !== null) return Number(parsed.id)
      }
    } catch {}
    return undefined
  }, [usuarioHook])

  useEffect(() => {
    if (usuarioHook) {
      const v = {
        nombre: usuarioHook.nombre ?? '',
        email: usuarioHook.email ?? '',
        rol: usuarioHook.rol ?? '',
      }
      setUsuario(v)
      setEmail(v.email)
    }
  }, [usuarioHook])

  const getRolColor = (rol: string | undefined) => {
    switch (rol?.toLowerCase()) {
      case 'admin':
      case 'administrador':
        return 'error'
      case 'supervisor':
        return 'warning'
      case 'operador':
        return 'info'
      case 'usuario':
      case 'user':
        return 'default'
      default:
        return 'primary'
    }
  }

  const getInitials = (nombre: string | undefined) => {
    if (!nombre) return 'U'
    return nombre.split(' ').map(w => w.charAt(0)).join('').toUpperCase().slice(0, 2)
  }

  // Guardar email
  const handleSaveEmail = async () => {
    if (!userId) {
      setSnack({ open: true, type: 'error', msg: 'No se pudo determinar el ID del usuario.' })
      return
    }
    const trimmed = email.trim()
    if (!trimmed) {
      setSnack({ open: true, type: 'warning', msg: 'El email es requerido.' })
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
      setSnack({ open: true, type: 'warning', msg: 'El email no es válido.' })
      return
    }

    try {
      setSavingEmail(true)
      const updated = await usuarioService.updateUsuario(userId, { email: trimmed })
      // actualizar vista
      setUsuario(prev => prev ? ({ ...prev, email: updated.email ?? trimmed }) : prev)
      // actualizar localStorage
      try {
        const raw = localStorage.getItem('user')
        const prev = raw ? JSON.parse(raw) : {}
        localStorage.setItem('user', JSON.stringify({ ...prev, email: updated.email ?? trimmed }))
      } catch {}
      setSnack({ open: true, type: 'success', msg: 'Email actualizado correctamente.' })
      setEditEmail(false)
    } catch (e: any) {
      setSnack({ open: true, type: 'error', msg: e?.message || 'No se pudo actualizar el email' })
    } finally {
      setSavingEmail(false)
    }
  }

  // Guardar contraseña
  const handleSavePassword = async () => {
    if (!userId) {
      setSnack({ open: true, type: 'error', msg: 'No se pudo determinar el ID del usuario.' })
      return
    }
    if (!currentPassword || !newPassword || !confirmPassword) {
      setSnack({ open: true, type: 'warning', msg: 'Completá todos los campos de contraseña.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setSnack({ open: true, type: 'warning', msg: 'La confirmación no coincide.' })
      return
    }
    if (newPassword.length < 8) {
      setSnack({ open: true, type: 'warning', msg: 'La nueva contraseña debe tener al menos 8 caracteres.' })
      return
    }

    try {
      setSavingPassword(true)
      await usuarioService.changePassword(userId, { currentPassword, newPassword })
      setSnack({ open: true, type: 'success', msg: 'Contraseña actualizada correctamente.' })
      // limpiar formulario
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setEditPassword(false)
    } catch (e: any) {
      setSnack({ open: true, type: 'error', msg: e?.message || 'No se pudo actualizar la contraseña' })
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading && !usuario) {
    return (
      <Box sx={{ p: 4 }}>
        <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Skeleton variant="circular" width={80} height={80} sx={{ mr: 3 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" sx={{ fontSize: '2rem', width: '60%' }} />
              <Skeleton variant="text" sx={{ fontSize: '1rem', width: '40%' }} />
            </Box>
          </Box>
          <Skeleton variant="rectangular" height={200} />
        </Paper>
      </Box>
    )
  }

  if (!usuario) {
    return (
      <Box sx={{ p: 4 }}>
        <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Usuario no encontrado
            </Typography>
            <Typography>
              Inicia sesión nuevamente.
            </Typography>
          </Alert>
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 0, maxWidth: 800, mx: 'auto', borderRadius: 3, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        {/* Header */}
        <Box sx={{ background: 'linear-gradient(135deg, #6d44b8 0%, #5b2f9c 100%)', color: 'white', p: 4, position: 'relative',
          '&::before': { content: '""', position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.1) 0%, transparent 70%)', pointerEvents: 'none' }}}>
          <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '1.8rem', fontWeight: 'bold', mr: 3, border: '3px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(10px)' }}>
              {getInitials(usuario.nombre)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                {usuario.nombre || 'Usuario'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Chip label={usuario.rol || 'Sin rol'} color={getRolColor(usuario.rol) as any} size="small"
                      sx={{ fontWeight: 'bold', bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '& .MuiChip-label': { color: 'white' } }}
                      icon={<BadgeIcon sx={{ color: 'white !important' }} />} />
                <Chip label="Activo" size="small" sx={{ bgcolor: 'rgba(76, 175, 80, 0.2)', color: 'white', '& .MuiChip-label': { color: 'white' } }}
                      icon={<VerifiedIcon sx={{ color: 'white !important' }} />} />
              </Box>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {usuario.email || 'Sin email'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Contenido */}
        <Box sx={{ p: 4 }}>
          <Grid container spacing={3}>
            {/* Info de cuenta (nombre read-only, email editable) */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <PersonIcon sx={{ color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="bold">Información de cuenta</Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Nombre (solo lectura)</Typography>
                      <TextField value={usuario.nombre} fullWidth InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid item xs={12} md={10}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Correo electrónico</Typography>
                        {!editEmail ? (
                          <Button size="small" startIcon={<EditIcon />} onClick={() => setEditEmail(true)}>
                            Editar
                          </Button>
                        ) : null}
                      </Box>
                      {!editEmail ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <EmailIcon sx={{ color: 'grey.500', mr: 1, fontSize: '1.1rem' }} />
                          <Typography>{usuario.email}</Typography>
                        </Box>
                      ) : (
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} mt={1}>
                          <TextField
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            fullWidth
                            placeholder="tu@email.com"
                          />
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              variant="contained"
                              color="success"
                              startIcon={savingEmail ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                              disabled={savingEmail}
                              onClick={handleSaveEmail}
                            >
                              {savingEmail ? 'Guardando...' : 'Guardar'}
                            </Button>
                            <Button
                              variant="outlined"
                              color="inherit"
                              startIcon={<CloseIcon />}
                              disabled={savingEmail}
                              onClick={() => {
                                setEditEmail(false)
                                setEmail(usuario.email)
                              }}
                            >
                              Cancelar
                            </Button>
                          </Stack>
                        </Stack>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Cambiar contraseña */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <SecurityIcon sx={{ color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="bold">Contraseña</Typography>
                  </Box>

                  {!editPassword ? (
                    <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                      <LockIcon color="disabled" />
                      <Typography color="text.secondary">••••••••</Typography>
                      <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditPassword(true)}>
                        Cambiar contraseña
                      </Button>
                    </Box>
                  ) : (
                    <>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <TextField
                            label="Contraseña actual"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            label="Nueva contraseña"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            fullWidth
                            helperText="Mínimo 8 caracteres"
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            label="Confirmar nueva"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            fullWidth
                          />
                        </Grid>
                      </Grid>

                      <Stack direction="row" spacing={1} mt={2} justifyContent="flex-end">
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={savingPassword ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                          disabled={savingPassword}
                          onClick={handleSavePassword}
                        >
                          {savingPassword ? 'Guardando...' : 'Guardar'}
                        </Button>
                        <Button
                          variant="outlined"
                          color="inherit"
                          startIcon={<CloseIcon />}
                          disabled={savingPassword}
                          onClick={() => {
                            setEditPassword(false)
                            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
                          }}
                        >
                          Cancelar
                        </Button>
                      </Stack>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Info del sistema (read-only) */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <VerifiedIcon sx={{ color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="bold">Información del Sistema</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">Rol</Typography>
                      <Chip label={usuario.rol || 'Sin asignar'} color={getRolColor(usuario.rol) as any} size="small" variant="outlined" />
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <Typography variant="body2" color="text.secondary">Última sesión</Typography>
                      <Typography>
                        {new Date().toLocaleDateString('es-AR', {
                          year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.type} onClose={() => setSnack(s => ({ ...s, open: false }))} sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  )
}
