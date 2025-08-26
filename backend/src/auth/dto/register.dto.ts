import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength, IsOptional } from "class-validator";

export class RegisterDto {
  @ApiProperty({
    description: "Email del usuario",
    example: "usuario@ejemplo.com",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "Contraseña del usuario",
    example: "password123",
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: "Nombre completo del usuario",
    example: "Juan Pérez",
  })
  @IsString()
  nombre: string;

  @ApiProperty({
    description: "Rol del usuario",
    example: "usuario",
    required: false,
  })
  @IsOptional()
  @IsString()
  rol?: string;
}
