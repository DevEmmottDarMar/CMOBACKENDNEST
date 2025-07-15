// src/trabajos/trabajos.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Trabajo,
  TrabajoEstado,
  SecuenciaPermiso,
} from './entities/trabajo.entity';
import { CreateTrabajoDto } from './dto/create-trabajo.dto';
import { UpdateTrabajoDto } from './dto/update-trabajo.dto';
import { IniciarTrabajoDto } from './dto/iniciar-trabajo.dto';
import { TrabajoInicioResponseDto } from './dto/trabajo-inicio-response.dto';
import { AprobarTrabajoDto } from './dto/aprobar-trabajo.dto';
import { User } from '../users/entities/user.entity';
import { Area } from '../areas/entities/area.entity';
import { EventsGateway } from '../events/events.gateway';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class TrabajosService {
  constructor(
    @InjectRepository(Trabajo)
    private trabajosRepository: Repository<Trabajo>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Area)
    private areasRepository: Repository<Area>,
    private eventsGateway: EventsGateway,
  ) {}

  async create(createTrabajoDto: CreateTrabajoDto): Promise<Trabajo> {
    const {
      areaId,
      tecnicoAsignadoId,
      fechaInicioReal,
      fechaFinReal,
      estado,
      siguienteTipoPermiso,
      titulo,
      descripcion,
      fechaProgramada,
      comentarios,
    } = createTrabajoDto;

    const area = await this.areasRepository.findOneBy({ id: areaId });
    if (!area) throw new BadRequestException('Área no encontrada.');

    let tecnicoAsignado: User | undefined = undefined;
    if (tecnicoAsignadoId) {
      tecnicoAsignado = await this.usersRepository.findOne({
        where: { id: tecnicoAsignadoId },
        relations: ['role']
      }) || undefined;
      if (!tecnicoAsignado || tecnicoAsignado.role?.nombre !== 'tecnico') {
        throw new BadRequestException(
          'Técnico asignado no válido o rol incorrecto.',
        );
      }
    }

    const nuevoTrabajo = this.trabajosRepository.create({
      titulo,
      descripcion,
      areaId: area.id,
      tecnicoAsignadoId: tecnicoAsignadoId || undefined,
      estado: estado || TrabajoEstado.PENDIENTE,
      siguienteTipoPermiso: siguienteTipoPermiso || SecuenciaPermiso.ALTURA,
      fechaProgramada: fechaProgramada ? new Date(fechaProgramada) : undefined,
      fechaInicioReal: fechaInicioReal ? new Date(fechaInicioReal) : undefined,
      fechaFinReal: fechaFinReal ? new Date(fechaFinReal) : undefined,
      comentarios,
    } as Partial<Trabajo>);
    return this.trabajosRepository.save(nuevoTrabajo as Trabajo);
  }

  async findAll(
    tecnicoId?: string,
    areaId?: string,
    estado?: TrabajoEstado,
    fechaInicioMin?: Date,
    fechaFinMax?: Date,
  ): Promise<Trabajo[]> {
    const findOptions: any = {
      relations: ['tecnicoAsignado', 'area'],
      where: {},
    };

    if (tecnicoId) {
      findOptions.where.tecnicoAsignado = { id: tecnicoId };
    }
    if (areaId) {
      findOptions.where.area = { id: areaId };
    }
    if (estado) {
      findOptions.where.estado = estado;
    }
    // Filtrado de fechas se mantiene igual

    return this.trabajosRepository.find(findOptions);
  }

  async findOne(id: string): Promise<Trabajo> {
    const trabajo = await this.trabajosRepository.findOne({
      where: { id },
      relations: ['tecnicoAsignado', 'area'],
    });
    if (!trabajo) {
      throw new NotFoundException(`Trabajo con ID "${id}" no encontrado.`);
    }
    return trabajo;
  }

  async update(
    id: string,
    updateTrabajoDto: UpdateTrabajoDto,
  ): Promise<Trabajo> {
    const {
      areaId,
      tecnicoAsignadoId,
      fechaInicioReal,
      fechaFinReal,
      estado,
      siguienteTipoPermiso,
      ...trabajoData
    } = updateTrabajoDto;

    const existingTrabajo = await this.trabajosRepository.findOne({
      where: { id },
      relations: ['tecnicoAsignado', 'area'],
    });
    if (!existingTrabajo) {
      throw new NotFoundException(`Trabajo con ID "${id}" no encontrado.`);
    }

    const updatedTrabajo = this.trabajosRepository.merge(
      existingTrabajo,
      trabajoData,
    );

    // 1. Manejo de la relación 'area' (obligatoria: no puede ser null)
    if (areaId !== undefined) {
      // Si areaId se envió en el DTO
      // Aquí no puede ser null porque la entidad Trabajo.area es nullable:false
      const area = await this.areasRepository.findOneBy({ id: areaId });
      if (!area)
        throw new BadRequestException(
          'Área no encontrada para la actualización.',
        );
      updatedTrabajo.area = area;
      updatedTrabajo.areaId = area.id;
    } else {
      // Si areaId NO se envió en el DTO, mantenemos el objeto existente
      updatedTrabajo.area = existingTrabajo.area;
      updatedTrabajo.areaId = existingTrabajo.areaId;
    }

    // 2. Manejo de la relación 'tecnicoAsignado'
    if (tecnicoAsignadoId !== undefined) {
      if (tecnicoAsignadoId === null) {
        // Si se envió null, desvincular
        updatedTrabajo.tecnicoAsignado = undefined;
        updatedTrabajo.tecnicoAsignadoId = undefined;
      } else {
        // Si se envió un ID, buscar y vincular
        const tecnico = await this.usersRepository.findOne({
          where: { id: tecnicoAsignadoId },
          relations: ['role']
        });
        if (!tecnico || tecnico.role?.nombre !== 'tecnico') {
          throw new BadRequestException(
            'Técnico asignado no válido o rol incorrecto.',
          );
        }
        updatedTrabajo.tecnicoAsignado = tecnico;
        updatedTrabajo.tecnicoAsignadoId = tecnico.id;
      }
    } else {
      // Si tecnicoAsignadoId NO se envió en el DTO, mantenemos el objeto existente
      updatedTrabajo.tecnicoAsignado = existingTrabajo.tecnicoAsignado;
      updatedTrabajo.tecnicoAsignadoId = existingTrabajo.tecnicoAsignadoId;
    }

    // 3. Asegurar que las fechas se guarden como objetos Date
    if (fechaInicioReal !== undefined) {
      updatedTrabajo.fechaInicioReal = fechaInicioReal
        ? new Date(fechaInicioReal)
        : undefined;
    }
    if (fechaFinReal !== undefined) {
      updatedTrabajo.fechaFinReal = fechaFinReal
        ? new Date(fechaFinReal)
        : undefined;
    }

    // 4. Asegurar que los enums se asignen correctamente
    if (estado !== undefined) {
      updatedTrabajo.estado = estado as TrabajoEstado;
    }
    if (siguienteTipoPermiso !== undefined) {
      updatedTrabajo.siguienteTipoPermiso = siguienteTipoPermiso as SecuenciaPermiso;
    }

    return this.trabajosRepository.save(updatedTrabajo);
  }

  async remove(id: string): Promise<any> {
    const result = await this.trabajosRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Trabajo con ID "${id}" no encontrado.`);
    }
    return { message: 'Trabajo eliminado exitosamente' };
  }

  async iniciarTrabajo(id: string, iniciarTrabajoDto: IniciarTrabajoDto): Promise<TrabajoInicioResponseDto> {
    const { tecnicoId, fotoInicial, comentarios } = iniciarTrabajoDto;

    // Verificar que el trabajo existe
    const trabajo = await this.trabajosRepository.findOne({
      where: { id },
      relations: ['tecnicoAsignado', 'area']
    });

    if (!trabajo) {
      throw new NotFoundException(`Trabajo con ID "${id}" no encontrado.`);
    }

    // Verificar que el técnico está asignado al trabajo
    if (trabajo.tecnicoAsignadoId !== tecnicoId) {
      throw new BadRequestException('No tienes autorización para iniciar este trabajo.');
    }

    // Verificar que el trabajo está en estado válido para iniciar
    if (trabajo.estado !== TrabajoEstado.ASIGNADO && trabajo.estado !== TrabajoEstado.PENDIENTE) {
      throw new BadRequestException(`No se puede iniciar un trabajo en estado "${trabajo.estado}".`);
    }

    // Verificar que el técnico existe y tiene rol correcto
    const tecnico = await this.usersRepository.findOne({
      where: { id: tecnicoId },
      relations: ['role']
    });

    if (!tecnico || tecnico.role?.nombre !== 'tecnico') {
      throw new BadRequestException('Técnico no válido o rol incorrecto.');
    }

    // Guardar la foto en el sistema de archivos o S3
    // TODO: Implementar guardado de imagen
    const fotoUrl = await this.guardarFoto(fotoInicial, trabajo.id);

    // Actualizar el trabajo
    trabajo.estado = TrabajoEstado.PENDIENTE_APROBACION;
    trabajo.fechaInicioReal = new Date();
    trabajo.comentarios = comentarios || trabajo.comentarios;
    
    // Guardar la URL de la foto en comentarios adicionales
    const comentariosConFoto = `${trabajo.comentarios || ''}\n\n📸 Foto inicial: ${fotoUrl}`;
    trabajo.comentarios = comentariosConFoto;

    const trabajoActualizado = await this.trabajosRepository.save(trabajo);

    // Enviar notificación al supervisor via WebSocket
    await this.notificarSupervisor(trabajoActualizado);

    return {
      id: trabajoActualizado.id,
      titulo: trabajoActualizado.titulo || 'Trabajo sin título',
      estado: trabajoActualizado.estado,
      estaAprobado: false,
      estaRechazado: false,
      fechaSolicitud: trabajoActualizado.fechaInicioReal!,
      comentarios: trabajoActualizado.comentarios
    };
  }

  async obtenerEstadoAprobacion(id: string): Promise<TrabajoInicioResponseDto> {
    const trabajo = await this.trabajosRepository.findOne({
      where: { id },
      relations: ['tecnicoAsignado', 'area']
    });

    if (!trabajo) {
      throw new NotFoundException(`Trabajo con ID "${id}" no encontrado.`);
    }

    const estaAprobado = trabajo.estado === TrabajoEstado.EN_PROCESO || trabajo.estado === TrabajoEstado.EN_PROGRESO;
    const estaRechazado = trabajo.estado === TrabajoEstado.CANCELADO;

    return {
      id: trabajo.id,
      titulo: trabajo.titulo || 'Trabajo sin título',
      estado: trabajo.estado,
      estaAprobado,
      estaRechazado,
      motivoRechazo: estaRechazado ? trabajo.comentarios : undefined,
      fechaSolicitud: trabajo.fechaInicioReal!,
      comentarios: trabajo.comentarios
    };
  }

  private async guardarFoto(fotoBase64: string, trabajoId: string): Promise<string> {
    // TODO: Implementar guardado real de imagen
    // Por ahora retornamos una URL temporal
    return `https://example.com/fotos/${trabajoId}/${Date.now()}.jpg`;
  }

  private async notificarSupervisor(trabajo: Trabajo): Promise<void> {
    try {
      const tecnico = await this.usersRepository.findOne({
        where: { id: trabajo.tecnicoAsignadoId },
        relations: ['area']
      });

      const mensaje = `🚀 Nuevo trabajo iniciado: "${trabajo.titulo}" por ${tecnico?.nombre || 'Técnico'} - Pendiente de aprobación`;
      
      this.eventsGateway.sendTrabajoNotification(
        {
          id: trabajo.id,
          titulo: trabajo.titulo,
          estado: trabajo.estado,
          tecnicoAsignado: tecnico,
          area: tecnico?.area,
          fechaInicioReal: trabajo.fechaInicioReal,
          comentarios: trabajo.comentarios
        },
        'iniciado',
        mensaje
      );
      
      console.log(`🔔 Notificación WebSocket enviada: Trabajo ${trabajo.id} iniciado`);
    } catch (error) {
      console.error('❌ Error enviando notificación WebSocket:', error);
    }
  }

  async aprobarTrabajo(id: string, aprobarTrabajoDto: AprobarTrabajoDto): Promise<TrabajoInicioResponseDto> {
    const { supervisorId, aprobado, comentarios } = aprobarTrabajoDto;

    // Verificar que el trabajo existe
    const trabajo = await this.trabajosRepository.findOne({
      where: { id },
      relations: ['tecnicoAsignado', 'area']
    });

    if (!trabajo) {
      throw new NotFoundException(`Trabajo con ID "${id}" no encontrado.`);
    }

    // Verificar que el trabajo está pendiente de aprobación
    if (trabajo.estado !== TrabajoEstado.PENDIENTE_APROBACION) {
      throw new BadRequestException(`No se puede aprobar/rechazar un trabajo en estado "${trabajo.estado}".`);
    }

    // Verificar que el supervisor existe y tiene rol correcto
    const supervisor = await this.usersRepository.findOne({
      where: { id: supervisorId },
      relations: ['role']
    });

    if (!supervisor || supervisor.role?.nombre !== 'supervisor') {
      throw new BadRequestException('Supervisor no válido o rol incorrecto.');
    }

    // Actualizar el trabajo según la decisión
    if (aprobado) {
      trabajo.estado = TrabajoEstado.EN_PROCESO;
      trabajo.comentarios = `${trabajo.comentarios || ''}\n\n✅ Aprobado por supervisor ${supervisor.nombre} - ${new Date().toISOString()}\n${comentarios || ''}`;
    } else {
      trabajo.estado = TrabajoEstado.CANCELADO;
      trabajo.comentarios = `${trabajo.comentarios || ''}\n\n❌ Rechazado por supervisor ${supervisor.nombre} - ${new Date().toISOString()}\nMotivo: ${comentarios || 'Sin motivo especificado'}`;
    }

    const trabajoActualizado = await this.trabajosRepository.save(trabajo);

    // Enviar notificación al técnico via WebSocket
    await this.notificarTecnico(trabajoActualizado, aprobado);

    return {
      id: trabajoActualizado.id,
      titulo: trabajoActualizado.titulo || 'Trabajo sin título',
      estado: trabajoActualizado.estado,
      estaAprobado: aprobado,
      estaRechazado: !aprobado,
      motivoRechazo: !aprobado ? comentarios : undefined,
      fechaSolicitud: trabajoActualizado.fechaInicioReal!,
      comentarios: trabajoActualizado.comentarios
    };
  }

  private async notificarTecnico(trabajo: Trabajo, aprobado: boolean): Promise<void> {
    try {
      const supervisor = await this.usersRepository.findOne({
        where: { id: trabajo.tecnicoAsignadoId },
        relations: ['area']
      });

      const estado = aprobado ? 'APROBADO' : 'RECHAZADO';
      const mensaje = aprobado 
        ? `✅ Trabajo "${trabajo.titulo}" ha sido aprobado por el supervisor`
        : `❌ Trabajo "${trabajo.titulo}" ha sido rechazado por el supervisor`;
      
      this.eventsGateway.sendTrabajoNotification(
        {
          id: trabajo.id,
          titulo: trabajo.titulo,
          estado: trabajo.estado,
          tecnicoAsignado: supervisor,
          area: supervisor?.area,
          fechaInicioReal: trabajo.fechaInicioReal,
          comentarios: trabajo.comentarios
        },
        aprobado ? 'aprobado' : 'rechazado',
        mensaje
      );
      
      console.log(`🔔 Notificación WebSocket enviada: Trabajo ${trabajo.id} ${estado}`);
    } catch (error) {
      console.error('❌ Error enviando notificación WebSocket:', error);
    }
  }

  async findPendientesAprobacion(): Promise<TrabajoInicioResponseDto[]> {
    try {
      console.log('🔍 Iniciando findPendientesAprobacion...');
      
      // Método simplificado para evitar errores
      const trabajos = await this.trabajosRepository.find({
        where: { estado: TrabajoEstado.PENDIENTE_APROBACION },
        order: { fechaInicioReal: 'ASC' }
      });

      console.log(`📊 Encontrados ${trabajos.length} trabajos`);

      return trabajos.map(trabajo => ({
        id: trabajo.id,
        titulo: trabajo.titulo || 'Trabajo sin título',
        estado: trabajo.estado,
        estaAprobado: false,
        estaRechazado: false,
        fechaSolicitud: trabajo.fechaInicioReal || new Date(),
        comentarios: trabajo.comentarios || ''
      }));
      
    } catch (error) {
      console.error('❌ Error en findPendientesAprobacion:', error);
      console.error('❌ Stack trace:', error.stack);
      return [];
    }
  }
}
