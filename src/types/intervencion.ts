// src/types/intervencion.ts

export type IntervencionItem = {
  id: number;
  numero_intervencion: string;
  fecha: string;
  fecha_creacion?: string;
  coordinador?: string;
  operador?: string;
  estado?: string;
  eliminado?: boolean;
  resena_hecho?: string;

  derivaciones?: Array<{
    id: number;
    tipo_derivacion_id: number;
    derivador?: string;
    fecha_derivacion?: string;
    municipio?: string;
    otro_texto?: string;
    tipo_derivaciones?: {
      id: number;
      descripcion: string;
    };
  }>;

  hechos_delictivos?: Array<{
    id: number;
    expediente?: string;
    num_agresores?: number;
    relaciones?: Array<{
      id: number;
      hecho_delictivo_id: number;
      robo: boolean;
      robo_arma_fuego: boolean;
      robo_arma_blanca: boolean;
      amenazas: boolean;
      lesiones: boolean;
      lesiones_arma_fuego: boolean;
      lesiones_arma_blanca: boolean;
      homicidio: boolean;
      homicidio_accidente_vial: boolean;
      homicidio_av_hecho: boolean;
      homicidio_delito: boolean;
      violencia_genero: boolean;
      femicidio: boolean;
      transfemicidio: boolean;
      abuso_sexual_simple: boolean;
      abuso_sexual_agravado: boolean;
      otros: boolean;
    }>;
    geo?: Array<{
      domicilio?: string;
      fecha?: string;
      departamentos?: {
        id?: number;
        descripcion?: string;
        dep_id?: number;
      };
    }>;
  }>;

  victimas?: Array<{
    id?: number;
    dni?: string;
    nombre?: string;
    genero?: number;
    genero_id?: number;
    fecha_nacimiento?: string;
    telefono?: string;
    ocupacion?: string;
    cantidad_victima_por_hecho?: number;
    direccion_id?: number;
    direccion?: {
      id: number;
      calle_nro?: string;
      barrio?: string;
      departamento?: string;
      localidad?: string;
    };
    generos?: {
      id: number;
      descripcion: string;
    };
    personas_entrevistadas?: Array<{
      id: number;
      nombre: string;
      relacion_victima: string;
      direccion_id: number;
      direccion?: {
        id: number;
        calle_nro?: string;
        barrio?: string;
        departamento?: string;
        localidad?: string;
      };
    }>;
  }>;

  abusos_sexuales?: Array<{
    id: number;
    hubo?: boolean;
    tipo_abuso?: number;
    datos?: Array<{
      id: number;
      kit: string;
      relacion: string;
      relacion_otro: string;
      lugar_hecho: string;
      lugar_otro: string;
      abuso_sexual_id: number;
    }>;
  }>;

  acciones_primera_linea?: Array<{
    id: number;
    acciones: string;
    fecha: string;
    user_audit: number;
  }>;

  intervenciones_tipo?: Array<{
    id: number;
    crisis: boolean;
    telefonica: boolean;
    domiciliaria: boolean;
    psicologica: boolean;
    medica: boolean;
    social: boolean;
    legal: boolean;
    sin_intervencion: boolean;
    archivo_caso: boolean;
  }>;

  seguimientos?: Array<{
    id: number;
    hubo: boolean;
    tipo?: Array<{
      id: number;
      asesoramientolegal: boolean;
      tratamientopsicologico: boolean;
      seguimientolegal: boolean;
      archivocaso: boolean;
      seguimiento_id: number;
    }>;
    detalles?: Array<{
      id: number;
      seguimiento_id: number;
      detalle: string;
    }>;
  }>;
};
