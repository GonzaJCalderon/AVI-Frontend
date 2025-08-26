import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll() {
    return this.databaseService.prisma.usuario.findMany({
      select: { id: true, email: true, nombre: true, rol: true, activo: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: number, dto: UpdateUsuarioDto) {
    const exists = await this.databaseService.prisma.usuario.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Usuario no encontrado');

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
}
