'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Box, CircularProgress, Alert, Typography } from '@mui/material'
import { obtenerIntervencion } from '@/services/intervenciones'
import EditarFormularioVictima, { IntervencionDetalle } from '@/components/EditarFormularioVictima'

export default function EditarFormularioPage() {
  const sp = useSearchParams()
  const id = sp.get('id')
  const [data, setData] = useState<IntervencionDetalle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setError('Falta el parámetro "id" en la URL')
      setLoading(false)
      return
    }
    ;(async () => {
      try {
        const detalle = await obtenerIntervencion(Number(id))
        // `obtenerIntervencion` devuelve tu IntervencionItem; el editor
        // soporta tanto tu forma “resumida” como estructuras más completas.
        setData(detalle as unknown as IntervencionDetalle)
      } catch (e: any) {
        setError(e?.message || 'No se pudo cargar la intervención')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  if (loading) {
    return (
      <Box p={4} display="flex" gap={2} alignItems="center">
        <CircularProgress />
        <Typography>Cargando intervención…</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  if (!data) {
    return (
      <Box p={4}>
        <Alert severity="warning">No se encontraron datos.</Alert>
      </Box>
    )
  }

  return <EditarFormularioVictima selected={data} />
}
