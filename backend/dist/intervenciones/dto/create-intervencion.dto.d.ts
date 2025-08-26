export declare class DireccionDto {
    calleNro: string;
    barrio: string;
    departamento: number;
    localidad: number;
}
export declare class IntervencionDto {
    coordinador?: string;
    operador?: string;
    fecha: string;
    resena_hecho: string;
}
export declare class DerivacionDto {
    motivos: number;
    derivador: string;
    hora: string;
}
export declare class TipoHechoDto {
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
}
export declare class UbicacionDto {
    calleBarrio: string;
    departamento: number;
}
export declare class HechoDelictivoDto {
    expediente: string;
    numAgresores: number;
    ubicacion: UbicacionDto;
    fecha: string;
    hora: string;
    tipoHecho: TipoHechoDto;
}
export declare class VictimaDto {
    dni: string;
    cantidadVictimas: number;
    nombre: string;
    genero: number;
    fechaNacimiento: string;
    telefono?: string;
    ocupacion?: string;
    direccion: DireccionDto;
}
export declare class PersonaEntrevistadaDto {
    nombre: string;
    relacionVictima: string;
    direccion: DireccionDto;
}
export declare class DatosAbusoSexualDto {
    kit: string;
    relacion: string;
    relacionOtro?: string;
    lugarHecho: string;
    lugarOtro?: string;
}
export declare class AbusoSexualDto {
    simple: boolean;
    agravado: boolean;
}
export declare class TipoIntervencionDto {
    crisis: boolean;
    telefonica: boolean;
    domiciliaria: boolean;
    psicologica: boolean;
    medica: boolean;
    social: boolean;
    legal: boolean;
    sinIntervencion: boolean;
    archivoCaso: boolean;
}
export declare class SeguimientoTipoDto {
    asesoramientoLegal: boolean;
    tratamientoPsicologico: boolean;
    seguimientoLegal: boolean;
    archivoCaso: boolean;
}
export declare class SeguimientoDto {
    realizado: boolean;
    tipo: SeguimientoTipoDto;
}
export declare class CreateIntervencionDto {
    intervencion: IntervencionDto;
    derivacion: DerivacionDto;
    hechoDelictivo: HechoDelictivoDto;
    accionesPrimeraLinea: string;
    abusoSexual: AbusoSexualDto;
    datosAbusoSexual: DatosAbusoSexualDto;
    victima: VictimaDto;
    personaEntrevistada: PersonaEntrevistadaDto;
    tipoIntervencion: TipoIntervencionDto;
    seguimiento: SeguimientoDto;
    detalleSeguimiento: string;
}
