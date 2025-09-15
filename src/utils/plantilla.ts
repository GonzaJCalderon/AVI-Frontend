// src/utils/plantilla.ts

export function createReplacements(data: any, id: string) {
  const safeDate = (d: any) => {
    try {
      return d ? new Date(d).toLocaleDateString('es-AR') : '';
    } catch {
      return '';
    }
  };

  const safeTime = (d: any) => {
    try {
      return d ? new Date(d).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : '';
    } catch {
      return '';
    }
  };

  const delitos = data?.hechoDelictivo?.tipoHecho || {};
  const direccion = data?.victima?.direccion || {};
  const entrevistada = data?.personaEntrevistada || {};

  const generoId = data?.victima?.genero || 0;

  return {
    // === GENERALES ===
    '{{ID}}': id,
    '{{NRO_FICHA}}': id,
    '{{FECHA}}': safeDate(data?.intervencion?.fecha),
    '{{COORDINADOR}}': data?.intervencion?.coordinador ?? '',
    '{{OPERADOR}}': data?.intervencion?.operador ?? '',
    '{{RESENA}}': data?.intervencion?.resena_hecho ?? '',

    // === DERIVACIÓN ===
    '{{DERIVADOR}}': data?.derivacion?.derivador ?? '',
    '{{HORA_DERIV}}': safeTime(data?.derivacion?.fecha_derivacion),
    '{{CEO_911}}': data?.derivacion?.motivos === 1 ? 'X' : '',
    '{{MIN_SEGURIDAD}}': data?.derivacion?.motivos === 2 ? 'X' : '',
    '{{MIN_PUBLICO_FISCAL}}': data?.derivacion?.motivos === 3 ? 'X' : '',
    '{{HOSPITAL}}': data?.derivacion?.motivos === 4 ? 'X' : '',
    '{{CENTRO_SALUD}}': data?.derivacion?.motivos === 5 ? 'X' : '',
    '{{DEMANDA_ESPONTANEA}}': data?.derivacion?.motivos === 6 ? 'X' : '',
    '{{MUNICIPIO}}': data?.derivacion?.motivos === 7 ? 'X' : '',
    '{{OTRO_DERIVACION}}': data?.derivacion?.motivos === 8 ? 'X' : '',
    '{{MUNICIPIO_NOMBRE}}': data?.derivacion?.motivos === 7 ? data?.derivacion?.derivador ?? '' : '',
    '{{OTRO_DERIVACION_TEXTO}}': data?.derivacion?.motivos === 8 ? data?.derivacion?.derivador ?? '' : '',

    // === HECHO DELICTIVO ===
    '{{EXPEDIENTE}}': data?.hechoDelictivo?.expediente ?? '',
    '{{NRO_AGRESORES}}': String(data?.hechoDelictivo?.numAgresores ?? ''),
    '{{DELITO_ROBO}}': delitos?.robo ? 'X' : '',
    '{{DELITO_HOMICIDIO}}': delitos?.homicidio ? 'X' : '',
    '{{DELITO_VIOLENCIA_GENERO}}': delitos?.violenciaGenero ? 'X' : '',
    '{{DELITO_ROBO_AF}}': delitos?.roboArmaFuego ? 'X' : '',
    '{{DELITO_HOMICIDIO_ACCIDENTE}}': delitos?.homicidioAccidenteVial ? 'X' : '',
    '{{DELITO_ABUSO_SIMPLE}}': delitos?.abusoSexualSimple ? 'X' : '',
    '{{DELITO_ROBO_AB}}': delitos?.roboArmaBlanca ? 'X' : '',
    '{{DELITO_HOMICIDIO_AV}}': delitos?.homicidioAvHecho ? 'X' : '',
    '{{DELITO_ABUSO_AGRAVADO}}': delitos?.abusoSexualAgravado ? 'X' : '',
    '{{DELITO_LESIONES}}': delitos?.lesiones ? 'X' : '',
    '{{DELITO_HOMICIDIO_DELITO}}': delitos?.homicidioDelito ? 'X' : '',
    '{{DELITO_TRANSFEMICIDIO}}': delitos?.transfemicidio || delitos?.travestisidioTransfemicidio ? 'X' : '',
    '{{DELITO_LESIONES_AF}}': delitos?.lesionesArmaFuego ? 'X' : '',
    '{{DELITO_AMENAZAS}}': delitos?.amenazas ? 'X' : '',
    '{{DELITO_LESIONES_AB}}': delitos?.lesionesArmaBlanca ? 'X' : '',
    '{{DELITO_FEMICIDIO}}': delitos?.femicidio ? 'X' : '',

    '{{UBICACION}}': data?.hechoDelictivo?.ubicacion?.calleBarrio ?? '',
    '{{DEPTO_HECHO}}': data?.hechoDelictivo?.ubicacion?.departamento ?? '',
    '{{FECHA_HECHO}}': safeDate(data?.hechoDelictivo?.fecha),
    '{{HORA_HECHO}}': data?.hechoDelictivo?.hora ?? '',

    // === ACCIONES ===
    '{{ACCIONES_1L}}': data?.accionesPrimeraLinea ?? '',

    // === ABUSO SEXUAL ===
    '{{KIT_SI}}': data?.abusoSexual?.kit?.toUpperCase() === 'SI' ? 'X' : '',
    '{{KIT_NO}}': data?.abusoSexual?.kit?.toUpperCase() === 'NO' ? 'X' : '',
    '{{REL_CONOCIDO}}': data?.abusoSexual?.relacion === 'Conocido' ? 'X' : '',
    '{{REL_DESCONOCIDO}}': data?.abusoSexual?.relacion === 'Desconocido' ? 'X' : '',
    '{{REL_FAMILIAR}}': data?.abusoSexual?.relacion === 'Familiar' ? 'X' : '',
    '{{REL_PAREJA}}': data?.abusoSexual?.relacion === 'Pareja' ? 'X' : '',
    '{{RELACION_OTRO}}': data?.abusoSexual?.relacion_otro ?? '',
    '{{LUGAR_INST}}': data?.abusoSexual?.lugar_hecho === 'Institución' ? 'X' : '',
    '{{LUGAR_PUBLICA}}': data?.abusoSexual?.lugar_hecho === 'Vía Pública' ? 'X' : '',
    '{{LUGAR_DOM}}': data?.abusoSexual?.lugar_hecho === 'Dom. particular' ? 'X' : '',
    '{{LUGAR_TRABAJO}}': data?.abusoSexual?.lugar_hecho === 'Lugar de trab.' ? 'X' : '',
    '{{LUGAR_OTRO}}': data?.abusoSexual?.lugar_otro ?? '',

    // === VÍCTIMAS ===
    '{{CANT_VICTIMAS}}': String(data?.victima?.cantidadVictimaPorHecho ?? ''),
    '{{DNI}}': data?.victima?.dni ?? '',
    '{{APELLIDO}}': data?.victima?.nombre?.split(' ').slice(1).join(' ') ?? '',
    '{{NOMBRES}}': data?.victima?.nombre?.split(' ')[0] ?? '',
    '{{GEN_MASCULINO}}': generoId === 1 ? 'X' : '',
    '{{GEN_FEMENINO}}': generoId === 2 ? 'X' : '',
    '{{GEN_NO_BINARIO}}': generoId === 3 ? 'X' : '',
    '{{GEN_AGENERO}}': generoId === 4 ? 'X' : '',
    '{{GEN_FLUIDO}}': generoId === 5 ? 'X' : '',
    '{{GEN_BIGENERO}}': generoId === 6 ? 'X' : '',
    '{{GEN_TRANSGENERO}}': generoId === 7 ? 'X' : '',
    '{{GEN_MUJER_TRANS}}': generoId === 8 ? 'X' : '',
    '{{GEN_HOMBRE_TRANS}}': generoId === 9 ? 'X' : '',
    '{{GEN_INTERGENERO}}': generoId === 10 ? 'X' : '',
    '{{GEN_INTERSEX}}': generoId === 11 ? 'X' : '',
    '{{GEN_OTRO}}': generoId === 12 ? 'X' : '',
    '{{GEN_PREFIERO_NO_DECIRLO}}': generoId === 13 ? 'X' : '',
    '{{NACIMIENTO}}': safeDate(data?.victima?.fechaNacimiento),
    '{{TELEFONO}}': data?.victima?.telefono ?? '',
    '{{DIR_VICTIMA}}': direccion?.calleNro ? `${direccion.calleNro}, ${direccion.barrio ?? ''}` : '',
    '{{DEPTO_VICTIMA}}': direccion?.departamento ?? '',
    '{{OCUPACION}}': data?.victima?.ocupacion ?? '',

    // === TIPO DE INTERVENCIÓN ===
    '{{TIPO_CRISIS}}': data?.intervencionTipo?.crisis ? 'X' : '',
    '{{TIPO_SOCIAL}}': data?.intervencionTipo?.social ? 'X' : '',
    '{{TIPO_LEGAL}}': data?.intervencionTipo?.legal ? 'X' : '',
    '{{TIPO_TELEFONICA}}': data?.intervencionTipo?.telefonica ? 'X' : '',
    '{{TIPO_PSICOLOGICA}}': data?.intervencionTipo?.psicologica ? 'X' : '',
    '{{TIPO_MEDICA}}': data?.intervencionTipo?.medica ? 'X' : '',

    // === SEGUIMIENTO ===
    '{{DETALLE_INTERV}}': data?.seguimiento?.detalle ?? '',
    '{{SEGUIM_SI}}': data?.seguimiento?.hubo === true ? 'X' : '',
    '{{SEGUIM_NO}}': data?.seguimiento?.hubo === false ? 'X' : '',
  };
}
