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
