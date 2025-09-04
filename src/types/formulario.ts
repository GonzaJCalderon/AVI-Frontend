// Tipos auxiliares
export type Derivacion = {
  id: number;
  tipo_derivacion_id: number;
};

export type Relacion = {
  id: number;
  hecho_delictivo_id: number;
  robo: boolean;
  robo_arma_fuego: boolean;
  robo_arma_blanca: boolean;
  amenazas: boolean;
  lesiones: boolean;
  lesiones_arma_fuego: boolean;
  lesiones_arma_blanca: boolean;
  homicidio_delito: boolean;
  homicidio_accidente_vial: boolean;
  homicidio_av_hecho: boolean;
  femicidio: boolean;
  travestisidio_transfemicidio: boolean;
  violencia_genero: boolean;
  otros: boolean;
};

export type Departamento = {
  id: number;
  descripcion: string;
  dep_id: number;
};

export type Geo = {
  domicilio: string;
  departamentos: Departamento;
};

export type HechoDelictivo = {
  id: number;
  expediente: string;
  num_agresores: number;
  relaciones: Relacion[];
  geo: Geo[];
};

export type Victima = {
  id: number;
  dni: string;
  nombre: string;
};

export type AbusoSexual = {
  id: number;
};

export type AccionPrimeraLinea = {
  id: number;
};

export type IntervencionTipo = {
  id: number;
};

export type SeguimientoTipo = {
  id: number;
};

export type SeguimientoDetalle = {
  id: number;
};

export type Seguimiento = {
  id: number;
  tipo: SeguimientoTipo[];
  detalles: SeguimientoDetalle[];
};

// Tipo para la interfaz de usuario (simplificado y transformado)
export type Formulario = {
  id: string;
  coordinador: string;
  operador: string;
  victima: string;
  numero: string;
  dni: string;
  fecha: string;
  estado: string; // Debería usar EstadoUI si está disponible
  delito: string;
  departamento: string;
  reseña_hecho: string;
    eliminado?: boolean;
  numero_intervencion?: string;
  counts?: {
    derivaciones: number;
    hechos_delictivos: number;
    victimas: number;
    seguimientos: number;
  };
};

// Tipo para los datos raw del API (estructura completa)
export type FormularioAPI = {
  id: number;
  numero_intervencion: string;
  fecha: string;
  coordinador: string;
  operador: string;
  fecha_creacion: string;
  resena_hecho: string | null;
  eliminado: boolean;
  estado: string | null;
  derivaciones: Derivacion[];
  hechos_delictivos: HechoDelictivo[];
  victimas: Victima[];
  abusos_sexuales: AbusoSexual[];
  acciones_primera_linea: AccionPrimeraLinea[];
  intervenciones_tipo: IntervencionTipo[];
  seguimientos: Seguimiento[];
};

// Tipo para la respuesta del API
export type FormularioResponse = {
  success: boolean;
  message: string;
  data: Formulario[];
};