// src/tipos-permiso/dto/create-tipo-permiso.dto.ts
import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTipoPermisoDto {
  @ApiProperty({
    description: 'Nombre del tipo de permiso',
    example: 'Permiso de Altura',
    minLength: 3,
    maxLength: 100
  })
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre: string;

  @ApiProperty({
    description: 'Descripción detallada del tipo de permiso',
    example: 'Permiso requerido para realizar trabajos en altura superior a 1.8 metros, incluyendo uso de escaleras, andamios o equipos elevadores',
    minLength: 10,
    maxLength: 500
  })
  @IsString()
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  descripcion: string;
}
