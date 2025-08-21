// src/services/intervenciones.ts
import { apiFetch } from './api'

export type IntervencionItem = {
  id: number;
  numero_intervencion: string;
  fecha: string;
  coordinador?: string;
  operador?: string;

  hechoDelictivo?: {
    expediente?: string;
    numAgresores?: number;
    ubicacion?: {
      calleBarrio?: string;
      departamento?: number;
    };
    tipoHecho?: {
      robo?: boolean;
      roboArmaFuego?: boolean;
      roboArmaBlanca?: boolean;
      amenazas?: boolean;
      lesiones?: boolean;
      lesionesArmaFuego?: boolean;
      lesionesArmaBlanca?: boolean;
      homicidioDelito?: boolean;
      homicidioAccidenteVial?: boolean;
      homicidioAvHecho?: boolean;
      femicidio?: boolean;
      travestisidioTransfemicidio?: boolean;
      violenciaGenero?: boolean;
      otros?: boolean;
    };
  };

victimas?: {
  dni?: string;
  nombre?: string;
  genero?: number;
  fechaNacimiento?: string;
  telefono?: string;
  ocupacion?: string;
  direccion?: {
    calleNro?: string;
    barrio?: string;
    departamento?: number;
    localidad?: number;
  };
}[];


  _count?: {
    derivaciones?: number;
    hechos_delictivos?: number;
    victimas?: number;
    seguimientos?: number;
  };
};


type IntervencionesListResponse = {
  success: boolean
  message: string
  data: IntervencionItem[]
}

/**
 * Payload EXACTO que espera el backend para POST /api/intervenciones
 */
export type CreateIntervencionPayload = {
  intervencion: {
    coordinador: string
    operador: string
  }
  derivacion: {
    motivos: number
    derivador: string
    hora: string
  }
  hechoDelictivo: {
    expediente: string
    numAgresores: number
    ubicacion: {
      calleBarrio: string
      departamento: number
    }
    tipoHecho: {
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
      travestisidioTransfemicidio: boolean
      violenciaGenero: boolean
      otros: boolean
    }
  }
  accionesPrimeraLinea: string
  abusoSexual: {
    simple: boolean
    agravado: boolean
  }
  datosAbusoSexual: {
    kit: string
    relacion: string
    relacionOtro: string
    lugarHecho: string
    lugarOtro: string
  }
  victima: {
    dni: string
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
  personaEntrevistada: {
    nombre: string
    relacionVictima: string
    direccion: {
      calleNro: string
      barrio: string
      departamento: number
      localidad: number
    }
  }
  tipoIntervencion: {
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
  seguimiento: {
    realizado: boolean
    tipo: {
      asesoramientoLegal: boolean
      tratamientoPsicologico: boolean
      seguimientoLegal: boolean
      archivoCaso: boolean
    }
  }
  detalleSeguimiento: string
}

export type IntervencionCreated = {
  id: number
  [k: string]: any
}

export const crearIntervencion = (payload: CreateIntervencionPayload) =>
  apiFetch<IntervencionCreated>('/intervenciones', {
    method: 'POST',
    body: JSON.stringify(payload)
  })

export const listarIntervenciones = async () => {
  const res = await apiFetch<IntervencionesListResponse>('/intervenciones', { method: 'GET' })
  return res.data
}

type IntervencionSingleResponse = {
  success: boolean;
  message: string;
  data: IntervencionItem;
};

export const obtenerIntervencion = async (id: number): Promise<IntervencionItem> => {
  const res = await apiFetch<IntervencionSingleResponse>(`/intervenciones/${id}`, {
    method: 'GET',
  });

  return res.data;
};


export const actualizarIntervencion = (id: number, data: Partial<CreateIntervencionPayload>) =>
  apiFetch<IntervencionItem>(`/intervenciones/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  })

export const eliminarIntervencion = (id: number) =>
  apiFetch<void>(`/intervenciones/${id}`, { method: 'DELETE' })
