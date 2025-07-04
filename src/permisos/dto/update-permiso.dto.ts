// src/permisos/dto/update-permiso.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreatePermisoDto } from './create-permiso.dto';
import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { PermisoEstado } from '../entities/permiso.entity'; // <-- Importar el ENUM

export class AuthorizePermisoDto {
  @IsEnum(PermisoEstado) // <-- Usar el ENUM de estados
  estado: PermisoEstado.APROBADO | PermisoEstado.RECHAZADO; // Solo permite aprobar o rechazar

  @IsString()
  @IsOptional()
  comentariosSupervisor?: string | null;

  @IsUUID()
  supervisorId: string;

  @IsDateString()
  @IsOptional()
  revisadoAt?: string;
}

export class UpdatePermisoDto extends PartialType(CreatePermisoDto) {
  @IsEnum(PermisoEstado)
  @IsOptional()
  estado?: PermisoEstado; // Para otras actualizaciones de estado si se necesitan
}
