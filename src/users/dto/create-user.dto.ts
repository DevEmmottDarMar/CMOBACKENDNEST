// src/users/dto/create-user.dto.ts
import {
  IsString,
  IsEmail,
  MinLength,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Carlos Técnico Centro',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  nombre: string;

  @ApiProperty({
    description: 'Email único del usuario',
    example: 'carlos.tecnico@example.com',
    format: 'email'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario (mínimo 6 caracteres)',
    example: 'password123',
    minLength: 6
  })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({
    description: 'ID del rol del usuario',
    example: '8476471a-4c5c-4938-9f0f-7b8ac9242b4c',
    format: 'uuid'
  })
  @IsUUID()
  roleId: string;

  @ApiPropertyOptional({
    description: 'ID del área a la que pertenece el usuario (opcional para admin)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    format: 'uuid'
  })
  @IsUUID()
  @IsOptional()
  areaId?: string;
}
