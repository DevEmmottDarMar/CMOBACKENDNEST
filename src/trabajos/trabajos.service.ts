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
import { User } from '../users/entities/user.entity';
import { Area } from '../areas/entities/area.entity';

@Injectable()
export class TrabajosService {
  constructor(
    @InjectRepository(Trabajo)
    private trabajosRepository: Repository<Trabajo>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Area)
    private areasRepository: Repository<Area>,
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
      tecnicoAsignado = await this.usersRepository.findOneBy({
        id: tecnicoAsignadoId,
      }) || undefined;
      if (!tecnicoAsignado || tecnicoAsignado.rol !== 'tecnico') {
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
        const tecnico = await this.usersRepository.findOneBy({
          id: tecnicoAsignadoId,
        });
        if (!tecnico || tecnico.rol !== 'tecnico') {
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
}
