'use client'

import { usePathname } from 'next/navigation'
import SidebarNavbar from './SidebarNavbar'
import { Box } from '@mui/material'
import { ReactNode } from 'react'

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  // Rutas que NO deben mostrar la sidebar
  const hideSidebarPaths = ['/recuperar', '/login', '/auth/reset']

  // ✅ Se oculta si termina en /login o /recuperar
  const shouldHideSidebar = hideSidebarPaths.some(path => pathname.endsWith(path))

  return (
    <Box display="flex">
      {!shouldHideSidebar && (
        <div className="no-print">
          <SidebarNavbar />
        </div>
      )}
      <Box component="main" flexGrow={1} p={0} sx={{ minHeight: '100vh' }}>
        {children}
      </Box>
    </Box>
  )
}
