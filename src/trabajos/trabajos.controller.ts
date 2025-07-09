// src/trabajos/trabajos.controller.ts
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
import { TrabajosService } from './trabajos.service';
import { CreateTrabajoDto } from './dto/create-trabajo.dto';
import { UpdateTrabajoDto } from './dto/update-trabajo.dto';
import { JwtAuthGuard } from '../auth/jwt.strategy/jwt.strategy';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Trabajo } from './entities/trabajo.entity';

@ApiTags('trabajos')
@Controller('trabajos')
export class TrabajosController {
  constructor(private readonly trabajosService: TrabajosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear un nuevo trabajo',
    description: 'Crea un nuevo trabajo en el sistema'
  })
  @ApiBody({
    type: CreateTrabajoDto,
    description: 'Datos del trabajo a crear'
  })
  @ApiResponse({
    status: 201,
    description: 'Trabajo creado exitosamente',
    type: Trabajo
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
  create(@Body() createTrabajoDto: CreateTrabajoDto) {
    return this.trabajosService.create(createTrabajoDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener todos los trabajos',
    description: 'Retorna una lista de todos los trabajos del sistema'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de trabajos obtenida exitosamente',
    type: [Trabajo]
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido'
  })
  findAll() {
    return this.trabajosService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener un trabajo por ID',
    description: 'Retorna los datos de un trabajo específico por su ID'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del trabajo',
    example: 'e1d68650-a7c2-435e-9623-7e4249e8f00e',
    format: 'uuid'
  })
  @ApiResponse({
    status: 200,
    description: 'Trabajo encontrado exitosamente',
    type: Trabajo
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido'
  })
  @ApiResponse({
    status: 404,
    description: 'Trabajo no encontrado'
  })
  findOne(@Param('id') id: string) {
    return this.trabajosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar un trabajo',
    description: 'Actualiza los datos de un trabajo existente'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del trabajo a actualizar',
    example: 'e1d68650-a7c2-435e-9623-7e4249e8f00e',
    format: 'uuid'
  })
  @ApiBody({
    type: UpdateTrabajoDto,
    description: 'Datos a actualizar del trabajo'
  })
  @ApiResponse({
    status: 200,
    description: 'Trabajo actualizado exitosamente',
    type: Trabajo
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
    description: 'Trabajo no encontrado'
  })
  update(@Param('id') id: string, @Body() updateTrabajoDto: UpdateTrabajoDto) {
    return this.trabajosService.update(id, updateTrabajoDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Eliminar un trabajo',
    description: 'Elimina un trabajo del sistema'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del trabajo a eliminar',
    example: 'e1d68650-a7c2-435e-9623-7e4249e8f00e',
    format: 'uuid'
  })
  @ApiResponse({
    status: 200,
    description: 'Trabajo eliminado exitosamente'
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido'
  })
  @ApiResponse({
    status: 404,
    description: 'Trabajo no encontrado'
  })
  remove(@Param('id') id: string) {
    return this.trabajosService.remove(id);
  }
}
