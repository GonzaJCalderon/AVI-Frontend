import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { jwtConfig } from "../../config/jwt.config";
import { DatabaseService } from "../../database/database.service";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  "jwt-refresh"
) {
  constructor(private readonly databaseService: DatabaseService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConfig.refreshSecret,
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    const refreshToken = req.headers.authorization?.replace("Bearer ", "");

    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token no proporcionado");
    }

    // Verificar que el refresh token existe en la base de datos
    const tokenExists =
      await this.databaseService.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { usuario: true },
      });

    if (!tokenExists || tokenExists.expiresAt < new Date()) {
      throw new UnauthorizedException("Refresh token inválido o expirado");
    }

    return {
      id: payload.sub,
      email: payload.email,
      rol: payload.rol,
      nombre: payload.nombre,
    };
  }
}
