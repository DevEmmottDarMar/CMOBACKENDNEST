// src/trabajos/dto/update-trabajo.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateTrabajoDto } from './create-trabajo.dto';
import { TrabajoEstado, SecuenciaPermiso } from '../entities/trabajo.entity'; // <-- Importar ENUMS
import { IsEnum, IsOptional, IsDateString } from 'class-validator';

export class UpdateTrabajoDto extends PartialType(CreateTrabajoDto) {
  @IsEnum(TrabajoEstado)
  @IsOptional()
  estado?: TrabajoEstado;

  @IsDateString()
  @IsOptional()
  fechaInicioReal?: string;

  @IsDateString()
  @IsOptional()
  fechaFinReal?: string;

  // === NUEVO CAMPO EN DTO ===
  @IsEnum(SecuenciaPermiso)
  @IsOptional()
  siguienteTipoPermiso?: SecuenciaPermiso;
  // ==========================
}
