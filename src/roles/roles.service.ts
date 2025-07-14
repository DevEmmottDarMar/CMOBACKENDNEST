// src/roles/roles.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    // Verificar si ya existe un rol con ese nombre
    const existingRole = await this.roleRepository.findOne({
      where: { nombre: createRoleDto.nombre }
    });

    if (existingRole) {
      throw new ConflictException(`Ya existe un rol con el nombre '${createRoleDto.nombre}'`);
    }

    const role = this.roleRepository.create(createRoleDto);
    return await this.roleRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return await this.roleRepository.find({
      relations: ['users'],
      order: { nombre: 'ASC' }
    });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['users']
    });

    if (!role) {
      throw new NotFoundException(`Rol con ID '${id}' no encontrado`);
    }

    return role;
  }

  async findOneByNombre(nombre: string): Promise<Role | null> {
    return await this.roleRepository.findOne({
      where: { nombre },
      relations: ['users']
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    // Si se está actualizando el nombre, verificar que no exista otro rol con ese nombre
    if (updateRoleDto.nombre && updateRoleDto.nombre !== role.nombre) {
      const existingRole = await this.roleRepository.findOne({
        where: { nombre: updateRoleDto.nombre }
      });

      if (existingRole) {
        throw new ConflictException(`Ya existe un rol con el nombre '${updateRoleDto.nombre}'`);
      }
    }

    Object.assign(role, updateRoleDto);
    return await this.roleRepository.save(role);
  }

  async remove(id: string): Promise<{ message: string }> {
    const role = await this.findOne(id);

    // Verificar si hay usuarios usando este rol
    if (role.users && role.users.length > 0) {
      throw new ConflictException(
        `No se puede eliminar el rol '${role.nombre}' porque tiene ${role.users.length} usuario(s) asignado(s)`
      );
    }

    await this.roleRepository.remove(role);
    return { message: `Rol '${role.nombre}' eliminado exitosamente` };
  }

  async createDefaultRoles(): Promise<Role[]> {
    const defaultRoles = [
      {
        nombre: 'tecnico',
        descripcion: 'Técnico que puede solicitar permisos de trabajo'
      },
      {
        nombre: 'supervisor',
        descripcion: 'Supervisor que puede aprobar o rechazar permisos'
      },
      {
        nombre: 'planificador',
        descripcion: 'Planificador que puede gestionar trabajos y asignaciones'
      },
      {
        nombre: 'prevencionista',
        descripcion: 'Prevencionista que puede revisar aspectos de seguridad'
      },
      {
        nombre: 'admin',
        descripcion: 'Administrador con acceso completo al sistema'
      }
    ];

    const createdRoles: Role[] = [];

    for (const roleData of defaultRoles) {
      try {
        const role = await this.create(roleData);
        createdRoles.push(role);
      } catch (error) {
        if (error instanceof ConflictException) {
          // El rol ya existe, continuar
          console.log(`Rol '${roleData.nombre}' ya existe`);
        } else {
          throw error;
        }
      }
    }

    return createdRoles;
  }
} 