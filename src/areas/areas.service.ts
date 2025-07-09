// src/areas/areas.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'; // Importa InjectRepository
import { Repository } from 'typeorm'; // Importa Repository
import { Area } from './entities/area.entity'; // Importa la entidad Area
import { CreateAreaDto } from './dto/create-area.dto'; // RUTA CORREGIDA
import { UpdateAreaDto } from './dto/update-area.dto'; // RUTA CORREGIDA

@Injectable()
export class AreasService {
  constructor(
    @InjectRepository(Area) // Inyecta el repositorio de la entidad Area
    private areasRepository: Repository<Area>,
  ) {}

  async create(createAreaDto: CreateAreaDto): Promise<Area> {
    const createdArea = this.areasRepository.create(createAreaDto);
    return this.areasRepository.save(createdArea);
  }

  async findAll(): Promise<Area[]> {
    return this.areasRepository.find();
  }

  async findOne(id: string): Promise<Area> {
    const area = await this.areasRepository.findOneBy({ id }); // Busca por ID
    if (!area) {
      throw new NotFoundException(`Área con ID "${id}" no encontrada.`);
    }
    return area;
  }

  async update(id: string, updateAreaDto: UpdateAreaDto): Promise<Area> {
    // preload carga la entidad existente, aplica los cambios y devuelve un nuevo objeto fusionado
    const existingArea = await this.areasRepository.preload({
      id: id,
      ...updateAreaDto,
    });
    if (!existingArea) {
      throw new NotFoundException(`Área con ID "${id}" no encontrada.`);
    }
    return this.areasRepository.save(existingArea);
  }

  async remove(id: string): Promise<any> {
    // delete elimina por ID y devuelve un objeto con 'affected' (número de filas eliminadas)
    const result = await this.areasRepository.delete(id);
    if (result.affected === 0) {
      // Si no se afectó ninguna fila, el ID no existía
      throw new NotFoundException(`Área con ID "${id}" no encontrada.`);
    }
    return { message: 'Área eliminada exitosamente' };
  }
}
