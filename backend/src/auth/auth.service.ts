import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { DatabaseService } from "../database/database.service";
import * as bcrypt from "bcryptjs";
import { jwtConfig } from "../config/jwt.config";
import { randomBytes } from "crypto";

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.databaseService.prisma.usuario.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async refreshTokens(refreshToken: string) {
    try {
      // Verificar que el refresh token existe
      const tokenExists =
        await this.databaseService.prisma.refreshToken.findUnique({
          where: { token: refreshToken },
          include: { usuario: true },
        });

      if (!tokenExists || tokenExists.expiresAt < new Date()) {
        throw new UnauthorizedException("Refresh token inválido o expirado");
      }

      const payload = {
        email: tokenExists.usuario.email,
        sub: tokenExists.usuario.id,
        rol: tokenExists.usuario.rol,
        nombre: tokenExists.usuario.nombre,
      };

      const newAccessToken = this.jwtService.sign(payload, {
        secret: jwtConfig.secret,
        expiresIn: jwtConfig.expiresIn,
      });

      const newRefreshToken = this.jwtService.sign(payload, {
        secret: jwtConfig.refreshSecret,
        expiresIn: jwtConfig.refreshExpiresIn,
      });

      // Actualizar refresh token en la base de datos
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
    } catch (error) {
      throw new UnauthorizedException("Error al refrescar tokens");
    }
  }

  async logout(refreshToken: string) {
    // Eliminar refresh token de la base de datos
    await this.databaseService.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });

    return { message: "Sesión cerrada exitosamente" };
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      rol: user.rol,
      nombre: user.nombre,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: jwtConfig.secret,
      expiresIn: jwtConfig.expiresIn,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: jwtConfig.refreshSecret,
      expiresIn: jwtConfig.refreshExpiresIn,
    });

    // Guardar refresh token en la base de datos (comentado temporalmente)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 días

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

  async register(createUserDto: {
    email: string;
    password: string;
    nombre: string;
    rol?: string;
  }) {
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
}
