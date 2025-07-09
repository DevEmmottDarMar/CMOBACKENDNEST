import { PartialType } from '@nestjs/mapped-types';
import { CreateAreaDto } from './create-area.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class UpdateAreaDto extends PartialType(CreateAreaDto) {
  @ApiPropertyOptional({
    description: 'Nombre de la área',
    example: 'Centro de Datos - Actualizado',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  @IsOptional()
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Descripción de la área',
    example: 'Área principal donde se encuentran los servidores y equipos de cómputo críticos - Actualizada',
    minLength: 10,
    maxLength: 500
  })
  @IsString()
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  @IsOptional()
  descripcion?: string;
}
