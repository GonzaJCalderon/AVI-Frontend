'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Typography } from '@mui/material'

export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push('/login') // o '/' si prefieres
    }, 3000)

    return () => clearTimeout(timeout)
  }, [router])

  return (
    <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="h4" color="error" textAlign="center">
        Página no encontrada. Redirigiendo...
      </Typography>
    </Box>
  )
}
