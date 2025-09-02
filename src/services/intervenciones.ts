// src/services/intervenciones.ts
import { apiFetch } from './api'

export type IntervencionItem = {
  id: number;
  numero_intervencion: string;
  fecha: string;
  coordinador?: string;
  operador?: string;
  estado?: string;           // ✅ agregado
  eliminado?: boolean;       // ✅ agregado
  reseña_hecho?: string;

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
      transfemicidio?: boolean;
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
  fecha: string
  resena_hecho: string
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
 transfemicidio: boolean;

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

// ✅ Funciones específicas para cambio de estado
export const eliminarIntervencionSoft = async (id: number) => {
  return await apiFetch(`/intervenciones/${id}/soft-delete`, {
    method: 'PATCH'
  });
};

export const cerrarIntervencion = async (id: number) => {
  return await apiFetch(`/intervenciones/${id}/cerrar`, {
    method: 'PATCH'
  });
};

export const archivarIntervencion = async (id: number) => {
  return await apiFetch(`/intervenciones/${id}/archivar`, {
    method: 'PATCH'
  });
};

// ✅ Nueva función para activar una intervención
export const activarIntervencion = async (id: number) => {
  return await apiFetch(`/intervenciones/${id}/activar`, {
    method: 'PATCH'
  });
};

// ✅ Función genérica para cambiar estado (si el backend la soporta)
export const cambiarEstadoIntervencion = async (id: number, nuevoEstado: string) => {
  return await apiFetch(`/intervenciones/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado: nuevoEstado })
  });
};

// ✅ AGREGAR: Importar normalizeEstado
import { normalizeEstado } from '@/utils/constants';

// ✅ NUEVA: Función de debug para verificar qué está pasando realmente
export const debugCambioEstado = async (id: number, nuevoEstado: string) => {
  console.log(`🔍 DEBUG: Iniciando cambio de estado para ID ${id}`);
  
  try {
    // 1. Ver estado ANTES del cambio
    const antes = await obtenerIntervencion(id);
    const estadoAntes = normalizeEstado(antes.estado, antes.eliminado);
    console.log(`📊 Estado ANTES: "${estadoAntes}"`);
    console.log(`📄 Datos completos ANTES:`, {
      id: antes.id,
      estado: antes.estado,
      eliminado: antes.eliminado,
      numero_intervencion: antes.numero_intervencion
    });
    
    // 2. Hacer el cambio
    console.log(`🔄 Ejecutando cambio a "${nuevoEstado}"`);
    const respuestaCambio = await archivarIntervencion(id);
    console.log(`📤 Respuesta del backend:`, respuestaCambio);
    
    // 3. Esperar y verificar
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 4. Ver estado DESPUÉS del cambio
    const despues = await obtenerIntervencion(id);
    const estadoDespues = normalizeEstado(despues.estado, despues.eliminado);
    console.log(`📊 Estado DESPUÉS: "${estadoDespues}"`);
    console.log(`📄 Datos completos DESPUÉS:`, {
      id: despues.id,
      estado: despues.estado,
      eliminado: despues.eliminado,
      numero_intervencion: despues.numero_intervencion
    });
    
    // 5. Comparar
    if (estadoAntes === estadoDespues) {
      console.log(`🚨 PROBLEMA: El estado NO cambió (sigue siendo "${estadoDespues}")`);
      return false;
    } else {
      console.log(`✅ ÉXITO: Estado cambió de "${estadoAntes}" a "${estadoDespues}"`);
      return true;
    }
    
  } catch (error) {
    console.error(`❌ Error en debug:`, error);
    return false;
  }
};

// ✅ NUEVA: Función mejorada para cambio de estado con verificación posterior
export const cambiarEstadoConVerificacion = async (id: number, nuevoEstado: string) => {
  console.log(`Cambiando estado de intervención ${id} a "${nuevoEstado}"`);
  
  try {
    // 1. Hacer el cambio de estado
    let resultado;
    switch (nuevoEstado) {
      case 'Activo':
        resultado = await activarIntervencion(id);
        break;
      case 'Archivado':
        resultado = await archivarIntervencion(id);
        break;
      default:
        resultado = await apiFetch(`/intervenciones/${id}/estado`, {
          method: 'PATCH',
          body: JSON.stringify({ estado: nuevoEstado })
        });
        break;
    }
    
    console.log(`Respuesta del cambio de estado:`, resultado);
    
    // 2. ✅ VERIFICAR que el cambio se persistió correctamente
    // Esperar un momento para que el backend procese
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 3. Obtener la intervención actualizada del backend
    const intervencionActualizada = await obtenerIntervencion(id);
    const estadoActual = normalizeEstado(intervencionActualizada.estado, intervencionActualizada.eliminado);
    
    console.log(`Estado después del cambio: "${estadoActual}" (esperado: "${nuevoEstado}")`);
    
    // 4. ✅ Verificar que el estado coincida
    if (estadoActual !== nuevoEstado) {
      throw new Error(
        `El cambio de estado no se persistió correctamente. ` +
        `Estado actual: "${estadoActual}", esperado: "${nuevoEstado}"`
      );
    }
    
    console.log(`✅ Estado verificado correctamente: "${estadoActual}"`);
    return resultado;
    
  } catch (error: any) {
    console.error(`❌ Error cambiando estado de intervención ${id}:`, error);
    throw error;
  }
};

// ✅ REEMPLAZAR: Función mejorada para cambio múltiple con verificación
export const cambiarEstadoMultipleConVerificacion = async (ids: number[], nuevoEstado: string) => {
  console.log(`Iniciando cambio de estado para ${ids.length} intervenciones a "${nuevoEstado}"`);
  
  const resultados = [];
  
  for (const id of ids) {
    try {
      const resultado = await cambiarEstadoConVerificacion(id, nuevoEstado);
      resultados.push({ id, success: true, resultado });
      console.log(`✅ Intervención ${id} actualizada y verificada correctamente`);
      
    } catch (error: any) {
      console.error(`❌ Error con intervención ${id}:`, error);
      resultados.push({ 
        id, 
        success: false, 
        error: error.message || error.toString() 
      });
    }
  }
  
  const exitosas = resultados.filter(r => r.success);
  const fallidas = resultados.filter(r => !r.success);
  
  console.log(`Resumen final: ${exitosas.length} exitosas, ${fallidas.length} fallidas`);
  
  if (fallidas.length > 0) {
    const errores = fallidas.map(f => `ID ${f.id}: ${f.error}`).join('; ');
    throw new Error(
      `${fallidas.length} de ${ids.length} actualizaciones fallaron o no se verificaron. ` +
      `Errores: ${errores}`
    );
  }
  
  return exitosas;
};

// ✅ MANTENER: Función original para compatibilidad (pero ahora sabemos que no verifica)
export const cambiarEstadoMultiple = async (ids: number[], nuevoEstado: string) => {
  console.log(`Iniciando cambio de estado para ${ids.length} intervenciones a "${nuevoEstado}"`);
  
  const promesas = ids.map(async (id, index) => {
    try {
      console.log(`Procesando intervención ${id} (${index + 1}/${ids.length})`);
      
      let resultado;
      switch (nuevoEstado) {
        case 'Activo':
          resultado = await activarIntervencion(id);
          break;
        case 'Archivado':
          resultado = await archivarIntervencion(id);
          break;
        default:
          resultado = await apiFetch(`/intervenciones/${id}/estado`, {
            method: 'PATCH',
            body: JSON.stringify({ estado: nuevoEstado })
          });
          break;
      }
      
      console.log(`✅ Intervención ${id} actualizada correctamente`);
      return { id, success: true, result: resultado };
      
    } catch (error: any) {
      console.error(`❌ Error actualizando intervención ${id}:`, error);
      return { 
        id, 
        success: false, 
        error: error.message || error.toString() 
      };
    }
  });

  const resultados = await Promise.allSettled(promesas);
  
  const exitosas: Array<{ id: number; success: true; result: any }> = [];
  const fallidas: Array<{ id: number; success: false; error: string }> = [];
  
  resultados.forEach((resultado) => {
    if (resultado.status === 'fulfilled') {
      if (resultado.value.success) {
        exitosas.push(resultado.value as { id: number; success: true; result: any });
      } else {
        fallidas.push(resultado.value as { id: number; success: false; error: string });
      }
    } else {
      fallidas.push({
        id: 0,
        success: false,
        error: resultado.reason?.message || 'Error desconocido'
      });
    }
  });
  
  console.log(`Resumen: ${exitosas.length} exitosas, ${fallidas.length} fallidas`);
  
  if (exitosas.length === 0 && fallidas.length > 0) {
    throw new Error(
      `Todas las actualizaciones fallaron. Errores: ${fallidas.map(f => `ID ${f.id}: ${f.error}`).join('; ')}`
    );
  }
  
  if (fallidas.length > 0) {
    throw new Error(
      `${fallidas.length} de ${ids.length} actualizaciones fallaron. ` +
      `Exitosas: ${exitosas.map(e => e.id).join(', ')}. ` +
      `Fallidas: ${fallidas.map(f => `ID ${f.id} (${f.error})`).join('; ')}`
    );
  }
  
  return exitosas;
};

const cambiarEstadoConReintentos = async (id: number, estado: string, maxReintentos = 3) => {
  for (let intento = 1; intento <= maxReintentos; intento++) {
    try {
      switch (estado) {
        case 'Activo':
          return await activarIntervencion(id);
        case 'Archivado':
          return await archivarIntervencion(id);
        default:
          return await apiFetch(`/intervenciones/${id}/estado`, {
            method: 'PATCH',
            body: JSON.stringify({ estado })
          });
      }
    } catch (error: any) {
      if (intento === maxReintentos) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * intento));
      console.log(`Reintentando ${intento + 1}/${maxReintentos} para intervención ${id}`);
    }
  }
};