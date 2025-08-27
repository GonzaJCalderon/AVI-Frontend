'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Divider,
  RadioGroup,
  Radio,
  FormLabel,
  Button,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Paper
} from '@mui/material'

import { useRouter } from 'next/navigation'
import { actualizarIntervencion } from '@/services/intervenciones'
import { Snackbar, Alert } from '@mui/material'




/**
 * Tipo de detalle flexible (acepta tu IntervencionItem "resumido" + variantes más completas)
 * Extendelo si tu API devuelve más campos/estructuras.
 */


export type IntervencionDetalle = {
  id: number
  numero_intervencion?: string
  fecha?: string
  coordinador?: string
  operador?: string
  resena_hecho?: string

  derivaciones?: Array<{
    derivador?: string
    fecha_derivacion?: string
    tipo_derivaciones?: { descripcion?: string }
    motivos?: number
  }>

  hechoDelictivo?: {
    expediente?: string
    numAgresores?: number
    ubicacion?: { calleBarrio?: string; departamento?: number | string }
    tipoHecho?: {
      robo?: boolean
      roboArmaFuego?: boolean
      roboArmaBlanca?: boolean
      amenazas?: boolean
      lesiones?: boolean
      lesionesArmaFuego?: boolean
      lesionesArmaBlanca?: boolean
      homicidioDelito?: boolean
      homicidioAccidenteVial?: boolean
      homicidioAvHecho?: boolean
      femicidio?: boolean
      travestisidioTransfemicidio?: boolean
      violenciaGenero?: boolean
      otros?: boolean
    }
    // en algunos backends viene como arrays anidados (geo/relaciones)
    geo?: Array<{
      domicilio?: string
      departamento_id?: number | string
      fecha?: string
    }>
    relaciones?: Array<Record<string, boolean>>
  }

  hechos_delictivos?: Array<{
    expediente?: string
    num_agresores?: number
    geo?: Array<{
      domicilio?: string
      departamento_id?: number | string
      fecha?: string
    }>
    relaciones?: Array<Record<string, boolean>>
  }>

  acciones_primera_linea?: Array<{ acciones?: string }>
  abusos_sexuales?: Array<{
    tipo_abuso?: number // 1=Simple, 2=Agravado (o el que uses)
    datos?: Array<{
      kit?: string
      relacion?: string
      relacion_otro?: string
      lugar_hecho?: string
      lugar_otro?: string
    }>
  }>

  intervenciones_tipo?: Array<{
    crisis?: boolean
    telefonica?: boolean
    domiciliaria?: boolean
    psicologica?: boolean
    medica?: boolean
    social?: boolean
    legal?: boolean
    sin_intervencion?: boolean
    archivo_caso?: boolean
  }>

  seguimientos?: Array<{
    hubo?: boolean
    tipo?: Array<{
      asesoramientolegal?: boolean
      tratamientopsicologico?: boolean
      seguimientolegal?: boolean
      archivocaso?: boolean
    }>
    detalles?: Array<{ detalle?: string }>
  }>

  victimas?: Array<{
    dni?: string
    nombre?: string
    genero?: number | string
    genero_id?: number | string
    fecha_nacimiento?: string
    telefono?: string
    ocupacion?: string
    direccion?: {
      calle_nro?: string
      barrio?: string
      departamento?: number | string
      localidad?: number | string
    }
    personas_entrevistadas?: Array<{
      nombre?: string
      relacion_victima?: string
      direccion?: {
        calle_nro?: string
        barrio?: string
        departamento?: number | string
        localidad?: number | string
      }
    }>
  }>
}

/** ====== Helpers de formato ====== */
function toDateInput(value?: string) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function toTimeInput(value?: string) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
function toDateTimeLocal(value?: string) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return `${toDateInput(value)}T${toTimeInput(value)}`
}

/** ====== Catálogos / opciones (puedes conectarlos a tu backend) ====== */
const motivosDerivacion = [
  { value: 1, label: 'CEO-911' },
  { value: 2, label: 'Ministerio Público Fiscal' },
  { value: 3, label: 'Hospital' },
  { value: 4, label: 'Ministerio de Seguridad' },
  { value: 5, label: 'Centro de Salud' },
  { value: 6, label: 'Municipio' },
  { value: 7, label: 'Demanda Espontanea' },
  { value: 8, label: 'Otro' }
]

/** ====== Estado del formulario ====== */
type FormState = {
  // 1. Intervención
  fechaIntervencion: string
  coordinador: string
  operador: string
  observaciones: string

  // 2. Derivación
  derivadorNombre: string
  horaDerivacion: string // datetime-local
  motivoDerivacion: number | '' // id numérico del <select>

  // 3. Hecho delictivo
  nroExpediente: string
  nroAgresores: string
  delitos: {
    robo: boolean
    roboArmaFuego: boolean
    roboArmaBlanca: boolean
    amenazas: boolean
    lesiones: boolean
    lesionesArmaFuego: boolean
    lesionesArmaBlanca: boolean
    homicidioDelito: boolean
    homicidioAccidenteVial: boolean
    homicidioAvHecho: boolean
    femicidio: boolean
    transfemicidio: boolean
    violenciaGenero: boolean
    otros: boolean
  }
  departamentoHecho: string | number | ''
  calleBarrioHecho: string
  fechaHecho: string
  horaHecho: string

  // 4. Acciones primera línea
  accionesPrimeraLinea: string

  // 5. Abuso sexual
  abusoSexualSimple: boolean
  abusoSexualAgravado: boolean

  // 5.1 Datos del abuso sexual
  kitAplicado: 'si' | 'no' | ''
  relacionAgresor: 'conocido' | 'familiar' | 'desconocido' | '' // + otro
  otroRelacion: string
  tipoLugar: 'institucion' | 'viaPublica' | 'domParticular' | '' // + otro
  otroLugar: string

  // 6. Víctima
  dni: string
  nombreVictima: string
  genero: string | number | ''
  fechaNacimiento: string
  telefono: string
  calleNro: string
  barrio: string
  departamento: string | number | ''
  localidad: string | number | ''
  ocupacion: string

  // 6.1 Persona entrevistada
  entrevistadoNombre: string
  entrevistadoCalle: string
  entrevistadoBarrio: string
  entrevistadoDepartamento: string | number | ''
  entrevistadoLocalidad: string | number | ''
  entrevistadoRelacion: string

  // 7. Tipo de intervención
  intervencion: {
    crisis: boolean
    telefonica: boolean
    domiciliaria: boolean
    psicologica: boolean
    medica: boolean
    social: boolean
    legal: boolean
    sinIntervencion: boolean
    archivoCaso: boolean
  }

  // 7.1 Seguimiento
  seguimientoRealizado: 'si' | 'no' | ''
  segAsesoramientoLegal: boolean
  segTratamientoPsicologico: boolean
  segSeguimientoLegal: boolean
  segArchivoCaso: boolean

  // 7.2 Detalle
  detalleSeguimiento: string
}

/** ====== Editor ====== */
export type EditarFormularioVictimaProps = {
  selected: IntervencionDetalle
}

export default function EditarFormularioVictima({ selected }: EditarFormularioVictimaProps) {
  const apiData = useMemo(() => selected, [selected])

  const router = useRouter()
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)


  const [form, setForm] = useState<FormState>({
    // 1
    fechaIntervencion: '',
    coordinador: '',
    operador: '',
    observaciones: '',

    // 2
    derivadorNombre: '',
    horaDerivacion: '',
    motivoDerivacion: '',

    // 3
    nroExpediente: '',
    nroAgresores: '',
    delitos: {
      robo: false,
      roboArmaFuego: false,
      roboArmaBlanca: false,
      amenazas: false,
      lesiones: false,
      lesionesArmaFuego: false,
      lesionesArmaBlanca: false,
      homicidioDelito: false,
      homicidioAccidenteVial: false,
      homicidioAvHecho: false,
      femicidio: false,
      transfemicidio: false,
      violenciaGenero: false,
      otros: false
    },
    departamentoHecho: '',
    calleBarrioHecho: '',
    fechaHecho: '',
    horaHecho: '',

    // 4
    accionesPrimeraLinea: '',

    // 5
    abusoSexualSimple: false,
    abusoSexualAgravado: false,

    // 5.1
    kitAplicado: '',
    relacionAgresor: '',
    otroRelacion: '',
    tipoLugar: '',
    otroLugar: '',

    // 6
    dni: '',
    nombreVictima: '',
    genero: '',
    fechaNacimiento: '',
    telefono: '',
    calleNro: '',
    barrio: '',
    departamento: '',
    localidad: '',
    ocupacion: '',

    // 6.1
    entrevistadoNombre: '',
    entrevistadoCalle: '',
    entrevistadoBarrio: '',
    entrevistadoDepartamento: '',
    entrevistadoLocalidad: '',
    entrevistadoRelacion: '',

    // 7
    intervencion: {
      crisis: false,
      telefonica: false,
      domiciliaria: false,
      psicologica: false,
      medica: false,
      social: false,
      legal: false,
      sinIntervencion: false,
      archivoCaso: false
    },

    // 7.1
    seguimientoRealizado: '',
    segAsesoramientoLegal: false,
    segTratamientoPsicologico: false,
    segSeguimientoLegal: false,
    segArchivoCaso: false,

    // 7.2
    detalleSeguimiento: ''
  })

  /** Mapeo de API -> Form completo (TODOS los campos del HTML) */
  useEffect(() => {
    if (!apiData) return

    // ===== 1. Intervención =====
    const fechaIntervencion = toDateInput(apiData.fecha)
    const coordinador = apiData.coordinador ?? ''
    const operador = apiData.operador ?? ''
    const observaciones = apiData.resena_hecho ?? ''

    // ===== 2. Derivación =====
    const deriv = apiData.derivaciones?.[0]
    const derivadorNombre = deriv?.derivador ?? ''
    const horaDerivacion = toDateTimeLocal(deriv?.fecha_derivacion)
    // Si tu backend trae "motivos" como número, úsalo; si solo trae descripción, te doy un match rápido
    let motivoDerivacion: number | '' = typeof deriv?.motivos === 'number' ? deriv?.motivos : ''
    if (!motivoDerivacion && deriv?.tipo_derivaciones?.descripcion) {
      const found = motivosDerivacion.find(m => m.label.toLowerCase() === deriv.tipo_derivaciones!.descripcion!.toLowerCase())
      motivoDerivacion = found?.value ?? ''
    }

    // ===== 3. Hecho delictivo =====
    // Soportar dos formas: `hechoDelictivo` (resumida) o `hechos_delictivos[0]` (compleja)
    const hd = apiData.hechoDelictivo ?? apiData.hechos_delictivos?.[0] ?? {}
    const nroExpediente = (hd as any).expediente ?? ''
    const nroAgresores = String((hd as any).numAgresores ?? (hd as any).num_agresores ?? '')

    // Ubicación (o geo[0])
    const geo0 = (hd as any).geo?.[0]
    const calleBarrioHecho = (hd as any).ubicacion?.calleBarrio ?? geo0?.domicilio ?? ''
    const departamentoHecho =
      (hd as any).ubicacion?.departamento ??
      geo0?.departamento_id ??
      ''

    // Fecha/hora del hecho (desde geo[0].fecha, si existe)
    const fechaHecho = toDateInput(geo0?.fecha)
    const horaHecho = toTimeInput(geo0?.fecha)

    // Delitos (desde tipoHecho o relaciones[0])
    const th = (hd as any).tipoHecho ?? (hd as any).relaciones?.[0] ?? {}
    const delitos = {
      robo: !!th.robo,
      roboArmaFuego: !!(th.roboArmaFuego ?? th.robo_arma_fuego),
      roboArmaBlanca: !!(th.roboArmaBlanca ?? th.robo_arma_blanca),
      amenazas: !!th.amenazas,
      lesiones: !!th.lesiones,
      lesionesArmaFuego: !!(th.lesionesArmaFuego ?? th.lesiones_arma_fuego),
      lesionesArmaBlanca: !!(th.lesionesArmaBlanca ?? th.lesiones_arma_blanca),
      homicidioDelito: !!(th.homicidioDelito ?? th.homicidio_delito),
      homicidioAccidenteVial: !!(th.homicidioAccidenteVial ?? th.homicidio_accidente_vial),
      homicidioAvHecho: !!(th.homicidioAvHecho ?? th.homicidio_av_hecho),
      femicidio: !!th.femicidio,
      transfemicidio: !!(th.travestisidioTransfemicidio ?? th.travestisidio_transfemicidio),
      violenciaGenero: !!(th.violenciaGenero ?? th.violencia_genero),
      otros: !!th.otros
    }

    // ===== 4. Acciones primera línea =====
    const accionesPrimeraLinea = apiData.acciones_primera_linea?.[0]?.acciones ?? ''

    // ===== 5. Abuso sexual =====
    const abuso = apiData.abusos_sexuales?.[0]
    const abusoSexualSimple = abuso?.tipo_abuso === 1
    const abusoSexualAgravado = abuso?.tipo_abuso === 2

    // ===== 5.1 Datos de abuso sexual =====
    const abusoDatos = abuso?.datos?.[0]
    const kitAplicadoRaw = (abusoDatos?.kit || '').toString().trim().toLowerCase()
    const kitAplicado = kitAplicadoRaw === 'si' ? 'si' : kitAplicadoRaw === 'no' ? 'no' : ''
    // mapear relacion (‘conocido’, ‘familiar’, ‘desconocido’ o custom)
    let relacionAgresor: FormState['relacionAgresor'] = ''
    if (['conocido', 'familiar', 'desconocido'].includes((abusoDatos?.relacion || '').toLowerCase())) {
      relacionAgresor = abusoDatos!.relacion!.toLowerCase() as any
    }
    const otroRelacion = relacionAgresor ? '' : (abusoDatos?.relacion_otro ?? '')
    let tipoLugar: FormState['tipoLugar'] = ''
    const lugar = (abusoDatos?.lugar_hecho || '').toLowerCase()
    if (lugar === 'institucion') tipoLugar = 'institucion'
    else if (lugar === 'vía pública' || lugar === 'via publica' || lugar === 'viapublica') tipoLugar = 'viaPublica'
    else if (lugar === 'domicilio particular' || lugar === 'dom particular' || lugar === 'domparticular') tipoLugar = 'domParticular'
    const otroLugar = tipoLugar ? '' : (abusoDatos?.lugar_otro ?? '')

    // ===== 6. Víctima / Dirección =====
    const vict = apiData.victimas?.[0]
    const dni = vict?.dni ?? ''
    const nombreVictima = vict?.nombre ?? ''
    const genero = vict?.genero ?? vict?.genero_id ?? ''
    const fechaNacimiento = toDateInput(vict?.fecha_nacimiento)
    const telefono = vict?.telefono ?? ''
    const calleNro = vict?.direccion?.calle_nro ?? ''
    const barrio = vict?.direccion?.barrio ?? ''
    const departamento = vict?.direccion?.departamento ?? ''
    const localidad = vict?.direccion?.localidad ?? ''
    const ocupacion = vict?.ocupacion ?? ''

    const entrevistado = vict?.personas_entrevistadas?.[0]
    const entrevistadoNombre = entrevistado?.nombre ?? ''
    const entrevistadoCalle = entrevistado?.direccion?.calle_nro ?? ''
    const entrevistadoBarrio = entrevistado?.direccion?.barrio ?? ''
    const entrevistadoDepartamento = entrevistado?.direccion?.departamento ?? ''
    const entrevistadoLocalidad = entrevistado?.direccion?.localidad ?? ''
    const entrevistadoRelacion = entrevistado?.relacion_victima ?? ''

    // ===== 7. Intervención / Seguimiento =====
    const interTipo = apiData.intervenciones_tipo?.[0]
    const intervencion = {
      crisis: !!interTipo?.crisis,
      telefonica: !!interTipo?.telefonica,
      domiciliaria: !!interTipo?.domiciliaria,
      psicologica: !!interTipo?.psicologica,
      medica: !!interTipo?.medica,
      social: !!interTipo?.social,
      legal: !!interTipo?.legal,
      sinIntervencion: !!interTipo?.sin_intervencion,
      archivoCaso: !!interTipo?.archivo_caso
    }

    const seg = apiData.seguimientos?.[0]
    const seguimientoRealizado: FormState['seguimientoRealizado'] = seg?.hubo ? 'si' : 'no'
    const segTipo = seg?.tipo?.[0]
    const segAsesoramientoLegal = !!(segTipo?.asesoramientolegal)
    const segTratamientoPsicologico = !!(segTipo?.tratamientopsicologico)
    const segSeguimientoLegal = !!(segTipo?.seguimientolegal)
    const segArchivoCaso = !!(segTipo?.archivocaso)
    const detalleSeguimiento = seg?.detalles?.[0]?.detalle ?? ''

    setForm({
      // 1
      fechaIntervencion,
      coordinador,
      operador,
      observaciones,

      // 2
      derivadorNombre,
      horaDerivacion,
      motivoDerivacion,

      // 3
      nroExpediente,
      nroAgresores,
      delitos,
      departamentoHecho: departamentoHecho ?? '',
      calleBarrioHecho,
      fechaHecho,
      horaHecho,

      // 4
      accionesPrimeraLinea,

      // 5
      abusoSexualSimple,
      abusoSexualAgravado,

      // 5.1
      kitAplicado,
      relacionAgresor,
      otroRelacion,
      tipoLugar,
      otroLugar,

      // 6
      dni,
      nombreVictima,
      genero,
      fechaNacimiento,
      telefono,
      calleNro,
      barrio,
      departamento,
      localidad,
      ocupacion,

      // 6.1
      entrevistadoNombre,
      entrevistadoCalle,
      entrevistadoBarrio,
      entrevistadoDepartamento,
      entrevistadoLocalidad,
      entrevistadoRelacion,

      // 7
      intervencion,

      // 7.1
      seguimientoRealizado,
      segAsesoramientoLegal,
      segTratamientoPsicologico,
      segSeguimientoLegal,
      segArchivoCaso,

      // 7.2
      detalleSeguimiento
    })
  }, [apiData])

  // ===== Handlers genéricos =====
  const setField = (k: keyof FormState, v: any) => setForm(prev => ({ ...prev, [k]: v }))
  const handleChange =
    (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setField(k, e.target.value)

    const handleGuardarCambios = async () => {
  try {
    setGuardando(true)
    setMensaje(null)
    setError(null)

    // Simulamos el payload final. Aca deberías construir tu payload real
    const payload = {
      intervencion: {
        fecha: form.fechaIntervencion,
        coordinador: form.coordinador,
        operador: form.operador,
        resena_hecho: form.observaciones
      }
      // Agregá las demás secciones si tu backend las espera
    }

    await actualizarIntervencion(apiData.id, payload)

    setMensaje('Cambios guardados correctamente ✅')

    // Redirigir luego de 2 segundos
    setTimeout(() => {
      router.push('/inicio')
    }, 2000)
  } catch (e: any) {
    console.error('Error al guardar', e)
    setError('Ocurrió un error al guardar. Intentalo de nuevo.')
  } finally {
    setGuardando(false)
  }
}


  const handleCheckbox =
    (path: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked
      setForm(prev => {
        const clone: any = structuredClone(prev)
        // path ej: "delitos.robo" | "intervencion.crisis"
        const parts = path.split('.')
        let ref = clone
        for (let i = 0; i < parts.length - 1; i++) ref = ref[parts[i]]
        ref[parts.at(-1)!] = checked
        return clone
      })
    }

  const handleSelectNumber =
    (k: keyof FormState) =>
    (e: any) => {
      const v = e.target.value
      setField(k, v === '' ? '' : Number(v))
    }

  // ===== Render =====
  return (
    <Box sx={{ p: 4, maxWidth: 1100, mx: 'auto' }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Editar Formulario de Asistencia a Víctimas
      </Typography>

      {/* 1. DATOS DE LA INTERVENCIÓN */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>1. Datos de la Intervención</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Fecha de Intervención"
              type="date"
              fullWidth
              value={form.fechaIntervencion}
              onChange={handleChange('fechaIntervencion')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Coordinador" fullWidth value={form.coordinador} onChange={handleChange('coordinador')} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Operador" fullWidth value={form.operador} onChange={handleChange('operador')} />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Breve reseña del hecho"
              fullWidth
              multiline
              rows={3}
              value={form.observaciones}
              onChange={handleChange('observaciones')}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* 2. DERIVACIÓN */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>2. Derivación</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Nombre y Apellido del Derivador"
              fullWidth
              value={form.derivadorNombre}
              onChange={handleChange('derivadorNombre')}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Hora de Derivación"
              type="datetime-local"
              fullWidth
              value={form.horaDerivacion}
              onChange={handleChange('horaDerivacion')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="motivo-derivacion">Motivo</InputLabel>
              <Select
                labelId="motivo-derivacion"
                label="Motivo"
                value={form.motivoDerivacion === '' ? '' : Number(form.motivoDerivacion)}
                onChange={handleSelectNumber('motivoDerivacion')}
              >
                {motivosDerivacion.map(m => (
                  <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* 3. DATOS DEL HECHO DELICTIVO */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>3. Datos del Hecho Delictivo</Typography>

        <Grid container spacing={2} sx={{ mb: 1 }}>
          <Grid item xs={12} md={10}>
            <TextField
              label="Número de Expediente"
              fullWidth
              value={form.nroExpediente}
              onChange={handleChange('nroExpediente')}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              label="Nro Agresores"
              type="number"
              fullWidth
              value={form.nroAgresores}
              onChange={handleChange('nroAgresores')}
              inputProps={{ min: 0, step: 1 }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />
        <FormLabel>Hecho delictivo</FormLabel>
        <Grid container spacing={1} sx={{ mt: 1 }}>
          {[
            ['robo', 'Robo'],
            ['roboArmaFuego', 'Robo con arma de fuego'],
            ['roboArmaBlanca', 'Robo con arma blanca'],
            ['amenazas', 'Amenazas'],
            ['lesiones', 'Lesiones'],
            ['lesionesArmaFuego', 'Lesiones con arma de fuego'],
            ['lesionesArmaBlanca', 'Lesiones con arma blanca'],
            ['homicidioDelito', 'Homicidio por Delito'],
            ['homicidioAccidenteVial', 'Homicidio por Accidente Vial'],
            ['homicidioAvHecho', 'Homicidio / Av. Hecho'],
            ['femicidio', 'Femicidio'],
            ['transfemicidio', 'Travestisidio / Transfemicidio'],
            ['violenciaGenero', 'Violencia de género'],
            ['otros', 'Otros']
          ].map(([key, label]) => (
            <Grid item xs={12} md={6} key={key}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={(form.delitos as any)[key]}
                    onChange={handleCheckbox(`delitos.${key}`)}
                  />
                }
                label={label}
              />
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Calle y Nro / Barrio / Lugar"
              fullWidth
              value={form.calleBarrioHecho}
              onChange={handleChange('calleBarrioHecho')}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Departamento (ID / nombre)"
              fullWidth
              value={form.departamentoHecho}
              onChange={handleChange('departamentoHecho')}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Fecha del hecho"
              type="date"
              fullWidth
              value={form.fechaHecho}
              onChange={handleChange('fechaHecho')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Hora del hecho"
              type="time"
              fullWidth
              value={form.horaHecho}
              onChange={handleChange('horaHecho')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* 4. ACCIONES EN PRIMERA LÍNEA */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>4. Acciones Realizadas en Primera Línea</Typography>
        <TextField
          label="Detalle de acciones"
          fullWidth
          multiline
          rows={3}
          value={form.accionesPrimeraLinea}
          onChange={handleChange('accionesPrimeraLinea')}
        />
      </Paper>

      {/* 5. ABUSO SEXUAL */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>5. ¿Hubo Abuso Sexual?</Typography>
        <FormGroup>
          <FormControlLabel
            control={<Checkbox checked={form.abusoSexualSimple} onChange={handleCheckbox('abusoSexualSimple')} />}
            label="Abuso Sexual Simple"
          />
          <FormControlLabel
            control={<Checkbox checked={form.abusoSexualAgravado} onChange={handleCheckbox('abusoSexualAgravado')} />}
            label="Abuso Sexual Agravado"
          />
        </FormGroup>
      </Paper>

      {/* 5.1 DATOS DEL ABUSO SEXUAL */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>5.1 Datos del Abuso Sexual</Typography>

        <FormLabel>¿Se aplicó el kit?</FormLabel>
        <RadioGroup
          row
          value={form.kitAplicado}
          onChange={(_, v) => setField('kitAplicado', v as FormState['kitAplicado'])}
          sx={{ mb: 2 }}
        >
          <FormControlLabel value="si" control={<Radio />} label="Sí" />
          <FormControlLabel value="no" control={<Radio />} label="No" />
        </RadioGroup>

        <FormLabel>Relación entre la víctima y el presunto agresor</FormLabel>
        <RadioGroup
          row
          value={form.relacionAgresor}
          onChange={(_, v) => setField('relacionAgresor', v as FormState['relacionAgresor'])}
        >
          <FormControlLabel value="conocido" control={<Radio />} label="Conocido" />
          <FormControlLabel value="familiar" control={<Radio />} label="Familiar" />
          <FormControlLabel value="desconocido" control={<Radio />} label="Desconocido" />
        </RadioGroup>
        <TextField
          sx={{ mt: 2 }}
          label="Otro (especificar)"
          fullWidth
          value={form.otroRelacion}
          onChange={handleChange('otroRelacion')}
        />

        <Divider sx={{ my: 2 }} />
        <FormLabel>Tipo de lugar del hecho</FormLabel>
        <RadioGroup
          row
          value={form.tipoLugar}
          onChange={(_, v) => setField('tipoLugar', v as FormState['tipoLugar'])}
        >
          <FormControlLabel value="institucion" control={<Radio />} label="Institución" />
          <FormControlLabel value="viaPublica" control={<Radio />} label="Vía Pública" />
          <FormControlLabel value="domParticular" control={<Radio />} label="Domicilio Particular" />
        </RadioGroup>
        <TextField
          sx={{ mt: 2 }}
          label="Otro lugar (especificar)"
          fullWidth
          value={form.otroLugar}
          onChange={handleChange('otroLugar')}
        />
      </Paper>

      {/* 6. DATOS DE LA VÍCTIMA */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>6. Datos de la Víctima</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField label="DNI" fullWidth value={form.dni} onChange={handleChange('dni')} />
          </Grid>
          <Grid item xs={12} md={8}>
            <TextField label="Nombre y Apellido" fullWidth value={form.nombreVictima} onChange={handleChange('nombreVictima')} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Género (id/etiqueta)" fullWidth value={form.genero} onChange={handleChange('genero')} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Fecha de Nacimiento"
              type="date"
              fullWidth
              value={form.fechaNacimiento}
              onChange={handleChange('fechaNacimiento')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Teléfono" fullWidth value={form.telefono} onChange={handleChange('telefono')} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Calle y Nro" fullWidth value={form.calleNro} onChange={handleChange('calleNro')} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Barrio" fullWidth value={form.barrio} onChange={handleChange('barrio')} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Departamento (id/etiqueta)" fullWidth value={form.departamento} onChange={handleChange('departamento')} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Localidad (id/etiqueta)" fullWidth value={form.localidad} onChange={handleChange('localidad')} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Ocupación" fullWidth value={form.ocupacion} onChange={handleChange('ocupacion')} />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Persona entrevistada</Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField label="Nombre y Apellido" fullWidth value={form.entrevistadoNombre} onChange={handleChange('entrevistadoNombre')} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Calle y Nro" fullWidth value={form.entrevistadoCalle} onChange={handleChange('entrevistadoCalle')} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Barrio" fullWidth value={form.entrevistadoBarrio} onChange={handleChange('entrevistadoBarrio')} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Departamento" fullWidth value={form.entrevistadoDepartamento} onChange={handleChange('entrevistadoDepartamento')} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Localidad" fullWidth value={form.entrevistadoLocalidad} onChange={handleChange('entrevistadoLocalidad')} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Relación con la víctima" fullWidth value={form.entrevistadoRelacion} onChange={handleChange('entrevistadoRelacion')} />
          </Grid>
        </Grid>
      </Paper>

      {/* 7. TIPO DE INTERVENCIÓN */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>7. Tipo de Intervención</Typography>
        <Grid container spacing={1}>
          {[
            ['crisis', 'Intervención en Crisis'],
            ['telefonica', 'Intervención Telefónica'],
            ['domiciliaria', 'Intervención Domiciliaria'],
            ['psicologica', 'Intervención Psicológica'],
            ['medica', 'Intervención Médica'],
            ['social', 'Intervención Social'],
            ['legal', 'Intervención Legal'],
            ['sinIntervencion', 'Sin Intervención'],
            ['archivoCaso', 'Archivo del Caso']
          ].map(([key, label]) => (
            <Grid item xs={12} md={6} key={key}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={(form.intervencion as any)[key]}
                    onChange={handleCheckbox(`intervencion.${key}`)}
                  />
                }
                label={label}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* 7.1 SEGUIMIENTO */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>7.1 Seguimiento</Typography>
        <FormLabel>¿Se realizó seguimiento?</FormLabel>
        <RadioGroup
          row
          value={form.seguimientoRealizado}
          onChange={(_, v) => setField('seguimientoRealizado', v as FormState['seguimientoRealizado'])}
          sx={{ mb: 2 }}
        >
          <FormControlLabel value="si" control={<Radio />} label="Sí" />
          <FormControlLabel value="no" control={<Radio />} label="No" />
        </RadioGroup>

        <FormGroup>
          <FormControlLabel
            control={<Checkbox checked={form.segAsesoramientoLegal} onChange={handleCheckbox('segAsesoramientoLegal')} />}
            label="Asesoramiento Legal"
          />
          <FormControlLabel
            control={<Checkbox checked={form.segTratamientoPsicologico} onChange={handleCheckbox('segTratamientoPsicologico')} />}
            label="Tratamiento Psicológico"
          />
          <FormControlLabel
            control={<Checkbox checked={form.segSeguimientoLegal} onChange={handleCheckbox('segSeguimientoLegal')} />}
            label="Seguimiento Legal"
          />
          <FormControlLabel
            control={<Checkbox checked={form.segArchivoCaso} onChange={handleCheckbox('segArchivoCaso')} />}
            label="Archivo del Caso"
          />
        </FormGroup>
      </Paper>

      {/* 7.2 DETALLE DE SEGUIMIENTO */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>7.2 Detalle de Seguimiento</Typography>
        <TextField
          label="Detalle de seguimiento"
          fullWidth
          multiline
          rows={3}
          value={form.detalleSeguimiento}
          onChange={handleChange('detalleSeguimiento')}
        />
      </Paper>

      <Box textAlign="center">
        <Button
  variant="contained"
  color="success"
  size="large"
  onClick={handleGuardarCambios}
  disabled={guardando}
>
  {guardando ? 'Guardando...' : 'Guardar Cambios'}
</Button>

      </Box>
      <Snackbar open={!!mensaje} autoHideDuration={6000} onClose={() => setMensaje(null)}>
  <Alert severity="success" onClose={() => setMensaje(null)}>{mensaje}</Alert>
</Snackbar>

<Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
  <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
</Snackbar>

    </Box>
  )
}
