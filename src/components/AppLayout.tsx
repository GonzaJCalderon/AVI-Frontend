'use client'

import { usePathname } from 'next/navigation'
import SidebarNavbar from './SidebarNavbar'
import { Box } from '@mui/material'
import { ReactNode } from 'react'

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  // ✅ SIN /avd/ porque basePath lo maneja automáticamente
  const hideSidebarPaths = [
    '/login',
    '/recuperar-password',
    '/restablecer-password',
  ]

  const shouldHideSidebar = hideSidebarPaths.includes(pathname)

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