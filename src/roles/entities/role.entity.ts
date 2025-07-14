// src/roles/entities/role.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

@Entity('roles')
export class Role {
  @ApiProperty({
    description: 'ID único del rol',
    example: '8476471a-4c5c-4938-9f0f-7b8ac9242b4c',
    format: 'uuid'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Nombre del rol',
    example: 'tecnico',
    minLength: 2,
    maxLength: 50
  })
  @Column({ type: 'varchar', length: 50, unique: true })
  nombre: string;

  @ApiProperty({
    description: 'Descripción del rol',
    example: 'Técnico que puede solicitar permisos de trabajo',
    minLength: 5,
    maxLength: 255
  })
  @Column({ type: 'varchar', length: 255 })
  descripcion: string;

  @ApiProperty({
    description: 'Fecha y hora de creación del rol',
    example: '2025-01-15T10:30:00.000Z',
    format: 'date-time'
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha y hora de la última actualización del rol',
    example: '2025-01-15T14:45:00.000Z',
    format: 'date-time'
  })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @ApiProperty({
    description: 'Usuarios que tienen este rol',
    type: () => [User]
  })
  @OneToMany(() => User, (user) => user.role)
  users?: User[];
} 