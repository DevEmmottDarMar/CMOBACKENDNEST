// src/permisos/permisos.service.ts
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permiso, PermisoEstado } from './entities/permiso.entity';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { AuthorizePermisoDto } from './dto/update-permiso.dto';
import { Trabajo, TrabajoEstado, SecuenciaPermiso } from '../trabajos/entities/trabajo.entity';
import { User } from '../users/entities/user.entity';
import { TipoPermiso } from '../tipos-permiso/entities/tipo-permiso.entity';

import { EventsService } from '../events/events.service';
import { TrabajosService } from '../trabajos/trabajos.service';
import { S3Service } from '../s3/s3.service';
import { UploadPermisoImageDto } from './dto/upload-permiso-image.dto';

@Injectable()
export class PermisosService {
  private readonly logger = new Logger(PermisosService.name);

  constructor(
    @InjectRepository(Permiso) private permisosRepository: Repository<Permiso>,
    @InjectRepository(Trabajo) private trabajosRepository: Repository<Trabajo>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(TipoPermiso) private tiposPermisoRepository: Repository<TipoPermiso>,
    private eventsService: EventsService,
    private trabajosService: TrabajosService,
    private s3Service: S3Service,
  ) { }

  private readonly relationsOptions = [
    'trabajo',
    'tecnico',
    'supervisor',
    'tipoPermiso',
  ];

  async create(createPermisoDto: CreatePermisoDto): Promise<Permiso> {
    console.log('--- Método create (inicio) ---');
    console.log('DTO recibido:', createPermisoDto);

    const trabajo = await this.trabajosRepository.findOne({ where: { id: createPermisoDto.trabajoId } });
    if (!trabajo) {
      console.log('Error: Trabajo no encontrado para ID:', createPermisoDto.trabajoId);
      throw new BadRequestException('Trabajo no encontrado.');
    }
    console.log('Trabajo encontrado:', trabajo.titulo);

    const tecnico = await this.usersRepository.findOneBy({ id: createPermisoDto.tecnicoId });
    if (!tecnico || tecnico.rol !== 'tecnico') {
      console.log('Error: Técnico no válido o rol incorrecto para ID:', createPermisoDto.tecnicoId);
      throw new BadRequestException('Técnico no válido o rol incorrecto.');
    }
    console.log('Técnico encontrado:', tecnico.nombre);

    const tipoPermiso = await this.tiposPermisoRepository.findOneBy({ id: createPermisoDto.tipoPermisoId });
    if (!tipoPermiso) {
      console.log('Error: Tipo de Permiso no encontrado para ID:', createPermisoDto.tipoPermisoId);
      throw new BadRequestException('Tipo de Permiso no encontrado.');
    }
    console.log('Tipo de Permiso encontrado:', tipoPermiso.nombre);

    // Verificar que el trabajo no esté completado o cancelado
    if (trabajo.estado === TrabajoEstado.COMPLETADO || trabajo.estado === TrabajoEstado.CANCELADO) {
      console.log(`Error: No se puede crear permiso para trabajo con estado: ${trabajo.estado}`);
      throw new BadRequestException(`No se puede crear permiso para trabajo con estado: ${trabajo.estado}`);
    }

    // Verificar que el tipo de permiso solicitado sea el siguiente en la secuencia
    if (tipoPermiso.nombre === SecuenciaPermiso.ALTURA && trabajo.estado === TrabajoEstado.PENDIENTE) {
      // Si es el primer permiso (ALTURA) y el trabajo está pendiente, cambiar estado a EN_PROGRESO
      await this.trabajosService.update(trabajo.id, {
        estado: TrabajoEstado.EN_PROGRESO,
      });
      console.log('Trabajo actualizado a EN_PROGRESO al crear primer permiso (ALTURA).');
    }

    const permisoExistentePendiente = await this.permisosRepository.findOne({
      where: { trabajo: { id: trabajo.id }, tipoPermiso: { id: tipoPermiso.id }, estado: PermisoEstado.PENDIENTE },
    });
    if (permisoExistentePendiente) {
      console.log(`Error: Ya existe un permiso pendiente de tipo "${tipoPermiso.nombre}" para este trabajo.`);
      throw new BadRequestException(`Ya existe un permiso de tipo "${tipoPermiso.nombre}" pendiente para el trabajo "${trabajo.titulo}".`);
    }
    console.log('No hay permisos pendientes duplicados.');

    const createdPermiso = this.permisosRepository.create({
      ...createPermisoDto,
      trabajo: trabajo,
      tecnico: tecnico,
      tipoPermiso: tipoPermiso,
      estado: PermisoEstado.PENDIENTE,
      enviadoAt: new Date(),
    });
    console.log('Permiso creado en memoria:', createdPermiso);

    const savedPermiso = await this.permisosRepository.save(createdPermiso);
    console.log('Permiso guardado en la base de datos:', savedPermiso.id);

    const populatedPermiso = await this.permisosRepository.findOne({ where: { id: savedPermiso.id }, relations: this.relationsOptions });
    if (!populatedPermiso) {
      this.logger.warn(`Permiso recién creado con ID ${savedPermiso.id} no pudo ser populado.`);
      console.log(`Advertencia: Permiso recién creado con ID ${savedPermiso.id} no pudo ser populado.`);
      throw new NotFoundException(`Permiso creado, pero no pudo ser populado.`);
    }
    console.log('Permiso populado exitosamente:', populatedPermiso.id);

    const createMessage = `Un nuevo permiso de ${tipoPermiso.nombre} ha sido creado para el trabajo "${trabajo.titulo}" por ${tecnico.nombre}.`;
    console.log('Enviando notificación:', createMessage);
    this.eventsService.sendPermisoNotification(populatedPermiso, 'nuevo', createMessage);

    console.log('--- Método create (fin) ---');
    return populatedPermiso;
  }

  // === ¡MÉTODO FALTANTE! ===
  /**
   * Obtiene todos los permisos asociados a un trabajo específico.
   * @param trabajoId El ID del trabajo.
   * @returns Una lista de permisos relacionados con el trabajo.
   */
  async findPermisosByTrabajo(trabajoId: string): Promise<Permiso[]> {
    console.log(`--- Método findPermisosByTrabajo (inicio) para trabajoId: ${trabajoId} ---`);
    const permisos = await this.permisosRepository.find({
      where: { trabajo: { id: trabajoId } }, // Filtra por ID del trabajo
      relations: this.relationsOptions,
      order: { enviadoAt: 'DESC' }, // Ordena por los más recientes primero
    });
    console.log(`Se encontraron ${permisos.length} permisos para el trabajo ${trabajoId}.`);
    console.log('--- Método findPermisosByTrabajo (fin) ---');
    return permisos;
  }
  // ========================

  async findPermisosByTecnico(tecnicoId: string): Promise<Permiso[]> {
    console.log(`--- Método findPermisosByTecnico (inicio) para técnico: ${tecnicoId} ---`);
    const permisos = await this.permisosRepository.find({
      where: { tecnico: { id: tecnicoId } },
      relations: this.relationsOptions,
    });
    console.log(`Se encontraron ${permisos.length} permisos para el técnico.`);
    console.log('--- Método findPermisosByTecnico (fin) ---');
    return permisos;
  }

  // Método alias para findPermisosByTecnico
  async findByTecnico(tecnicoId: string): Promise<Permiso[]> {
    return this.findPermisosByTecnico(tecnicoId);
  }

  // Método alias para findPermisosByTrabajo
  async findByTrabajo(trabajoId: string): Promise<Permiso[]> {
    return this.findPermisosByTrabajo(trabajoId);
  }

  // Método alias para findPermisosPendientes
  async findPendientes(): Promise<Permiso[]> {
    return this.findPermisosPendientes();
  }

  async findPermisosPendientes(estado?: PermisoEstado, areaId?: string, fechaInicioMin?: Date, fechaFinMax?: Date): Promise<Permiso[]> {
    console.log(`--- Método findPermisosPendientes (inicio) ---`);
    console.log(`Parámetros: estado=${estado}, areaId=${areaId}, fechaInicioMin=${fechaInicioMin}, fechaFinMax=${fechaFinMax}`);
    const findOptions: any = {
      where: {},
      relations: this.relationsOptions,
      order: { enviadoAt: 'DESC' },
    };

    if (estado) {
      findOptions.where.estado = estado;
      console.log(`Filtrando por estado: ${estado}`);
    } else {
      findOptions.where.estado = PermisoEstado.PENDIENTE;
      console.log(`Filtrando por estado por defecto: ${PermisoEstado.PENDIENTE}`);
    }

    if (areaId) {
      findOptions.where.trabajo = { area: { id: areaId } };
      console.log(`Filtrando por área del trabajo: ${areaId}`);
    }

    if (fechaInicioMin || fechaFinMax) {
      findOptions.where.enviadoAt = findOptions.where.enviadoAt || {};
      if (fechaInicioMin) {
        findOptions.where.enviadoAt.gte = fechaInicioMin;
        console.log(`Filtrando por fecha de envío (desde): ${fechaInicioMin}`);
      }
      if (fechaFinMax) {
        findOptions.where.enviadoAt.lte = fechaFinMax;
        console.log(`Filtrando por fecha de envío (hasta): ${fechaFinMax}`);
      }
    }
    console.log('Opciones de búsqueda finales:', JSON.stringify(findOptions));

    const permisos = await this.permisosRepository.find(findOptions);
    console.log(`Se encontraron ${permisos.length} permisos.`);

    const permisosWithUrls = await Promise.all(
      permisos.map(async (permiso) => {
        // Aquí podrías agregar lógica para obtener URLs si fuera necesario
        return {
          ...permiso,
        };
      }),
    );
    console.log('--- Método findPermisosPendientes (fin) ---');
    return permisosWithUrls as Permiso[];
  }

  async findOne(id: string): Promise<Permiso & { fotoUrl?: string }> {
    console.log(`--- Método findOne (inicio) para ID: ${id} ---`);
    const permiso = await this.permisosRepository.findOne({ where: { id }, relations: this.relationsOptions });

    if (!permiso) {
      console.log(`Error: Permiso con ID "${id}" no encontrado.`);
      throw new NotFoundException(`Permiso con ID "${id}" no encontrado.`);
    }
    console.log('Permiso encontrado:', permiso.id);
    console.log('--- Método findOne (fin) ---');
    return permiso as Permiso & { fotoUrl?: string };
  }

  async authorizePermiso(id: string, authorizePermisoDto: AuthorizePermisoDto): Promise<Permiso> {
    console.log(`--- Método authorizePermiso (inicio) para ID: ${id} ---`);
    console.log('DTO de autorización recibido:', authorizePermisoDto);

    const supervisor = await this.usersRepository.findOneBy({ id: authorizePermisoDto.supervisorId });
    if (!supervisor || supervisor.rol !== 'supervisor') {
      console.log('Error: Supervisor no válido o rol incorrecto para ID:', authorizePermisoDto.supervisorId);
      throw new BadRequestException('Supervisor no válido o rol incorrecto.');
    }
    console.log('Supervisor encontrado y validado:', supervisor.nombre);

    const existingPermiso = await this.permisosRepository.findOne({ where: { id }, relations: this.relationsOptions });
    if (!existingPermiso) {
      console.log(`Error: Permiso con ID "${id}" no encontrado para autorización.`);
      throw new NotFoundException(`Permiso con ID "${id}" no encontrado.`);
    }
    console.log('Permiso existente encontrado:', existingPermiso.id, 'con estado:', existingPermiso.estado);

    if (existingPermiso.estado !== PermisoEstado.PENDIENTE) {
      console.log(`Error: El permiso no está pendiente. Estado actual: ${existingPermiso.estado}.`);
      throw new BadRequestException(`El permiso ya no está pendiente (estado: ${existingPermiso.estado}). Solo se pueden autorizar permisos PENDIENTES.`);
    }
    console.log('El permiso está PENDIENTE, procediendo con la autorización.');

    existingPermiso.estado = authorizePermisoDto.estado;
    existingPermiso.comentariosSupervisor = authorizePermisoDto.comentariosSupervisor ?? undefined;
    existingPermiso.supervisor = supervisor;
    existingPermiso.enviadoAt = new Date();
    console.log('Estado del permiso actualizado en memoria a:', existingPermiso.estado);
    console.log('Comentarios del supervisor:', existingPermiso.comentariosSupervisor);

    const updatedPermiso = await this.permisosRepository.save(existingPermiso);
    console.log('Permiso guardado en la base de datos con nuevo estado:', updatedPermiso.estado);

    const trabajoAsociado = updatedPermiso.trabajo;
    if (!trabajoAsociado) {
      console.log('Error: No se encontró trabajo asociado al permiso.');
      throw new BadRequestException('No se encontró trabajo asociado al permiso.');
    }
    console.log('Trabajo asociado al permiso:', trabajoAsociado.titulo, 'con estado:', trabajoAsociado.estado);

    let notificationType: 'nuevo' | 'actualizado';
    let notificationMessage: string;

    if (updatedPermiso.estado === PermisoEstado.APROBADO) {
      console.log('Permiso APROBADO. Procesando lógica de secuencia y estado del trabajo.');
      notificationType = 'actualizado';
      
      const tipoPermisoNombre = updatedPermiso.tipoPermiso?.nombre || 'Desconocido';
      const supervisorNombre = updatedPermiso.supervisor?.nombre || 'Supervisor';
      const trabajoNombre = trabajoAsociado.titulo || 'Trabajo';
      
      notificationMessage = `Permiso ${tipoPermisoNombre} APROBADO para el trabajo "${trabajoNombre}" por ${supervisorNombre}.`;

      const ordenPermisos: SecuenciaPermiso[] = [SecuenciaPermiso.ALTURA, SecuenciaPermiso.ENGANCHE, SecuenciaPermiso.CIERRE];
      const nombreTipoPermisoActual = tipoPermisoNombre as SecuenciaPermiso;
      const indiceActual = ordenPermisos.indexOf(nombreTipoPermisoActual);
      console.log('Tipo de permiso actual:', nombreTipoPermisoActual, 'Indice en secuencia:', indiceActual);

      if (indiceActual !== -1 && indiceActual < ordenPermisos.length - 1) {
        const proximoPermisoEnSecuencia = ordenPermisos[indiceActual + 1];
        console.log(`Próximo permiso en secuencia: ${proximoPermisoEnSecuencia}. Actualizando trabajo.`);
        await this.trabajosService.update(trabajoAsociado.id, { siguienteTipoPermiso: proximoPermisoEnSecuencia });
        console.log('Trabajo actualizado con siguiente tipo de permiso.');
      } else if (nombreTipoPermisoActual === SecuenciaPermiso.CIERRE) {
        console.log('Permiso de CIERRE. Estableciendo siguiente tipo de permiso a FINALIZADO.');
        await this.trabajosService.update(trabajoAsociado.id, { siguienteTipoPermiso: SecuenciaPermiso.FINALIZADO });
        console.log('Trabajo actualizado con siguiente tipo de permiso FINALIZADO.');
      }

      if (nombreTipoPermisoActual === SecuenciaPermiso.CIERRE && trabajoAsociado.estado !== TrabajoEstado.COMPLETADO) {
        console.log('Permiso de CIERRE y trabajo NO COMPLETADO. Actualizando estado del trabajo a COMPLETADO.');
        await this.trabajosService.update(trabajoAsociado.id, {
          estado: TrabajoEstado.COMPLETADO,
          fechaFinReal: new Date().toISOString(),
        });
        console.log('Trabajo actualizado a COMPLETADO.');
      }

    } else if (updatedPermiso.estado === PermisoEstado.RECHAZADO) {
      console.log('Permiso RECHAZADO.');
      notificationType = 'actualizado';
      
      const tipoPermisoNombre = updatedPermiso.tipoPermiso?.nombre || 'Desconocido';
      const supervisorNombre = updatedPermiso.supervisor?.nombre || 'Supervisor';
      const trabajoNombre = trabajoAsociado.titulo || 'Trabajo';
      
      notificationMessage = `Permiso ${tipoPermisoNombre} RECHAZADO para el trabajo "${trabajoNombre}" por ${supervisorNombre}.`;
    } else {
      console.log('El permiso fue actualizado a un estado diferente de APROBADO/RECHAZADO.');
      notificationType = 'actualizado';
      
      const tipoPermisoNombre = updatedPermiso.tipoPermiso?.nombre || 'Desconocido';
      notificationMessage = `El permiso ${tipoPermisoNombre} ha sido actualizado.`;
    }
    console.log('Enviando notificación:', notificationMessage);
    this.eventsService.sendPermisoNotification(updatedPermiso, notificationType, notificationMessage);

    console.log('--- Método authorizePermiso (fin) ---');
    return updatedPermiso;
  }

  // Método alias para authorizePermiso
  async authorize(id: string, authorizePermisoDto: AuthorizePermisoDto): Promise<Permiso> {
    return this.authorizePermiso(id, authorizePermisoDto);
  }

  async remove(id: string): Promise<{ message: string }> {
    console.log(`--- Método remove (inicio) para ID: ${id} ---`);
    const permiso = await this.permisosRepository.findOne({ where: { id } });
    if (!permiso) {
      console.log(`Error: Permiso con ID "${id}" no encontrado para eliminar.`);
      throw new NotFoundException(`Permiso con ID "${id}" no encontrado.`);
    }
    console.log('Permiso encontrado para eliminar:', permiso.id);

    await this.permisosRepository.remove(permiso);
    console.log('Permiso eliminado exitosamente.');
    console.log('--- Método remove (fin) ---');
    return { message: 'Permiso eliminado exitosamente.' };
  }

  async uploadImage(uploadImageDto: UploadPermisoImageDto): Promise<string> {
    console.log('--- Método uploadImage (inicio) ---');
    console.log('Permiso ID:', uploadImageDto.permisoId);
    console.log('Base64 data length:', uploadImageDto.base64Data?.length || 0);

    // Verificar que el permiso existe
    const permiso = await this.findOne(uploadImageDto.permisoId);
    if (!permiso) {
      console.log(`Error: Permiso con ID ${uploadImageDto.permisoId} no encontrado.`);
      throw new NotFoundException(`Permiso con ID ${uploadImageDto.permisoId} no encontrado.`);
    }
    console.log('Permiso encontrado:', permiso.id);

    // Extraer el tipo de contenido del base64
    const contentTypeMatch = uploadImageDto.base64Data.match(/^data:(.*?);base64,/);
    const contentType = contentTypeMatch ? contentTypeMatch[1] : 'image/jpeg';
    console.log('Content type detectado:', contentType);

    // Generar clave única para S3
    const timestamp = Date.now();
    const extension = contentType.split('/')[1] || 'jpg';
    const s3Key = `permisos/${uploadImageDto.permisoId}/${timestamp}-${Math.random().toString(36).substring(2)}.${extension}`;
    console.log('S3 Key generada:', s3Key);

    // Subir archivo Base64 a S3
    const url = await this.s3Service.uploadBase64File(
      uploadImageDto.base64Data,
      s3Key,
      contentType
    );
    console.log('URL generada:', url);

    // Actualizar el permiso con la clave de la imagen
    await this.permisosRepository.update(uploadImageDto.permisoId, {
      fotoKey: s3Key
    });
    console.log('Permiso actualizado con la imagen');

    console.log('--- Método uploadImage (fin) ---');
    return url;
  }
}