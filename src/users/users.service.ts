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
import { Role } from '../roles/entities/role.entity'; // Importa Role para la validación

import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    // Si necesitas AreaRepository en otros métodos, inyectalo aquí:
    // @InjectRepository(Area)
    // private areasRepository: Repository<Area>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar si el email ya existe
    const existingUser = await this.findOneByEmail(createUserDto.email);
    if (existingUser) {
      throw new BadRequestException('El email ya está registrado.');
    }

    // Verificar si el rol existe
    if (createUserDto.roleId) {
      const role = await this.rolesRepository.findOne({
        where: { id: createUserDto.roleId },
      });
      if (!role) {
        throw new BadRequestException(
          `Rol con ID "${createUserDto.roleId}" no encontrado.`,
        );
      }
    }

    // Hashear la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );

    // Crear usuario con contraseña hasheada
    const createdUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.usersRepository.save(createdUser);
  }

  async findAll(areaId?: string): Promise<User[]> {
    const findOptions: any = {
      relations: ['role', 'area'],
      order: { nombre: 'ASC' },
    };

    if (areaId) {
      findOptions.where = { areaId };
    }

    return this.usersRepository.find(findOptions);
  }

  //buscar todos los tecnicos
  async findAllTechnicians(): Promise<User[]> {
    return this.usersRepository.find({
      where: { role: { nombre: 'tecnico' } },
      relations: ['role', 'area'],
    });
  }

  // Método alias para findAllTechnicians
  async findAllTecnicos(): Promise<User[]> {
    return this.findAllTechnicians();
  }

  // === CORRECCIÓN AQUÍ: Cambia el tipo de retorno a 'User | null' ===
  async findOneById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['role', 'area'],
    });
  }

  // Método alias para findOneById
  async findOne(id: string): Promise<User> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }
    return user;
  }

  // === CORRECCIÓN AQUÍ: Cambia el tipo de retorno a 'User | null' ===
  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['role', 'area'],
    });
  }
  // ==========================================================

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const userToUpdate = await this.usersRepository.findOneBy({ id });
    if (!userToUpdate) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }

    // Si se está actualizando el rol, verificar que existe
    if (updateUserDto.roleId) {
      const role = await this.rolesRepository.findOne({
        where: { id: updateUserDto.roleId },
      });
      if (!role) {
        throw new BadRequestException(
          `Rol con ID "${updateUserDto.roleId}" no encontrado.`,
        );
      }
    }

    // Si se está actualizando la contraseña, hashearla
    if (updateUserDto.password) {
      const saltRounds = 10;
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        saltRounds,
      );
    }

    // Si se está actualizando el email, verificar que no exista
    if (updateUserDto.email && updateUserDto.email !== userToUpdate.email) {
      const existingUser = await this.findOneByEmail(updateUserDto.email);
      if (existingUser) {
        throw new BadRequestException('El email ya está registrado.');
      }
    }

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

  //listar usuarios por area
  async findAllByArea(areaId: string): Promise<User[]> {
    return this.usersRepository.find({
      where: { areaId },
      relations: ['role', 'area'],
    });
  }

  // Método alias para findAllByArea
  async findByArea(areaId: string): Promise<User[]> {
    return this.findAllByArea(areaId);
  }

  // Método para verificar contraseña
  async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Método para obtener usuarios por rol
  async findByRole(roleId: string): Promise<User[]> {
    return this.usersRepository.find({
      where: { roleId },
      relations: ['role', 'area'],
    });
  }

  // Método para obtener usuarios por nombre de rol
  async findByRoleName(roleName: string): Promise<User[]> {
    return this.usersRepository.find({
      where: { role: { nombre: roleName } },
      relations: ['role', 'area'],
    });
  }
}
