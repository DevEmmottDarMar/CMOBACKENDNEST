// src/users/dto/update-user.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    description: 'Nombre completo del usuario',
    example: 'Carlos Técnico Actualizado',
    minLength: 2,
    maxLength: 100
  })
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Email único del usuario',
    example: 'carlos.nuevo@example.com',
    format: 'email'
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'Contraseña del usuario (mínimo 6 caracteres)',
    example: 'nuevaPassword123',
    minLength: 6
  })
  password?: string;

  @ApiPropertyOptional({
    description: 'ID del rol del usuario',
    example: '8476471a-4c5c-4938-9f0f-7b8ac9242b4c',
    format: 'uuid'
  })
  roleId?: string;

  @ApiPropertyOptional({
    description: 'ID del área a la que pertenece el usuario',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    format: 'uuid'
  })
  areaId?: string;
}
