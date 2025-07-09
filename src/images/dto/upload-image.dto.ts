import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadImageDto {
  @ApiPropertyOptional({
    description: 'Texto alternativo para accesibilidad',
    example: 'Foto de perfil del usuario',
  })
  @IsString()
  @IsOptional()
  altText?: string;

  @ApiPropertyOptional({
    description: 'ID del usuario que sube la imagen',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  uploadedById?: string;

  @ApiPropertyOptional({
    description: 'ID del permiso relacionado',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  permisoId?: string;

  @ApiPropertyOptional({
    description: 'ID del trabajo relacionado',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  trabajoId?: string;
} 