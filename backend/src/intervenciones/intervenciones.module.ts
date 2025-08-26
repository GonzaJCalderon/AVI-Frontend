// src/intervenciones/intervenciones.module.ts
import { Module } from '@nestjs/common';
import { IntervencionesController } from './intervenciones.controller';
import { IntervencionesService } from './intervenciones.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [IntervencionesController],
  providers: [IntervencionesService],
  exports: [IntervencionesService],
})
export class IntervencionesModule {}