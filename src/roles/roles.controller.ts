// src/roles/roles.controller.ts
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
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/jwt.strategy/jwt.strategy';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Role } from './entities/role.entity';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear un nuevo rol',
    description: 'Crea un nuevo rol en el sistema'
  })
  @ApiBody({
    type: CreateRoleDto,
    description: 'Datos del rol a crear'
  })
  @ApiResponse({
    status: 201,
    description: 'Rol creado exitosamente',
    type: Role
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
    status: 409,
    description: 'Ya existe un rol con ese nombre'
  })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Post('create-default')
  // @UseGuards(JwtAuthGuard) // Temporalmente público para configuración inicial
  // @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear roles por defecto',
    description: 'Crea los roles básicos del sistema (tecnico, supervisor, planificador, prevencionista, admin)'
  })
  @ApiResponse({
    status: 201,
    description: 'Roles por defecto creados exitosamente',
    type: [Role]
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido'
  })
  createDefaultRoles() {
    return this.rolesService.createDefaultRoles();
  }

  @Get()
  // @UseGuards(JwtAuthGuard) // Temporalmente público para configuración inicial
  // @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener todos los roles',
    description: 'Retorna todos los roles del sistema ordenados por nombre'
  })
  @ApiResponse({
    status: 200,
    description: 'Roles obtenidos exitosamente',
    type: [Role]
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido'
  })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener un rol por ID',
    description: 'Retorna los datos de un rol específico por su ID'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del rol',
    example: '8476471a-4c5c-4938-9f0f-7b8ac9242b4c',
    format: 'uuid'
  })
  @ApiResponse({
    status: 200,
    description: 'Rol encontrado exitosamente',
    type: Role
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido'
  })
  @ApiResponse({
    status: 404,
    description: 'Rol no encontrado'
  })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Get('by-name/:nombre')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener un rol por nombre',
    description: 'Retorna los datos de un rol específico por su nombre'
  })
  @ApiParam({
    name: 'nombre',
    description: 'Nombre del rol',
    example: 'tecnico'
  })
  @ApiResponse({
    status: 200,
    description: 'Rol encontrado exitosamente',
    type: Role
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido'
  })
  @ApiResponse({
    status: 404,
    description: 'Rol no encontrado'
  })
  findOneByNombre(@Param('nombre') nombre: string) {
    return this.rolesService.findOneByNombre(nombre);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar un rol',
    description: 'Actualiza los datos de un rol específico'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del rol a actualizar',
    example: '8476471a-4c5c-4938-9f0f-7b8ac9242b4c',
    format: 'uuid'
  })
  @ApiBody({
    type: UpdateRoleDto,
    description: 'Datos del rol a actualizar'
  })
  @ApiResponse({
    status: 200,
    description: 'Rol actualizado exitosamente',
    type: Role
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
    description: 'Rol no encontrado'
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un rol con ese nombre'
  })
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Eliminar un rol',
    description: 'Elimina un rol del sistema (solo si no tiene usuarios asignados)'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del rol a eliminar',
    example: '8476471a-4c5c-4938-9f0f-7b8ac9242b4c',
    format: 'uuid'
  })
  @ApiResponse({
    status: 200,
    description: 'Rol eliminado exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Rol eliminado exitosamente'
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido'
  })
  @ApiResponse({
    status: 404,
    description: 'Rol no encontrado'
  })
  @ApiResponse({
    status: 409,
    description: 'No se puede eliminar el rol porque tiene usuarios asignados'
  })
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
} 