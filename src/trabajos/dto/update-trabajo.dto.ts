// src/trabajos/dto/update-trabajo.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateTrabajoDto } from './create-trabajo.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsEnum, IsOptional, IsDateString } from 'class-validator';

export class UpdateTrabajoDto extends PartialType(CreateTrabajoDto) {
  @ApiPropertyOptional({
    description: 'Título o nombre del trabajo',
    example: 'Mantenimiento Preventivo Sistema de Aire Acondicionado - Actualizado',
    minLength: 5,
    maxLength: 200
  })
  @IsString()
  @IsOptional()
  titulo?: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada del trabajo a realizar',
    example: 'Realizar mantenimiento preventivo semestral al sistema de aire acondicionado del edificio principal, incluyendo limpieza de filtros, revisión de compresores y verificación de niveles de refrigerante.',
    minLength: 10,
    maxLength: 1000
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'ID del área donde se realizará el trabajo',
    example: 'c1d2e3f4-g5h6-7890-1234-567890abcdef',
    format: 'uuid'
  })
  @IsUUID()
  @IsOptional()
  areaId?: string;

  @ApiPropertyOptional({
    description: 'ID del técnico asignado al trabajo',
    example: '8476471a-4c5c-4938-9f0f-7b8ac9242b4c',
    format: 'uuid'
  })
  @IsUUID()
  @IsOptional()
  tecnicoAsignadoId?: string;

  @ApiPropertyOptional({
    description: 'Estado del trabajo',
    enum: ['pendiente', 'en_progreso', 'completado', 'cancelado'],
    example: 'en_progreso'
  })
  @IsEnum(['pendiente', 'en_progreso', 'completado', 'cancelado'])
  @IsOptional()
  estado?: 'pendiente' | 'en_progreso' | 'completado' | 'cancelado';

  @ApiPropertyOptional({
    description: 'Fecha programada para el inicio del trabajo',
    example: '2025-01-20T08:00:00.000Z',
    format: 'date-time'
  })
  @IsDateString()
  @IsOptional()
  fechaProgramada?: string;

  @ApiPropertyOptional({
    description: 'Fecha real de inicio del trabajo',
    example: '2025-01-20T08:30:00.000Z',
    format: 'date-time'
  })
  @IsDateString()
  @IsOptional()
  fechaInicioReal?: string;

  @ApiPropertyOptional({
    description: 'Fecha real de finalización del trabajo',
    example: '2025-01-20T17:00:00.000Z',
    format: 'date-time'
  })
  @IsDateString()
  @IsOptional()
  fechaFinReal?: string;

  @ApiPropertyOptional({
    description: 'Tipo de permiso que se requiere para el siguiente paso del trabajo',
    enum: ['altura', 'enganche', 'cierre', 'electrico', 'mecanico', 'finalizado'],
    example: 'altura'
  })
  @IsEnum(['altura', 'enganche', 'cierre', 'electrico', 'mecanico', 'finalizado'])
  @IsOptional()
  siguienteTipoPermiso?: 'altura' | 'enganche' | 'cierre' | 'electrico' | 'mecanico' | 'finalizado';

  @ApiPropertyOptional({
    description: 'Comentarios adicionales sobre el trabajo',
    example: 'Trabajo requiere acceso a áreas restringidas. Coordinar con el departamento de seguridad.',
    maxLength: 500
  })
  @IsString()
  @IsOptional()
  comentarios?: string;
}
