import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class AprobarTrabajoDto {
  @ApiProperty({
    description: 'ID del supervisor que está aprobando/rechazando el trabajo',
    example: '8476471a-4c5c-4938-9f0f-7b8ac9242b4c',
    format: 'uuid'
  })
  @IsUUID()
  supervisorId: string;

  @ApiProperty({
    description: 'Indica si el trabajo es aprobado (true) o rechazado (false)',
    example: true
  })
  @IsBoolean()
  aprobado: boolean;

  @ApiPropertyOptional({
    description: 'Comentarios del supervisor sobre la aprobación o rechazo',
    example: 'Trabajo aprobado. Foto cumple con los requisitos de seguridad.',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  comentarios?: string;
} 