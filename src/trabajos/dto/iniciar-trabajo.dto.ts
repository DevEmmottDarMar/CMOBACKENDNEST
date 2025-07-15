import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class IniciarTrabajoDto {
  @ApiProperty({
    description: 'ID del técnico que está iniciando el trabajo',
    example: '8476471a-4c5c-4938-9f0f-7b8ac9242b4c',
    format: 'uuid'
  })
  @IsUUID()
  tecnicoId: string;

  @ApiProperty({
    description: 'Foto inicial en formato base64 (permisos de altura)',
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...'
  })
  @IsString()
  fotoInicial: string;

  @ApiPropertyOptional({
    description: 'Comentarios adicionales del técnico sobre el trabajo',
    example: 'Condiciones normales, equipo funcionando correctamente',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  comentarios?: string;
} 