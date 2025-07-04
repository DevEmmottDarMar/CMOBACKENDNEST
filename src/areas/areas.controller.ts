// src/areas/areas.controller.ts
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
  // Ya no usamos UseGuards ni Request por la simplicidad inicial
  // UseGuards,
  // Request,
  // ForbiddenException,
  NotFoundException, // <-- Importar NotFoundException
} from '@nestjs/common';
import { AreasService } from './areas.service';
import { CreateAreaDto } from './dto/create-area.dto'; // RUTA CORREGIDA
import { UpdateAreaDto } from './dto/update-area.dto'; // RUTA CORREGIDA
import { Area } from './entities/area.entity';
// AuthGuard ya no se usa por la simplicidad inicial
// import { AuthGuard } from '@nestjs/passport';

@Controller('areas') // Ruta base: /areas
// REMOVER @UseGuards si no se usa
// @UseGuards(AuthGuard('jwt'))
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(ValidationPipe) createAreaDto: CreateAreaDto,
  ): Promise<Area> {
    // REMOVER @Request() req
    return this.areasService.create(createAreaDto);
  }

  @Get()
  async findAll(): Promise<Area[]> {
    return this.areasService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Area> {
    const area = await this.areasService.findOne(id);
    if (!area) {
      throw new NotFoundException(`Área con ID "${id}" no encontrada.`);
    }
    return area;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateAreaDto: UpdateAreaDto,
  ): Promise<Area> {
    return this.areasService.update(id, updateAreaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<any> {
    const result = await this.areasService.remove(id);
    if (result.affected === 0) {
      // TypeORM devuelve affected para delete
      throw new NotFoundException(`Área con ID "${id}" no encontrada.`);
    }
    return { message: 'Área eliminada exitosamente' };
  }
}
