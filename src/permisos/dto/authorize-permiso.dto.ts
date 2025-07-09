// src/permisos/dto/authorize-permiso.dto.ts
import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';
import { PermisoEstado } from '../entities/permiso.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// DTO específico para la autorización de permisos por el supervisor (PATCH /permisos/:id/authorize)
export class AuthorizePermisoDto {
  @ApiProperty({
    description: 'Nuevo estado del permiso. Debe ser "aprobado" o "rechazado".',
    enum: [PermisoEstado.APROBADO, PermisoEstado.RECHAZADO],
    example: PermisoEstado.APROBADO,
  })
  @IsEnum([PermisoEstado.APROBADO, PermisoEstado.RECHAZADO], { message: 'El estado debe ser "aprobado" o "rechazado".' })
  estado: PermisoEstado.APROBADO | PermisoEstado.RECHAZADO;

  @ApiPropertyOptional({
    description: 'Comentarios adicionales del supervisor al autorizar o rechazar el permiso (opcional).',
    example: 'Permiso aprobado bajo condición de revisar puntos de anclaje.',
    type: String,
    maxLength: 500,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  comentariosSupervisor?: string | null;
  
  @ApiProperty({
    description: 'ID UUID del supervisor que realiza la autorización.',
    example: '2879a157-654d-46ed-be30-3554a0b7a40d',
    type: String,
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty({ message: 'El ID del supervisor no puede estar vacío.' })
  supervisorId: string;

  @ApiPropertyOptional({
    description: 'Fecha y hora de revisión del permiso en formato ISO 8601 (opcional). Por defecto es la fecha actual del servidor.',
    example: '2025-07-07T11:00:00.000Z',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  @IsDateString()
  @IsOptional()
  revisadoAt?: string;
} 