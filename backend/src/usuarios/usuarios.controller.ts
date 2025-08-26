import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@ApiTags('usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios', schema: {
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
      }}}
    }
  } })
  async findAll() {
    const usuarios = await this.usuariosService.findAll();
    return { success: true, data: usuarios };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiBody({
    type: UpdateUsuarioDto,
    description: 'Campos a actualizar',
    examples: {
      ejemplo: {
        summary: 'Actualizar nombre, rol y activo',
        value: { nombre: 'Nuevo Nombre', rol: 'admin', activo: true },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Usuario actualizado', schema: {
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
      }}
    }
  } })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async update(@Param('id') id: string, @Body() dto: UpdateUsuarioDto) {
    const usuario = await this.usuariosService.update(+id, dto);
    return { success: true, data: usuario };
  }
}
