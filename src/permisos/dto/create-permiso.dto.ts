// src/permisos/dto/create-permiso.dto.ts
import { IsString, IsUUID, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePermisoDto {
  @ApiProperty({
    description: 'ID del trabajo al que pertenece el permiso',
    example: 'e1d68650-a7c2-435e-9623-7e4249e8f00e',
    format: 'uuid'
  })
  @IsUUID()
  trabajoId: string;

  @ApiProperty({
    description: 'ID del técnico que solicita el permiso',
    example: '8476471a-4c5c-4938-9f0f-7b8ac9242b4c',
    format: 'uuid'
  })
  @IsUUID()
  tecnicoId: string;

  @ApiProperty({
    description: 'ID del tipo de permiso solicitado',
    example: '369a8f2e-c985-47d8-bd20-4bbe575cd0e3',
    format: 'uuid'
  })
  @IsUUID()
  tipoPermisoId: string;

  @ApiProperty({
    description: 'Estado inicial del permiso',
    enum: ['pendiente', 'aprobado', 'rechazado'],
    example: 'pendiente',
    default: 'pendiente'
  })
  @IsEnum(['pendiente', 'aprobado', 'rechazado'])
  estado: 'pendiente' | 'aprobado' | 'rechazado';

  @ApiPropertyOptional({
    description: 'Comentarios adicionales del técnico sobre el permiso',
    example: 'Necesito acceso a áreas elevadas para realizar el mantenimiento',
    maxLength: 500
  })
  @IsString()
  @IsOptional()
  comentariosTecnico?: string;
}