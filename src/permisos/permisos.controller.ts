// src/permisos/permisos.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
  Request,
  ForbiddenException, // <-- Importar ForbiddenException
} from '@nestjs/common';
import { PermisosService } from './permisos.service';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { AuthorizePermisoDto } from './dto/update-permiso.dto';
import { Permiso } from './entities/permiso.entity';
import { AuthGuard } from '@nestjs/passport';
import { TrabajoEstado } from '../trabajos/entities/trabajo.entity'; // Importar TrabajoEstado
import { PermisoEstado } from './entities/permiso.entity'; // Importar PermisoEstado

@Controller('permisos')
export class PermisosController {
  constructor(private readonly permisosService: PermisosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(ValidationPipe) createPermisoDto: CreatePermisoDto,
    @Request() req,
  ): Promise<Permiso> {
    // Si la guardia está activa, req.user estará disponible
    // if (req.user && req.user.rol === 'tecnico' && req.user.id !== createPermisoDto.tecnicoId) {
    //     throw new ForbiddenException('No puedes enviar permisos en nombre de otro técnico.');
    // }
    return this.permisosService.create(createPermisoDto);
  }

  @Get('tecnico/:tecnicoId')
  async findPermisosByTecnico(
    @Param('tecnicoId') tecnicoId: string,
    @Request() req,
  ): Promise<Permiso[]> {
    // if (req.user && req.user.rol === 'tecnico' && req.user.id !== tecnicoId) {
    //   throw new ForbiddenException('Acceso denegado. Un técnico solo puede ver sus propios permisos.');
    // }
    return this.permisosService.findPermisosByTecnico(tecnicoId);
  }

  // === NUEVO ENDPOINT: Listar Permisos por Trabajo ===
  // GET /permisos/by-trabajo/:trabajoId
  @Get('by-trabajo/:trabajoId')
  async findPermisosByTrabajo(
    @Param('trabajoId') trabajoId: string,
  ): Promise<Permiso[]> {
    return this.permisosService.findPermisosByTrabajo(trabajoId);
  }
  // ====================================================

  // === MODIFICADO: findPermisosPendientes con filtros y parámetros de Request ===
  // GET /permisos/pendientes?estado=pendiente&areaId=UUID&fechaInicioMin=ISO_DATE&fechaFinMax=ISO_DATE
  @Get('pendientes')
  async findPermisosPendientes(
    @Query('estado') estado?: PermisoEstado, // <-- Tipo ENUM
    @Query('areaId') areaId?: string,
    @Query('fechaInicioMin') fechaInicioMin?: string,
    @Query('fechaFinMax') fechaFinMax?: string,
    @Request() req?, // <-- Parámetro Request es opcional o va al final. Ya que no hay UseGuards, es opcional.
  ): Promise<Permiso[]> {
    // Lógica de autorización por rol si UseGuards está activo
    // if (req.user && req.user.rol !== 'supervisor' && req.user.rol !== 'admin') {
    //   throw new ForbiddenException('Solo supervisores y administradores pueden ver permisos pendientes.');
    // }
    // Asignar areaId del supervisor si aplica
    // const supervisorAreaId = (req.user && req.user.rol === 'supervisor') ? req.user.areaId : undefined;

    return this.permisosService.findPermisosPendientes(
      estado, // Pasa el estado directamente
      areaId, // Pasa el areaId directamente
      fechaInicioMin ? new Date(fechaInicioMin) : undefined,
      fechaFinMax ? new Date(fechaFinMax) : undefined,
    );
  }
  // ======================================================================

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<Permiso & { fotoUrl?: string }> {
    return this.permisosService.findOne(id);
  }

  @Patch(':id/authorize')
  async authorizePermiso(
    @Param('id') id: string,
    @Body(ValidationPipe) authorizePermisoDto: AuthorizePermisoDto,
    @Request() req,
  ): Promise<Permiso> {
    // Lógica de autorización por rol
    // if (req.user && req.user.rol !== 'supervisor') {
    //   throw new ForbiddenException('Solo los supervisores pueden autorizar permisos.');
    // }
    // if (req.user.id !== authorizePermisoDto.supervisorId) {
    //     throw new ForbiddenException('No puedes autorizar permisos en nombre de otro supervisor.');
    // }
    return this.permisosService.authorizePermiso(id, authorizePermisoDto);
  }
}
