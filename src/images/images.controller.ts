import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ImagesService } from './images.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { UploadImageDto } from './dto/upload-image.dto';

@ApiTags('images', 'Operaciones relacionadas a Imágenes')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva imagen' })
  create(@Body() createImageDto: CreateImageDto) {
    return this.imagesService.create(createImageDto);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Subir imagen a S3 y crear registro' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        altText: {
          type: 'string',
          description: 'Texto alternativo para accesibilidad',
        },
        uploadedById: {
          type: 'string',
          format: 'uuid',
          description: 'ID del usuario que sube la imagen',
        },
        permisoId: {
          type: 'string',
          format: 'uuid',
          description: 'ID del permiso relacionado',
        },
        trabajoId: {
          type: 'string',
          format: 'uuid',
          description: 'ID del trabajo relacionado',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadImageDto: UploadImageDto,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    return this.imagesService.uploadImage(file, uploadImageDto);
  }

  @Post('upload-base64')
  @ApiOperation({ summary: 'Subir imagen Base64 a S3 y crear registro' })
  uploadBase64Image(
    @Body() body: {
      base64Data: string;
      contentType: string;
      altText?: string;
      uploadedById?: string;
      permisoId?: string;
      trabajoId?: string;
    },
  ) {
    const { base64Data, contentType, ...uploadImageDto } = body;

    if (!base64Data || !contentType) {
      throw new BadRequestException('Se requieren base64Data y contentType');
    }

    return this.imagesService.uploadBase64Image(base64Data, contentType, uploadImageDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las imágenes' })
  findAll() {
    return this.imagesService.findAll();
  }

  @Get('by-permiso/:permisoId')
  @ApiOperation({ summary: 'Obtener imágenes por permiso' })
  @ApiParam({ name: 'permisoId', description: 'ID del permiso' })
  findByPermiso(@Param('permisoId') permisoId: string) {
    return this.imagesService.findByPermiso(permisoId);
  }

  @Get('by-trabajo/:trabajoId')
  @ApiOperation({ summary: 'Obtener imágenes por trabajo' })
  @ApiParam({ name: 'trabajoId', description: 'ID del trabajo' })
  findByTrabajo(@Param('trabajoId') trabajoId: string) {
    return this.imagesService.findByTrabajo(trabajoId);
  }

  @Get('by-user/:userId')
  @ApiOperation({ summary: 'Obtener imágenes por usuario' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  findByUser(@Param('userId') userId: string) {
    return this.imagesService.findByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una imagen por ID' })
  @ApiParam({ name: 'id', description: 'ID de la imagen' })
  findOne(@Param('id') id: string) {
    return this.imagesService.findOne(id);
  }

  @Get(':id/signed-url')
  @ApiOperation({ summary: 'Obtener URL firmada para descargar imagen' })
  @ApiParam({ name: 'id', description: 'ID de la imagen' })
  @ApiQuery({ name: 'expiresIn', required: false, description: 'Tiempo de expiración en segundos' })
  getSignedUrl(
    @Param('id') id: string,
    @Query('expiresIn') expiresIn?: string,
  ) {
    const expiresInSeconds = expiresIn ? parseInt(expiresIn) : 3600;
    return this.imagesService.getSignedUrl(id, expiresInSeconds);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una imagen' })
  @ApiParam({ name: 'id', description: 'ID de la imagen' })
  update(@Param('id') id: string, @Body() updateImageDto: UpdateImageDto) {
    return this.imagesService.update(id, updateImageDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una imagen' })
  @ApiParam({ name: 'id', description: 'ID de la imagen' })
  remove(@Param('id') id: string) {
    return this.imagesService.remove(id);
  }
} 