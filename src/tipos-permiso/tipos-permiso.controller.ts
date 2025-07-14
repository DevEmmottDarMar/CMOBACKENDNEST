// src/tipos-permiso/tipos-permiso.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TiposPermisoService } from './tipos-permiso.service';
import { CreateTipoPermisoDto } from './dto/create-tipo-permiso.dto';
import { UpdateTipoPermisoDto } from './dto/update-tipo-permiso.dto';
import { JwtAuthGuard } from '../auth/jwt.strategy/jwt.strategy';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { TipoPermiso } from './entities/tipo-permiso.entity';

@ApiTags('tipos-permiso')
@Controller('tipos-permiso')
export class TiposPermisoController {
  constructor(private readonly tiposPermisoService: TiposPermisoService) {}

  @Post()
  // @UseGuards(JwtAuthGuard) // Temporalmente público para configuración inicial
  // @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear un nuevo tipo de permiso',
    description: 'Crea un nuevo tipo de permiso en el sistema'
  })
  @ApiBody({
    type: CreateTipoPermisoDto,
    description: 'Datos del tipo de permiso a crear'
  })
  @ApiResponse({
    status: 201,
    description: 'Tipo de permiso creado exitosamente',
    type: TipoPermiso
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos proporcionados'
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido'
  })
  create(@Body() createTipoPermisoDto: CreateTipoPermisoDto) {
    return this.tiposPermisoService.create(createTipoPermisoDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener todos los tipos de permiso',
    description: 'Retorna una lista de todos los tipos de permiso del sistema'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tipos de permiso obtenida exitosamente',
    type: [TipoPermiso]
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido'
  })
  findAll() {
    return this.tiposPermisoService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener un tipo de permiso por ID',
    description: 'Retorna los datos de un tipo de permiso específico por su ID'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del tipo de permiso',
    example: '369a8f2e-c985-47d8-bd20-4bbe575cd0e3',
    format: 'uuid'
  })
  @ApiResponse({
    status: 200,
    description: 'Tipo de permiso encontrado exitosamente',
    type: TipoPermiso
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido'
  })
  @ApiResponse({
    status: 404,
    description: 'Tipo de permiso no encontrado'
  })
  findOne(@Param('id') id: string) {
    return this.tiposPermisoService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar un tipo de permiso',
    description: 'Actualiza los datos de un tipo de permiso existente'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del tipo de permiso a actualizar',
    example: '369a8f2e-c985-47d8-bd20-4bbe575cd0e3',
    format: 'uuid'
  })
  @ApiBody({
    type: UpdateTipoPermisoDto,
    description: 'Datos a actualizar del tipo de permiso'
  })
  @ApiResponse({
    status: 200,
    description: 'Tipo de permiso actualizado exitosamente',
    type: TipoPermiso
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
    description: 'Tipo de permiso no encontrado'
  })
  update(@Param('id') id: string, @Body() updateTipoPermisoDto: UpdateTipoPermisoDto) {
    return this.tiposPermisoService.update(id, updateTipoPermisoDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Eliminar un tipo de permiso',
    description: 'Elimina un tipo de permiso del sistema'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del tipo de permiso a eliminar',
    example: '369a8f2e-c985-47d8-bd20-4bbe575cd0e3',
    format: 'uuid'
  })
  @ApiResponse({
    status: 200,
    description: 'Tipo de permiso eliminado exitosamente'
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido'
  })
  @ApiResponse({
    status: 404,
    description: 'Tipo de permiso no encontrado'
  })
  remove(@Param('id') id: string) {
    return this.tiposPermisoService.remove(id);
  }
}
