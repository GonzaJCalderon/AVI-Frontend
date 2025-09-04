'use client'

import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Avatar,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import SearchIcon from '@mui/icons-material/Search'
import LogoutIcon from '@mui/icons-material/Logout'
import GroupIcon from '@mui/icons-material/Group'
import MenuIcon from '@mui/icons-material/Menu'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const expandedWidth = 240
const collapsedWidth = 72
const PROFILE_PATH = '/usuario' // ✅ tu página de perfil real

type User = {
  nombre?: string
  name?: string
  email?: string
  rol?: string
}

function getInitials(nombre?: string) {
  if (!nombre) return 'U'
  return nombre.trim().split(/\s+/).map(w => w.charAt(0)).join('').toUpperCase().slice(0, 2)
}

export default function SidebarNavbar() {
  const router = useRouter()
  const pathname = usePathname()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [user, setUser] = useState<User | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        setUser(null)
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    router.push('/login')
  }

  const navItems = [
    { label: 'Inicio', icon: <HomeIcon />, path: '/inicio' },
    { label: 'Nuevo Caso', icon: <AddCircleIcon />, path: '/nuevo-caso' },
    { label: 'Buscar', icon: <SearchIcon />, path: '/inicio#busqueda-avanzada' },
    { label: 'Gestión de Usuarios', icon: <GroupIcon />, path: '/admin' },
  ]

  const userItems = [
    { label: 'Mi Perfil', icon: <AccountCircleIcon />, path: PROFILE_PATH }, // ✅
  ]

  const drawerContent = (
    <Box display="flex" flexDirection="column" height="100%">
      {/* LOGO + TÍTULO */}
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={2} sx={{ minHeight: '80px' }}>
        <IconButton onClick={() => router.push('/inicio')}>
          <Avatar alt="Logo Gobierno" src="/images/logo-png-sin-fondo.png" sx={{ width: 48, height: 48, bgcolor: 'white' }} />
        </IconButton>

        {!isMobile && hovered && (
          <Typography variant="subtitle2" textAlign="center" fontWeight="bold" mt={1} px={1} color="white" sx={{ lineHeight: '1.2' }}>
            Plataforma de Asistencia a las Víctimas
          </Typography>
        )}
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 1 }} />

      {/* NAVEGACIÓN PRINCIPAL */}
      <List>
        {navItems.map((item) => (
          <ListItem
            button
            key={item.label}
          onClick={() => {
  if (item.label === 'Nuevo Caso') {
    window.open('http://10.100.1.80/avd/formulario_asistencia_victimas.html', '_blank', 'noopener,noreferrer')
  } else if (item.path.includes('#')) {
    window.location.href = item.path
  } else {
    router.push(item.path)
  }
  if (isMobile) setMobileOpen(false)
}}

            selected={pathname === item.path}
            sx={{
              '&.Mui-selected': { backgroundColor: 'rgba(255,255,255,0.15)' },
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
              justifyContent: hovered || isMobile ? 'flex-start' : 'center',
              px: hovered || isMobile ? 3 : 2,
              transition: 'padding 0.3s',
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 0, mr: hovered || isMobile ? 2 : 0 }}>
              {item.icon}
            </ListItemIcon>
            {(hovered || isMobile) && <ListItemText primary={item.label} />}
          </ListItem>
        ))}
      </List>

      <Box flexGrow={1} />

      {/* SECCIÓN DE USUARIO */}
      {(hovered || isMobile) && (
        <>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 1 }} />
          <List>
            {userItems.map((item) => (
              <ListItem
                button
                key={item.label}
                onClick={() => {
                  router.push(item.path)
                  if (isMobile) setMobileOpen(false)
                }}
                selected={pathname === item.path}
                sx={{
                  '&.Mui-selected': { backgroundColor: 'rgba(255,255,255,0.15)' },
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                  justifyContent: 'flex-start',
                  px: 3,
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 0, mr: 2 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </>
      )}

      {/* LOGOUT E INFO DE USUARIO */}
      <Box px={hovered || isMobile ? 2 : 0} pb={2} textAlign={hovered || isMobile ? 'left' : 'center'}>
        {!hovered && !isMobile && user && (
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Tooltip title={`${user.nombre || user.name} - ${user.email}`} placement="right">
              <Avatar
                sx={{
                  width: 40, height: 40,
                  bgcolor: 'rgba(255,255,255,0.2)', color: 'white',
                  fontSize: '0.9rem', fontWeight: 'bold',
                  mx: 'auto', cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                }}
                onClick={() => router.push(PROFILE_PATH)} // ✅
              >
                {getInitials(user?.nombre || user?.name)}
              </Avatar>
            </Tooltip>
          </Box>
        )}

        <Tooltip title="Cerrar sesión">
          <ListItem
            button
            onClick={handleLogout}
            sx={{
              justifyContent: hovered || isMobile ? 'flex-start' : 'center',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 0, mr: hovered || isMobile ? 2 : 0 }}>
              <LogoutIcon />
            </ListItemIcon>
            {(hovered || isMobile) && <ListItemText primary="Cerrar sesión" />}
          </ListItem>
        </Tooltip>

        {(hovered || isMobile) && user && (
          <Box
            sx={{
              mt: 2, p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2,
              cursor: 'pointer', transition: 'background-color 0.2s',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' }
            }}
            onClick={() => router.push(PROFILE_PATH)} // ✅
          >
            <Typography variant="body2" color="white" fontWeight="bold">
              {user.nombre || user.name || 'Usuario'}
            </Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.8)">{user.email}</Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.7)" display="block">
              {user.rol || 'Sin rol'}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )

  return (
    <>
      {isMobile && (
        <IconButton
          onClick={() => setMobileOpen(!mobileOpen)}
          sx={{
            position: 'fixed', top: 16, left: 16, zIndex: 1300, color: 'white',
            backgroundColor: '#6d44b8', '&:hover': { backgroundColor: '#5934a2' },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        anchor="left"
        ModalProps={{ keepMounted: true }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          width: hovered || isMobile ? expandedWidth : collapsedWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: hovered || isMobile ? expandedWidth : collapsedWidth,
            transition: 'width 0.3s',
            boxSizing: 'border-box',
            backgroundColor: '#6d44b8',
            color: 'white',
            overflowX: 'hidden',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  )
}
