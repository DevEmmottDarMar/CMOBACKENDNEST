import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadBase64Dto {
  @ApiProperty({
    description: 'Datos del archivo en formato Base64',
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
  })
  @IsString()
  @IsNotEmpty()
  base64Data: string;

  @ApiProperty({
    description: 'Clave única para el archivo en S3',
    example: 'uploads/images/profile-123.jpg',
  })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({
    description: 'Tipo de contenido del archivo',
    example: 'image/jpeg',
  })
  @IsString()
  @IsNotEmpty()
  contentType: string;
} 