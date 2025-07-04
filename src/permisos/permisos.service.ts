// src/permisos/permisos.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permiso, PermisoEstado } from './entities/permiso.entity';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { AuthorizePermisoDto } from './dto/update-permiso.dto';
import {
  Trabajo,
  TrabajoEstado,
  SecuenciaPermiso,
} from '../trabajos/entities/trabajo.entity'; // <-- Importar SecuenciaPermiso
import { User } from '../users/entities/user.entity';
import { TipoPermiso } from '../tipos-permiso/entities/tipo-permiso.entity';

import { EventsService } from '../events/events.service';
import { TrabajosService } from '../trabajos/trabajos.service';

@Injectable()
export class PermisosService {
  private readonly logger = new Logger(PermisosService.name);

  constructor(
    @InjectRepository(Permiso) private permisosRepository: Repository<Permiso>,
    @InjectRepository(Trabajo) private trabajosRepository: Repository<Trabajo>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(TipoPermiso)
    private tiposPermisoRepository: Repository<TipoPermiso>,
    private eventsService: EventsService,
    private trabajosService: TrabajosService,
  ) {}

  private readonly relationsOptions = [
    'trabajo',
    'tecnico',
    'supervisor',
    'tipoPermiso',
  ];

  async create(createPermisoDto: CreatePermisoDto): Promise<Permiso> {
    const trabajo = await this.trabajosRepository.findOne({
      where: { id: createPermisoDto.trabajoId },
      relations: ['permisos'],
    }); // Cargar permisos del trabajo
    if (!trabajo) throw new BadRequestException('Trabajo no encontrado.');

    const tecnico = await this.usersRepository.findOneBy({
      id: createPermisoDto.tecnicoId,
    });
    if (!tecnico || tecnico.rol !== 'tecnico')
      throw new BadRequestException('Técnico no válido o rol incorrecto.');

    const tipoPermiso = await this.tiposPermisoRepository.findOneBy({
      id: createPermisoDto.tipoPermisoId,
    });
    if (!tipoPermiso)
      throw new BadRequestException('Tipo de Permiso no encontrado.');

    // === LÓGICA CLAVE: ENFORZAR SECUENCIA AL CREAR PERMISO ===
    // 1. Validar que el trabajo no esté ya completado/cancelado.
    if (
      trabajo.estado === TrabajoEstado.COMPLETADO ||
      trabajo.estado === TrabajoEstado.CANCELADO
    ) {
      throw new BadRequestException(
        `El trabajo "${trabajo.nombre}" ya está ${trabajo.estado}. No se pueden crear más permisos.`,
      );
    }

    // 2. Validar que el tipo de permiso que se intenta crear es el esperado para la secuencia
    if (tipoPermiso.nombre !== trabajo.siguienteTipoPermiso) {
      throw new BadRequestException(
        `El siguiente permiso esperado para el trabajo "${trabajo.nombre}" es de tipo "${trabajo.siguienteTipoPermiso}", no "${tipoPermiso.nombre}".`,
      );
    }

    // 3. Validar si ya existe un permiso de este tipo PENDIENTE para este trabajo
    const permisoExistentePendiente = await this.permisosRepository.findOne({
      where: {
        trabajo: { id: trabajo.id },
        tipoPermiso: { id: tipoPermiso.id },
        estado: PermisoEstado.PENDIENTE,
      },
    });
    if (permisoExistentePendiente) {
      throw new BadRequestException(
        `Ya existe un permiso de tipo "${tipoPermiso.nombre}" pendiente para el trabajo "${trabajo.nombre}".`,
      );
    }

    // 4. Si el permiso es de 'altura' y es el primero, registrar fecha de inicio del trabajo.
    if (
      tipoPermiso.nombre === SecuenciaPermiso.ALTURA &&
      trabajo.estado === TrabajoEstado.ASIGNADO
    ) {
      await this.trabajosService.update(trabajo.id, {
        estado: TrabajoEstado.EN_PROCESO,
        fechaInicioReal: new Date().toISOString(), // Registrar fecha de inicio
      });
    }
    // ========================================================================================

    const createdPermiso = this.permisosRepository.create({
      ...createPermisoDto,
      trabajo: trabajo,
      tecnico: tecnico,
      tipoPermiso: tipoPermiso,
      estado: PermisoEstado.PENDIENTE,
      enviadoAt: new Date(),
    });
    const savedPermiso = await this.permisosRepository.save(createdPermiso);

    const populatedPermiso = await this.permisosRepository.findOne({
      where: { id: savedPermiso.id },
      relations: this.relationsOptions,
    });
    if (!populatedPermiso) {
      this.logger.warn(
        `Permiso recién creado con ID ${savedPermiso.id} no pudo ser populado.`,
      );
      throw new NotFoundException(`Permiso creado, pero no pudo ser populado.`);
    }
    this.eventsService.sendPermisoNotification(populatedPermiso, 'nuevo');

    return populatedPermiso;
  }

  async findPermisosByTecnico(tecnicoId: string): Promise<Permiso[]> {
    return this.permisosRepository.find({
      where: { tecnico: { id: tecnicoId } },
      relations: this.relationsOptions,
      order: { enviadoAt: 'DESC' },
    });
  }

  async findPermisosByTrabajo(trabajoId: string): Promise<Permiso[]> {
    return this.permisosRepository.find({
      where: { trabajo: { id: trabajoId } },
      relations: this.relationsOptions,
      order: { enviadoAt: 'DESC' },
    });
  }

  async findPermisosPendientes(
    estado?: PermisoEstado,
    areaId?: string,
    fechaInicioMin?: Date,
    fechaFinMax?: Date,
  ): Promise<Permiso[]> {
    const findOptions: any = {
      where: {},
      relations: this.relationsOptions,
      order: { enviadoAt: 'DESC' },
    };

    if (estado) {
      findOptions.where.estado = estado;
    } else {
      findOptions.where.estado = PermisoEstado.PENDIENTE;
    }

    if (areaId) {
      findOptions.where.trabajo = { area: { id: areaId } };
    }

    if (fechaInicioMin || fechaFinMax) {
      findOptions.where.enviadoAt = findOptions.where.enviadoAt || {};
      if (fechaInicioMin) {
        findOptions.where.enviadoAt.gte = fechaInicioMin;
      }
      if (fechaFinMax) {
        findOptions.where.enviadoAt.lte = fechaFinMax;
      }
    }

    const permisos = await this.permisosRepository.find(findOptions);

    const permisosWithUrls = await Promise.all(
      permisos.map(async (permiso) => {
        return {
          ...permiso,
        };
      }),
    );
    return permisosWithUrls as Permiso[];
  }

  async findOne(id: string): Promise<Permiso & { fotoUrl?: string }> {
    const permiso = await this.permisosRepository.findOne({
      where: { id },
      relations: this.relationsOptions,
    });

    if (!permiso) {
      throw new NotFoundException(`Permiso con ID "${id}" no encontrado.`);
    }

    return permiso as Permiso & { fotoUrl?: string };
  }

  async authorizePermiso(
    id: string,
    authorizePermisoDto: AuthorizePermisoDto,
  ): Promise<Permiso> {
    const supervisor = await this.usersRepository.findOneBy({
      id: authorizePermisoDto.supervisorId,
    });
    if (!supervisor || supervisor.rol !== 'supervisor') {
      throw new BadRequestException('Supervisor no válido o rol incorrecto.');
    }

    const existingPermiso = await this.permisosRepository.findOne({
      where: { id },
      relations: this.relationsOptions,
    });
    if (!existingPermiso) {
      throw new NotFoundException(`Permiso con ID "${id}" no encontrado.`);
    }

    // El permiso solo puede ser autorizado si está pendiente
    if (existingPermiso.estado !== PermisoEstado.PENDIENTE) {
      throw new BadRequestException(
        `El permiso ya no está pendiente (estado: ${existingPermiso.estado}). Solo se pueden autorizar permisos PENDIENTES.`,
      );
    }

    existingPermiso.estado = authorizePermisoDto.estado;
    existingPermiso.comentariosSupervisor =
      authorizePermisoDto.comentariosSupervisor ?? null;
    existingPermiso.supervisor = supervisor;
    existingPermiso.supervisorId = supervisor.id;
    existingPermiso.revisadoAt = new Date();

    const updatedPermiso = await this.permisosRepository.save(existingPermiso);

    const trabajoAsociado = updatedPermiso.trabajo; // Ya populado

    // === LÓGICA CLAVE: AVANZAR SECUENCIA Y COMPLETAR TRABAJO AL APROBAR PERMISO ===
    if (updatedPermiso.estado === PermisoEstado.APROBADO) {
      const ordenPermisos: SecuenciaPermiso[] = [
        SecuenciaPermiso.ALTURA,
        SecuenciaPermiso.ENGANCHE,
        SecuenciaPermiso.CIERRE,
      ];
      const nombreTipoPermisoActual = (updatedPermiso.tipoPermiso as any)
        .nombre; // Nombre del tipo de permiso aprobado
      const indiceActual = ordenPermisos.indexOf(
        nombreTipoPermisoActual as SecuenciaPermiso,
      );

      if (indiceActual !== -1) {
        // Si el permiso aprobado está en la secuencia definida
        let proximoPermisoEnSecuencia: SecuenciaPermiso;
        if (indiceActual < ordenPermisos.length - 1) {
          // Si no es el último de la secuencia
          proximoPermisoEnSecuencia = ordenPermisos[indiceActual + 1];
        } else {
          // Si es el último de la secuencia (cierre)
          proximoPermisoEnSecuencia = SecuenciaPermiso.FINALIZADO;
        }

        // Actualizar el trabajo con el siguiente permiso esperado
        await this.trabajosService.update(trabajoAsociado.id, {
          siguienteTipoPermiso: proximoPermisoEnSecuencia,
        });

        // Si el permiso aprobado es de 'cierre', y es el último de la secuencia, marcar trabajo como completado
        if (
          nombreTipoPermisoActual === SecuenciaPermiso.CIERRE &&
          proximoPermisoEnSecuencia === SecuenciaPermiso.FINALIZADO
        ) {
          await this.trabajosService.update(trabajoAsociado.id, {
            estado: TrabajoEstado.COMPLETADO,
            fechaFinReal: new Date().toISOString(),
          });
        }
      }
    }
    // ==================================================================================================

    this.eventsService.sendPermisoNotification(updatedPermiso, 'actualizado');

    return updatedPermiso;
  }
}
