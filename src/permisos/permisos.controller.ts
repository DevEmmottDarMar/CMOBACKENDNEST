// src/permisos/permisos.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PermisosService } from './permisos.service';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { UpdatePermisoDto } from './dto/update-permiso.dto';
import { JwtAuthGuard } from '../auth/jwt.strategy/jwt.strategy';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { Permiso } from './entities/permiso.entity';
import { PermisoResponseDto } from './dto/permiso-response.dto';
import { AuthorizePermisoDto } from './dto/authorize-permiso.dto';

@ApiTags('permisos')
@Controller('permisos')
export class PermisosController {
  constructor(private readonly permisosService: PermisosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear un nuevo permiso',
    description: 'Crea un nuevo permiso de trabajo para un técnico'
  })
  @ApiBody({
    type: CreatePermisoDto,
    description: 'Datos del permiso a crear'
  })
  @ApiResponse({
    status: 201,
    description: 'Permiso creado exitosamente',
    type: PermisoResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos proporcionados'
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido'
  })
  @ApiResponse({
    status: 404,
    description: 'Trabajo, técnico o tipo de permiso no encontrado'
  })
  create(@Body() createPermisoDto: CreatePermisoDto) {
    return this.permisosService.create(createPermisoDto);
  }

  @Get('tecnico/:tecnicoId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener permisos por técnico',
    description: 'Retorna todos los permisos solicitados por un técnico específico'
  })
  @ApiParam({
    name: 'tecnicoId',
    description: 'ID del técnico',
    example: '8476471a-4c5c-4938-9f0f-7b8ac9242b4c',
    format: 'uuid'
  })
  @ApiResponse({
    status: 200,
    description: 'Permisos del técnico obtenidos exitosamente',
    type: [PermisoResponseDto]
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido'
  })
  @ApiResponse({
    status: 404,
    description: 'Técnico no encontrado'
  })
  findByTecnico(@Param('tecnicoId') tecnicoId: string) {
    return this.permisosService.findByTecnico(tecnicoId);
  }

  @Get('by-trabajo/:trabajoId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener permisos por trabajo',
    description: 'Retorna todos los permisos asociados a un trabajo específico'
  })
  @ApiParam({
    name: 'trabajoId',
    description: 'ID del trabajo',
    example: 'e1d68650-a7c2-435e-9623-7e4249e8f00e',
    format: 'uuid'
  })
  @ApiResponse({
    status: 200,
    description: 'Permisos del trabajo obtenidos exitosamente',
    type: [PermisoResponseDto]
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido'
  })
  @ApiResponse({
    status: 404,
    description: 'Trabajo no encontrado'
  })
  findByTrabajo(@Param('trabajoId') trabajoId: string) {
    return this.permisosService.findByTrabajo(trabajoId);
  }

  @Get('pendientes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener permisos pendientes',
    description: 'Retorna todos los permisos que están en estado pendiente'
  })
  @ApiResponse({
    status: 200,
    description: 'Permisos pendientes obtenidos exitosamente',
    type: [PermisoResponseDto]
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido'
  })
  findPendientes() {
    return this.permisosService.findPendientes();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener un permiso por ID',
    description: 'Retorna los datos de un permiso específico por su ID'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del permiso',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    format: 'uuid'
  })
  @ApiResponse({
    status: 200,
    description: 'Permiso encontrado exitosamente',
    type: PermisoResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido'
  })
  @ApiResponse({
    status: 404,
    description: 'Permiso no encontrado'
  })
  findOne(@Param('id') id: string) {
    return this.permisosService.findOne(id);
  }

  @Patch(':id/authorize')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Autorizar o rechazar un permiso',
    description: 'Permite a un supervisor aprobar o rechazar un permiso pendiente'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del permiso a autorizar',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    format: 'uuid'
  })
  @ApiBody({
    type: AuthorizePermisoDto,
    description: 'Datos de autorización (estado y comentarios del supervisor)'
  })
  @ApiResponse({
    status: 200,
    description: 'Permiso autorizado/rechazado exitosamente',
    type: PermisoResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos proporcionados'
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido'
  })
  @ApiResponse({
    status: 403,
    description: 'Solo supervisores pueden autorizar permisos'
  })
  @ApiResponse({
    status: 404,
    description: 'Permiso no encontrado'
  })
  authorize(@Param('id') id: string, @Body() authorizePermisoDto: AuthorizePermisoDto) {
    return this.permisosService.authorize(id, authorizePermisoDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Eliminar un permiso',
    description: 'Elimina un permiso del sistema'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del permiso a eliminar',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    format: 'uuid'
  })
  @ApiResponse({
    status: 200,
    description: 'Permiso eliminado exitosamente'
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido'
  })
  @ApiResponse({
    status: 404,
    description: 'Permiso no encontrado'
  })
  remove(@Param('id') id: string) {
    return this.permisosService.remove(id);
  }

  @Post('upload-image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: 'Subir imagen para un permiso',
    description: 'Sube una imagen en base64 asociada a un permiso y la almacena en S3'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        permisoId: {
          type: 'string',
          description: 'ID del permiso al que se asociará la imagen',
          example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
          format: 'uuid'
        },
        base64Data: {
          type: 'string',
          description: 'Imagen en formato base64',
          example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...'
        }
      },
      required: ['permisoId', 'base64Data']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Imagen subida exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Imagen subida exitosamente'
        },
        imageKey: {
          type: 'string',
          example: 'permisos/2025/01/15/permiso-123-image.jpg'
        },
        permiso: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef'
            },
            fotoKey: {
              type: 'string',
              example: 'permisos/2025/01/15/permiso-123-image.jpg'
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos proporcionados'
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido'
  })
  @ApiResponse({
    status: 404,
    description: 'Permiso no encontrado'
  })
  @ApiResponse({
    status: 500,
    description: 'Error al subir imagen a S3'
  })
  uploadImage(@Body() body: { permisoId: string; base64Data: string }) {
    return this.permisosService.uploadImage({ permisoId: body.permisoId, base64Data: body.base64Data });
  }
}