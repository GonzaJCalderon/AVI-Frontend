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
exports.UsuariosService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let UsuariosService = class UsuariosService {
    databaseService;
    constructor(databaseService) {
        this.databaseService = databaseService;
    }
    async findAll() {
        return this.databaseService.prisma.usuario.findMany({
            select: { id: true, email: true, nombre: true, rol: true, activo: true, createdAt: true, updatedAt: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async update(id, dto) {
        const exists = await this.databaseService.prisma.usuario.findUnique({ where: { id } });
        if (!exists)
            throw new common_1.NotFoundException('Usuario no encontrado');
        return this.databaseService.prisma.usuario.update({
            where: { id },
            data: {
                email: dto.email ?? undefined,
                nombre: dto.nombre ?? undefined,
                rol: dto.rol ?? undefined,
                activo: dto.activo ?? undefined,
            },
            select: { id: true, email: true, nombre: true, rol: true, activo: true, createdAt: true, updatedAt: true },
        });
    }
};
exports.UsuariosService = UsuariosService;
exports.UsuariosService = UsuariosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], UsuariosService);
//# sourceMappingURL=usuarios.service.js.map