// src/app.module.ts
import { Module } from '@nestjs/common';
import { IntervencionesModule } from './intervenciones/intervenciones.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';

@Module({
  imports: [DatabaseModule, AuthModule, IntervencionesModule, UsuariosModule],
})
export class AppModule {}
