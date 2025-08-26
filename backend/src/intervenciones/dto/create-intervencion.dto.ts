// src/intervenciones/dto/create-intervencion.dto.ts
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsDateString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class DireccionDto {
  @ApiProperty({ description: "Calle y número de la dirección" })
  @IsString()
  calleNro: string;

  @ApiProperty({ description: "Barrio de la dirección" })
  @IsString()
  barrio: string;

  @ApiProperty({ description: "ID del departamento" })
  @IsNumber()
  departamento: number;

  @ApiProperty({ description: "ID de la localidad" })
  @IsNumber()
  localidad: number;
}

export class IntervencionDto {
  @ApiPropertyOptional({
    description: "Nombre del coordinador de la intervención",
  })
  @IsOptional()
  @IsString()
  coordinador?: string;

  @ApiPropertyOptional({
    description: "Nombre del operador de la intervención",
  })
  @IsOptional()
  @IsString()
  operador?: string;

  @ApiProperty({ description: "Fecha de la intervención" })
  @IsDateString()
  fecha: string;

  @ApiProperty({ description: "Breve reseña del hecho delictivo" })
  @IsString()
  resena_hecho: string;
}

export class DerivacionDto {
  @ApiProperty({ description: "ID de los motivos de derivación" })
  @IsNumber()
  motivos: number;

  @ApiProperty({ description: "Nombre de quien realiza la derivación" })
  @IsString()
  derivador: string;

  @ApiProperty({ description: "Hora de la derivación" })
  @IsString()
  hora: string;
}

export class TipoHechoDto {
  @ApiProperty({ description: "Indica si hubo robo" })
  @IsBoolean()
  robo: boolean;

  @ApiProperty({ description: "Indica si hubo robo con arma de fuego" })
  @IsBoolean()
  roboArmaFuego: boolean;

  @ApiProperty({ description: "Indica si hubo robo con arma blanca" })
  @IsBoolean()
  roboArmaBlanca: boolean;

  @ApiProperty({ description: "Indica si hubo amenazas" })
  @IsBoolean()
  amenazas: boolean;

  @ApiProperty({ description: "Indica si hubo lesiones" })
  @IsBoolean()
  lesiones: boolean;

  @ApiProperty({ description: "Indica si hubo lesiones con arma de fuego" })
  @IsBoolean()
  lesionesArmaFuego: boolean;

  @ApiProperty({ description: "Indica si hubo lesiones con arma blanca" })
  @IsBoolean()
  lesionesArmaBlanca: boolean;

  @ApiProperty({ description: "Indica si hubo homicidio por delito" })
  @IsBoolean()
  homicidioDelito: boolean;

  @ApiProperty({ description: "Indica si hubo homicidio por accidente vial" })
  @IsBoolean()
  homicidioAccidenteVial: boolean;

  @ApiProperty({ description: "Indica si hubo homicidio AV hecho" })
  @IsBoolean()
  homicidioAvHecho: boolean;

  @ApiProperty({ description: "Indica si hubo femicidio" })
  @IsBoolean()
  femicidio: boolean;

  @ApiProperty({ description: "Indica si hubo travestisidio/transfemicidio" })
  @IsBoolean()
  travestisidioTransfemicidio: boolean;

  @ApiProperty({ description: "Indica si hubo violencia de género" })
  @IsBoolean()
  violenciaGenero: boolean;

  @ApiProperty({ description: "Indica si hubo otros tipos de hechos" })
  @IsBoolean()
  otros: boolean;
}

export class UbicacionDto {
  @ApiProperty({ description: "Calle y barrio del hecho" })
  @IsString()
  calleBarrio: string;

  @ApiProperty({ description: "ID del departamento del hecho" })
  @IsNumber()
  departamento: number;
}

export class HechoDelictivoDto {
  @ApiProperty({ description: "Número de expediente del hecho delictivo" })
  @IsString()
  expediente: string;

  @ApiProperty({ description: "Número de agresores" })
  @IsNumber()
  numAgresores: number;

  @ApiProperty({ description: "Ubicación del hecho delictivo" })
  @ValidateNested()
  @Type(() => UbicacionDto)
  ubicacion: UbicacionDto;

  @ApiProperty({ description: "Fecha del hecho delictivo" })
  @IsDateString()
  fecha: string;

  @ApiProperty({ description: "Hora del hecho delictivo" })
  @IsString()
  hora: string;

  @ApiProperty({ description: "Tipo de hecho delictivo" })
  @ValidateNested()
  @Type(() => TipoHechoDto)
  tipoHecho: TipoHechoDto;
}

export class VictimaDto {
  @ApiProperty({ description: "DNI de la víctima" })
  @IsString()
  dni: string;

  @ApiProperty({ description: "Cantidad de victimas" })
  @IsNumber()
  cantidadVictimas: number;

  @ApiProperty({ description: "Nombre de la víctima" })
  @IsString()
  nombre: string;

  @ApiProperty({ description: "ID del género de la víctima" })
  @IsNumber()
  genero: number;

  @ApiProperty({ description: "Fecha de nacimiento de la víctima" })
  @IsDateString()
  fechaNacimiento: string;

  @ApiPropertyOptional({ description: "Teléfono de la víctima" })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiPropertyOptional({ description: "Ocupación de la víctima" })
  @IsOptional()
  @IsString()
  ocupacion?: string;

  @ApiProperty({ description: "Dirección de la víctima" })
  @ValidateNested()
  @Type(() => DireccionDto)
  direccion: DireccionDto;
}

export class PersonaEntrevistadaDto {
  @ApiProperty({ description: "Nombre de la persona entrevistada" })
  @IsString()
  nombre: string;

  @ApiProperty({ description: "Relación con la víctima" })
  @IsString()
  relacionVictima: string;

  @ApiProperty({ description: "Dirección de la persona entrevistada" })
  @ValidateNested()
  @Type(() => DireccionDto)
  direccion: DireccionDto;
}

export class DatosAbusoSexualDto {
  @ApiProperty({ description: "Número de kit de abuso sexual" })
  @IsString()
  kit: string;

  @ApiProperty({ description: "Relación con la víctima" })
  @IsString()
  relacion: string;

  @ApiPropertyOptional({ description: "Otra relación especificada" })
  @IsOptional()
  @IsString()
  relacionOtro?: string;

  @ApiProperty({ description: "Lugar del hecho" })
  @IsString()
  lugarHecho: string;

  @ApiPropertyOptional({ description: "Otro lugar especificado" })
  @IsOptional()
  @IsString()
  lugarOtro?: string;
}

export class AbusoSexualDto {
  @ApiProperty({ description: "Indica si es abuso sexual simple" })
  @IsBoolean()
  simple: boolean;

  @ApiProperty({ description: "Indica si es abuso sexual agravado" })
  @IsBoolean()
  agravado: boolean;
}

export class TipoIntervencionDto {
  @ApiProperty({ description: "Indica si es intervención de crisis" })
  @IsBoolean()
  crisis: boolean;

  @ApiProperty({ description: "Indica si es intervención telefónica" })
  @IsBoolean()
  telefonica: boolean;

  @ApiProperty({ description: "Indica si es intervención domiciliaria" })
  @IsBoolean()
  domiciliaria: boolean;

  @ApiProperty({ description: "Indica si es intervención psicológica" })
  @IsBoolean()
  psicologica: boolean;

  @ApiProperty({ description: "Indica si es intervención médica" })
  @IsBoolean()
  medica: boolean;

  @ApiProperty({ description: "Indica si es intervención social" })
  @IsBoolean()
  social: boolean;

  @ApiProperty({ description: "Indica si es intervención legal" })
  @IsBoolean()
  legal: boolean;

  @ApiProperty({ description: "Indica si no hubo intervención" })
  @IsBoolean()
  sinIntervencion: boolean;

  @ApiProperty({ description: "Indica si se archivó el caso" })
  @IsBoolean()
  archivoCaso: boolean;
}

export class SeguimientoTipoDto {
  @ApiProperty({ description: "Indica si se realizó asesoramiento legal" })
  @IsBoolean()
  asesoramientoLegal: boolean;

  @ApiProperty({ description: "Indica si se realizó tratamiento psicológico" })
  @IsBoolean()
  tratamientoPsicologico: boolean;

  @ApiProperty({ description: "Indica si se realizó seguimiento legal" })
  @IsBoolean()
  seguimientoLegal: boolean;

  @ApiProperty({ description: "Indica si se archivó el caso" })
  @IsBoolean()
  archivoCaso: boolean;
}

export class SeguimientoDto {
  @ApiProperty({ description: "Indica si se realizó seguimiento" })
  @IsBoolean()
  realizado: boolean;

  @ApiProperty({ description: "Tipo de seguimiento realizado" })
  @ValidateNested()
  @Type(() => SeguimientoTipoDto)
  tipo: SeguimientoTipoDto;
}

export class CreateIntervencionDto {
  @ApiProperty({ description: "Datos de la intervención" })
  @ValidateNested()
  @Type(() => IntervencionDto)
  intervencion: IntervencionDto;

  @ApiProperty({ description: "Datos de la derivación" })
  @ValidateNested()
  @Type(() => DerivacionDto)
  derivacion: DerivacionDto;

  @ApiProperty({ description: "Datos del hecho delictivo" })
  @ValidateNested()
  @Type(() => HechoDelictivoDto)
  hechoDelictivo: HechoDelictivoDto;

  @ApiProperty({ description: "Acciones de primera línea realizadas" })
  @IsString()
  accionesPrimeraLinea: string;

  @ApiProperty({ description: "Datos del abuso sexual" })
  @ValidateNested()
  @Type(() => AbusoSexualDto)
  abusoSexual: AbusoSexualDto;

  @ApiProperty({ description: "Datos específicos del abuso sexual" })
  @ValidateNested()
  @Type(() => DatosAbusoSexualDto)
  datosAbusoSexual: DatosAbusoSexualDto;

  @ApiProperty({ description: "Datos de la víctima" })
  @ValidateNested()
  @Type(() => VictimaDto)
  victima: VictimaDto;

  @ApiProperty({ description: "Datos de la persona entrevistada" })
  @ValidateNested()
  @Type(() => PersonaEntrevistadaDto)
  personaEntrevistada: PersonaEntrevistadaDto;

  @ApiProperty({ description: "Tipo de intervención realizada" })
  @ValidateNested()
  @Type(() => TipoIntervencionDto)
  tipoIntervencion: TipoIntervencionDto;

  @ApiProperty({ description: "Datos del seguimiento" })
  @ValidateNested()
  @Type(() => SeguimientoDto)
  seguimiento: SeguimientoDto;

  @ApiProperty({ description: "Detalle del seguimiento" })
  @IsString()
  detalleSeguimiento: string;
}
