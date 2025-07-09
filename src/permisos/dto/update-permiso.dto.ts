// src/permisos/dto/update-permiso.dto.ts
import { PartialType } from '@nestjs/mapped-types'; // Para hacer opcionales los campos de CreatePermisoDto
import { CreatePermisoDto } from './create-permiso.dto'; // Importa CreatePermisoDto
import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';
import { PermisoEstado } from '../entities/permiso.entity'; // Importa el ENUM de estados de permiso
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// DTO específico para la autorización de permisos por el supervisor (PATCH /permisos/:id/authorize)
export class AuthorizePermisoDto {
  @ApiProperty({
    description: 'Nuevo estado del permiso. Debe ser "aprobado" o "rechazado".',
    enum: [PermisoEstado.APROBADO, PermisoEstado.RECHAZADO], // Mostrará solo estas dos opciones en Swagger UI
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
    example: '2879a157-654d-46ed-be30-3554a0b7a40d', // ID de ejemplo de un supervisor
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

// DTO general para actualizar cualquier propiedad del permiso (no solo autorización)
// Hereda todos los campos de CreatePermisoDto y los hace opcionales.
export class UpdatePermisoDto extends PartialType(CreatePermisoDto) {
  @ApiPropertyOptional({
    description: 'ID del trabajo al que pertenece el permiso',
    example: 'e1d68650-a7c2-435e-9623-7e4249e8f00e',
    format: 'uuid'
  })
  @IsUUID()
  @IsOptional()
  trabajoId?: string;

  @ApiPropertyOptional({
    description: 'ID del técnico que solicita el permiso',
    example: '8476471a-4c5c-4938-9f0f-7b8ac9242b4c',
    format: 'uuid'
  })
  @IsUUID()
  @IsOptional()
  tecnicoId?: string;

  @ApiPropertyOptional({
    description: 'ID del tipo de permiso solicitado',
    example: '369a8f2e-c985-47d8-bd20-4bbe575cd0e3',
    format: 'uuid'
  })
  @IsUUID()
  @IsOptional()
  tipoPermisoId?: string;

  @ApiPropertyOptional({
    description: 'Estado del permiso',
    enum: ['pendiente', 'aprobado', 'rechazado'],
    example: 'aprobado'
  })
  @IsEnum(['pendiente', 'aprobado', 'rechazado'])
  @IsOptional()
  estado?: 'pendiente' | 'aprobado' | 'rechazado';

  @ApiPropertyOptional({
    description: 'Comentarios adicionales del técnico sobre el permiso',
    example: 'Necesito acceso a áreas elevadas para realizar el mantenimiento',
    maxLength: 500
  })
  @IsString()
  @IsOptional()
  comentariosTecnico?: string;
}