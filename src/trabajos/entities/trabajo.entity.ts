// src/trabajos/entities/trabajo.entity.ts
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
import { User } from '../../users/entities/user.entity';
import { Permiso } from '../../permisos/entities/permiso.entity';
import { Image } from '../../images/entities/image.entity';

export enum TrabajoEstado {
  PENDIENTE = 'pendiente',
  ASIGNADO = 'asignado',
  EN_PROCESO = 'en_proceso',
  EN_PROGRESO = 'en_progreso',
  COMPLETADO = 'completado',
  CANCELADO = 'cancelado',
}

export enum SecuenciaPermiso {
  ALTURA = 'altura',
  ENGANCHE = 'enganche',
  CIERRE = 'cierre',
  ELECTRICO = 'electrico',
  MECANICO = 'mecanico',
  FINALIZADO = 'finalizado',
}

@Entity('trabajos')
export class Trabajo {
  @ApiProperty({
    description: 'ID único del trabajo',
    example: 'e1d68650-a7c2-435e-9623-7e4249e8f00e',
    format: 'uuid'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Título o nombre del trabajo',
    example: 'Mantenimiento Preventivo Sistema de Aire Acondicionado',
    minLength: 5,
    maxLength: 200
  })
  @Column({ type: 'varchar', length: 200, nullable: true })
  titulo?: string;

  @ApiProperty({
    description: 'Descripción detallada del trabajo a realizar',
    example: 'Realizar mantenimiento preventivo semestral al sistema de aire acondicionado del edificio principal, incluyendo limpieza de filtros, revisión de compresores y verificación de niveles de refrigerante.',
    minLength: 10,
    maxLength: 1000
  })
  @Column({ type: 'text' })
  descripcion: string;

  @ApiProperty({
    description: 'ID del área donde se realizará el trabajo',
    example: 'c1d2e3f4-g5h6-7890-1234-567890abcdef',
    format: 'uuid'
  })
  @Column({ type: 'uuid' })
  areaId: string;

  @ApiPropertyOptional({
    description: 'ID del técnico asignado al trabajo',
    example: '8476471a-4c5c-4938-9f0f-7b8ac9242b4c',
    format: 'uuid',
    nullable: true
  })
  @Column({ type: 'uuid', nullable: true })
  tecnicoAsignadoId?: string;

  @ApiProperty({
    description: 'Estado actual del trabajo',
    enum: TrabajoEstado,
    example: TrabajoEstado.PENDIENTE
  })
  @Column({
    type: 'enum',
    enum: TrabajoEstado,
    default: TrabajoEstado.PENDIENTE,
  })
  estado: TrabajoEstado;

  @ApiPropertyOptional({
    description: 'Fecha programada para el inicio del trabajo',
    example: '2025-01-20T08:00:00.000Z',
    format: 'date-time',
    nullable: true
  })
  @Column({ type: 'timestamp', nullable: true })
  fechaProgramada?: Date;

  @ApiPropertyOptional({
    description: 'Fecha real de inicio del trabajo',
    example: '2025-01-20T08:30:00.000Z',
    format: 'date-time',
    nullable: true
  })
  @Column({ type: 'timestamp', nullable: true })
  fechaInicioReal?: Date;

  @ApiPropertyOptional({
    description: 'Fecha real de finalización del trabajo',
    example: '2025-01-20T17:00:00.000Z',
    format: 'date-time',
    nullable: true
  })
  @Column({ type: 'timestamp', nullable: true })
  fechaFinReal?: Date;

  @ApiPropertyOptional({
    description: 'Tipo de permiso que se requiere para el siguiente paso del trabajo',
    enum: SecuenciaPermiso,
    example: SecuenciaPermiso.ALTURA,
    nullable: true
  })
  @Column({
    type: 'enum',
    enum: SecuenciaPermiso,
    nullable: true,
  })
  siguienteTipoPermiso?: SecuenciaPermiso;

  @ApiPropertyOptional({
    description: 'Comentarios adicionales sobre el trabajo',
    example: 'Trabajo requiere acceso a áreas restringidas. Coordinar con el departamento de seguridad.',
    maxLength: 500,
    nullable: true
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  comentarios?: string;

  @ApiProperty({
    description: 'Fecha y hora de creación del trabajo',
    example: '2025-01-15T10:30:00.000Z',
    format: 'date-time'
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha y hora de la última actualización del trabajo',
    example: '2025-01-15T14:45:00.000Z',
    format: 'date-time'
  })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @ApiPropertyOptional({
    description: 'Área donde se realizará el trabajo',
    type: () => Area
  })
  @ManyToOne(() => Area, (area) => area.trabajos)
  @JoinColumn({ name: 'areaId' })
  area?: Area;

  @ApiPropertyOptional({
    description: 'Técnico asignado al trabajo',
    type: () => User
  })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'tecnicoAsignadoId' })
  tecnicoAsignado?: User;

  @ApiPropertyOptional({
    description: 'Permisos asociados a este trabajo',
    type: () => [Permiso]
  })
  @OneToMany(() => Permiso, (permiso) => permiso.trabajo)
  permisos?: Permiso[];

  @ApiPropertyOptional({
    description: 'Imágenes asociadas a este trabajo',
    type: () => [Image]
  })
  @OneToMany(() => Image, (image) => image.trabajo)
  images?: Image[];
}
