'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  FolderOpenIcon,
  UsersIcon
} from '@heroicons/react/24/outline'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { Grid, AppBar, Toolbar, Button, Avatar } from '@mui/material'
import Paper from '@mui/material/Paper'

type User = {
  name: string
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const fetchUser = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/user', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (res.ok) {
          const data = await res.json()
          setUser(data)
        } else {
          console.warn('Backend respondió con error, usando usuario mock')
          setUser({ name: 'Usuario Demo' })
        }
      } catch (error) {
        console.warn('No se pudo conectar al backend, usando usuario mock')
        setUser({ name: 'Usuario Demo' })
      }
    }

    fetchUser()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  if (!user) {
    return (
      <Box sx={{ p: 8 }}>
        <Typography color="text.secondary">Cargando usuario...</Typography>
      </Box>
    )
  }

  const cardData = [
    {
      title: 'Buscar Formulario',
      description: 'Buscá formularios por nombre, ID o criterio.',
      icon: <MagnifyingGlassIcon className="w-10 h-10 text-pink-700" />,
      color: '#ffe4e6',
      onClick: () => router.push('/buscar')
    },
    {
      title: 'Ver Formularios',
      description: 'Visualizá un formulario completo y su información.',
      icon: <DocumentTextIcon className="w-10 h-10 text-blue-700" />,
      color: '#dbeafe',
      onClick: () => router.push('/ver-formularios')
    },
    {
      title: 'Listar Formularios',
      description: 'Listá todos los formularios disponibles.',
      icon: <FolderOpenIcon className="w-10 h-10 text-green-700" />,
      color: '#dcfce7',
      onClick: () => router.push('/listar-formularios')
    },
    {
      title: 'Nuevo Caso',
      description: 'Ingresá un nuevo formulario para asistencia.',
      icon: <DocumentTextIcon className="w-10 h-10 text-yellow-700" />,
      color: '#fef9c3',
      onClick: () =>
        window.open('http://10.100.1.80/avd/formulario_asistencia_victimas.html', '_blank')
    },
    {
      title: 'Administrar Usuarios',
      description: 'Gestioná los usuarios de la plataforma.',
      icon: <UsersIcon className="w-10 h-10 text-purple-700" />,
      color: '#ede9fe',
onClick: () => router.push('/main/admin')

    }
  ]

  return (
    <>
    
      {/* Contenido Principal */}
      <Box
        sx={{
          minHeight: '100vh',
          p: 4,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Paper elevation={3} sx={{ maxWidth: 1200, width: '100%', p: 4, borderRadius: 3, backdropFilter: 'blur(8px)', backgroundColor: '#ffffffcc' }}>
          <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
            Bienvenido, <span style={{ color: '#6366f1' }}>{user.name}</span>
          </Typography>

          <Grid container spacing={3} mt={2}>
            {cardData.map((card, i) => (
              <Grid item key={i} xs={12} sm={6} md={4}>
                <Card
                  onClick={card.onClick}
                  sx={{
                    backgroundColor: card.color,
                    cursor: 'pointer',
                    borderRadius: 3,
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.03)',
                      boxShadow: 6,
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box mb={2}>{card.icon}</Box>
                    <Typography variant="h6" fontWeight="bold">{card.title}</Typography>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      {card.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </>
  )
}
