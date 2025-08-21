'use client'

import { useEffect, useState } from 'react'
import { Box, Typography, Paper, Button } from '@mui/material'
import useUsuario from '@/hooks/useUsuario'
import { useRouter } from 'next/navigation'
import TablaUsuarios from '@/components/TablaUsuarios'
import { Usuario } from '@/components/types'

export default function AdminUsuariosPage() {
  const router = useRouter()
  const usuario = useUsuario()

  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<{ nombre: string; email: string; rol: string }>({
    nombre: '',
    email: '',
    rol: 'user'
  })
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    if (usuario.rol !== 'admin') {
      router.push('/usuario')
    }
  }, [usuario, router])

  useEffect(() => {
    const mock: Usuario[] = [
      { id: 1, nombre: 'Juan Pérez', email: 'juan@correo.com', rol: 'admin', activo: true },
      { id: 2, nombre: 'Ana López', email: 'ana@correo.com', rol: 'user', activo: false }
    ]
    setUsuarios(mock)
  }, [])

  const handleEditar = (user: Usuario) => {
    setEditandoId(user.id)
    setEditForm({ nombre: user.nombre, email: user.email, rol: user.rol })
  }

  const cancelarEdicion = () => setEditandoId(null)

  const guardarCambios = (id: number) => {
    setUsuarios(prev => prev.map(u => (u.id === id ? { ...u, ...editForm } : u)))
    setEditandoId(null)
  }

  const eliminarUsuario = (id: number) => {
    const usuario = usuarios.find(u => u.id === id)
    if (usuario?.rol === 'admin') {
      alert('No puedes eliminar un usuario con rol de administrador.')
      return
    }
    if (!confirm('¿Eliminar este usuario?')) return
    setUsuarios(prev => prev.filter(u => u.id !== id))
  }

  const toggleActivo = (id: number) => {
    setUsuarios(prev => prev.map(u => (u.id === id ? { ...u, activo: !u.activo } : u)))
  }

  const reiniciarPassword = (user: Usuario) => {
    alert(`🔐 Se ha bloqueado la contraseña para: ${user.email}`)
  }

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Panel de administración de usuarios
        </Typography>

        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => router.push('/admin/crear-usuario')}
        >
          ➕ Crear nuevo usuario
        </Button>
      </Paper>

      <TablaUsuarios
        usuarios={usuarios}
        busqueda={busqueda}
        editandoId={editandoId}
        editForm={editForm}
        onEdit={handleEditar}
        onCancel={cancelarEdicion}
        onSave={guardarCambios}
        onDelete={eliminarUsuario}
        onToggleActivo={toggleActivo}
        onResetPassword={reiniciarPassword}
        onBusquedaChange={setBusqueda}
        onEditFormChange={setEditForm}
      />
    </Box>
  )
}
