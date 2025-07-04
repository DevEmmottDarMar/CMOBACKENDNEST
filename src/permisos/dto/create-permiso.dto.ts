// src/permisos/dto/create-permiso.dto.ts
import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { PermisoEstado } from '../entities/permiso.entity'; // <-- Importar el ENUM

export class CreatePermisoDto {
  @IsUUID()
  trabajoId: string;

  @IsUUID()
  tecnicoId: string;

  @IsUUID()
  tipoPermisoId: string; // ID del tipo de permiso

  @IsString()
  @IsOptional()
  fotoKey?: string | null;

  // === ESTADO COMO ENUM ===
  @IsEnum(PermisoEstado) // <-- Usar el ENUM de estados
  @IsOptional()
  estado?: PermisoEstado; // Por defecto será 'pendiente'
  // ========================

  @IsString()
  @IsOptional()
  comentariosTecnico?: string | null;

  // === FECHA DE ENVÍO ===
  @IsDateString()
  @IsOptional()
  enviadoAt?: string; // Podría enviarse si la app quiere setear un timestamp específico
  // ======================
}
