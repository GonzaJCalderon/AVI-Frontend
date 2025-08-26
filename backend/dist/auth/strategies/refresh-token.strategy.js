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
exports.RefreshTokenStrategy = void 0;
const passport_jwt_1 = require("passport-jwt");
const passport_1 = require("@nestjs/passport");
const common_1 = require("@nestjs/common");
const jwt_config_1 = require("../../config/jwt.config");
const database_service_1 = require("../../database/database.service");
let RefreshTokenStrategy = class RefreshTokenStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, "jwt-refresh") {
    databaseService;
    constructor(databaseService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwt_config_1.jwtConfig.refreshSecret,
            passReqToCallback: true,
        });
        this.databaseService = databaseService;
    }
    async validate(req, payload) {
        const refreshToken = req.headers.authorization?.replace("Bearer ", "");
        if (!refreshToken) {
            throw new common_1.UnauthorizedException("Refresh token no proporcionado");
        }
        const tokenExists = await this.databaseService.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { usuario: true },
        });
        if (!tokenExists || tokenExists.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException("Refresh token inválido o expirado");
        }
        return {
            id: payload.sub,
            email: payload.email,
            rol: payload.rol,
            nombre: payload.nombre,
        };
    }
};
exports.RefreshTokenStrategy = RefreshTokenStrategy;
exports.RefreshTokenStrategy = RefreshTokenStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], RefreshTokenStrategy);
//# sourceMappingURL=refresh-token.strategy.js.map