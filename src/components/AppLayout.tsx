'use client'

import { usePathname } from 'next/navigation'
import SidebarNavbar from './SidebarNavbar'
import { Box } from '@mui/material'
import { ReactNode } from 'react'

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  // Rutas que NO deben mostrar la sidebar
  const hideSidebarPaths = ['/recuperar', '/login']

  const shouldHideSidebar = hideSidebarPaths.includes(pathname)

  return (
    <Box display="flex">
      {!shouldHideSidebar && <SidebarNavbar />}
      <Box component="main" flexGrow={1} p={0} sx={{ minHeight: '100vh' }}>
        {children}
      </Box>
    </Box>
  )
}
