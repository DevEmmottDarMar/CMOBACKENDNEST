// src/users/users.controller.ts
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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt.strategy/jwt.strategy';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo usuario',
    description: 'Crea un nuevo usuario en el sistema con rol técnico, supervisor o admin'
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'Datos del usuario a crear'
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
    type: User
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos proporcionados'
  })
  @ApiResponse({
    status: 409,
    description: 'El email ya existe en el sistema'
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener todos los usuarios',
    description: 'Retorna una lista de todos los usuarios del sistema (requiere autenticación)'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios obtenida exitosamente',
    type: [User]
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido'
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('tecnicos')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener todos los técnicos',
    description: 'Retorna una lista de todos los usuarios con rol técnico'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de técnicos obtenida exitosamente',
    type: [User]
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido'
  })
  findAllTecnicos() {
    return this.usersService.findAllTecnicos();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener un usuario por ID',
    description: 'Retorna los datos de un usuario específico por su ID'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario',
    example: '8476471a-4c5c-4938-9f0f-7b8ac9242b4c',
    format: 'uuid'
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado exitosamente',
    type: User
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido'
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado'
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get('area/:areaId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener usuarios por área',
    description: 'Retorna todos los usuarios que pertenecen a un área específica'
  })
  @ApiParam({
    name: 'areaId',
    description: 'ID del área',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    format: 'uuid'
  })
  @ApiResponse({
    status: 200,
    description: 'Usuarios del área obtenidos exitosamente',
    type: [User]
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido'
  })
  @ApiResponse({
    status: 404,
    description: 'Área no encontrada'
  })
  findByArea(@Param('areaId') areaId: string) {
    return this.usersService.findByArea(areaId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar un usuario',
    description: 'Actualiza los datos de un usuario existente'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario a actualizar',
    example: '8476471a-4c5c-4938-9f0f-7b8ac9242b4c',
    format: 'uuid'
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'Datos a actualizar del usuario'
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado exitosamente',
    type: User
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
    description: 'Usuario no encontrado'
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Eliminar un usuario',
    description: 'Elimina un usuario del sistema'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario a eliminar',
    example: '8476471a-4c5c-4938-9f0f-7b8ac9242b4c',
    format: 'uuid'
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario eliminado exitosamente'
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT requerido'
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado'
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
