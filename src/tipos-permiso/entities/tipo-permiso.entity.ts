// src/tipos-permiso/entities/tipo-permiso.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Permiso } from '../../permisos/entities/permiso.entity';

@Entity('tipos_permiso')
export class TipoPermiso {
  @ApiProperty({
    description: 'ID único del tipo de permiso',
    example: '369a8f2e-c985-47d8-bd20-4bbe575cd0e3',
    format: 'uuid'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Nombre del tipo de permiso',
    example: 'Permiso de Altura',
    minLength: 3,
    maxLength: 100
  })
  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @ApiProperty({
    description: 'Descripción detallada del tipo de permiso',
    example: 'Permiso requerido para realizar trabajos en altura superior a 1.8 metros, incluyendo uso de escaleras, andamios o equipos elevadores',
    minLength: 10,
    maxLength: 500
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  descripcion?: string;

  @ApiProperty({
    description: 'Fecha y hora de creación del tipo de permiso',
    example: '2025-01-15T10:30:00.000Z',
    format: 'date-time'
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha y hora de la última actualización del tipo de permiso',
    example: '2025-01-15T14:45:00.000Z',
    format: 'date-time'
  })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @ApiPropertyOptional({
    description: 'Permisos que utilizan este tipo',
    type: () => [Permiso]
  })
  @OneToMany(() => Permiso, (permiso) => permiso.tipoPermiso)
  permisos?: Permiso[];
}
