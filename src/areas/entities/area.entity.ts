// src/areas/entities/area.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Trabajo } from '../../trabajos/entities/trabajo.entity';

@Entity('areas')
export class Area {
  @ApiProperty({
    description: 'ID único del área',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    format: 'uuid'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Nombre del área',
    example: 'Centro de Datos',
    minLength: 2,
    maxLength: 100
  })
  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @ApiProperty({
    description: 'Descripción del área',
    example: 'Área principal donde se encuentran los servidores y equipos de cómputo críticos',
    minLength: 10,
    maxLength: 500
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  descripcion?: string;

  @ApiProperty({
    description: 'Fecha y hora de creación del área',
    example: '2025-01-15T10:30:00.000Z',
    format: 'date-time'
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha y hora de la última actualización del área',
    example: '2025-01-15T14:45:00.000Z',
    format: 'date-time'
  })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @ApiPropertyOptional({
    description: 'Usuarios que pertenecen a esta área',
    type: () => [User]
  })
  @OneToMany(() => User, (user) => user.area)
  users?: User[];

  @ApiPropertyOptional({
    description: 'Trabajos asignados a esta área',
    type: () => [Trabajo]
  })
  @OneToMany(() => Trabajo, (trabajo) => trabajo.area)
  trabajos?: Trabajo[];
}
