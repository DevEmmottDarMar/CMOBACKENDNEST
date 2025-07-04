// src/trabajos/trabajos.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TrabajosService } from './trabajos.service';
import { CreateTrabajoDto } from './dto/create-trabajo.dto';
import { UpdateTrabajoDto } from './dto/update-trabajo.dto';

@Controller('trabajos')
export class TrabajosController {
  constructor(private readonly trabajosService: TrabajosService) {}

  @Post()
  create(@Body() createTrabajoDto: CreateTrabajoDto) {
    return this.trabajosService.create(createTrabajoDto);
  }

  // 🚀 GET /trabajos MODIFICADO
  // Para obtener todos los trabajos. Opcionalmente puede filtrar por tecnicoId Y/O areaId.
  // Ejemplos:
  // GET /trabajos?tecnicoId=uuid-del-tecnico
  // GET /trabajos?areaId=uuid-del-area
  // GET /trabajos?tecnicoId=uuid-del-tecnico&areaId=uuid-del-area
  @Get()
  findAll(
    @Query('tecnicoId') tecnicoId?: string,
    @Query('areaId') areaId?: string, // <-- ¡NUEVO PARÁMETRO!
  ) {
    return this.trabajosService.findAll(tecnicoId, areaId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.trabajosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTrabajoDto: UpdateTrabajoDto,
  ) {
    return this.trabajosService.update(id, updateTrabajoDto);
  }

}
