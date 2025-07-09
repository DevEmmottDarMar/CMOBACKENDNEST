import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoPermisoDto } from './create-tipo-permiso.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class UpdateTipoPermisoDto extends PartialType(CreateTipoPermisoDto) {
  @ApiPropertyOptional({
    description: 'Nombre del tipo de permiso',
    example: 'Permiso de Altura - Actualizado',
    minLength: 3,
    maxLength: 100
  })
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  @IsOptional()
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada del tipo de permiso',
    example: 'Permiso requerido para realizar trabajos en altura superior a 1.8 metros, incluyendo uso de escaleras, andamios o equipos elevadores - Actualizada',
    minLength: 10,
    maxLength: 500
  })
  @IsString()
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  @IsOptional()
  descripcion?: string;
}
