// Simplified: Partial over the Create DTO (shallow optional)
import { PartialType } from '@nestjs/swagger';
import { CreateIntervencionDto } from './create-intervencion.dto';

export class UpdateIntervencionDto extends PartialType(CreateIntervencionDto) {}
