"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const database_service_1 = require("../database/database.service");
const bcrypt = __importStar(require("bcryptjs"));
const jwt_config_1 = require("../config/jwt.config");
let AuthService = class AuthService {
    databaseService;
    jwtService;
    constructor(databaseService, jwtService) {
        this.databaseService = databaseService;
        this.jwtService = jwtService;
    }
    async validateUser(email, password) {
        const user = await this.databaseService.prisma.usuario.findUnique({
            where: { email },
        });
        if (user && (await bcrypt.compare(password, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
    async refreshTokens(refreshToken) {
        try {
            const tokenExists = await this.databaseService.prisma.refreshToken.findUnique({
                where: { token: refreshToken },
                include: { usuario: true },
            });
            if (!tokenExists || tokenExists.expiresAt < new Date()) {
                throw new common_1.UnauthorizedException("Refresh token inválido o expirado");
            }
            const payload = {
                email: tokenExists.usuario.email,
                sub: tokenExists.usuario.id,
                rol: tokenExists.usuario.rol,
                nombre: tokenExists.usuario.nombre,
            };
            const newAccessToken = this.jwtService.sign(payload, {
                secret: jwt_config_1.jwtConfig.secret,
                expiresIn: jwt_config_1.jwtConfig.expiresIn,
            });
            const newRefreshToken = this.jwtService.sign(payload, {
                secret: jwt_config_1.jwtConfig.refreshSecret,
                expiresIn: jwt_config_1.jwtConfig.refreshExpiresIn,
            });
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);
            await this.databaseService.prisma.refreshToken.update({
                where: { id: tokenExists.id },
                data: {
                    token: newRefreshToken,
                    expiresAt,
                },
            });
            return {
                access_token: newAccessToken,
                refresh_token: newRefreshToken,
                user: {
                    id: tokenExists.usuario.id,
                    email: tokenExists.usuario.email,
                    nombre: tokenExists.usuario.nombre,
                    rol: tokenExists.usuario.rol,
                },
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException("Error al refrescar tokens");
        }
    }
    async logout(refreshToken) {
        await this.databaseService.prisma.refreshToken.deleteMany({
            where: { token: refreshToken },
        });
        return { message: "Sesión cerrada exitosamente" };
    }
    async login(user) {
        const payload = {
            email: user.email,
            sub: user.id,
            rol: user.rol,
            nombre: user.nombre,
        };
        const accessToken = this.jwtService.sign(payload, {
            secret: jwt_config_1.jwtConfig.secret,
            expiresIn: jwt_config_1.jwtConfig.expiresIn,
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: jwt_config_1.jwtConfig.refreshSecret,
            expiresIn: jwt_config_1.jwtConfig.refreshExpiresIn,
        });
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.databaseService.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                expiresAt,
                userId: user.id,
            },
        });
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user.id,
                email: user.email,
                nombre: user.nombre,
                rol: user.rol,
            },
        };
    }
    async register(createUserDto) {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const user = await this.databaseService.prisma.usuario.create({
            data: {
                email: createUserDto.email,
                password: hashedPassword,
                nombre: createUserDto.nombre,
                rol: createUserDto.rol || "usuario",
            },
        });
        const { password, ...result } = user;
        return result;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map