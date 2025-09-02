'use client'

import { useState } from 'react'
import {
  Box,
  Button,
  MenuItem,
  Paper,
  TextField,
  Typography,
  Select,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
  SelectChangeEvent,
  Grid,
  CircularProgress,
  FormHelperText,
} from '@mui/material'
import { useUsuarios } from '@/hooks/useUsuarios'
import {
  createUsuarioSchema,
  CreateUsuarioFormData,
  validateField,
  validateForm,
} from '@/utils/validationSchemas'

// ✅ Tipo explícito para el rol
type RolUsuario = 'usuario' | 'admin'

// ✅ Tipo fuerte para el formulario
type FormularioCrearUsuarioState = {
  nombre: string
  apellido: string
  email: string
  rol: RolUsuario
}

interface FormularioCrearUsuarioProps {
  onUserCreated?: () => void
}

export default function FormularioCrearUsuario({
  onUserCreated,
}: FormularioCrearUsuarioProps) {
  const { createUsuario, creating, error, clearError } = useUsuarios()

  const [form, setForm] = useState<FormularioCrearUsuarioState>({
    nombre: '',
    apellido: '',
    email: '',
    rol: 'usuario',
  })

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [feedback, setFeedback] = useState({
    open: false,
    success: true,
    message: '',
  })

  const handleFieldValidation = async (field: string, value: any) => {
    const error = await validateField(createUsuarioSchema, field, value)

    setFieldErrors((prev) => ({
      ...prev,
      [field]: error || '',
    }))
  }

  const handleInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target

    setForm((prev) => ({ ...prev, [name]: value }))

    if (touched[name]) {
      await handleFieldValidation(name, value)
    }
  }

  const handleSelectChange = async (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target

    setForm((prev) => ({ ...prev, [name]: value as RolUsuario }))

    if (touched[name!]) {
      await handleFieldValidation(name!, value)
    }
  }

  const handleBlur = async (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    await handleFieldValidation(field, form[field as keyof FormularioCrearUsuarioState])
  }

  const resetForm = () => {
    setForm({
      nombre: '',
      apellido: '',
      email: '',
      rol: 'usuario',
    })
    setFieldErrors({})
    setTouched({})
    clearError()
  }

  const handleSubmit = async () => {
    const allTouched = Object.keys(form).reduce(
      (acc, key) => ({
        ...acc,
        [key]: true,
      }),
      {}
    )
    setTouched(allTouched)

    const validation = await validateForm(createUsuarioSchema, form)

    if (!validation.isValid) {
      setFieldErrors(validation.errors)
      setFeedback({
        open: true,
        success: false,
        message: 'Por favor, corrige los errores en el formulario',
      })
      return
    }

    const success = await createUsuario(form)

    if (success) {
      setFeedback({
        open: true,
        success: true,
        message:
          'Usuario creado correctamente. Se ha asignado una contraseña temporal.',
      })
      resetForm()
      onUserCreated?.()
    } else {
      setFeedback({
        open: true,
        success: false,
        message: error || 'Error al crear el usuario',
      })
    }
  }

  const closeFeedback = () => {
    setFeedback((prev) => ({ ...prev, open: false }))
    clearError()
  }

  const hasErrors = Object.values(fieldErrors).some((error) => error !== '')
  const isFormValid =
    !hasErrors &&
    Object.values(form).every((value) =>
      typeof value === 'string' ? value.trim() !== '' : true
    )

  return (
    <Paper sx={{ p: 4, maxWidth: 500 }}>
      <Typography variant="h6" gutterBottom>
        Crear nuevo usuario
      </Typography>

      <Grid container spacing={2} mb={2}>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Nombre"
            name="nombre"
            value={form.nombre}
            onChange={handleInputChange}
            onBlur={() => handleBlur('nombre')}
            error={touched.nombre && !!fieldErrors.nombre}
            helperText={touched.nombre ? fieldErrors.nombre : ''}
            disabled={creating}
            InputProps={{
              endAdornment:
                creating && touched.nombre ? (
                  <CircularProgress size={20} />
                ) : null,
            }}
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Apellido"
            name="apellido"
            value={form.apellido}
            onChange={handleInputChange}
            onBlur={() => handleBlur('apellido')}
            error={touched.apellido && !!fieldErrors.apellido}
            helperText={touched.apellido ? fieldErrors.apellido : ''}
            disabled={creating}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Correo electrónico"
            name="email"
            type="email"
            value={form.email}
            onChange={handleInputChange}
            onBlur={() => handleBlur('email')}
            error={touched.email && !!fieldErrors.email}
            helperText={touched.email ? fieldErrors.email : ''}
            disabled={creating}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl
            fullWidth
            error={touched.rol && !!fieldErrors.rol}
            disabled={creating}
          >
            <InputLabel id="rol-label">Rol</InputLabel>
            <Select
              labelId="rol-label"
              name="rol"
              value={form.rol}
              label="Rol"
              onChange={handleSelectChange}
              onBlur={() => handleBlur('rol')}
            >
              <MenuItem value="usuario">Usuario</MenuItem>
              <MenuItem value="admin">Administrador</MenuItem>
            </Select>
            {touched.rol && fieldErrors.rol && (
              <FormHelperText>{fieldErrors.rol}</FormHelperText>
            )}
          </FormControl>
        </Grid>
      </Grid>

      <Button
        variant="contained"
        fullWidth
        onClick={handleSubmit}
        disabled={creating || !isFormValid}
        sx={{ position: 'relative' }}
      >
        {creating ? (
          <>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            Creando usuario...
          </>
        ) : (
          'Crear Usuario'
        )}
      </Button>

      {error && !feedback.open && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      <Snackbar
        open={feedback.open}
        autoHideDuration={6000}
        onClose={closeFeedback}
      >
        <Alert
          severity={feedback.success ? 'success' : 'error'}
          onClose={closeFeedback}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Paper>
  )
}
