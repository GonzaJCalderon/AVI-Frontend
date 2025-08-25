'use client'

import { useEffect } from 'react'
import { Box, Typography, Paper, Button, Alert } from '@mui/material'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log del error
    console.error('Error capturado por error.tsx:', error)
  }, [error])

  return (
    <Box sx={{ 
      p: 4, 
      minHeight: '50vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <Paper sx={{ p: 4, maxWidth: 600, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          ¡Oops! Algo salió mal
        </Typography>
        
        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
          <Typography variant="body2">
            {error.message || 'Ha ocurrido un error inesperado'}
          </Typography>
        </Alert>

        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="subtitle2" gutterBottom>
              Detalles del error (solo en desarrollo):
            </Typography>
            <Paper 
              sx={{ 
                p: 2, 
                bgcolor: 'grey.100', 
                fontSize: '0.875rem',
                fontFamily: 'monospace',
                overflow: 'auto',
                maxHeight: 200
              }}
            >
              {error.stack}
            </Paper>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            onClick={reset}
            size="large"
          >
            Intentar de nuevo
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => window.location.reload()}
            size="large"
          >
            Recargar página
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}