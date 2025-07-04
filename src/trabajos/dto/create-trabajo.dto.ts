// src/trabajos/dto/create-trabajo.dto.ts
import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { TrabajoEstado, SecuenciaPermiso } from '../entities/trabajo.entity'; // <-- Importar ambos ENUMS

export class CreateTrabajoDto {
  @IsString()
  nombre: string;

  @IsString()
  descripcion: string;

  @IsUUID()
  areaId: string;

  @IsUUID()
  @IsOptional()
  tecnicoAsignadoId?: string | null;

  @IsEnum(TrabajoEstado)
  @IsOptional()
  estado?: TrabajoEstado;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsDateString()
  @IsOptional()
  fechaInicioReal?: string;

  @IsDateString()
  @IsOptional()
  fechaFinReal?: string;

  // === NUEVO CAMPO EN DTO ===
  @IsEnum(SecuenciaPermiso)
  @IsOptional()
  siguienteTipoPermiso?: SecuenciaPermiso; // Opcional, el default está en la entidad
  // ==========================
}
