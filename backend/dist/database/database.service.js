"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let DatabaseService = class DatabaseService {
    prisma;
    async onModuleInit() {
        this.prisma = new client_1.PrismaClient();
        await this.prisma.$connect();
        console.log("✅ Conexión a base de datos PostgreSQL establecida con Prisma");
    }
    async generarCodigoUnico() {
        const year = new Date().getFullYear();
        const last = await this.prisma.intervenciones.findFirst({
            where: {
                numero_intervencion: {
                    endsWith: `-${year}`,
                },
            },
            orderBy: {
                id: "desc",
            },
        });
        let nextNumber = 1;
        if (last) {
            const [num] = last.numero_intervencion.split("-");
            nextNumber = parseInt(num, 10) + 1;
        }
        const codigo = `${nextNumber.toString().padStart(4, "0")}-${year}`;
        const existe = await this.prisma.intervenciones.findUnique({
            where: { numero_intervencion: codigo },
        });
        return existe ? this.generarCodigoUnico() : codigo;
    }
    convertirBooleano(valor) {
        return Boolean(valor);
    }
    convertirBooleanoDos(valor) {
        if (typeof valor === "string") {
            return valor !== "no";
        }
        return Boolean(valor);
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = __decorate([
    (0, common_1.Injectable)()
], DatabaseService);
//# sourceMappingURL=database.service.js.map