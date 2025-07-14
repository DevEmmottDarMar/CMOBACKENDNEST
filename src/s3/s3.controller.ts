import { 
  Controller, 
  Post, 
  Get, 
  Delete, 
  Param, 
  Body, 
  UseInterceptors, 
  UploadedFile,
  BadRequestException,
  Query
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { S3Service } from './s3.service';
import { UploadBase64Dto } from './dto/upload-base64.dto';

@ApiTags('s3', 'Operaciones relacionadas a AWS S3')
@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post('upload')
  @ApiOperation({ summary: 'Subir archivo a S3' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('key') key: string,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    if (!key) {
      throw new BadRequestException('Se requiere una clave (key) para el archivo');
    }

    const url = await this.s3Service.uploadFile(file, key);
    return {
      message: 'Archivo subido exitosamente',
      url,
      key,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  @Post('upload-base64')
  @ApiOperation({ summary: 'Subir archivo Base64 a S3' })
  async uploadBase64File(@Body() uploadBase64Dto: UploadBase64Dto) {
    console.log('Recibida petición upload-base64:', {
      key: uploadBase64Dto.key,
      contentType: uploadBase64Dto.contentType,
      base64DataLength: uploadBase64Dto.base64Data?.length || 0
    });

    const { base64Data, key, contentType } = uploadBase64Dto;

    const url = await this.s3Service.uploadBase64File(
      base64Data,
      key,
      contentType,
    );

    console.log('Subida completada exitosamente:', { url, key });

    return {
      message: 'Archivo Base64 subido exitosamente',
      url,
      key,
      contentType,
    };
  }

  @Get('download/:key')
  @ApiOperation({ summary: 'Obtener URL firmada para descargar archivo' })
  async getSignedUrl(
    @Param('key') key: string,
    @Query('expiresIn') expiresIn?: string,
  ) {
    const expiresInSeconds = expiresIn ? parseInt(expiresIn) : 3600;
    const signedUrl = await this.s3Service.getSignedUrl(key, expiresInSeconds);

    return {
      message: 'URL firmada generada exitosamente',
      signedUrl,
      key,
      expiresIn: expiresInSeconds,
    };
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Eliminar archivo de S3' })
  async deleteFile(@Param('key') key: string) {
    await this.s3Service.deleteFile(key);

    return {
      message: 'Archivo eliminado exitosamente',
      key,
    };
  }
} 