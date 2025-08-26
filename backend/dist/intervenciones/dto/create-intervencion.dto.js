"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateIntervencionDto = exports.SeguimientoDto = exports.SeguimientoTipoDto = exports.TipoIntervencionDto = exports.AbusoSexualDto = exports.DatosAbusoSexualDto = exports.PersonaEntrevistadaDto = exports.VictimaDto = exports.HechoDelictivoDto = exports.UbicacionDto = exports.TipoHechoDto = exports.DerivacionDto = exports.IntervencionDto = exports.DireccionDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class DireccionDto {
    calleNro;
    barrio;
    departamento;
    localidad;
}
exports.DireccionDto = DireccionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Calle y número de la dirección" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DireccionDto.prototype, "calleNro", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Barrio de la dirección" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DireccionDto.prototype, "barrio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "ID del departamento" }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DireccionDto.prototype, "departamento", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "ID de la localidad" }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DireccionDto.prototype, "localidad", void 0);
class IntervencionDto {
    coordinador;
    operador;
    fecha;
    resena_hecho;
}
exports.IntervencionDto = IntervencionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Nombre del coordinador de la intervención",
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IntervencionDto.prototype, "coordinador", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Nombre del operador de la intervención",
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IntervencionDto.prototype, "operador", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Fecha de la intervención" }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], IntervencionDto.prototype, "fecha", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Breve reseña del hecho delictivo" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IntervencionDto.prototype, "resena_hecho", void 0);
class DerivacionDto {
    motivos;
    derivador;
    hora;
}
exports.DerivacionDto = DerivacionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "ID de los motivos de derivación" }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DerivacionDto.prototype, "motivos", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Nombre de quien realiza la derivación" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DerivacionDto.prototype, "derivador", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Hora de la derivación" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DerivacionDto.prototype, "hora", void 0);
class TipoHechoDto {
    robo;
    roboArmaFuego;
    roboArmaBlanca;
    amenazas;
    lesiones;
    lesionesArmaFuego;
    lesionesArmaBlanca;
    homicidioDelito;
    homicidioAccidenteVial;
    homicidioAvHecho;
    femicidio;
    travestisidioTransfemicidio;
    violenciaGenero;
    otros;
}
exports.TipoHechoDto = TipoHechoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Indica si hubo robo" }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TipoHechoDto.prototype, "robo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Indica si hubo robo con arma de fuego" }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TipoHechoDto.prototype, "roboArmaFuego", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Indica si hubo robo con arma blanca" }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TipoHechoDto.prototype, "roboArmaBlanca", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Indica si hubo amenazas" }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TipoHechoDto.prototype, "amenazas", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Indica si hubo lesiones" }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TipoHechoDto.prototype, "lesiones", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Indica si hubo lesiones con arma de fuego" }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TipoHechoDto.prototype, "lesionesArmaFuego", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Indica si hubo lesiones con arma blanca" }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TipoHechoDto.prototype, "lesionesArmaBlanca", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Indica si hubo homicidio por delito" }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TipoHechoDto.prototype, "homicidioDelito", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Indica si hubo homicidio por accidente vial" }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TipoHechoDto.prototype, "homicidioAccidenteVial", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Indica si hubo homicidio AV hecho" }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TipoHechoDto.prototype, "homicidioAvHecho", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Indica si hubo femicidio" }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TipoHechoDto.prototype, "femicidio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Indica si hubo travestisidio/transfemicidio" }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TipoHechoDto.prototype, "travestisidioTransfemicidio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Indica si hubo violencia de género" }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TipoHechoDto.prototype, "violenciaGenero", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Indica si hubo otros tipos de hechos" }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TipoHechoDto.prototype, "otros", void 0);
class UbicacionDto {
    calleBarrio;
    departamento;
}
exports.UbicacionDto = UbicacionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Calle y barrio del hecho" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UbicacionDto.prototype, "calleBarrio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "ID del departamento del hecho" }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UbicacionDto.prototype, "departamento", void 0);
class HechoDelictivoDto {
    expediente;
    numAgresores;
    ubicacion;
    fecha;
    hora;
    tipoHecho;
}
exports.HechoDelictivoDto = HechoDelictivoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Número de expediente del hecho delictivo" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HechoDelictivoDto.prototype, "expediente", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Número de agresores" }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], HechoDelictivoDto.prototype, "numAgresores", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Ubicación del hecho delictivo" }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => UbicacionDto),
    __metadata("design:type", UbicacionDto)
], HechoDelictivoDto.prototype, "ubicacion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Fecha del hecho delictivo" }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], HechoDelictivoDto.prototype, "fecha", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Hora del hecho delictivo" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HechoDelictivoDto.prototype, "hora", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Tipo de hecho delictivo" }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => TipoHechoDto),
    __metadata("design:type", TipoHechoDto)
], HechoDelictivoDto.prototype, "tipoHecho", void 0);
class VictimaDto {
    dni;
    cantidadVictimas;
    nombre;
    genero;
    fechaNacimiento;
    telefono;
    ocupacion;
    direccion;
}
exports.VictimaDto = VictimaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "DNI de la víctima" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VictimaDto.prototype, "dni", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Cantidad de victimas" }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], VictimaDto.prototype, "cantidadVictimas", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Nombre de la víctima" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VictimaDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "ID del género de la víctima" }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], VictimaDto.prototype, "genero", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Fecha de nacimiento de la víctima" }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], VictimaDto.prototype, "fechaNacimiento", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Teléfono de la víctima" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VictimaDto.prototype, "telefono", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Ocupación de la víctima" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VictimaDto.prototype, "ocupacion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Dirección de la víctima" }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DireccionDto),
    __metadata("design:type", DireccionDto)
], VictimaDto.prototype, "direccion", void 0);
class PersonaEntrevistadaDto {
    nombre;
    relacionVictima;
    direccion;
}
exports.PersonaEntrevistadaDto = PersonaEntrevistadaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Nombre de la persona entrevistada" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PersonaEntrevistadaDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Relación con la víctima" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PersonaEntrevistadaDto.prototype, "relacionVictima", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Dirección de la persona entrevistada" }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DireccionDto),
    __metadata("design:type", DireccionDto)
], PersonaEntrevistadaDto.prototype, "direccion", void 0);
class DatosAbusoSexualDto {
    kit;
    relacion;
    relacionOtro;
    lugarHecho;
    lugarOtro;
}
exports.DatosAbusoSexualDto = DatosAbusoSexualDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Número de kit de abuso sexual" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DatosAbusoSexualDto.prototype, "kit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Relación con la víctima" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DatosAbusoSexualDto.prototype, "relacion", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Otra relación especificada" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DatosAbusoSexualDto.prototype, "relacionOtro", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Lugar del hecho" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DatosAbusoSexualDto.prototype, "lugarHecho", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Otro lugar especificado" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DatosAbusoSexualDto.prototype, "lugarOtro", void 0);
class AbusoSexualDto {
    simple;
    agravado;
}
exports.AbusoSexualDto = AbusoSexualDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Indica si es abuso sexual simple" }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AbusoSexualDto.prototype, "simple", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Indica si es abuso sexual agravado" }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AbusoSexualDto.prototype, "agravado", void 0);
class TipoIntervencionDto {
    crisis;
    telefonica;
    domiciliaria;
    psicologica;
    medica;
    social;
    legal;
    sinIntervencion;
    archivoCaso;
}
exports.TipoIntervencionDto = TipoIntervencionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Indica si es intervención de crisis" }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TipoIntervencionDto.prototype, "crisis", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Indica si es intervención telefónica" }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TipoIntervencionDto.prototype, "telefonica", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Indica si es intervención domiciliaria" }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TipoIntervencionDto.prototype, "domiciliaria", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Indica si es intervención psicológica" }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TipoIntervencionDto.prototype, "psicologica", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Indica si es intervención médica" }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TipoIntervencionDto.prototype, "medica", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Indica si es intervención social" }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TipoIntervencionDto.prototype, "social", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Indica si es intervención legal" }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TipoIntervencionDto.prototype, "legal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Indica si no hubo intervención" }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TipoIntervencionDto.prototype, "sinIntervencion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Indica si se archivó el caso" }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TipoIntervencionDto.prototype, "archivoCaso", void 0);
class SeguimientoTipoDto {
    asesoramientoLegal;
    tratamientoPsicologico;
    seguimientoLegal;
    archivoCaso;
}
exports.SeguimientoTipoDto = SeguimientoTipoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Indica si se realizó asesoramiento legal" }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SeguimientoTipoDto.prototype, "asesoramientoLegal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Indica si se realizó tratamiento psicológico" }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SeguimientoTipoDto.prototype, "tratamientoPsicologico", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Indica si se realizó seguimiento legal" }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SeguimientoTipoDto.prototype, "seguimientoLegal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Indica si se archivó el caso" }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SeguimientoTipoDto.prototype, "archivoCaso", void 0);
class SeguimientoDto {
    realizado;
    tipo;
}
exports.SeguimientoDto = SeguimientoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Indica si se realizó seguimiento" }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SeguimientoDto.prototype, "realizado", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Tipo de seguimiento realizado" }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SeguimientoTipoDto),
    __metadata("design:type", SeguimientoTipoDto)
], SeguimientoDto.prototype, "tipo", void 0);
class CreateIntervencionDto {
    intervencion;
    derivacion;
    hechoDelictivo;
    accionesPrimeraLinea;
    abusoSexual;
    datosAbusoSexual;
    victima;
    personaEntrevistada;
    tipoIntervencion;
    seguimiento;
    detalleSeguimiento;
}
exports.CreateIntervencionDto = CreateIntervencionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Datos de la intervención" }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => IntervencionDto),
    __metadata("design:type", IntervencionDto)
], CreateIntervencionDto.prototype, "intervencion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Datos de la derivación" }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DerivacionDto),
    __metadata("design:type", DerivacionDto)
], CreateIntervencionDto.prototype, "derivacion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Datos del hecho delictivo" }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => HechoDelictivoDto),
    __metadata("design:type", HechoDelictivoDto)
], CreateIntervencionDto.prototype, "hechoDelictivo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Acciones de primera línea realizadas" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateIntervencionDto.prototype, "accionesPrimeraLinea", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Datos del abuso sexual" }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AbusoSexualDto),
    __metadata("design:type", AbusoSexualDto)
], CreateIntervencionDto.prototype, "abusoSexual", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Datos específicos del abuso sexual" }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DatosAbusoSexualDto),
    __metadata("design:type", DatosAbusoSexualDto)
], CreateIntervencionDto.prototype, "datosAbusoSexual", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Datos de la víctima" }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => VictimaDto),
    __metadata("design:type", VictimaDto)
], CreateIntervencionDto.prototype, "victima", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Datos de la persona entrevistada" }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PersonaEntrevistadaDto),
    __metadata("design:type", PersonaEntrevistadaDto)
], CreateIntervencionDto.prototype, "personaEntrevistada", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Tipo de intervención realizada" }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => TipoIntervencionDto),
    __metadata("design:type", TipoIntervencionDto)
], CreateIntervencionDto.prototype, "tipoIntervencion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Datos del seguimiento" }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SeguimientoDto),
    __metadata("design:type", SeguimientoDto)
], CreateIntervencionDto.prototype, "seguimiento", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Detalle del seguimiento" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateIntervencionDto.prototype, "detalleSeguimiento", void 0);
//# sourceMappingURL=create-intervencion.dto.js.map