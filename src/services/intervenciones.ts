// src/services/intervenciones.ts
import { apiFetch } from './api'
import { normalizeEstado } from '@/utils/constants'

// ==================== TIPOS ====================

export type IntervencionItem = {
  id: number
  numero_intervencion: string
  fecha: string
  fecha_creacion?: string
  coordinador?: string
  operador?: string
  estado?: string
  eliminado?: boolean
  resena_hecho?: string

  derivaciones?: Array<{
    id: number
    tipo_derivacion_id: number
    derivador?: string
    fecha_derivacion?: string
    municipio?: string
    otro_texto?: string
    tipo_derivaciones?: {
      id: number
      descripcion: string
    }
  }>

  hechos_delictivos?: Array<{
    id: number
    expediente?: string
    num_agresores?: number
    relaciones?: Array<{
      id: number
      hecho_delictivo_id: number
      robo: boolean
      robo_arma_fuego: boolean
      robo_arma_blanca: boolean
      amenazas: boolean
      lesiones: boolean
      lesiones_arma_fuego: boolean
      lesiones_arma_blanca: boolean
      homicidio: boolean
      homicidio_accidente_vial: boolean
      homicidio_av_hecho: boolean
      homicidio_delito: boolean
      violencia_genero: boolean
      femicidio: boolean
      transfemicidio: boolean
      abuso_sexual_simple: boolean
      abuso_sexual_agravado: boolean
      otros: boolean
    }>
    geo?: Array<{
      domicilio?: string
      fecha?: string
      localidad?: number
      localidad_id?: number
      departamentos?: {
        id?: number
        descripcion?: string
        dep_id?: number
      }
    }>
  }>

  victimas?: Array<{
    id?: number
    dni?: string
    nombre?: string
    genero?: number
    genero_id?: number
    fecha_nacimiento?: string
    telefono?: string
    ocupacion?: string
    cantidad_victima_por_hecho?: number
    direccion_id?: number
    direccion?: {
      id: number
      calle_nro?: string
      barrio?: string
      departamento?: string
      localidad?: string
    }
    generos?: {
      id: number
      descripcion: string
    }
    personas_entrevistadas?: Array<{
      id: number
      nombre: string
      relacion_victima: string
      direccion_id: number
      direccion?: {
        id: number
        calle_nro?: string
        barrio?: string
        departamento?: string
        localidad?: string
      }
    }>
  }>

  abusos_sexuales?: Array<{
    id: number
    hubo?: boolean
    tipo_abuso?: number
    datos?: Array<{
      id: number
      kit: string
      relacion: string
      relacion_otro: string
      lugar_hecho: string
      lugar_otro: string
      abuso_sexual_id: number
    }>
  }>

  acciones_primera_linea?: Array<{
    id: number
    acciones: string
    fecha: string
    user_audit: number
  }>

  intervenciones_tipo?: Array<{
    id: number
    crisis: boolean
    telefonica: boolean
    domiciliaria: boolean
    psicologica: boolean
    medica: boolean
    social: boolean
    legal: boolean
    sin_intervencion: boolean
    archivo_caso: boolean
  }>

  seguimientos?: Array<{
    id: number
    hubo: boolean
    tipo?: Array<{
      id: number
      asesoramientolegal: boolean
      tratamientopsicologico: boolean
      seguimientolegal: boolean
      archivocaso: boolean
      seguimiento_id: number
    }>
    detalles?: Array<{
      id: number
      seguimiento_id: number
      detalle: string
    }>
  }>
}

type IntervencionesListResponse = {
  success: boolean
  message: string
  data: IntervencionItem[]
}

type IntervencionSingleResponse = {
  success: boolean
  message: string
  data: IntervencionItem
}

export type IntervencionCreated = {
  id: number
  [k: string]: any
}

// ==================== CRUD ====================
// ==================== CRUD ====================

export interface CreateIntervencionPayload {
  intervencion: {
    coordinador: string;
    operador: string;
    fecha: string | null;
    resena_hecho: string;
  };

  derivacion: {
    motivos: number;
    derivador: string | null;
    fecha_derivacion: string | null;
    expediente: string | null;
    departamento: string | number | null;
    localidad: string | number | null;
  };

  hechoDelictivo: {
    expediente: string;
    numAgresores: number;
    fecha: string | null;
    hora: string;
    ubicacion: {
      calleBarrio: string;
      departamento: string | number | null;
      localidad: string | number | null;
    };
    tipoHecho: {
      robo: boolean;
      roboArmaFuego: boolean;
      roboArmaBlanca: boolean;
      amenazas: boolean;
      lesiones: boolean;
      lesionesArmaFuego: boolean;
      lesionesArmaBlanca: boolean;
      homicidioDelito: boolean;
      homicidioAccidenteVial: boolean;
      homicidioAvHecho: boolean;
      femicidio: boolean;
      travestisidioTransfemicidio: boolean;
      violenciaGenero: boolean;
      otros: boolean;
    };
  };

  accionesPrimeraLinea: string;

  abusoSexual: {
    simple: boolean;
    agravado: boolean;
  };

  datosAbusoSexual: {
    kit: string;
    relacion: string;
    relacionOtro: string;
    lugarHecho: string;
    lugarOtro: string;
  };

  victima: {
    dni: string;
    nombre: string;
    genero: number;
    fechaNacimiento: string | null;
    telefono: string;
    ocupacion: string;
    cantidadVictimas: number;
    direccion: {
      calleNro: string;
      barrio: string;
      departamento: string | number | null;
      localidad: string | number | null;
    };
  };

  personaEntrevistada: {
    nombre: string;
    relacionVictima: string;
    direccion: {
      calleNro: string;
      barrio: string;
      departamento: string | number | null;
      localidad: string | number | null;
    };
  };

  tipoIntervencion: {
    crisis: boolean;
    telefonica: boolean;
    domiciliaria: boolean;
    psicologica: boolean;
    medica: boolean;
    social: boolean;
    legal: boolean;
    sinIntervencion: boolean;
    archivoCaso: boolean;
  };

  seguimiento: {
    realizado: boolean | null;
    tipo: {
      asesoramientoLegal?: boolean;
      tratamientoPsicologico?: boolean;
      seguimientoLegal?: boolean;
      archivoCaso?: boolean;
    };
  };

  detalleIntervencion: string;
}

// Actualizar la función crearIntervencion:
export const crearIntervencion = (payload: CreateIntervencionPayload) =>
  apiFetch<IntervencionCreated>('/api/intervenciones', {
    method: 'POST',
    body: JSON.stringify(payload)
  })


export const listarIntervenciones = async (): Promise<IntervencionItem[]> => {
  const res = await apiFetch<IntervencionesListResponse>('/api/intervenciones', { method: 'GET' })
  return res.data
}

export const obtenerIntervencionPorId = async (id: number): Promise<IntervencionItem> => {
  const res = await apiFetch<IntervencionSingleResponse>(`/api/intervenciones/${id}`, { method: 'GET' })
  return res.data
}

export const actualizarIntervencion = (id: number, data: any) =>
  apiFetch<IntervencionItem>(`/api/intervenciones/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  })

export const eliminarIntervencion = (id: number) =>
  apiFetch<void>(`/api/intervenciones/${id}`, { method: 'DELETE' })

export const eliminarIntervencionSoft = (id: number) =>
  apiFetch(`/api/intervenciones/${id}/soft-delete`, { method: 'PATCH' })

// ==================== ESTADOS ====================

export const cambiarEstadoIntervencion = async (id: number, nuevoEstado: string) => {
  const estado = nuevoEstado.toLowerCase()

  if (estado === 'archivada' || estado === 'archivado') {
    return await apiFetch(`/api/intervenciones/${id}/archivar`, { method: 'PATCH' })
  }

  if (estado === 'activa' || estado === 'activo') {
    return await apiFetch(`/api/intervenciones/${id}/activar`, { method: 'PATCH' })
  }

  throw new Error(`❌ No hay endpoint definido para cambiar el estado a "${nuevoEstado}"`)
}

export const activarIntervencion = (id: number) =>
  apiFetch(`/api/intervenciones/${id}/activar`, { method: 'PATCH' })

export const archivarIntervencion = (id: number) =>
  cambiarEstadoIntervencion(id, 'archivada')

export const cerrarIntervencion = (id: number) =>
  cambiarEstadoIntervencion(id, 'cerrada')

// ==================== VERIFICACIÓN ====================

export const cambiarEstadoConVerificacion = async (id: number, nuevoEstado: string) => {
  console.log(`Cambiando estado de intervención ${id} a "${nuevoEstado}"`)
  let resultado
  switch (nuevoEstado) {
    case 'Activo':
      resultado = await activarIntervencion(id)
      break
    case 'Archivado':
      resultado = await archivarIntervencion(id)
      break
    default:
      resultado = await cambiarEstadoIntervencion(id, nuevoEstado)
  }

  await new Promise(r => setTimeout(r, 500))
  const intervencionActualizada = await obtenerIntervencionPorId(id)
  const estadoActual = normalizeEstado(intervencionActualizada.estado, intervencionActualizada.eliminado)

  if (estadoActual !== nuevoEstado) {
    throw new Error(`El cambio de estado no se persistió. Actual: "${estadoActual}", esperado: "${nuevoEstado}"`)
  }

  console.log(`✅ Estado verificado: "${estadoActual}"`)
  return resultado
}

export const cambiarEstadoMultipleConVerificacion = async (ids: number[], nuevoEstado: string) => {
  const resultados = []
  for (const id of ids) {
    try {
      const resultado = await cambiarEstadoConVerificacion(id, nuevoEstado)
      resultados.push({ id, success: true, resultado })
    } catch (error: any) {
      resultados.push({ id, success: false, error: error.message })
    }
  }

  const fallidas = resultados.filter(r => !r.success)
  if (fallidas.length > 0) {
    throw new Error(
      `${fallidas.length} de ${ids.length} fallaron: ${fallidas.map(f => `ID ${f.id}: ${f.error}`).join('; ')}`
    )
  }
  return resultados
}

// ==================== UTIL ====================

export const listarNoActivas = async (): Promise<IntervencionItem[]> => {
  const todas = await listarIntervenciones()
  return todas.filter(i => i.estado?.toLowerCase() !== 'activa')
}

export const debugCambioEstado = async (id: number, nuevoEstado: string) => {
  console.log(`🔍 DEBUG: Iniciando cambio de estado para ID ${id}`)

  try {
    const antes = await obtenerIntervencionPorId(id)
    const estadoAntes = normalizeEstado(antes.estado, antes.eliminado)
    console.log(`📊 Estado ANTES: "${estadoAntes}"`, antes)

    const respuestaCambio = await cambiarEstadoIntervencion(id, nuevoEstado)
    console.log(`📤 Respuesta del backend:`, respuestaCambio)

    await new Promise(resolve => setTimeout(resolve, 1000))

    const despues = await obtenerIntervencionPorId(id)
    const estadoDespues = normalizeEstado(despues.estado, despues.eliminado)
    console.log(`📊 Estado DESPUÉS: "${estadoDespues}"`, despues)

    if (estadoAntes === estadoDespues) {
      console.log(`🚨 NO cambió el estado`)
      return false
    }

    console.log(`✅ Cambió correctamente a "${estadoDespues}"`)
    return true
  } catch (error) {
    console.error(`❌ Error en debugCambioEstado:`, error)
    return false
  }
}
