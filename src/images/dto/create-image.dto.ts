import { IsString, IsOptional, IsUUID, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateImageDto {
  @ApiProperty({
    description: 'Clave única del archivo en S3',
    example: 'uploads/images/profile-123.jpg',
  })
  @IsString()
  @IsNotEmpty()
  s3Key: string;

  @ApiProperty({
    description: 'URL pública de la imagen',
    example: 'https://bucket-name.s3.amazonaws.com/uploads/images/profile-123.jpg',
  })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({
    description: 'Texto alternativo para accesibilidad',
    example: 'Foto de perfil del usuario',
  })
  @IsString()
  @IsOptional()
  altText?: string;

  @ApiProperty({
    description: 'Tipo MIME del archivo',
    example: 'image/jpeg',
  })
  @IsString()
  @IsNotEmpty()
  mimetype: string;

  @ApiProperty({
    description: 'Tamaño del archivo en bytes',
    example: 1024000,
  })
  @IsNumber()
  @IsNotEmpty()
  size: number;

  @ApiPropertyOptional({
    description: 'ID del usuario que subió la imagen',
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