// src/roles/dto/create-role.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Nombre del rol',
    example: 'tecnico',
    minLength: 2,
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  nombre: string;

  @ApiProperty({
    description: 'Descripción del rol',
    example: 'Técnico que puede solicitar permisos de trabajo',
    minLength: 5,
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  descripcion: string;
} 