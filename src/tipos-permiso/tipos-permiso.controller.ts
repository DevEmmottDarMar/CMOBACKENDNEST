// src/tipos-permiso/tipos-permiso.controller.ts
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
  UseGuards,
  Request,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { TiposPermisoService } from './tipos-permiso.service';
import { CreateTipoPermisoDto } from './dto/create-tipo-permiso.dto';
import { UpdateTipoPermisoDto } from './dto/update-tipo-permiso.dto';
import { TipoPermiso } from './entities/tipo-permiso.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('tipos-permiso')
export class TiposPermisoController {
  constructor(private readonly tiposPermisoService: TiposPermisoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(ValidationPipe) createTipoPermisoDto: CreateTipoPermisoDto,
    @Request() req,
  ): Promise<TipoPermiso> {
    return this.tiposPermisoService.create(createTipoPermisoDto);
  }

  @Get()
  async findAll(): Promise<TipoPermiso[]> {
    return this.tiposPermisoService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TipoPermiso> {
    const tipoPermiso = await this.tiposPermisoService.findOne(id);
    if (!tipoPermiso) {
      throw new NotFoundException(
        `Tipo de Permiso con ID "${id}" no encontrado.`,
      );
    }
    return tipoPermiso;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateTipoPermisoDto: UpdateTipoPermisoDto,
  ): Promise<TipoPermiso> {
    return this.tiposPermisoService.update(id, updateTipoPermisoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<any> {
    const result = await this.tiposPermisoService.remove(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Tipo de Permiso con ID "${id}" no encontrado.`,
      );
    }
    return { message: 'Tipo de Permiso eliminado exitosamente' };
  }
}
