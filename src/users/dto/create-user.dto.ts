// src/users/dto/create-user.dto.ts
import {
  IsString,
  IsEmail,
  MinLength,
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator'; // Importa IsUUID

export class CreateUserDto {
  @IsString()
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsEnum(['tecnico', 'supervisor', 'admin'])
  rol: 'tecnico' | 'supervisor' | 'admin';

  // === ¡AÑADIR ESTA PROPIEDAD! ===
  @IsUUID() // Valida que el areaId sea un UUID válido
  @IsOptional() // Hacemos areaId opcional al crear, por si un admin no tiene área
  areaId?: string; // areaId puede ser opcional
  // =============================
}
