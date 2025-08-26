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
exports.UsuariosController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const usuarios_service_1 = require("./usuarios.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const update_usuario_dto_1 = require("./dto/update-usuario.dto");
let UsuariosController = class UsuariosController {
    usuariosService;
    constructor(usuariosService) {
        this.usuariosService = usuariosService;
    }
    async findAll() {
        const usuarios = await this.usuariosService.findAll();
        return { success: true, data: usuarios };
    }
    async update(id, dto) {
        const usuario = await this.usuariosService.update(+id, dto);
        return { success: true, data: usuario };
    }
};
exports.UsuariosController = UsuariosController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todos los usuarios' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de usuarios', schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: { type: 'array', items: { type: 'object', properties: {
                            id: { type: 'number', example: 1 },
                            email: { type: 'string', example: 'usuario@ejemplo.com' },
                            nombre: { type: 'string', example: 'Nombre Apellido' },
                            rol: { type: 'string', example: 'usuario' },
                            activo: { type: 'boolean', example: true },
                            createdAt: { type: 'string' },
                            updatedAt: { type: 'string' }
                        } } }
            }
        } }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsuariosController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar un usuario' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'number' }),
    (0, swagger_1.ApiBody)({
        type: update_usuario_dto_1.UpdateUsuarioDto,
        description: 'Campos a actualizar',
        examples: {
            ejemplo: {
                summary: 'Actualizar nombre, rol y activo',
                value: { nombre: 'Nuevo Nombre', rol: 'admin', activo: true },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Usuario actualizado', schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: { type: 'object', properties: {
                        id: { type: 'number', example: 1 },
                        email: { type: 'string', example: 'usuario@ejemplo.com' },
                        nombre: { type: 'string', example: 'Nombre Apellido' },
                        rol: { type: 'string', example: 'admin' },
                        activo: { type: 'boolean', example: true },
                        createdAt: { type: 'string' },
                        updatedAt: { type: 'string' }
                    } }
            }
        } }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usuario no encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_usuario_dto_1.UpdateUsuarioDto]),
    __metadata("design:returntype", Promise)
], UsuariosController.prototype, "update", null);
exports.UsuariosController = UsuariosController = __decorate([
    (0, swagger_1.ApiTags)('usuarios'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('usuarios'),
    __metadata("design:paramtypes", [usuarios_service_1.UsuariosService])
], UsuariosController);
//# sourceMappingURL=usuarios.controller.js.map