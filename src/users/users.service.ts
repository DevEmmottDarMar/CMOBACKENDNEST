// src/users/users.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Area } from '../areas/entities/area.entity'; // Importa Area para la validación (si la usas)

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    // Si necesitas AreaRepository en otros métodos, inyectalo aquí:
    // @InjectRepository(Area)
    // private areasRepository: Repository<Area>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Si tu User tiene areaId y la creas, necesitas validarla aquí:
    // if (createUserDto.areaId) {
    //   const area = await this.areasRepository.findOneBy({ id: createUserDto.areaId });
    //   if (!area) throw new BadRequestException('Área no encontrada.');
    //   // Asigna el objeto Area a la relación si la tienes en la entidad User
    //   // createdUser.area = area;
    // }

    const createdUser = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(createdUser);
  }

  async findAll(areaId?: string): Promise<User[]> {
    const findOptions: any = { where: {} };
    // Si tu User.entity.ts tiene la relación 'area' y quieres poblarla:
    // findOptions.relations = ['area'];

    if (areaId) {
      findOptions.where.area = { id: areaId }; // Asumiendo que User tiene una relación 'area'
    }
    return this.usersRepository.find(findOptions);
  }

  // === CORRECCIÓN AQUÍ: Cambia el tipo de retorno a 'User | null' ===
  async findOneById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  // === CORRECCIÓN AQUÍ: Cambia el tipo de retorno a 'User | null' ===
  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }
  // ==========================================================

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const userToUpdate = await this.usersRepository.findOneBy({ id });
    if (!userToUpdate) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }

    // Si `updateUserDto.areaId` se envía y quieres actualizar la relación `area`:
    // if (updateUserDto.areaId !== undefined) {
    //   if (updateUserDto.areaId === null) {
    //     userToUpdate.area = null;
    //     userToUpdate.areaId = null;
    //   } else {
    //     const area = await this.areasRepository.findOneBy({ id: updateUserDto.areaId });
    //     if (!area) throw new BadRequestException('Área no encontrada para la actualización.');
    //     userToUpdate.area = area;
    //     userToUpdate.areaId = area.id;
    //   }
    // }

    this.usersRepository.merge(userToUpdate, updateUserDto);
    return this.usersRepository.save(userToUpdate);
  }

  async remove(id: string): Promise<any> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }
    return { message: 'Usuario eliminado exitosamente' };
  }
}
