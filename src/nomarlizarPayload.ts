import { CreateIntervencionPayload } from '@/services/intervenciones';

export const normalizarPayload = (
  raw: CreateIntervencionPayload
): CreateIntervencionPayload => {
  const payload = structuredClone(raw); // evita mutar el original

  // ==================== HELPERS ====================
  const safeNumber = (val: string | number | null | undefined): number | null => {
    if (val === null || val === undefined || val === '' || val === 0) return null;
    const num = Number(val);
    return !isNaN(num) && num > 0 ? num : null;
  };

  const safeStringOrNull = (val: string | null | undefined): string | null =>
    val?.trim() || null;

  // ==================== NORMALIZACIONES ====================

  // 🧾 Derivación
  payload.derivacion.fecha_derivacion = safeStringOrNull(payload.derivacion.fecha_derivacion);
  payload.derivacion.derivador = safeStringOrNull(payload.derivacion.derivador);
  payload.derivacion.expediente = safeStringOrNull(payload.derivacion.expediente);
  payload.derivacion.departamento = safeNumber(payload.derivacion.departamento);
  payload.derivacion.localidad = safeNumber(payload.derivacion.localidad);

  // 📁 Hecho delictivo
  payload.hechoDelictivo.expediente = safeStringOrNull(payload.hechoDelictivo.expediente) || '';
  payload.hechoDelictivo.ubicacion.departamento = safeNumber(payload.hechoDelictivo.ubicacion.departamento);
  payload.hechoDelictivo.ubicacion.localidad = safeNumber(payload.hechoDelictivo.ubicacion.localidad);

  // 👤 Víctima
  payload.victima.direccion.departamento = safeNumber(payload.victima.direccion.departamento);
  payload.victima.direccion.localidad = safeNumber(payload.victima.direccion.localidad);

  // 👥 Persona entrevistada
  payload.personaEntrevistada.direccion.departamento = safeNumber(payload.personaEntrevistada.direccion.departamento);
  payload.personaEntrevistada.direccion.localidad = safeNumber(payload.personaEntrevistada.direccion.localidad);

  return payload;
};