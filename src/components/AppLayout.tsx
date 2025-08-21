'use client'

import { usePathname } from 'next/navigation'
import SidebarNavbar from '@/components/SidebarNavbar'
import { Box } from '@mui/material'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideSidebar = pathname === '/login'

  return (
    <Box display="flex">
      {!hideSidebar && <SidebarNavbar />}
      <Box component="main" sx={{ flexGrow: 1, padding: 3 }}>
        {children}
      </Box>
    </Box>
  )
}
