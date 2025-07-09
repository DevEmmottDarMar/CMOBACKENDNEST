// src/tipos-permiso/tipos-permiso.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoPermiso } from './entities/tipo-permiso.entity';
import { CreateTipoPermisoDto } from './dto/create-tipo-permiso.dto';
import { UpdateTipoPermisoDto } from './dto/update-tipo-permiso.dto';

@Injectable()
export class TiposPermisoService {
  constructor(
    @InjectRepository(TipoPermiso)
    private tiposPermisoRepository: Repository<TipoPermiso>,
  ) {}

  async create(
    createTipoPermisoDto: CreateTipoPermisoDto,
  ): Promise<TipoPermiso> {
    const createdTipoPermiso =
      this.tiposPermisoRepository.create(createTipoPermisoDto);
    return this.tiposPermisoRepository.save(createdTipoPermiso);
  }

  async findAll(): Promise<TipoPermiso[]> {
    return this.tiposPermisoRepository.find();
  }

  async findOne(id: string): Promise<TipoPermiso> {
    const tipoPermiso = await this.tiposPermisoRepository.findOneBy({ id });
    if (!tipoPermiso) {
      throw new NotFoundException(
        `Tipo de Permiso con ID "${id}" no encontrado.`,
      );
    }
    return tipoPermiso;
  }

  async update(
    id: string,
    updateTipoPermisoDto: UpdateTipoPermisoDto,
  ): Promise<TipoPermiso> {
    const existingTipoPermiso = await this.tiposPermisoRepository.preload({
      id: id,
      ...updateTipoPermisoDto,
    });
    if (!existingTipoPermiso) {
      throw new NotFoundException(
        `Tipo de Permiso con ID "${id}" no encontrado.`,
      );
    }
    return this.tiposPermisoRepository.save(existingTipoPermiso);
  }

  async remove(id: string): Promise<any> {
    const result = await this.tiposPermisoRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Tipo de Permiso con ID "${id}" no encontrado.`,
      );
    }
    return { message: 'Tipo de Permiso eliminado exitosamente' };
  }
}
