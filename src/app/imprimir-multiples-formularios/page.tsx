'use client'

import {
  Box,
  Typography,
  Grid,
  Checkbox,
  FormControlLabel,
} from '@mui/material'
import type { IntervencionItem } from '@/services/intervenciones'

type Props = {
  data: IntervencionItem
  id: number
}

const getGenero = (genero?: number) => {
  const generoMap: Record<number, string> = {
    1: 'M',
    2: 'F',
    3: 'X',
  }
  return generoMap[genero || 0] || ''
}

const formatDate = (date?: string) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${d.getFullYear()}`
}

export default function ImprimirFormularioUnitario({ data, id }: Props) {
  return (
    <Box sx={{ p: 3, fontFamily: 'Arial, sans-serif', fontSize: '12px', lineHeight: 1.4 }}>
      {/* Encabezado */}
      <Box textAlign="center" mb={3}>
        <Typography variant="h5" fontWeight="bold" sx={{ fontSize: '16px' }}>
          CENTRO DE ASISTENCIA A VÍCTIMAS DEL DELITO
        </Typography>
        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '14px' }}>
          PROTOCOLO DE ASISTENCIA
        </Typography>
      </Box>

      {/* 1. DATOS DE LA INTERVENCIÓN */}
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

      {/* 2. DATOS DE LA VÍCTIMA */}
      {data.victimas && data.victimas.length > 0 && (
        <Box mb={2}>
          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '13px', mb: 1 }}>
            2. VÍCTIMA
          </Typography>

          {data.victimas.map((victima, index) => (
            <Box key={index} mb={2}>
              <Typography sx={{ fontSize: '12px', mb: 1 }}>
                Nombre: <u>{victima.nombre || ''}</u>
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <Typography sx={{ fontSize: '12px' }}>
                    DNI: <u>{victima.dni || ''}</u>
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography sx={{ fontSize: '12px' }}>
                    Género:
                    <Checkbox checked={getGenero(victima.genero) === 'M'} size="small" sx={{ p: 0.25 }} /> M
                    <Checkbox checked={getGenero(victima.genero) === 'F'} size="small" sx={{ p: 0.25 }} /> F
                    <Checkbox checked={getGenero(victima.genero) === 'X'} size="small" sx={{ p: 0.25 }} /> X
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography sx={{ fontSize: '12px' }}>
                    Teléfono: <u>{victima.telefono || ''}</u>
                  </Typography>
                </Grid>
              </Grid>
              <Grid container spacing={1} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Typography sx={{ fontSize: '12px' }}>
                    Fecha de nacimiento: <u>{formatDate(victima.fechaNacimiento)}</u>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ fontSize: '12px' }}>
                    Ocupación: <u>{victima.ocupacion || ''}</u>
                  </Typography>
                </Grid>
              </Grid>

              {victima.direccion && (
                <Typography sx={{ fontSize: '12px', mt: 1 }}>
                  Dirección: <u>{victima.direccion.calleNro}, {victima.direccion.barrio} - Departamento {victima.direccion.departamento}</u>
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      )}

      {/* 3. DATOS DEL HECHO DELICTIVO */}
      {data.hechoDelictivo && (
        <Box mb={2}>
          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '13px', mb: 1 }}>
            3. DATOS DEL HECHO DELICTIVO
          </Typography>

          <Typography sx={{ fontSize: '12px', mb: 1 }}>
            Expediente: <u>{data.hechoDelictivo.expediente || ''}</u>
          </Typography>

          <Typography sx={{ fontSize: '12px', mb: 1 }}>
            Nro de Agresores: <u>{data.hechoDelictivo.numAgresores || ''}</u>
          </Typography>

          {data.hechoDelictivo.ubicacion && (
            <Typography sx={{ fontSize: '12px', mb: 1 }}>
              Ubicación: <u>{data.hechoDelictivo.ubicacion.calleBarrio}</u> - Departamento: <u>{data.hechoDelictivo.ubicacion.departamento}</u>
            </Typography>
          )}

          {/* Tipos de hechos */}
          {data.hechoDelictivo.tipoHecho && (
            <Grid container spacing={1}>
              {Object.entries(data.hechoDelictivo.tipoHecho).map(([key, value]) =>
                value ? (
                  <Grid item xs={4} key={key}>
                    <FormControlLabel
                      control={<Checkbox checked={true} size="small" />}
                      label={key}
                      sx={{ fontSize: '10px' }}
                    />
                  </Grid>
                ) : null
              )}
            </Grid>
          )}
        </Box>
      )}

      {/* 4. RESUMEN */}
      {data._count && (
        <Box mb={2}>
          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '13px', mb: 1 }}>
            4. RESUMEN DE LA INTERVENCIÓN
          </Typography>
          <Typography sx={{ fontSize: '12px' }}>
            Derivaciones: <u>{data._count.derivaciones}</u>
          </Typography>
          <Typography sx={{ fontSize: '12px' }}>
            Hechos delictivos: <u>{data._count.hechos_delictivos}</u>
          </Typography>
          <Typography sx={{ fontSize: '12px' }}>
            Víctimas: <u>{data._count.victimas}</u>
          </Typography>
          <Typography sx={{ fontSize: '12px' }}>
            Seguimientos: <u>{data._count.seguimientos}</u>
          </Typography>
        </Box>
      )}
    </Box>
  )
}
