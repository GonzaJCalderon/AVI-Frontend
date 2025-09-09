'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { obtenerIntervencionPorId } from '@/services/intervenciones'
import {
  Box,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  Chip,
  Grid,
  Checkbox,
  FormControlLabel,
  Alert,
  Button,
} from '@mui/material'

/** ===================== Tipos base ===================== **/
type IntervencionData = {
  intervencion?: {
    coordinador: string
    operador: string
    fecha: string
    resena_hecho: string
    nroFicha?: string
  }
  derivacion?: {
    motivos: number
    derivador: string
    hora: string
  }
  hechoDelictivo?: {
    expediente: string
    numAgresores: number
    fecha: string
    hora: string
    ubicacion: {
      calleBarrio: string
      departamento: number
    }
    tipoHecho: Record<string, boolean>
  }
  accionesPrimeraLinea?: string
  abusoSexual?: {
    simple: boolean
    agravado: boolean
  }
  datosAbusoSexual?: {
    kit: string
    relacion: string
    relacionOtro: string
    lugarHecho: string
    lugarOtro: string
  }
  victima?: {
    dni: string
    cantidadVictimas: number
    nombre: string
    genero: number
    fechaNacimiento: string
    telefono: string
    ocupacion: string
    direccion: {
      calleNro: string
      barrio: string
      departamento: number
      localidad: number
    }
  }
  personaEntrevistada?: {
    nombre: string
    relacionVictima: string
    direccion: {
      calleNro: string
      barrio: string
      departamento: number
      localidad: number
    }
  }
  tipoIntervencion?: Record<string, boolean>
  seguimiento?: {
    realizado: boolean
    tipo: Record<string, boolean>
  }
  detalleSeguimiento?: string
}

/** ===================== Utils ===================== **/
const formatDate = (date?: string) => {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  const dd = d.getDate().toString().padStart(2, '0')
  const mm = (d.getMonth() + 1).toString().padStart(2, '0')
  const yyyy = d.getFullYear().toString()
  return `${dd}/${mm}/${yyyy}`
}

const getGenero = (genero?: number) => {
  const generoMap: Record<number, string> = { 1: 'M', 2: 'F', 3: 'X' }
  return generoMap[genero || 0] || ''
}

const mapLugar = (key: string): string => {
  const map: Record<string, string> = {
    institucion: 'Institución',
    viaPublica: 'Vía Pública',
    domParticular: 'Dom. particular',
    lugarTrabajo: 'Lugar de trab.',
  }
  return map[key] || key
}

const splitNombre = (full?: string) => {
  if (!full) return { nombres: '', apellidos: '' }
  const parts = full.trim().split(/\s+/)
  if (parts.length === 1) return { nombres: parts[0], apellidos: '' }
  const apellidos = parts.slice(-2).join(' ')
  const nombres = parts.slice(0, -2).join(' ')
  return { nombres, apellidos }
}

const renderChipsFromFlags = (obj?: Record<string, boolean>) =>
  Object.entries(obj || {})
    .filter(([, v]) => v)
    .map(([k]) => <Chip key={k} label={k} size="small" sx={{ mr: 1, mb: 1 }} />)

/** ===================== Mapeo backend -> IntervencionData ===================== **/
function mapBackendToIntervencionData(jsonData: any): IntervencionData {
  const rel0 = jsonData?.hechos_delictivos?.[0]?.relaciones?.[0]
  const geo0 = jsonData?.hechos_delictivos?.[0]?.geo?.[0]

  const homicidioAny = !!(
    rel0?.homicidio_delito ||
    rel0?.homicidio_accidente_vial ||
    rel0?.homicidio_av_hecho ||
    rel0?.femicidio ||
    rel0?.travestisidio_transfemicidio
  )

  return {
    intervencion: {
      coordinador: jsonData?.coordinador || '',
      operador: jsonData?.operador || '',
      fecha: jsonData?.fecha || '',
      resena_hecho: jsonData?.resena_hecho || '',
      nroFicha: jsonData?.numero_intervencion || '',
    },
    derivacion: jsonData?.derivaciones?.[0]
      ? {
          motivos: jsonData.derivaciones[0].tipo_derivacion_id ?? 0,
          derivador: jsonData.derivaciones[0].derivador || '',
          hora:
            jsonData.derivaciones[0].fecha_derivacion
              ?.split('T')[1]
              ?.slice(0, 5) || '',
        }
      : undefined,
    hechoDelictivo: jsonData?.hechos_delictivos?.[0]
      ? {
          expediente: jsonData.hechos_delictivos[0].expediente || '',
          numAgresores: jsonData.hechos_delictivos[0].num_agresores || 0,
          fecha: geo0?.fecha || '',
          hora: geo0?.fecha?.split('T')[1]?.slice(0, 5) || '',
          ubicacion: {
            calleBarrio: geo0?.domicilio || '',
            departamento: geo0?.departamentos?.dep_id || 0,
          },
          tipoHecho: {
            'Robo': rel0?.robo || false,
            'Robo con arma de fuego': rel0?.robo_arma_fuego || false,
            'Robo con arma blanca': rel0?.robo_arma_blanca || false,
            'Amenazas': rel0?.amenazas || false,
            'Lesiones': rel0?.lesiones || false,
            'Lesiones con arma de fuego': rel0?.lesiones_arma_fuego || false,
            'Lesiones con arma blanca': rel0?.lesiones_arma_blanca || false,
            'Homicidio': homicidioAny,
            'Homicidio por delito': rel0?.homicidio_delito || false,
            'Homicidio por accidente vial': rel0?.homicidio_accidente_vial || false,
            'Homicidio/ Av. Hecho': rel0?.homicidio_av_hecho || false,
            'Femicidio': rel0?.femicidio || false,
            'Travestisidio/ transfemicidio': rel0?.travestisidio_transfemicidio || false,
            'Violencia de género': rel0?.violencia_genero || false,
            'Otros': rel0?.otros || false,
          },
        }
      : undefined,
    accionesPrimeraLinea: jsonData?.acciones_primera_linea?.[0]?.acciones || '',
    abusoSexual: { simple: false, agravado: false },
    datosAbusoSexual: jsonData?.abusos_sexuales?.[0]?.datos?.[0]
      ? {
          kit: String(jsonData.abusos_sexuales[0].datos[0].kit || '').toUpperCase(),
          relacion: jsonData.abusos_sexuales[0].datos[0].relacion || '',
          relacionOtro: jsonData.abusos_sexuales[0].datos[0].relacion_otro || '',
          lugarHecho: mapLugar(jsonData.abusos_sexuales[0].datos[0].lugar_hecho),
          lugarOtro: jsonData.abusos_sexuales[0].datos[0].lugar_otro || '',
        }
      : undefined,
    victima: jsonData?.victimas?.[0]
      ? {
          dni: jsonData.victimas[0].dni || '',
          cantidadVictimas: jsonData.victimas[0].cantidad_victima_por_hecho || 1,
          nombre: jsonData.victimas[0].nombre || '',
          genero: Number(jsonData.victimas[0].genero_id) || 0,
          fechaNacimiento: jsonData.victimas[0].fecha_nacimiento || '',
          telefono: jsonData.victimas[0].telefono || '',
          ocupacion: jsonData.victimas[0].ocupacion || '',
          direccion: {
            calleNro: jsonData.victimas[0].direccion?.calle_nro || '',
            barrio: jsonData.victimas[0].direccion?.barrio || '',
            departamento: Number(jsonData.victimas[0].direccion?.departamento) || 0,
            localidad: Number(jsonData.victimas[0].direccion?.localidad) || 0,
          },
        }
      : undefined,
    personaEntrevistada: jsonData?.victimas?.[0]?.personas_entrevistadas?.[0]
      ? {
          nombre: jsonData.victimas[0].personas_entrevistadas[0].nombre || '',
          relacionVictima: jsonData.victimas[0].personas_entrevistadas[0].relacion_victima || '',
          direccion: {
            calleNro: jsonData.victimas[0].personas_entrevistadas[0].direccion?.calle_nro || '',
            barrio: jsonData.victimas[0].personas_entrevistadas[0].direccion?.barrio || '',
            departamento: Number(jsonData.victimas[0].personas_entrevistadas[0].direccion?.departamento) || 0,
            localidad: Number(jsonData.victimas[0].personas_entrevistadas[0].direccion?.localidad) || 0,
          },
        }
      : undefined,
    tipoIntervencion: jsonData?.intervenciones_tipo?.[0]
      ? {
          'Intervención en crisis': jsonData.intervenciones_tipo[0].crisis,
          'Intervención social': jsonData.intervenciones_tipo[0].social,
          'Intervención legal': jsonData.intervenciones_tipo[0].legal,
          'Intervención telefónica': jsonData.intervenciones_tipo[0].telefonica,
          'Intervención Psicológica': jsonData.intervenciones_tipo[0].psicologica,
          'Intervención médica': jsonData.intervenciones_tipo[0].medica,
          'Intervención domiciliaria': jsonData.intervenciones_tipo[0].domiciliaria,
          'Sin intervención': jsonData.intervenciones_tipo[0].sin_intervencion,
          'Archivo': jsonData.intervenciones_tipo[0].archivo_caso,
        }
      : undefined,
    seguimiento: jsonData?.seguimientos?.[0]
      ? {
          realizado: jsonData.seguimientos[0].hubo || false,
          tipo: jsonData.seguimientos[0].tipo?.[0]
            ? {
                'Asesoramiento legal': jsonData.seguimientos[0].tipo[0].asesoramientolegal,
                'Tratamiento psicológico': jsonData.seguimientos[0].tipo[0].tratamientopsicologico,
                'Seguimiento legal': jsonData.seguimientos[0].tipo[0].seguimientolegal,
                'Archivo': jsonData.seguimientos[0].tipo[0].archivocaso,
              }
            : {},
        }
      : undefined,
    detalleSeguimiento: jsonData?.seguimientos?.[0]?.detalles?.[0]?.detalle || '',
  }
}

/** ===================== Componente ===================== **/
export default function VerFormularioPage() {
  const sp = useSearchParams()
  const id = sp.get('id')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<IntervencionData | null>(null)
  const [nroFicha, setNroFicha] = useState<string>('')

  useEffect(() => {
    if (!id) {
      setError('ID no provisto')
      setLoading(false)
      return
    }
    const ac = new AbortController()

    ;(async () => {
      setLoading(true)
      setError(null)
      setData(null)
      try {
       const resp = await obtenerIntervencionPorId(Number(id))

        // El servicio podría devolver {success,data} o el objeto crudo:
        const raw = (resp && (resp as any).data) ? (resp as any).data : resp
        if (!raw) throw new Error('Respuesta vacía')
        const mapped = mapBackendToIntervencionData(raw)
        setData(mapped)
        setNroFicha(mapped.intervencion?.nroFicha || String(id))
      } catch (e: any) {
        if (e?.name !== 'AbortError') setError(e?.message || 'Error al cargar la intervención')
      } finally {
        setLoading(false)
      }
    })()

    return () => ac.abort()
  }, [id])

  const otrosTipoHecho = useMemo(() => {
    const KNOWN = new Set([
      'Robo',
      'Homicidio',
      'Violencia de género',
      'Robo con arma de fuego',
      'Homicidio por accidente vial',
      'Robo con arma blanca',
      'Homicidio/ Av. Hecho',
      'Lesiones',
      'Homicidio por delito',
      'Travestisidio/ transfemicidio',
      'Lesiones con arma de fuego',
      'Amenazas',
      'Lesiones con arma blanca',
      'Femicidio',
    ])
    const entry = Object.entries(data?.hechoDelictivo?.tipoHecho || {}).find(
      ([k, v]) => v && !KNOWN.has(k)
    )
    return entry?.[0] || ''
  }, [data])

  if (loading) {
    return (
    <Box sx={{ p: 6, display: 'grid', placeItems: 'center' }}>
  <CircularProgress />
  <Typography sx={{ mt: 2 }}>Cargando intervención…</Typography>
</Box>

    )
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  if (!data) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">No se encontró la intervención.</Alert>
      </Box>
    )
  }

  const { nombres, apellidos } = splitNombre(data.victima?.nombre)

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 4, maxWidth: 1000, margin: 'auto' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h5" fontWeight="bold">
            Intervención #{nroFicha}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" size="small" onClick={() => window.print()}>
              🖨️ Imprimir
            </Button>
          </Box>
        </Box>

        <Typography>
          <strong>Coordinador:</strong> {data.intervencion?.coordinador || '—'}
        </Typography>
        <Typography>
          <strong>Operador:</strong> {data.intervencion?.operador || '—'}
        </Typography>
        <Typography>
          <strong>Fecha:</strong> {formatDate(data.intervencion?.fecha) || '—'}
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Derivación */}
        <Typography variant="h6" gutterBottom><strong>Derivación</strong></Typography>
        <Typography mb={1}>
          <strong>Derivador:</strong> {data.derivacion?.derivador || '—'}
        </Typography>
        <Typography mb={1}>
          <strong>Hora:</strong> {data.derivacion?.hora || '—'}
        </Typography>
        <Typography mb={1}><strong>Motivo:</strong> {
          ({
            1: 'CEO 911',
            2: 'Min. Seguridad',
            3: 'Min. Público',
            4: 'Fiscal',
            5: 'Municipio',
            6: 'Hospital',
            7: 'Centro de Salud',
            8: 'Demanda espontánea',
            9: 'Otro',
          } as Record<number, string>)[data.derivacion?.motivos || 0] || '—'
        }</Typography>

        <Divider sx={{ my: 3 }} />

        {/* Hecho delictivo */}
        <Typography variant="h6" gutterBottom><strong>Hecho Delictivo</strong></Typography>
        <Typography><strong>Expediente:</strong> {data.hechoDelictivo?.expediente || '—'}</Typography>
        <Typography><strong>Nro Agresores:</strong> {data.hechoDelictivo?.numAgresores || '—'}</Typography>
        <Typography><strong>Fecha/Hora:</strong> {formatDate(data.hechoDelictivo?.fecha) || '—'} {data.hechoDelictivo?.hora || ''}</Typography>
        <Typography sx={{ mb: 1 }}>
          <strong>Ubicación:</strong> {data.hechoDelictivo?.ubicacion?.calleBarrio || '—'} — Dep: {data.hechoDelictivo?.ubicacion?.departamento || '—'}
        </Typography>
        <Typography sx={{ mb: 1 }}><strong>Tipo de hecho:</strong></Typography>
        <Box sx={{ mb: 1 }}>
          {renderChipsFromFlags(data.hechoDelictivo?.tipoHecho)}
          {otrosTipoHecho && <Chip label={`Otros: ${otrosTipoHecho}`} size="small" sx={{ mr: 1, mb: 1 }} />}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Acciones primera línea */}
        <Typography variant="h6" gutterBottom><strong>Acciones de Primera Línea</strong></Typography>
        <Typography sx={{ whiteSpace: 'pre-wrap' }}>
          {data.accionesPrimeraLinea || '—'}
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Abuso sexual */}
        <Typography variant="h6" gutterBottom><strong>Abuso Sexual</strong></Typography>
        <Grid container spacing={2} sx={{ mb: 1 }}>
          <Grid item xs={6}>
            <Typography>
              <strong>Kit:</strong>{' '}
              <Checkbox disabled checked={data.datosAbusoSexual?.kit === 'SI'} size="small" sx={{ p: 0.25 }} /> SI
              <Checkbox disabled checked={data.datosAbusoSexual?.kit === 'NO'} size="small" sx={{ p: 0.25 }} /> NO
            </Typography>
          </Grid>
        </Grid>
        <Typography><strong>Relación víctima/agresor:</strong> {data.datosAbusoSexual?.relacion || '—'}</Typography>
        {!!data.datosAbusoSexual?.relacionOtro && (
          <Typography><strong>Otro:</strong> {data.datosAbusoSexual?.relacionOtro}</Typography>
        )}
        <Typography sx={{ mt: 1 }}><strong>Lugar del hecho:</strong> {data.datosAbusoSexual?.lugarHecho || '—'}</Typography>
        {!!data.datosAbusoSexual?.lugarOtro && (
          <Typography><strong>Otro:</strong> {data.datosAbusoSexual?.lugarOtro}</Typography>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Víctima */}
        <Typography variant="h6" gutterBottom><strong>Víctima</strong></Typography>
        <Typography><strong>Cantidad:</strong> {data.victima?.cantidadVictimas || '—'}</Typography>
        <Grid container spacing={1} sx={{ my: 1 }}>
          <Grid item xs={3}><Typography><strong>DNI:</strong> {data.victima?.dni || '—'}</Typography></Grid>
          <Grid item xs={4}><Typography><strong>Apellido:</strong> {apellidos || '—'}</Typography></Grid>
          <Grid item xs={5}><Typography><strong>Nombres:</strong> {nombres || '—'}</Typography></Grid>
        </Grid>
        <Grid container spacing={1} sx={{ my: 1 }}>
          <Grid item xs={4}>
            <Typography>
              <strong>Género:</strong>{' '}
              <Checkbox disabled checked={getGenero(data.victima?.genero) === 'M'} size="small" sx={{ p: 0.25 }} /> M
              <Checkbox disabled checked={getGenero(data.victima?.genero) === 'F'} size="small" sx={{ p: 0.25 }} /> F
              <Checkbox disabled checked={getGenero(data.victima?.genero) === 'X'} size="small" sx={{ p: 0.25 }} /> X
            </Typography>
          </Grid>
          <Grid item xs={4}><Typography><strong>Nacimiento:</strong> {formatDate(data.victima?.fechaNacimiento) || '—'}</Typography></Grid>
          <Grid item xs={4}><Typography><strong>Teléfono:</strong> {data.victima?.telefono || '—'}</Typography></Grid>
        </Grid>
        <Typography sx={{ mb: 1 }}>
          <strong>Dirección:</strong>{' '}
          {data.victima?.direccion
            ? `${data.victima.direccion.calleNro}, ${data.victima.direccion.barrio} — Dep: ${data.victima.direccion.departamento}`
            : '—'}
        </Typography>
        <Typography sx={{ mb: 2 }}><strong>Ocupación:</strong> {data.victima?.ocupacion || '—'}</Typography>

        {/* Persona entrevistada */}
        {data.personaEntrevistada && (
          <>
            <Typography variant="subtitle1" sx={{ mt: 1 }}><strong>Persona entrevistada</strong></Typography>
            <Typography><strong>Nombre:</strong> {data.personaEntrevistada?.nombre || '—'}</Typography>
            <Typography><strong>Relación:</strong> {data.personaEntrevistada?.relacionVictima || '—'}</Typography>
            <Typography>
              <strong>Dirección:</strong>{' '}
              {data.personaEntrevistada?.direccion
                ? `${data.personaEntrevistada.direccion.calleNro}, ${data.personaEntrevistada.direccion.barrio} — Dep: ${data.personaEntrevistada.direccion.departamento}`
                : '—'}
            </Typography>
          </>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Tipo de intervención */}
        <Typography variant="h6" gutterBottom><strong>Tipo de Intervención</strong></Typography>
        <Box sx={{ mb: 1 }}>
          {renderChipsFromFlags(data.tipoIntervencion)}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Seguimiento */}
        <Typography variant="h6" gutterBottom><strong>Seguimiento</strong></Typography>
        <Typography>
          <strong>Se realizó seguimiento:</strong>{' '}
          {data.seguimiento?.realizado ? 'Sí' : 'No'}
        </Typography>
        <Box sx={{ mt: 1, mb: 1 }}>
          {renderChipsFromFlags(data.seguimiento?.tipo)}
        </Box>
        {!!data.detalleSeguimiento && (
          <>
            <Typography sx={{ mt: 1 }}><strong>Detalle:</strong></Typography>
            <Typography sx={{ whiteSpace: 'pre-wrap' }}>{data.detalleSeguimiento}</Typography>
          </>
        )}
      </Paper>
    </Box>
  )
}
