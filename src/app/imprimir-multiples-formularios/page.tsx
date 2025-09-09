'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Grid,
  Checkbox,
  FormControlLabel,
  Alert,
  Divider,
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

/** ===================== Utilidades ===================== **/
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
  // Heurística local: últimas dos palabras como apellidos
  const apellidos = parts.slice(-2).join(' ')
  const nombres = parts.slice(0, -2).join(' ')
  return { nombres, apellidos }
}

/** ===================== Mapeo backend -> IntervencionData ===================== **/
function mapBackendToIntervencionData(jsonData: any): IntervencionData {
  // Relación 0 si existe (flags de tipo hecho)
  const rel0 = jsonData?.hechos_delictivos?.[0]?.relaciones?.[0]
  const geo0 = jsonData?.hechos_delictivos?.[0]?.geo?.[0]

  const homicidioAny = !!(
    rel0?.homicidio_delito ||
    rel0?.homicidio_accidente_vial ||
    rel0?.homicidio_av_hecho ||
    rel0?.femicidio ||
    rel0?.travestisidio_transfemicidio
  )

  const mapped: IntervencionData = {
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
    abusoSexual: {
      simple: false,
      agravado: false,
    },
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
          relacionVictima:
            jsonData.victimas[0].personas_entrevistadas[0].relacion_victima || '',
          direccion: {
            calleNro:
              jsonData.victimas[0].personas_entrevistadas[0].direccion?.calle_nro ||
              '',
            barrio:
              jsonData.victimas[0].personas_entrevistadas[0].direccion?.barrio ||
              '',
            departamento: Number(
              jsonData.victimas[0].personas_entrevistadas[0].direccion?.departamento
            ) || 0,
            localidad: Number(
              jsonData.victimas[0].personas_entrevistadas[0].direccion?.localidad
            ) || 0,
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

  return mapped
}

/** ===================== Componente principal ===================== **/
export default function ImprimirMultiplesFormulariosPage() {
  const sp = useSearchParams()
  const ids = useMemo(() => sp.getAll('id').filter(Boolean), [sp])

  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<Array<{ id: string; data: IntervencionData }>>([])
  const [errors, setErrors] = useState<Array<{ id: string; error: string }>>([])

  useEffect(() => {
    if (!ids.length) {
      setLoading(false)
      setItems([])
      return
    }
    const ac = new AbortController()

    ;(async () => {
      setLoading(true)
      setItems([])
      setErrors([])
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('Token no encontrado')

        const base = 'http://10.100.1.80:3333/api/intervenciones'
        const results = await Promise.allSettled(
          ids.map(async (id) => {
            const res = await fetch(`${base}/${id}`, {
              headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
              signal: ac.signal,
            })
            const json = await res.json()
            if (!res.ok || !json?.success || !json?.data) {
              throw new Error('Respuesta inválida del servidor')
            }
            const mapped = mapBackendToIntervencionData(json.data)
            return { id, data: mapped }
          })
        )

        const ok: Array<{ id: string; data: IntervencionData }> = []
        const ko: Array<{ id: string; error: string }> = []

        results.forEach((r, idx) => {
          const id = ids[idx]
          if (r.status === 'fulfilled') ok.push(r.value)
          else ko.push({ id, error: r.reason?.message || 'Error desconocido' })
        })

        setItems(ok)
        setErrors(ko)
      } catch (e: any) {
        if (e?.name !== 'AbortError') {
          setErrors([{ id: 'lote', error: e?.message || 'Error general' }])
        }
      } finally {
        setLoading(false)
      }
    })()

    return () => ac.abort()
  }, [ids])

  const handlePrintPDF = async () => {
    if (typeof window === 'undefined') return
    const html2pdf = (await import('html2pdf.js')).default
    const element = document.getElementById('pdf-multi-content')
    if (!element) return
    html2pdf()
      .from(element)
      .set({
        margin: 10,
        filename: `intervenciones_${ids.join('_')}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .save()
  }

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Cargando intervenciones…</Typography>
      </Box>
    )
  }

  if (!items.length && !errors.length) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">
          No se recibieron IDs. Usá la URL así: <b>?id=21&amp;id=22&amp;id=23</b>
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 4, maxWidth: '210mm', margin: '0 auto' }}>
      {/* Barra de acciones */}
      <Box display="flex" gap={2} mb={2} sx={{ '@media print': { display: 'none' } }}>
        <Button variant="contained" onClick={handlePrintPDF}>📄 Descargar PDF</Button>
        <Button variant="outlined" onClick={() => window.print()}>🖨️ Imprimir</Button>
      </Box>

      {/* Errores por ID (si hubo) */}
      {errors.length > 0 && (
        <Box mb={2}>
          {errors.map((e) => (
            <Alert key={e.id} severity="error" sx={{ mb: 1 }}>
              Error al cargar ID <b>{e.id}</b>: {e.error}
            </Alert>
          ))}
        </Box>
      )}

      <Box id="pdf-multi-content" sx={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', lineHeight: 1.4 }}>
        {items.map(({ id, data }, idx) => (
          <Box
            key={id}
            sx={{
              p: 3,
              // Corte de página después de cada item excepto el último
              ...(idx < items.length - 1
                ? { pageBreakAfter: 'always', borderBottom: '1px dashed #ccc', mb: 3, pb: 3 }
                : {}),
            }}
          >
            {/* Encabezado */}
            <Box textAlign="center" mb={3}>
              <Typography variant="h5" fontWeight="bold" sx={{ fontSize: '16px' }}>
                CENTRO DE ASISTENCIA A VICTIMAS DEL DELITO
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
                    Fecha: <u>{formatDate(data.intervencion?.fecha)}</u>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ fontSize: '12px' }}>
                    Coordinador: <u>{data.intervencion?.coordinador || ''}</u>
                  </Typography>
                </Grid>
              </Grid>
              <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid item xs={6}>
                  <Typography sx={{ fontSize: '12px' }}>
                    Nro de Ficha: <u>{data.intervencion?.nroFicha || id || ''}</u>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ fontSize: '12px' }}>
                    Operador: <u>{data.intervencion?.operador || ''}</u>
                  </Typography>
                </Grid>
              </Grid>
              <Typography sx={{ fontSize: '12px', mt: 1 }}>
                Breve reseña del hecho:
              </Typography>
              <Typography sx={{ fontSize: '12px', border: '1px solid #000', p: 1, minHeight: '40px', mt: 0.5 }}>
                {data.intervencion?.resena_hecho || ''}
              </Typography>
            </Box>

            {/* 2. DERIVACIÓN */}
            <Box mb={2}>
              <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '13px', mb: 1 }}>
                2. DERIVACIÓN
              </Typography>
              <Typography sx={{ fontSize: '12px', mb: 1 }}>
                Nombre y Apellido del Derivador: <u>{data.derivacion?.derivador || ''}</u> Hora <u>{data.derivacion?.hora || ''}</u>
              </Typography>

              {/* Motivos (checkboxes) */}
              <Grid container spacing={1}>
                {[1,2,3,4,6,7,8].map((code) => (
                  <Grid key={code} item xs={3}>
                    <FormControlLabel
                      control={<Checkbox disabled checked={data.derivacion?.motivos === code} size="small" />}
                      label={
                        ({
                          1: 'CEO 911',
                          2: 'Min. Seguridad',
                          3: 'Min. Público',
                          4: 'Fiscal',
                          6: 'Hospital',
                          7: 'Centro de Salud',
                          8: 'Demanda espontánea',
                        } as Record<number, string>)[code]
                      }
                      sx={{ '& .MuiFormControlLabel-label': { fontSize: '12px' } }}
                    />
                  </Grid>
                ))}
                <Grid item xs={3}>
                  <Typography sx={{ fontSize: '12px' }}>
                    Municipio: <u>{data.derivacion?.motivos === 5 ? 'X' : ''}</u>
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography sx={{ fontSize: '12px' }}>
                    Otro: <u>{data.derivacion?.motivos === 9 ? 'X' : ''}</u>
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {/* 3. DATOS DEL HECHO DELICTIVO */}
            <Box mb={2}>
              <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '13px', mb: 1 }}>
                3. DATOS DEL HECHO DELICTIVO
              </Typography>
              <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid item xs={8}>
                  <Typography sx={{ fontSize: '12px' }}>
                    Número de Expediente: <u>{data.hechoDelictivo?.expediente || ''}</u>
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography sx={{ fontSize: '12px' }}>
                    Nros de Agresores: <u>{data.hechoDelictivo?.numAgresores || ''}</u>
                  </Typography>
                </Grid>
              </Grid>

              {/* Checkboxes tipos de hechos (disabled) */}
              <Grid container spacing={1} sx={{ mb: 1 }}>
                {[
                  'Robo',
                  'Homicidio',
                  'Violencia de género',
                  'Robo con arma de fuego',
                  'Homicidio por accidente vial',
                  'Abuso sexual simple', // tomado de abusoSexual
                  'Robo con arma blanca',
                  'Homicidio/ Av. Hecho',
                  'Abuso sexual agravado', // tomado de abusoSexual
                  'Lesiones',
                  'Homicidio por delito',
                  'Travestisidio/ transfemicidio',
                  'Lesiones con arma de fuego',
                  'Amenazas',
                  'Lesiones con arma blanca',
                  'Femicidio',
                ].map((k) => {
                  const isAbuso = k.startsWith('Abuso sexual')
                  const checked = isAbuso
                    ? (k.endsWith('simple') ? !!data.abusoSexual?.simple : !!data.abusoSexual?.agravado)
                    : !!data.hechoDelictivo?.tipoHecho?.[k]
                  return (
                    <Grid key={k} item xs={4}>
                      <FormControlLabel
                        control={<Checkbox disabled checked={checked} size="small" />}
                        label={k}
                        sx={{ '& .MuiFormControlLabel-label': { fontSize: '12px' } }}
                      />
                    </Grid>
                  )
                })}
              </Grid>

              {/* Otros */}
              <Typography sx={{ fontSize: '12px', mb: 1 }}>
                Otros:{' '}
                <u>
                  {(() => {
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
                    const entry = Object.entries(data.hechoDelictivo?.tipoHecho || {}).find(
                      ([k, v]) => v && !KNOWN.has(k)
                    )
                    return entry?.[0] || ''
                  })()}
                </u>
              </Typography>

              <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '12px', mb: 1 }}>
                Ubicación geográfica del hecho
              </Typography>
              <Typography sx={{ fontSize: '12px', mb: 1 }}>
                Calle y nro / Barrio/ Lugar <u>{data.hechoDelictivo?.ubicacion?.calleBarrio || ''}</u>
              </Typography>
              <Typography sx={{ fontSize: '12px', mb: 1 }}>
                Departamento <u>{data.hechoDelictivo?.ubicacion?.departamento || ''}</u>
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography sx={{ fontSize: '12px' }}>
                    Fecha del hecho: <u>{formatDate(data.hechoDelictivo?.fecha)}</u>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ fontSize: '12px' }}>
                    Hora del hecho: <u>{data.hechoDelictivo?.hora || ''}</u>
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {/* 4. ACCIONES REALIZADAS EN PRIMERA LINEA */}
            <Box mb={2}>
              <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '13px', mb: 1 }}>
                4. ACCIONES REALIZADAS EN PRIMERA LINEA
              </Typography>
              <Typography sx={{ fontSize: '12px', border: '1px solid #000', p: 1, minHeight: '60px' }}>
                {data.accionesPrimeraLinea || ''}
              </Typography>
            </Box>

            {/* 5. ABUSO SEXUAL */}
            <Box mb={2}>
              <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '13px', mb: 1 }}>
                5. ABUSO SEXUAL
              </Typography>
              <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid item xs={6}>
                  <Typography sx={{ fontSize: '12px' }}>
                    Aplicación del kit
                    <Checkbox disabled checked={data.datosAbusoSexual?.kit === 'SI'} size="small" sx={{ p: 0.25 }} /> SI
                    <Checkbox disabled checked={data.datosAbusoSexual?.kit === 'NO'} size="small" sx={{ p: 0.25 }} /> NO
                  </Typography>
                </Grid>
              </Grid>
              <Typography sx={{ fontSize: '12px', mb: 1 }}>
                Relación entre la víctima y presunto agresor:
              </Typography>
              <Grid container spacing={1}>
                {['Conocido', 'Desconocido', 'Familiar', 'Pareja'].map((rel) => (
                  <Grid key={rel} item xs={3}>
                    <FormControlLabel
                      control={<Checkbox disabled checked={data.datosAbusoSexual?.relacion === rel} size="small" />}
                      label={rel}
                      sx={{ '& .MuiFormControlLabel-label': { fontSize: '12px' } }}
                    />
                  </Grid>
                ))}
                <Grid item xs={3}>
                  <Typography sx={{ fontSize: '12px' }}>
                    Otro: <u>{data.datosAbusoSexual?.relacionOtro || ''}</u>
                  </Typography>
                </Grid>
              </Grid>
              <Typography sx={{ fontSize: '12px', mt: 1, mb: 1 }}>
                Tipo del lugar del hecho:
              </Typography>
              <Grid container spacing={1}>
                {['Institución', 'Vía Pública', 'Dom. particular', 'Lugar de trab.'].map((l) => (
                  <Grid key={l} item xs={3}>
                    <FormControlLabel
                      control={<Checkbox disabled checked={data.datosAbusoSexual?.lugarHecho === l} size="small" />}
                      label={l}
                      sx={{ '& .MuiFormControlLabel-label': { fontSize: '12px' } }}
                    />
                  </Grid>
                ))}
              </Grid>
              <Typography sx={{ fontSize: '12px', mt: 0.5 }}>
                Otro: <u>{data.datosAbusoSexual?.lugarOtro || ''}</u>
              </Typography>
            </Box>

            {/* 6. VÍCTIMA */}
            <Box mb={2}>
              <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '13px', mb: 1 }}>
                6. VÍCTIMA
              </Typography>
              <Typography sx={{ fontSize: '12px', mb: 1 }}>
                Cantidad de víctimas: <u>{data.victima?.cantidadVictimas || ''}</u>
              </Typography>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '12px', mb: 1 }}>
                Identificación:
              </Typography>

              {(() => {
                const { nombres, apellidos } = splitNombre(data.victima?.nombre)
                return (
                  <>
                    <Grid container spacing={1} sx={{ mb: 1 }}>
                      <Grid item xs={3}>
                        <Typography sx={{ fontSize: '12px' }}>
                          DNI: <u>{data.victima?.dni || ''}</u>
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography sx={{ fontSize: '12px' }}>
                          Apellido: <u>{apellidos}</u>
                        </Typography>
                      </Grid>
                      <Grid item xs={5}>
                        <Typography sx={{ fontSize: '12px' }}>
                          Nombres: <u>{nombres}</u>
                        </Typography>
                      </Grid>
                    </Grid>
                  </>
                )
              })()}

              <Grid container spacing={1} sx={{ mb: 1 }}>
                <Grid item xs={4}>
                  <Typography sx={{ fontSize: '12px' }}>
                    Género:
                    <Checkbox disabled checked={getGenero(data.victima?.genero) === 'M'} size="small" sx={{ p: 0.25 }} /> M
                    <Checkbox disabled checked={getGenero(data.victima?.genero) === 'F'} size="small" sx={{ p: 0.25 }} /> F
                    <Checkbox disabled checked={getGenero(data.victima?.genero) === 'X'} size="small" sx={{ p: 0.25 }} /> X
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography sx={{ fontSize: '12px' }}>
                    Fecha de nacimiento: <u>{formatDate(data.victima?.fechaNacimiento)}</u>
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography sx={{ fontSize: '12px' }}>
                    Teléfono: <u>{data.victima?.telefono || ''}</u>
                  </Typography>
                </Grid>
              </Grid>
              <Typography sx={{ fontSize: '12px', mb: 1 }}>
                Calle y nro / Barrio/ Lugar:{' '}
                <u>
                  {data.victima?.direccion
                    ? `${data.victima.direccion.calleNro}, ${data.victima.direccion.barrio}`
                    : ''}
                </u>{' '}
                Departamento <u>{data.victima?.direccion?.departamento || ''}</u>
              </Typography>
              <Typography sx={{ fontSize: '12px', mb: 2 }}>
                Ocupación: <u>{data.victima?.ocupacion || ''}</u>
              </Typography>

              <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '12px', mb: 1 }}>
                Persona entrevistada:
              </Typography>
              <Typography sx={{ fontSize: '12px', mb: 1 }}>
                Nombre y Apellido: <u>{data.personaEntrevistada?.nombre || ''}</u>
              </Typography>
              <Typography sx={{ fontSize: '12px', mb: 1 }}>
                Calle y nro / Barrio/ Lugar:{' '}
                <u>
                  {data.personaEntrevistada?.direccion
                    ? `${data.personaEntrevistada.direccion.calleNro}, ${data.personaEntrevistada.direccion.barrio}`
                    : ''}
                </u>{' '}
                Departamento <u>{data.personaEntrevistada?.direccion?.departamento || ''}</u>
              </Typography>
              <Typography sx={{ fontSize: '12px' }}>
                Relación con la víctima: <u>{data.personaEntrevistada?.relacionVictima || ''}</u>
              </Typography>
            </Box>

            {/* 7. TIPO DE INTERVENCIÓN */}
            <Box mb={2}>
              <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '13px', mb: 1 }}>
                7. TIPO DE INTERVENCIÓN:
              </Typography>
              <Grid container spacing={1} sx={{ mb: 1 }}>
                {[
                  'Intervención en crisis',
                  'Intervención social',
                  'Intervención legal',
                  'Intervención telefónica',
                  'Intervención Psicológica',
                  'Intervención médica',
                  'Intervención domiciliaria',
                  'Sin intervención',
                  'Archivo',
                ].map((k) => (
                  <Grid key={k} item xs={4}>
                    <FormControlLabel
                      control={<Checkbox disabled checked={!!data.tipoIntervencion?.[k]} size="small" />}
                      label={k}
                      sx={{ '& .MuiFormControlLabel-label': { fontSize: '12px' } }}
                    />
                  </Grid>
                ))}
              </Grid>

              <Typography sx={{ fontSize: '12px', mb: 1 }}>
                Detalle de la intervención:
              </Typography>
              <Typography sx={{ fontSize: '12px', border: '1px solid #000', p: 1, minHeight: '40px', mb: 2 }}>
                {data.detalleSeguimiento || ''}
              </Typography>

              <Typography sx={{ fontSize: '12px', mb: 1 }}>
                Se realizó seguimiento:
                <Checkbox disabled checked={data.seguimiento?.realizado === true} size="small" sx={{ p: 0.25 }} /> SI
                <Checkbox disabled checked={data.seguimiento?.realizado === false} size="small" sx={{ p: 0.25 }} /> NO
              </Typography>

              <Typography sx={{ fontSize: '12px', mb: 1 }}>
                Tipo de seguimiento:
              </Typography>
              <Grid container spacing={1}>
                {[
                  'Asesoramiento legal',
                  'Tratamiento psicológico',
                  'Seguimiento legal',
                  'Archivo',
                ].map((k) => (
                  <Grid key={k} item xs={3}>
                    <FormControlLabel
                      control={<Checkbox disabled checked={!!data.seguimiento?.tipo?.[k]} size="small" />}
                      label={k}
                      sx={{ '& .MuiFormControlLabel-label': { fontSize: '12px' } }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Pie opcional */}
            <Divider sx={{ mt: 2 }} />
            <Typography sx={{ fontSize: '11px', mt: 1, color: 'text.secondary' }}>
              ID interno: {id}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Estilos para impresión */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #pdf-multi-content, #pdf-multi-content * { visibility: visible; }
          #pdf-multi-content { position: absolute; left: 0; top: 0; width: 100%; }
          @page { margin: 1cm; size: A4; }
        }
      `}</style>
    </Box>
  )
}
