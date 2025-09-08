// utils/mappers.ts - Funciones para mapear IDs a nombres legibles

interface Departamento {
  id: string;
  nombre: string;
}

interface Localidad {
  id: string;
  nombre: string;
  departamento_id: string;
}

// Cache para evitar recargar los JSONs constantemente
let departamentosCache: Departamento[] | null = null;
let localidadesCache: Localidad[] | null = null;

/**
 * Carga los departamentos desde el JSON público
 */
export async function cargarDepartamentos(): Promise<Departamento[]> {
  if (departamentosCache) return departamentosCache;
  
  try {
    const response = await fetch('/departamentosMendoza.json');
    const data = await response.json();
    departamentosCache = data.departamentos || [];
    return departamentosCache;
  } catch (error) {
    console.error('Error cargando departamentos:', error);
    return [];
  }
}

/**
 * Carga las localidades desde el JSON público
 */
export async function cargarLocalidades(): Promise<Localidad[]> {
  if (localidadesCache) return localidadesCache;
  
  try {
    const response = await fetch('/localidadesMendoza.json');
    const data = await response.json();
    localidadesCache = data.localidades || [];
    return localidadesCache;
  } catch (error) {
    console.error('Error cargando localidades:', error);
    return [];
  }
}

/**
 * Mapea un ID de departamento a su nombre
 * @param departamentoId - ID del departamento (puede ser string o number)
 * @returns Nombre del departamento o el ID si no se encuentra
 */
export function mapearDepartamento(departamentoId: string | number | undefined): string {
  if (!departamentoId) return '—';
  
  if (!departamentosCache) {
    console.warn('Departamentos no cargados. Llama a cargarDepartamentos() primero.');
    return String(departamentoId);
  }
  
  const depIdStr = String(departamentoId);
  const departamento = departamentosCache.find(d => d.id === depIdStr);
  
  return departamento ? departamento.nombre : String(departamentoId);
}

/**
 * Mapea un domicilio/dirección a localidad (para el caso donde viene como texto)
 * @param domicilio - Texto del domicilio que puede contener información de localidad  
 * @returns El domicilio tal como viene o "—" si está vacío
 */
export function mapearDomicilioALocalidad(domicilio: string | undefined): string {
  if (!domicilio || domicilio.trim() === '') return '—';
  
  // Por ahora devolvemos el domicilio tal como viene
  // Podrías implementar lógica más sofisticada para extraer la localidad del domicilio
  return domicilio.trim();
}

/**
 * Obtiene un departamento por su nombre
 * @param nombre - Nombre del departamento
 * @returns Objeto departamento o undefined
 */
export function obtenerDepartamentoPorNombre(nombre: string): Departamento | undefined {
  if (!departamentosCache) return undefined;
  return departamentosCache.find(d => d.nombre === nombre);
}

/**
 * Obtiene las localidades de un departamento específico
 * @param departamentoId - ID del departamento
 * @returns Array de localidades del departamento
 */
export function obtenerLocalidadesPorDepartamento(departamentoId: string): Localidad[] {
  if (!localidadesCache) return [];
  return localidadesCache.filter(l => l.departamento_id === departamentoId);
}