// src/areas/areas.controller.ts
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
import { AreasService } from './areas.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { JwtAuthGuard } from '../auth/jwt.strategy/jwt.strategy';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Area } from './entities/area.entity';

@ApiTags('areas')
@Controller('areas')
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear una nueva área',
    description: 'Crea una nueva área en el sistema'
  })
  @ApiBody({
    type: CreateAreaDto,
    description: 'Datos del área a crear'
  })
  @ApiResponse({
    status: 201,
    description: 'Área creada exitosamente',
    type: Area
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos proporcionados'
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido'
  })
  create(@Body() createAreaDto: CreateAreaDto) {
    return this.areasService.create(createAreaDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener todas las áreas',
    description: 'Retorna una lista de todas las áreas del sistema'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de áreas obtenida exitosamente',
    type: [Area]
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido'
  })
  findAll() {
    return this.areasService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener un área por ID',
    description: 'Retorna los datos de un área específica por su ID'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del área',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    format: 'uuid'
  })
  @ApiResponse({
    status: 200,
    description: 'Área encontrada exitosamente',
    type: Area
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido'
  })
  @ApiResponse({
    status: 404,
    description: 'Área no encontrada'
  })
  findOne(@Param('id') id: string) {
    return this.areasService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar un área',
    description: 'Actualiza los datos de un área existente'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del área a actualizar',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    format: 'uuid'
  })
  @ApiBody({
    type: UpdateAreaDto,
    description: 'Datos a actualizar del área'
  })
  @ApiResponse({
    status: 200,
    description: 'Área actualizada exitosamente',
    type: Area
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
    description: 'Área no encontrada'
  })
  update(@Param('id') id: string, @Body() updateAreaDto: UpdateAreaDto) {
    return this.areasService.update(id, updateAreaDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Eliminar un área',
    description: 'Elimina un área del sistema'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del área a eliminar',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    format: 'uuid'
  })
  @ApiResponse({
    status: 200,
    description: 'Área eliminada exitosamente'
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido'
  })
  @ApiResponse({
    status: 404,
    description: 'Área no encontrada'
  })
  remove(@Param('id') id: string) {
    return this.areasService.remove(id);
  }
}
