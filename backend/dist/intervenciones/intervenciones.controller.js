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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntervencionesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const intervenciones_service_1 = require("./intervenciones.service");
const create_intervencion_dto_1 = require("./dto/create-intervencion.dto");
const update_intervencion_dto_1 = require("./dto/update-intervencion.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let IntervencionesController = class IntervencionesController {
    intervencionesService;
    constructor(intervencionesService) {
        this.intervencionesService = intervencionesService;
    }
    async createIntervencion(createIntervencionDto) {
        try {
            const result = await this.intervencionesService.createIntervencion(createIntervencionDto);
            return {
                success: true,
                message: "Intervención registrada correctamente.",
                codigo: result.codigo,
                data: result.data,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: `Error al registrar la intervención: ${error.message}`,
                codigo: null,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findAll() {
        try {
            const intervenciones = await this.intervencionesService.findAll();
            return {
                success: true,
                message: "Intervenciones obtenidas correctamente.",
                data: intervenciones,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: `Error al obtener las intervenciones: ${error.message}`,
                data: null,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findOne(id) {
        try {
            const intervencion = await this.intervencionesService.findOne(+id);
            if (!intervencion) {
                throw new common_1.HttpException({
                    success: false,
                    message: "Intervención no encontrada",
                    data: null,
                }, common_1.HttpStatus.NOT_FOUND);
            }
            return {
                success: true,
                message: "Intervención obtenida correctamente.",
                data: intervencion,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: `Error al obtener la intervención: ${error.message}`,
                data: null,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async update(id, updateIntervencionDto) {
        try {
            const updated = await this.intervencionesService.updateIntervencion(+id, updateIntervencionDto);
            if (!updated) {
                throw new common_1.HttpException({ success: false, message: "Intervención no encontrada", data: null }, common_1.HttpStatus.NOT_FOUND);
            }
            return {
                success: true,
                message: "Intervención actualizada correctamente.",
                data: updated,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException({
                success: false,
                message: `Error al actualizar la intervención: ${error.message}`,
                data: null,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async eliminarLogico(id) {
        return this.intervencionesService.eliminarLogico(Number(id));
    }
    async cerrarIntervencion(id) {
        return this.intervencionesService.cerrarIntervencion(Number(id));
    }
    async archivarIntervencion(id) {
        return this.intervencionesService.archivarIntervencion(Number(id));
    }
    async findAllNoActivas() {
        try {
            const intervenciones_no_activas = await this.intervencionesService.findAllNoActivas();
            return {
                success: true,
                message: "Intervenciones no activas obtenidas correctamente.",
                data: intervenciones_no_activas,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: `Error al obtener las intervenciones: ${error.message}`,
                data: null,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateIntervencion(id, updateIntervencionDto) {
        const numId = Number(id);
        if (!numId || isNaN(numId)) {
            throw new common_1.HttpException({ success: false, message: "ID inválido", data: null }, common_1.HttpStatus.BAD_REQUEST);
        }
        const result = await this.intervencionesService.updateIntervencion(numId, updateIntervencionDto);
        if (!result) {
            throw new common_1.HttpException({ success: false, message: "Intervención no encontrada", data: null }, common_1.HttpStatus.NOT_FOUND);
        }
        return {
            success: true,
            message: "Intervención actualizada correctamente",
            data: result,
        };
    }
};
exports.IntervencionesController = IntervencionesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: "Crear una nueva intervención",
        description: "Registra una nueva intervención con todos sus datos relacionados",
    }),
    (0, swagger_1.ApiBody)({
        type: create_intervencion_dto_1.CreateIntervencionDto,
        description: "Datos de la intervención a crear",
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: "Intervención creada exitosamente",
        schema: {
            type: "object",
            properties: {
                success: { type: "boolean", example: true },
                message: {
                    type: "string",
                    example: "Intervención registrada correctamente.",
                },
                codigo: { type: "string", example: "INT-2024-001" },
                data: { type: "object" },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: "Error interno del servidor",
        schema: {
            type: "object",
            properties: {
                success: { type: "boolean", example: false },
                message: {
                    type: "string",
                    example: "Error al registrar la intervención",
                },
                codigo: { type: "null", example: null },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_intervencion_dto_1.CreateIntervencionDto]),
    __metadata("design:returntype", Promise)
], IntervencionesController.prototype, "createIntervencion", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: "Listar todas las intervenciones",
        description: "Obtiene una lista de todas las intervenciones registradas",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Lista de intervenciones obtenida exitosamente",
        schema: {
            type: "object",
            properties: {
                success: { type: "boolean", example: true },
                message: {
                    type: "string",
                    example: "Intervenciones obtenidas correctamente.",
                },
                data: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "number", example: 1 },
                            numero_intervencion: { type: "string", example: "INT-2024-001" },
                            fecha: { type: "string", example: "2024-01-15T00:00:00.000Z" },
                            coordinador: { type: "string", example: "Juan Pérez" },
                            operador: { type: "string", example: "María García" },
                            reseña_hecho: { type: "string", example: "Robo en domicilio..." },
                            eliminado: { type: "boolean", example: false },
                            estado: { type: "string", example: "activo" },
                            fecha_creacion: {
                                type: "string",
                                example: "2024-01-15T10:30:00.000Z",
                            },
                            _count: {
                                type: "object",
                                properties: {
                                    derivaciones: { type: "number", example: 1 },
                                    hechos_delictivos: { type: "number", example: 1 },
                                    victimas: { type: "number", example: 1 },
                                    seguimientos: { type: "number", example: 1 },
                                },
                            },
                        },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: "Error interno del servidor",
        schema: {
            type: "object",
            properties: {
                success: { type: "boolean", example: false },
                message: {
                    type: "string",
                    example: "Error al obtener las intervenciones",
                },
                data: { type: "null", example: null },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IntervencionesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, swagger_1.ApiOperation)({
        summary: "Obtener una intervención específica",
        description: "Obtiene los detalles completos de una intervención por su ID",
    }),
    (0, swagger_1.ApiParam)({
        name: "id",
        description: "ID de la intervención",
        type: "number",
        example: 1,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Intervención obtenida exitosamente",
        schema: {
            type: "object",
            properties: {
                success: { type: "boolean", example: true },
                message: {
                    type: "string",
                    example: "Intervención obtenida correctamente.",
                },
                data: {
                    type: "object",
                    properties: {
                        id: { type: "number", example: 1 },
                        numero_intervencion: { type: "string", example: "INT-2024-001" },
                        fecha: { type: "string", example: "2024-01-15T00:00:00.000Z" },
                        coordinador: { type: "string", example: "Juan Pérez" },
                        operador: { type: "string", example: "María García" },
                        reseña_hecho: { type: "string", example: "Robo en domicilio..." },
                        fecha_creacion: {
                            type: "string",
                            example: "2024-01-15T10:30:00.000Z",
                        },
                        derivaciones: { type: "array" },
                        hechos_delictivos: { type: "array" },
                        victimas: { type: "array" },
                        personas_entrevistadas: { type: "array" },
                        seguimientos: { type: "array" },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: "Intervención no encontrada",
        schema: {
            type: "object",
            properties: {
                success: { type: "boolean", example: false },
                message: {
                    type: "string",
                    example: "Intervención no encontrada",
                },
                data: { type: "null", example: null },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: "Error interno del servidor",
        schema: {
            type: "object",
            properties: {
                success: { type: "boolean", example: false },
                message: {
                    type: "string",
                    example: "Error al obtener la intervención",
                },
                data: { type: "null", example: null },
            },
        },
    }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IntervencionesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, swagger_1.ApiOperation)({
        summary: "Actualizar una intervención",
        description: "Actualiza parcial o totalmente una intervención completa por su ID",
    }),
    (0, swagger_1.ApiParam)({
        name: "id",
        description: "ID de la intervención",
        type: "number",
    }),
    (0, swagger_1.ApiBody)({
        type: update_intervencion_dto_1.UpdateIntervencionDto,
        description: "Campos a actualizar",
        examples: {
            actualizarBasicos: {
                summary: "Actualizar datos básicos y tipo",
                value: {
                    intervencion: {
                        coordinador: "Coordinador X",
                        operador: "Operador Y",
                    },
                    tipoIntervencion: { crisis: true, telefonica: false },
                },
            },
            actualizarHechoYGeo: {
                summary: "Actualizar hecho delictivo y geolocalización",
                value: {
                    hechoDelictivo: {
                        expediente: "EXP-123",
                        numAgresores: 2,
                        tipoHecho: { robo: true, lesiones: false },
                        ubicacion: { calleBarrio: "Calle 123", departamento: 5 },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Intervención actualizada exitosamente",
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Intervención no encontrada" }),
    (0, swagger_1.ApiResponse)({ status: 500, description: "Error interno del servidor" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_intervencion_dto_1.UpdateIntervencionDto]),
    __metadata("design:returntype", Promise)
], IntervencionesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(":id/eliminar"),
    (0, swagger_1.ApiOperation)({
        summary: "Eliminar una intervención lógicamente",
        description: "Elimina una intervención de forma lógica, cambiando su estado a 'eliminado'",
    }),
    (0, swagger_1.ApiParam)({
        name: "id",
        description: "ID de la intervención",
        type: "number",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Intervención eliminada lógicamente",
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Intervención no encontrada" }),
    (0, swagger_1.ApiResponse)({ status: 500, description: "Error interno del servidor" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], IntervencionesController.prototype, "eliminarLogico", null);
__decorate([
    (0, common_1.Patch)(":id/cerrar"),
    (0, swagger_1.ApiOperation)({
        summary: "Cerrar una intervención",
        description: "Cierra una intervención, cambiando su estado a 'cerrado'",
    }),
    (0, swagger_1.ApiParam)({
        name: "id",
        description: "ID de la intervención",
        type: "number",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Intervención cerrada exitosamente",
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Intervención no encontrada" }),
    (0, swagger_1.ApiResponse)({ status: 500, description: "Error interno del servidor" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], IntervencionesController.prototype, "cerrarIntervencion", null);
__decorate([
    (0, common_1.Patch)(":id/archivar"),
    (0, swagger_1.ApiOperation)({
        summary: "Archivar una intervención",
        description: "Archiva una intervención, cambiando su estado a 'archivado'",
    }),
    (0, swagger_1.ApiParam)({
        name: "id",
        description: "ID de la intervención",
        type: "number",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Intervención archivada exitosamente",
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Intervención no encontrada" }),
    (0, swagger_1.ApiResponse)({ status: 500, description: "Error interno del servidor" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], IntervencionesController.prototype, "archivarIntervencion", null);
__decorate([
    (0, common_1.Get)("no-activas/all"),
    (0, swagger_1.ApiOperation)({
        summary: "Listar todas las intervencione no activas",
        description: "Obtiene una lista de todas las intervenciones registradas no activas",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Lista de intervenciones no activas obtenida exitosamente",
        schema: {
            type: "object",
            properties: {
                success: { type: "boolean", example: true },
                message: {
                    type: "string",
                    example: "Intervenciones obtenidas correctamente.",
                },
                data: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "number", example: 1 },
                            numero_intervencion: { type: "string", example: "INT-2024-001" },
                            fecha: { type: "string", example: "2024-01-15T00:00:00.000Z" },
                            coordinador: { type: "string", example: "Juan Pérez" },
                            operador: { type: "string", example: "María García" },
                            reseña_hecho: { type: "string", example: "Robo en domicilio..." },
                            estado: { type: "string", example: "cerrado" },
                            eliminado: { type: "boolean", example: false },
                            fecha_creacion: {
                                type: "string",
                                example: "2024-01-15T10:30:00.000Z",
                            },
                            _count: {
                                type: "object",
                                properties: {
                                    derivaciones: { type: "number", example: 1 },
                                    hechos_delictivos: { type: "number", example: 1 },
                                    victimas: { type: "number", example: 1 },
                                    seguimientos: { type: "number", example: 1 },
                                },
                            },
                        },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: "Error interno del servidor",
        schema: {
            type: "object",
            properties: {
                success: { type: "boolean", example: false },
                message: {
                    type: "string",
                    example: "Error al obtener las intervenciones",
                },
                data: { type: "null", example: null },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IntervencionesController.prototype, "findAllNoActivas", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, swagger_1.ApiOperation)({
        summary: "Actualizar completamente una intervención",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Intervención actualizada correctamente",
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Intervención no encontrada" }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "ID inválido" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_intervencion_dto_1.UpdateIntervencionDto]),
    __metadata("design:returntype", Promise)
], IntervencionesController.prototype, "updateIntervencion", null);
exports.IntervencionesController = IntervencionesController = __decorate([
    (0, swagger_1.ApiTags)("intervenciones"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)("intervenciones"),
    __metadata("design:paramtypes", [intervenciones_service_1.IntervencionesService])
], IntervencionesController);
//# sourceMappingURL=intervenciones.controller.js.map