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

  const hecho = data.hechos_delictivos?.[0]
  const relacion = hecho?.relaciones?.[0]
  const geo = hecho?.geo?.[0]
  const derivacion = data.derivaciones?.[0]
  const victima = data.victimas?.[0]
  const personaEntrevistada = victima?.personas_entrevistadas?.[0]
  const abuso = data.abusos_sexuales?.[0]
  const datosAbuso = abuso?.datos?.[0]
  const accion = data.acciones_primera_linea?.[0]
  const tipo = data.intervenciones_tipo?.[0]
  const seguimiento = data.seguimientos?.[0]
  const seguimientoTipos = seguimiento?.tipo?.[0]

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold">PROTOCOLO DE ASISTENCIA</Typography>

      <Typography>Fecha: {formatDate(data.fecha)}</Typography>
      <Typography>Coordinador: {data.coordinador}</Typography>
      <Typography>Operador: {data.operador}</Typography>
      <Typography>Estado: {data.estado ?? 'No especificado'}</Typography>
      <Typography>N° Ficha: {data.numero_intervencion ?? id}</Typography>

      <Box mt={2}>
        <Typography variant="h6">DERIVACIÓN</Typography>
        <Typography>Tipo: {derivacion?.tipo_derivaciones?.descripcion ?? '—'}</Typography>
        <Typography>Derivador: {derivacion?.derivador ?? '—'}</Typography>
        <Typography>Fecha derivación: {formatDate(derivacion?.fecha_derivacion)}</Typography>
      </Box>

      <Box mt={2}>
        <Typography variant="h6">HECHO DELICTIVO</Typography>
        <Typography>Expediente: {hecho?.expediente ?? '—'}</Typography>
        <Typography>Número agresores: {hecho?.num_agresores ?? '—'}</Typography>
        <Typography>Domicilio: {geo?.domicilio ?? '—'}</Typography>
        <Typography>Departamento: {geo?.departamentos?.descripcion ?? '—'}</Typography>

        <Typography mt={1}>Tipo de hecho:</Typography>
        <Grid container>
          {relacion &&
            Object.entries(relacion)
              .filter(([k, v]) => v === true && k !== 'id' && k !== 'hecho_delictivo_id')
              .map(([k]) => (
                <Grid item xs={4} key={k}>
                  <FormControlLabel
                    control={<Checkbox checked={true} />}
                    label={k.replace(/_/g, ' ')}
                  />
                </Grid>
              ))}
        </Grid>
      </Box>

      <Box mt={2}>
        <Typography variant="h6">ABUSO SEXUAL</Typography>
        <Typography>Kit: {datosAbuso?.kit ?? '—'}</Typography>
        <Typography>Relación: {datosAbuso?.relacion ?? '—'}</Typography>
        <Typography>Relación otro: {datosAbuso?.relacion_otro ?? '—'}</Typography>
        <Typography>Lugar hecho: {datosAbuso?.lugar_hecho ?? '—'}</Typography>
        <Typography>Lugar otro: {datosAbuso?.lugar_otro ?? '—'}</Typography>
      </Box>

      <Box mt={2}>
        <Typography variant="h6">VÍCTIMA</Typography>
        <Typography>DNI: {victima?.dni ?? '—'}</Typography>
        <Typography>Nombre: {victima?.nombre ?? '—'}</Typography>
        <Typography>Género: {victima?.generos?.descripcion ?? '—'}</Typography>
        <Typography>Fecha nacimiento: {formatDate(victima?.fecha_nacimiento)}</Typography>
        <Typography>Teléfono: {victima?.telefono ?? '—'}</Typography>
        <Typography>Ocupación: {victima?.ocupacion ?? '—'}</Typography>
        <Typography>
          Dirección: {victima?.direccion?.calle_nro ?? ''} {victima?.direccion?.barrio ?? ''} - {victima?.direccion?.departamento ?? ''} / {victima?.direccion?.localidad ?? ''}
        </Typography>
      </Box>

      <Box mt={2}>
        <Typography variant="h6">ENTREVISTADO</Typography>
        <Typography>Nombre: {personaEntrevistada?.nombre ?? '—'}</Typography>
        <Typography>Relación: {personaEntrevistada?.relacion_victima ?? '—'}</Typography>
        <Typography>
          Dirección: {personaEntrevistada?.direccion?.calle_nro ?? ''} {personaEntrevistada?.direccion?.barrio ?? ''} - {personaEntrevistada?.direccion?.departamento ?? ''} / {personaEntrevistada?.direccion?.localidad ?? ''}
        </Typography>
      </Box>

      <Box mt={2}>
        <Typography variant="h6">ACCIONES PRIMERA LÍNEA</Typography>
        <Typography>{accion?.acciones ?? '—'}</Typography>
      </Box>

      <Box mt={2}>
        <Typography variant="h6">TIPO DE INTERVENCIÓN</Typography>
        {tipo ? (
          <ul>
            {Object.entries(tipo)
              .filter(([k, v]) => v === true && k !== 'id' && k !== 'intervencion_id')
              .map(([k]) => (
                <li key={k}>{k.replace(/_/g, ' ')}</li>
              ))}
          </ul>
        ) : (
          'No registrada'
        )}
      </Box>

      <Box mt={2}>
        <Typography variant="h6">SEGUIMIENTO</Typography>
        <Typography>¿Hubo? {seguimiento?.hubo ? 'Sí' : 'No'}</Typography>
        {seguimiento?.tipo?.[0] && (
          <ul>
            {Object.entries(seguimiento?.tipo?.[0])
              .filter(([k, v]) => v === true && k !== 'id' && k !== 'seguimiento_id')
              .map(([k]) => (
                <li key={k}>{k.replace(/([A-Z])/g, ' $1').toLowerCase()}</li>
              ))}
          </ul>
        )}
        <Typography>
          Detalle: {seguimiento?.detalles?.[0]?.detalle ?? '—'}
        </Typography>
      </Box>

      <Box mt={2}>
        <Typography variant="h6">RESEÑA HECHO</Typography>
        <Typography>{data.resena_hecho || '—'}</Typography>
      </Box>

      <Box mt={4}>
        <Typography>Fecha de creación: {formatDate(data.fecha_creacion)}</Typography>
      </Box>
    </Box>
  )
}
