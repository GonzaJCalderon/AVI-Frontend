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
  Grid
} from '@mui/material'

export default function FormularioCrearUsuario() {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    rol: 'usuario'
  })

  const [feedback, setFeedback] = useState({ open: false, success: true, message: '' })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    const passwordDefault = 'password123' // según el ejemplo de tu API
    const { nombre, apellido, email, rol } = form

    if (!nombre || !apellido || !email) {
      setFeedback({ open: true, success: false, message: 'Todos los campos son obligatorios' })
      return
    }

    try {
      const res = await fetch('http://10.100.1.80:3333/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: passwordDefault,
          nombre: `${nombre} ${apellido}`,
          rol
        })
      })

      const data = await res.json()

      if (res.ok) {
        setFeedback({ open: true, success: true, message: 'Usuario creado correctamente' })
        setForm({ nombre: '', apellido: '', email: '', rol: 'usuario' })
        console.log('Usuario creado:', data)
      } else if (res.status === 409) {
        setFeedback({
          open: true,
          success: false,
          message: data.error || 'El email ya está registrado',
        })
      } else {
        throw new Error(data.error || 'Error al crear usuario')
      }
    } catch (err: any) {
      setFeedback({ open: true, success: false, message: err.message })
    }
  }

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
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Apellido"
            name="apellido"
            value={form.apellido}
            onChange={handleInputChange}
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
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="rol-label">Rol</InputLabel>
            <Select
              labelId="rol-label"
              name="rol"
              value={form.rol}
              label="Rol"
              onChange={handleSelectChange}
            >
              <MenuItem value="usuario">Usuario</MenuItem>
              <MenuItem value="admin">Administrador</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Button variant="contained" fullWidth onClick={handleSubmit}>
        Crear Usuario
      </Button>

      <Snackbar
        open={feedback.open}
        autoHideDuration={4000}
        onClose={() => setFeedback((f) => ({ ...f, open: false }))}
      >
        <Alert
          severity={feedback.success ? 'success' : 'error'}
          onClose={() => setFeedback((f) => ({ ...f, open: false }))}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Paper>
  )
}
