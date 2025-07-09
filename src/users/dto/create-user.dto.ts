// src/users/dto/create-user.dto.ts
import {
  IsString,
  IsEmail,
  MinLength,
  IsEnum,
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
    description: 'Rol del usuario en el sistema',
    enum: ['tecnico', 'supervisor', 'admin'],
    example: 'tecnico'
  })
  @IsEnum(['tecnico', 'supervisor', 'admin'])
  rol: 'tecnico' | 'supervisor' | 'admin';

  @ApiPropertyOptional({
    description: 'ID del área a la que pertenece el usuario (opcional para admin)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    format: 'uuid'
  })
  @IsUUID()
  @IsOptional()
  areaId?: string;
}
