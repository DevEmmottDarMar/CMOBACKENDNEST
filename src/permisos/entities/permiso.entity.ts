// src/permisos/entities/permiso.entity.ts
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
import { User } from '../../users/entities/user.entity';
import { Trabajo } from '../../trabajos/entities/trabajo.entity';
import { TipoPermiso } from '../../tipos-permiso/entities/tipo-permiso.entity';
import { Image } from '../../images/entities/image.entity';

export enum PermisoEstado {
  PENDIENTE = 'pendiente',
  APROBADO = 'aprobado',
  RECHAZADO = 'rechazado',
}

@Entity('permisos')
export class Permiso {
  @ApiProperty({
    description: 'ID único del permiso',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    format: 'uuid'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID del trabajo al que pertenece el permiso',
    example: 'e1d68650-a7c2-435e-9623-7e4249e8f00e',
    format: 'uuid'
  })
  @Column({ type: 'uuid' })
  trabajoId: string;

  @ApiProperty({
    description: 'ID del técnico que solicita el permiso',
    example: '8476471a-4c5c-4938-9f0f-7b8ac9242b4c',
    format: 'uuid'
  })
  @Column({ type: 'uuid' })
  tecnicoId: string;

  @ApiProperty({
    description: 'ID del tipo de permiso solicitado',
    example: '369a8f2e-c985-47d8-bd20-4bbe575cd0e3',
    format: 'uuid'
  })
  @Column({ type: 'uuid' })
  tipoPermisoId: string;

  @ApiProperty({
    description: 'Estado actual del permiso',
    enum: PermisoEstado,
    example: PermisoEstado.PENDIENTE
  })
  @Column({
    type: 'enum',
    enum: PermisoEstado,
    default: PermisoEstado.PENDIENTE,
  })
  estado: PermisoEstado;

  @ApiPropertyOptional({
    description: 'Comentarios del técnico sobre el permiso',
    example: 'Necesito acceso a áreas elevadas para realizar el mantenimiento',
    nullable: true
  })
  @Column({ type: 'text', nullable: true })
  comentariosTecnico?: string;

  @ApiPropertyOptional({
    description: 'Comentarios del supervisor sobre la aprobación/rechazo',
    example: 'Permiso aprobado. Asegúrate de usar el equipo de protección',
    nullable: true
  })
  @Column({ type: 'text', nullable: true })
  comentariosSupervisor?: string;

  @ApiPropertyOptional({
    description: 'Clave de la imagen en S3 (si existe)',
    example: 'permisos/2025/01/15/permiso-123-image.jpg',
    nullable: true
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  fotoKey?: string;

  @ApiPropertyOptional({
    description: 'Fecha y hora de envío del permiso',
    example: '2025-01-15T10:30:00.000Z',
    format: 'date-time',
    nullable: true
  })
  @Column({ type: 'timestamp', nullable: true })
  enviadoAt?: Date;

  @ApiPropertyOptional({
    description: 'Fecha y hora de autorización del permiso',
    example: '2025-01-15T14:45:00.000Z',
    format: 'date-time',
    nullable: true
  })
  @Column({ type: 'timestamp', nullable: true })
  autorizadoAt?: Date;

  @ApiPropertyOptional({
    description: 'ID del supervisor que autorizó el permiso',
    example: 'b2c3d4e5-f6g7-8901-2345-678901abcdef',
    format: 'uuid',
    nullable: true
  })
  @Column({ type: 'uuid', nullable: true })
  autorizadoPor?: string;

  @ApiProperty({
    description: 'Fecha y hora de creación del permiso',
    example: '2025-01-15T10:30:00.000Z',
    format: 'date-time'
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha y hora de la última actualización del permiso',
    example: '2025-01-15T14:45:00.000Z',
    format: 'date-time'
  })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @ApiPropertyOptional({
    description: 'Trabajo al que pertenece el permiso',
    type: () => Trabajo
  })
  @ManyToOne(() => Trabajo, (trabajo) => trabajo.permisos)
  @JoinColumn({ name: 'trabajoId' })
  trabajo?: Trabajo;

  @ApiPropertyOptional({
    description: 'Técnico que solicita el permiso',
    type: () => User
  })
  @ManyToOne(() => User, (user) => user.permisos)
  @JoinColumn({ name: 'tecnicoId' })
  tecnico?: User;

  @ApiPropertyOptional({
    description: 'Tipo de permiso solicitado',
    type: () => TipoPermiso
  })
  @ManyToOne(() => TipoPermiso, (tipoPermiso) => tipoPermiso.permisos)
  @JoinColumn({ name: 'tipoPermisoId' })
  tipoPermiso?: TipoPermiso;

  @ApiPropertyOptional({
    description: 'Supervisor que autorizó el permiso',
    type: () => User
  })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'autorizadoPor' })
  supervisor?: User;

  @ApiPropertyOptional({
    description: 'Imágenes asociadas al permiso',
    type: () => Image,
    isArray: true
  })
  @OneToMany(() => Image, (image) => image.permiso)
  images?: Image[];
}
