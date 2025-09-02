'use client'

import { Box, Typography, Grid, Checkbox, FormControlLabel } from '@mui/material'
import type { IntervencionItem } from '@/services/intervenciones'

type Props = {
  data: IntervencionItem
  id: number
}

export default function ImprimirFormularioUnitario({ data, id }: Props) {
  const formatDate = (date?: string) => {
    if (!date) return ''
    const d = new Date(date)
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
  }

  return (
    <Box sx={{ p: 3, fontFamily: 'Arial, sans-serif', fontSize: '12px', lineHeight: 1.4 }}>
      <Box textAlign="center" mb={3}>
        <Typography variant="h5" fontWeight="bold" sx={{ fontSize: '16px' }}>
          CENTRO DE ASISTENCIA A VÍCTIMAS DEL DELITO
        </Typography>
        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '14px' }}>
          PROTOCOLO DE ASISTENCIA
        </Typography>
      </Box>

      <Box mb={2}>
        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '13px', mb: 1 }}>
          1. DATOS DE LA INTERVENCIÓN
        </Typography>
        <Grid container spacing={2} sx={{ mb: 1 }}>
          <Grid item xs={6}>
            <Typography sx={{ fontSize: '12px' }}>
              Fecha: <u>{formatDate(data.fecha)}</u>
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography sx={{ fontSize: '12px' }}>
              Coordinador: <u>{data.coordinador || ''}</u>
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{ mb: 1 }}>
          <Grid item xs={6}>
            <Typography sx={{ fontSize: '12px' }}>
              Nro de Ficha: <u>{data.numero_intervencion || id}</u>
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography sx={{ fontSize: '12px' }}>
              Operador: <u>{data.operador || ''}</u>
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Podés seguir agregando secciones similares según lo que desees imprimir */}

      <Typography sx={{ fontSize: '12px' }}>
        *Este formulario está en construcción. Faltan secciones como: derivación, hecho delictivo, víctima, etc.*
      </Typography>
    </Box>
  )
}
