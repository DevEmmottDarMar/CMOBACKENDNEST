// src/users/entities/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Area } from '../../areas/entities/area.entity';
import { Permiso } from '../../permisos/entities/permiso.entity';
import { Trabajo } from '../../trabajos/entities/trabajo.entity';
import { Image } from '../../images/entities/image.entity';

@Entity('users')
export class User {
  @ApiProperty({
    description: 'ID único del usuario',
    example: '8476471a-4c5c-4938-9f0f-7b8ac9242b4c',
    format: 'uuid'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Carlos Técnico Centro',
    minLength: 2,
    maxLength: 100
  })
  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @ApiProperty({
    description: 'Email único del usuario',
    example: 'carlos.tecnico@example.com',
    format: 'email'
  })
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @ApiProperty({
    description: 'Contraseña hasheada del usuario',
    example: '$2b$10$hashedPasswordString',
    writeOnly: true
  })
  @Column({ type: 'varchar', length: 255 })
  password: string;

  @ApiProperty({
    description: 'Rol del usuario en el sistema',
    enum: ['tecnico', 'supervisor', 'admin'],
    example: 'tecnico'
  })
  @Column({
    type: 'enum',
    enum: ['tecnico', 'supervisor', 'admin'],
    default: 'tecnico',
  })
  rol: 'tecnico' | 'supervisor' | 'admin';

  @ApiPropertyOptional({
    description: 'ID del área a la que pertenece el usuario',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    format: 'uuid',
    nullable: true
  })
  @Column({ type: 'uuid', nullable: true })
  areaId?: string;

  @ApiProperty({
    description: 'Fecha y hora de creación del usuario',
    example: '2025-01-15T10:30:00.000Z',
    format: 'date-time'
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha y hora de la última actualización del usuario',
    example: '2025-01-15T14:45:00.000Z',
    format: 'date-time'
  })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @ApiPropertyOptional({
    description: 'Área a la que pertenece el usuario',
    type: () => Area
  })
  @ManyToOne(() => Area, (area) => area.users, { nullable: true })
  @JoinColumn({ name: 'areaId' })
  area?: Area;

  @ApiPropertyOptional({
    description: 'Permisos solicitados por el usuario (si es técnico)',
    type: () => [Permiso]
  })
  @OneToMany(() => Permiso, (permiso) => permiso.tecnico)
  permisos?: Permiso[];

  @ApiPropertyOptional({
    description: 'Imágenes subidas por el usuario',
    type: () => [Image]
  })
  @OneToMany(() => Image, (image) => image.uploadedBy)
  imagenesSubidas?: Image[];
}
