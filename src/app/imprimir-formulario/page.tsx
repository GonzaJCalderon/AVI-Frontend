'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Divider,
  CircularProgress,
  Button,
  Grid,
  Checkbox,
  FormControlLabel
} from '@mui/material'

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

const mapLugar = (key: string): string => {
  const map: Record<string, string> = {
    institucion: 'Institución',
    viaPublica: 'Vía Pública',
    domParticular: 'Dom. particular',
    lugarTrabajo: 'Lugar de trab.'
  }
  return map[key] || key
}


export default function ImprimirFormularioPage() {
  const id = useSearchParams().get('id')
  const [data, setData] = useState<IntervencionData | null>(null)
  const [loading, setLoading] = useState(true)

useEffect(() => {
  if (!id) return
const obtenerDatos = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Token no encontrado')

    const res = await fetch(`http://10.100.1.80:3333/api/intervenciones/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    })

    const json = await res.json()
    if (!res.ok || !json.success || !json.data) {
      throw new Error('Error en la respuesta del servidor')
    }

    // 🎯 Mapeo (dejalo como lo tenés)
    const mappedData: IntervencionData = {
      intervencion: {
        coordinador: json.data.coordinador || '',
        operador: json.data.operador || '',
        fecha: json.data.fecha || '',
        resena_hecho: json.data.resena_hecho || '',
        nroFicha: json.data.numero_intervencion || ''
      },
      derivacion: json.data.derivaciones?.[0]
        ? {
            motivos: json.data.derivaciones[0].tipo_derivacion_id ?? 0,
            derivador: json.data.derivaciones[0].derivador || '',
            hora: json.data.derivaciones[0].fecha_derivacion?.split('T')[1]?.slice(0, 5) || ''
          }
        : undefined,
      hechoDelictivo: json.data.hechos_delictivos?.[0]
        ? {
            expediente: json.data.hechos_delictivos[0].expediente || '',
            numAgresores: json.data.hechos_delictivos[0].num_agresores || 0,
            fecha: json.data.hechos_delictivos[0].geo?.[0]?.fecha || '',
            hora: json.data.hechos_delictivos[0].geo?.[0]?.fecha?.split('T')[1]?.slice(0, 5) || '',
            ubicacion: {
              calleBarrio: json.data.hechos_delictivos[0].geo?.[0]?.domicilio || '',
              departamento: json.data.hechos_delictivos[0].geo?.[0]?.departamentos?.dep_id || 0
            },
            tipoHecho: {
              'Robo': json.data.hechos_delictivos[0].relaciones?.[0]?.robo || false,
              'Robo con arma de fuego': json.data.hechos_delictivos[0].relaciones?.[0]?.robo_arma_fuego || false,
              'Robo con arma blanca': json.data.hechos_delictivos[0].relaciones?.[0]?.robo_arma_blanca || false,
              'Amenazas': json.data.hechos_delictivos[0].relaciones?.[0]?.amenazas || false,
              'Lesiones': json.data.hechos_delictivos[0].relaciones?.[0]?.lesiones || false,
              'Lesiones con arma de fuego': json.data.hechos_delictivos[0].relaciones?.[0]?.lesiones_arma_fuego || false,
              'Lesiones con arma blanca': json.data.hechos_delictivos[0].relaciones?.[0]?.lesiones_arma_blanca || false,
              'Homicidio por delito': json.data.hechos_delictivos[0].relaciones?.[0]?.homicidio_delito || false,
              'Homicidio por accidente vial': json.data.hechos_delictivos[0].relaciones?.[0]?.homicidio_accidente_vial || false,
              'Homicidio/ Av. Hecho': json.data.hechos_delictivos[0].relaciones?.[0]?.homicidio_av_hecho || false,
              'Femicidio': json.data.hechos_delictivos[0].relaciones?.[0]?.femicidio || false,
              'Travestisidio/ transfemicidio': json.data.hechos_delictivos[0].relaciones?.[0]?.travestisidio_transfemicidio || false,
              'Violencia de género': json.data.hechos_delictivos[0].relaciones?.[0]?.violencia_genero || false,
              'Otros': json.data.hechos_delictivos[0].relaciones?.[0]?.otros || false
            }
          }
        : undefined,
      accionesPrimeraLinea: json.data.acciones_primera_linea?.[0]?.acciones || '',
      abusoSexual: {
        simple: false, // No disponible en la estructura
        agravado: false // No disponible en la estructura
      },
      datosAbusoSexual: json.data.abusos_sexuales?.[0]?.datos?.[0]
        ? {
            kit: json.data.abusos_sexuales[0].datos[0].kit.toUpperCase(),
            relacion: json.data.abusos_sexuales[0].datos[0].relacion || '',
            relacionOtro: json.data.abusos_sexuales[0].datos[0].relacion_otro || '',
            lugarHecho: mapLugar(json.data.abusos_sexuales[0].datos[0].lugar_hecho),
            lugarOtro: json.data.abusos_sexuales[0].datos[0].lugar_otro || ''
          }
        : undefined,
      victima: json.data.victimas?.[0]
        ? {
            dni: json.data.victimas[0].dni || '',
            cantidadVictimas: json.data.victimas[0].cantidad_victima_por_hecho || 1,
            nombre: json.data.victimas[0].nombre || '',
            genero: Number(json.data.victimas[0].genero_id) || 0,
            fechaNacimiento: json.data.victimas[0].fecha_nacimiento || '',
            telefono: json.data.victimas[0].telefono || '',
            ocupacion: json.data.victimas[0].ocupacion || '',
            direccion: {
              calleNro: json.data.victimas[0].direccion?.calle_nro || '',
              barrio: json.data.victimas[0].direccion?.barrio || '',
              departamento: Number(json.data.victimas[0].direccion?.departamento) || 0,
              localidad: Number(json.data.victimas[0].direccion?.localidad) || 0
            }
          }
        : undefined,
      personaEntrevistada: json.data.victimas?.[0]?.personas_entrevistadas?.[0]
        ? {
            nombre: json.data.victimas[0].personas_entrevistadas[0].nombre || '',
            relacionVictima: json.data.victimas[0].personas_entrevistadas[0].relacion_victima || '',
            direccion: {
              calleNro: json.data.victimas[0].personas_entrevistadas[0].direccion?.calle_nro || '',
              barrio: json.data.victimas[0].personas_entrevistadas[0].direccion?.barrio || '',
              departamento: Number(json.data.victimas[0].personas_entrevistadas[0].direccion?.departamento) || 0,
              localidad: Number(json.data.victimas[0].personas_entrevistadas[0].direccion?.localidad) || 0
            }
          }
        : undefined,
      tipoIntervencion: json.data.intervenciones_tipo?.[0]
        ? {
            'Intervención en crisis': json.data.intervenciones_tipo[0].crisis,
            'Intervención social': json.data.intervenciones_tipo[0].social,
            'Intervención legal': json.data.intervenciones_tipo[0].legal,
            'Intervención telefónica': json.data.intervenciones_tipo[0].telefonica,
            'Intervención Psicológica': json.data.intervenciones_tipo[0].psicologica,
            'Intervención médica': json.data.intervenciones_tipo[0].medica,
            'Intervención domiciliaria': json.data.intervenciones_tipo[0].domiciliaria,
            'Sin intervención': json.data.intervenciones_tipo[0].sin_intervencion,
            'Archivo': json.data.intervenciones_tipo[0].archivo_caso
          }
        : undefined,
      seguimiento: json.data.seguimientos?.[0]
        ? {
            realizado: json.data.seguimientos[0].hubo || false,
            tipo: json.data.seguimientos[0].tipo?.[0]
              ? {
                  'Asesoramiento legal': json.data.seguimientos[0].tipo[0].asesoramientolegal,
                  'Tratamiento psicológico': json.data.seguimientos[0].tipo[0].tratamientopsicologico,
                  'Seguimiento legal': json.data.seguimientos[0].tipo[0].seguimientolegal,
                  'Archivo': json.data.seguimientos[0].tipo[0].archivocaso
                }
              : {}
          }
        : undefined,
      detalleSeguimiento: json.data.seguimientos?.[0]?.detalles?.[0]?.detalle || ''
    }

    console.log('📦 JSON crudo del backend:', json.data)
    console.log('📄 Datos mapeados para el formulario PDF:', mappedData)

    setData(mappedData)
  } catch (error) {
    console.error('[❌ ERROR AL CARGAR INTERVENCIÓN]', error)
    setData(null)
  } finally {
    setLoading(false)
  }
}


  obtenerDatos()
}, [id])


  const handlePrintPDF = async () => {
    const html2pdf = (await import('html2pdf.js')).default
    const element = document.getElementById('pdf-content')
    if (!element) return

    html2pdf().from(element).set({
      margin: 10,
      filename: `intervencion_${id}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).save()
  }

  const formatDate = (date?: string) => {
    if (!date) return ''
    const d = new Date(date)
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
  }

  const getMotivosDerivacion = (motivos?: number) => {
    const motivosMap: Record<number, string> = {
      1: 'CEO 911',
      2: 'Min. Seguridad',
      3: 'Min. Público',
      4: 'Fiscal',
      5: 'Municipio',
      6: 'Hospital',
      7: 'Centro de Salud',
      8: 'Demanda espontánea',
      9: 'Otro'
    }
    return motivosMap[motivos || 0] || ''
  }

  const getGenero = (genero?: number) => {
    const generoMap: Record<number, string> = {
      1: 'M',
      2: 'F',
      3: 'X'
    }
    return generoMap[genero || 0] || ''
  }

  if (loading) return <CircularProgress />

  if (!data) {
    return (
      <Typography color="error">
        No se pudo cargar la intervención o faltan datos clave.
      </Typography>
    )
  }

  return (
    <Box sx={{ p: 4, maxWidth: '210mm', margin: '0 auto' }}>
      <Box id="pdf-content" sx={{ p: 3, fontFamily: 'Arial, sans-serif', fontSize: '12px', lineHeight: 1.4 }}>
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
          <Grid container spacing={1}>
            <Grid item xs={3}>
              <FormControlLabel 
                control={<Checkbox checked={data.derivacion?.motivos === 1} size="small" />} 
                label="CEO 911" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel 
                control={<Checkbox checked={data.derivacion?.motivos === 2} size="small" />} 
                label="Min. Seguridad" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel 
                control={<Checkbox checked={data.derivacion?.motivos === 3} size="small" />} 
                label="Min. Público" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel 
                control={<Checkbox checked={data.derivacion?.motivos === 4} size="small" />} 
                label="Fiscal" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
          </Grid>
          <Typography sx={{ fontSize: '12px', mt: 0.5 }}>
            Municipio: <u>{data.derivacion?.motivos === 5 ? 'X' : ''}</u>
          </Typography>
          <Grid container spacing={1} sx={{ mt: 0.5 }}>
            <Grid item xs={3}>
              <FormControlLabel 
                control={<Checkbox checked={data.derivacion?.motivos === 6} size="small" />} 
                label="Hospital" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel 
                control={<Checkbox checked={data.derivacion?.motivos === 7} size="small" />} 
                label="Centro de Salud" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel 
                control={<Checkbox checked={data.derivacion?.motivos === 8} size="small" />} 
                label="Demanda espontánea" 
                sx={{ fontSize: '10px' }}
              />
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

          {/* Checkboxes tipos de hechos */}
          <Grid container spacing={1} sx={{ mb: 1 }}>
            <Grid item xs={4}>
              <FormControlLabel 
                control={<Checkbox checked={data.hechoDelictivo?.tipoHecho?.['Robo'] || false} size="small" />} 
                label="Robo" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
            <Grid item xs={4}>
              <FormControlLabel 
                control={<Checkbox checked={data.hechoDelictivo?.tipoHecho?.['Homicidio'] || false} size="small" />} 
                label="Homicidio" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
            <Grid item xs={4}>
              <FormControlLabel 
                control={<Checkbox checked={data.hechoDelictivo?.tipoHecho?.['Violencia de género'] || false} size="small" />} 
                label="Violencia de género" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={1} sx={{ mb: 1 }}>
            <Grid item xs={4}>
              <FormControlLabel 
                control={<Checkbox checked={data.hechoDelictivo?.tipoHecho?.['Robo con arma de fuego'] || false} size="small" />} 
                label="Robo con arma de fuego" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
            <Grid item xs={4}>
              <FormControlLabel 
                control={<Checkbox checked={data.hechoDelictivo?.tipoHecho?.['Homicidio por accidente vial'] || false} size="small" />} 
                label="Homicidio por accidente vial" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
            <Grid item xs={4}>
              <FormControlLabel 
                control={<Checkbox checked={data.abusoSexual?.simple || false} size="small" />} 
                label="Abuso sexual simple" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={1} sx={{ mb: 1 }}>
            <Grid item xs={4}>
              <FormControlLabel 
                control={<Checkbox checked={data.hechoDelictivo?.tipoHecho?.['Robo con arma blanca'] || false} size="small" />} 
                label="Robo con arma blanca" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
            <Grid item xs={4}>
              <FormControlLabel 
                control={<Checkbox checked={data.hechoDelictivo?.tipoHecho?.['Homicidio/ Av. Hecho'] || false} size="small" />} 
                label="Homicidio/ Av. Hecho" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
            <Grid item xs={4}>
              <FormControlLabel 
                control={<Checkbox checked={data.abusoSexual?.agravado || false} size="small" />} 
                label="Abuso sexual agravado" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={1} sx={{ mb: 1 }}>
            <Grid item xs={4}>
              <FormControlLabel 
                control={<Checkbox checked={data.hechoDelictivo?.tipoHecho?.['Lesiones'] || false} size="small" />} 
                label="Lesiones" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
            <Grid item xs={4}>
              <FormControlLabel 
                control={<Checkbox checked={data.hechoDelictivo?.tipoHecho?.['Homicidio por delito'] || false} size="small" />} 
                label="Homicidio por delito" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
            <Grid item xs={4}>
              <FormControlLabel 
                control={<Checkbox checked={data.hechoDelictivo?.tipoHecho?.['Travestisidio/ transfemicidio'] || false} size="small" />} 
                label="Travestisidio/ transfemicidio" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={1} sx={{ mb: 1 }}>
            <Grid item xs={4}>
              <FormControlLabel 
                control={<Checkbox checked={data.hechoDelictivo?.tipoHecho?.['Lesiones con arma de fuego'] || false} size="small" />} 
                label="Lesiones con arma de fuego" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
            <Grid item xs={4}>
              <FormControlLabel 
                control={<Checkbox checked={data.hechoDelictivo?.tipoHecho?.['Amenazas'] || false} size="small" />} 
                label="Amenazas" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
            <Grid item xs={4}>
              <Typography sx={{ fontSize: '12px' }}>
                Otros: <u>{Object.entries(data.hechoDelictivo?.tipoHecho || {}).find(([key, val]) => val && !['Robo', 'Homicidio', 'Violencia de género', 'Robo con arma de fuego', 'Homicidio por accidente vial', 'Robo con arma blanca', 'Homicidio/ Av. Hecho', 'Lesiones', 'Homicidio por delito', 'Travestisidio/ transfemicidio', 'Lesiones con arma de fuego', 'Amenazas', 'Lesiones con arma blanca', 'Femicidio'].includes(key))?.[0] || ''}</u>
              </Typography>
            </Grid>
          </Grid>

          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={4}>
              <FormControlLabel 
                control={<Checkbox checked={data.hechoDelictivo?.tipoHecho?.['Lesiones con arma blanca'] || false} size="small" />} 
                label="Lesiones con arma blanca" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
            <Grid item xs={4}>
              <FormControlLabel 
                control={<Checkbox checked={data.hechoDelictivo?.tipoHecho?.['Femicidio'] || false} size="small" />} 
                label="Femicidio" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
          </Grid>

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
                <Checkbox checked={data.datosAbusoSexual?.kit === 'SI'} size="small" sx={{ p: 0.25 }} /> SI 
                <Checkbox checked={data.datosAbusoSexual?.kit === 'NO'} size="small" sx={{ p: 0.25 }} /> NO
              </Typography>
            </Grid>
          </Grid>
          <Typography sx={{ fontSize: '12px', mb: 1 }}>
            Relación entre la víctima y presunto agresor:
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={3}>
              <FormControlLabel 
                control={<Checkbox checked={data.datosAbusoSexual?.relacion === 'Conocido'} size="small" />} 
                label="Conocido" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel 
                control={<Checkbox checked={data.datosAbusoSexual?.relacion === 'Desconocido'} size="small" />} 
                label="Desconocido" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
            <Grid item xs={2}>
              <FormControlLabel 
                control={<Checkbox checked={data.datosAbusoSexual?.relacion === 'Familiar'} size="small" />} 
                label="Familiar" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
            <Grid item xs={2}>
              <FormControlLabel 
                control={<Checkbox checked={data.datosAbusoSexual?.relacion === 'Pareja'} size="small" />} 
                label="Pareja" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
            <Grid item xs={2}>
              <Typography sx={{ fontSize: '12px' }}>
                Otro: <u>{data.datosAbusoSexual?.relacionOtro || ''}</u>
              </Typography>
            </Grid>
          </Grid>
          <Typography sx={{ fontSize: '12px', mt: 1, mb: 1 }}>
            Tipo del lugar del hecho:
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={3}>
              <FormControlLabel 
                control={<Checkbox checked={data.datosAbusoSexual?.lugarHecho === 'Institución'} size="small" />} 
                label="Institución" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel 
                control={<Checkbox checked={data.datosAbusoSexual?.lugarHecho === 'Vía Pública'} size="small" />} 
                label="Vía Pública" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel 
                control={<Checkbox checked={data.datosAbusoSexual?.lugarHecho === 'Dom. particular'} size="small" />} 
                label="Dom. particular" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel 
                control={<Checkbox checked={data.datosAbusoSexual?.lugarHecho === 'Lugar de trab.'} size="small" />} 
                label="Lugar de trab." 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
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
          <Grid container spacing={1} sx={{ mb: 1 }}>
            <Grid item xs={3}>
              <Typography sx={{ fontSize: '12px' }}>
                DNI: <u>{data.victima?.dni || ''}</u>
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography sx={{ fontSize: '12px' }}>
                Apellido: <u>{data.victima?.nombre?.split(' ').slice(1).join(' ') || ''}</u>
              </Typography>
            </Grid>
            <Grid item xs={5}>
              <Typography sx={{ fontSize: '12px' }}>
                Nombres: <u>{data.victima?.nombre?.split(' ')[0] || ''}</u>
              </Typography>
            </Grid>
          </Grid>
          <Grid container spacing={1} sx={{ mb: 1 }}>
            <Grid item xs={4}>
              <Typography sx={{ fontSize: '12px' }}>
                Género: 
                <Checkbox checked={getGenero(data.victima?.genero) === 'M'} size="small" sx={{ p: 0.25 }} /> M 
                <Checkbox checked={getGenero(data.victima?.genero) === 'F'} size="small" sx={{ p: 0.25 }} /> F 
                <Checkbox checked={getGenero(data.victima?.genero) === 'X'} size="small" sx={{ p: 0.25 }} /> X
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
            Calle y nro / Barrio/ Lugar: <u>{data.victima?.direccion ? `${data.victima.direccion.calleNro}, ${data.victima.direccion.barrio}` : ''}</u> 
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
            Calle y nro / Barrio/ Lugar: <u>{data.personaEntrevistada?.direccion ? `${data.personaEntrevistada.direccion.calleNro}, ${data.personaEntrevistada.direccion.barrio}` : ''}</u> 
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
            <Grid item xs={4}>
              <FormControlLabel 
                control={<Checkbox checked={data.tipoIntervencion?.['Intervención en crisis'] || false} size="small" />} 
                label="Intervención en crisis" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
            <Grid item xs={4}>
              <FormControlLabel 
                control={<Checkbox checked={data.tipoIntervencion?.['Intervención social'] || false} size="small" />} 
                label="Intervención social" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
            <Grid item xs={4}>
              <FormControlLabel 
                control={<Checkbox checked={data.tipoIntervencion?.['Intervención legal'] || false} size="small" />} 
                label="Intervención legal" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
          </Grid>
          <Grid container spacing={1} sx={{ mb: 1 }}>
            <Grid item xs={4}>
              <FormControlLabel 
                control={<Checkbox checked={data.tipoIntervencion?.['Intervención telefónica'] || false} size="small" />} 
                label="Intervención telefónica" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
            <Grid item xs={4}>
              <FormControlLabel 
                control={<Checkbox checked={data.tipoIntervencion?.['Intervención Psicológica'] || false} size="small" />} 
                label="Intervención Psicológica" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
            <Grid item xs={4}>
              <FormControlLabel 
                control={<Checkbox checked={data.tipoIntervencion?.['Intervención médica'] || false} size="small" />} 
                label="Intervención médica" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
          </Grid>
          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={4}>
              <FormControlLabel 
                control={<Checkbox checked={data.tipoIntervencion?.['Intervención domiciliaria'] || false} size="small" />} 
                label="Intervención domiciliaria" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
            <Grid item xs={4}>
              <FormControlLabel 
                control={<Checkbox checked={data.tipoIntervencion?.['Sin intervención'] || false} size="small" />} 
                label="Sin intervención" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
            <Grid item xs={4}>
              <FormControlLabel 
                control={<Checkbox checked={data.tipoIntervencion?.['Archivo'] || false} size="small" />} 
                label="Archivo" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
          </Grid>

          <Typography sx={{ fontSize: '12px', mb: 1 }}>
            Detalle de la intervención:
          </Typography>
          <Typography sx={{ fontSize: '12px', border: '1px solid #000', p: 1, minHeight: '40px', mb: 2 }}>
            {data.detalleSeguimiento || ''}
          </Typography>

          <Typography sx={{ fontSize: '12px', mb: 1 }}>
            Se realizó seguimiento: 
            <Checkbox checked={data.seguimiento?.realizado === true} size="small" sx={{ p: 0.25 }} /> SI 
            <Checkbox checked={data.seguimiento?.realizado === false} size="small" sx={{ p: 0.25 }} /> NO
          </Typography>

          <Typography sx={{ fontSize: '12px', mb: 1 }}>
            Tipo de seguimiento:
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={3}>
              <FormControlLabel 
                control={<Checkbox checked={data.seguimiento?.tipo?.['Asesoramiento legal'] || false} size="small" />} 
                label="Asesoramiento legal" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel 
                control={<Checkbox checked={data.seguimiento?.tipo?.['Tratamiento psicológico'] || false} size="small" />} 
                label="Tratamiento psicológico" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel 
                control={<Checkbox checked={data.seguimiento?.tipo?.['Seguimiento legal'] || false} size="small" />} 
                label="Seguimiento legal" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel 
                control={<Checkbox checked={data.seguimiento?.tipo?.['Archivo'] || false} size="small" />} 
                label="Archivo" 
                sx={{ fontSize: '10px' }}
              />
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box mt={4} display="flex" gap={2} sx={{ '@media print': { display: 'none' } }}>
        <Button variant="contained" onClick={handlePrintPDF}>
          📄 Descargar PDF
        </Button>
        <Button variant="outlined" onClick={() => window.print()}>
          🖨️ Imprimir
        </Button>
      </Box>

      {/* Estilos para impresión */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #pdf-content, #pdf-content * {
            visibility: visible;
          }
          #pdf-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            margin: 1cm;
            size: A4;
          }
        }
      `}</style>
    </Box>
  )
}