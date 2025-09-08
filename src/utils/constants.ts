// utils/constants.ts
export const departments = [
  'Capital', 'Godoy Cruz', 'Junín', 'Las Heras', 'Maipú', 'Guaymallén', 'Rivadavia',
  'San Martín', 'La Paz', 'Santa Rosa', 'General Alvear', 'Malargüe', 'San Carlos',
  'Tupungato', 'Tunuyán', 'San Rafael', 'Lavalle', 'Luján de Cuyo'
];

export const delitos = [
  'Robo', 'Robo con arma de fuego', 'Robo con arma blanca', 'Amenazas', 'Lesiones',
  'Lesiones con arma de fuego', 'Lesiones con arma blanca', 'Homicidio por Delito',
  'Homicidio por Accidente Vial', 'Homicidio / Av. Hecho', 'Femicidio',
  'Travestisidio / Transfemicidio', 'Violencia de género', 'Otros'
];

export const delitoKeyMap: Record<string, string> = {
  robo: 'Robo',
  robo_arma_fuego: 'Robo con arma de fuego',
  robo_arma_blanca: 'Robo con arma blanca',
  amenazas: 'Amenazas',
  lesiones: 'Lesiones',
  lesiones_arma_fuego: 'Lesiones con arma de fuego',
  lesiones_arma_blanca: 'Lesiones con arma blanca',
  homicidio_delito: 'Homicidio por Delito',
  homicidio_accidente_vial: 'Homicidio por Accidente Vial',
  homicidio_av_hecho: 'Homicidio / Av. Hecho',
  femicidio: 'Femicidio',
  travestisidio_transfemicidio: 'Travestisidio / Transfemicidio',
  violencia_genero: 'Violencia de género',
  otros: 'Otros',
};

/**
 * Estados válidos de la UI (normalizados desde el backend)
 * Backend: "activo" | "archivado" | "eliminado"
 * UI:      "Activo" | "Archivado" | "Eliminado"
 */
export const ESTADOS_UI = ['Activo', 'Archivado', 'Eliminado'] as const;
export type EstadoUI = (typeof ESTADOS_UI)[number];

// Mapa de colores centralizado (usalo en chips y en dots)
export const estadoColorMap: Record<EstadoUI, string> = {
  Activo: '#4CAF50',
  Archivado: '#2196F3',
  Eliminado: '#9E9E9E',
};

/**
 * Helper para normalizar el estado del backend a la UI
 */
export function normalizeEstado(raw?: string, eliminado?: boolean): EstadoUI {
  if (eliminado) return 'Eliminado';
  const estado = (raw || '').toLowerCase();

  switch (estado) {
    case 'activo':
    case 'activa':
      return 'Activo';

    case 'archivado':
    case 'archivada':
      return 'Archivado';

    case 'eliminado':
    case 'eliminada':
      return 'Eliminado';

    default:
      return 'Activo'; // fallback
  }
}