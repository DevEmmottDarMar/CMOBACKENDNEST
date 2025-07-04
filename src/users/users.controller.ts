// src/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Query,
  NotFoundException, // <-- Importar Query
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(ValidationPipe) createUserDto: CreateUserDto,
  ): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  // 🚀 GET /users MODIFICADO
  // Para obtener todos los usuarios. Opcionalmente puede filtrar por areaId.
  // Ejemplo: GET /users?areaId=uuid-del-area
  @Get()
  async findAll(@Query('areaId') areaId?: string): Promise<User[]> {
    // <-- ¡NUEVO PARÁMETRO!
    return this.usersService.findAll(areaId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }
    return user;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<any> {
    return this.usersService.remove(id);
  }
}
