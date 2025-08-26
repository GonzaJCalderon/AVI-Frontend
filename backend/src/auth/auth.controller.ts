import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RefreshTokenGuard } from "./guards/refresh-token.guard";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@ApiTags("Autenticación")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @ApiOperation({ summary: "Iniciar sesión" })
  @ApiResponse({ status: 200, description: "Login exitoso" })
  @ApiResponse({ status: 401, description: "Credenciales inválidas" })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password
    );

    if (!user) {
      throw new Error("Credenciales inválidas");
    }

    return this.authService.login(user);
  }

  @Post("register")
  @ApiOperation({ summary: "Registrar nuevo usuario" })
  @ApiResponse({ status: 201, description: "Usuario registrado exitosamente" })
  @ApiResponse({ status: 400, description: "Datos inválidos" })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Obtener perfil del usuario autenticado" })
  @ApiResponse({ status: 200, description: "Perfil obtenido exitosamente" })
  @ApiResponse({ status: 401, description: "No autorizado" })
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(RefreshTokenGuard)
  @Post("refresh")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Refrescar tokens de acceso" })
  @ApiResponse({ status: 200, description: "Tokens refrescados exitosamente" })
  @ApiResponse({ status: 401, description: "Refresh token inválido" })
  async refreshTokens(@Request() req) {
    const refreshToken = req.headers.authorization?.replace("Bearer ", "");
    return this.authService.refreshTokens(refreshToken);
  }

  @Post("logout")
  @ApiOperation({ summary: "Cerrar sesión" })
  @ApiResponse({ status: 200, description: "Sesión cerrada exitosamente" })
  async logout(@Body() body: { refresh_token?: string }) {
    if (!body?.refresh_token) {
      return { message: "Nada para cerrar: no se recibió refresh_token" };
    }
    return this.authService.logout(body.refresh_token);
  }
}
