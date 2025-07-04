// src/trabajos/entities/trabajo.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Permiso } from '../../permisos/entities/permiso.entity';
import { Area } from '../../areas/entities/area.entity';

export enum TrabajoEstado {
  ASIGNADO = 'asignado',
  EN_PROCESO = 'en_proceso',
  COMPLETADO = 'completado',
  CANCELADO = 'cancelado',
}

export enum SecuenciaPermiso {
  ALTURA = 'altura',
  ENGANCHE = 'enganche',
  CIERRE = 'cierre',
  FINALIZADO = 'finalizado',
}

@Entity('trabajos')
export class Trabajo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  nombre: string;

  @Column('text')
  descripcion: string;

  @ManyToOne(() => User, (user) => user.trabajosAsignados, { nullable: true })
  @JoinColumn({ name: 'tecnicoAsignadoId' })
  tecnicoAsignado: User | null;

  @Column({ nullable: true })
  tecnicoAsignadoId: string | null;

  @ManyToOne(() => Area, (area) => area.trabajos, { nullable: false })
  @JoinColumn({ name: 'areaId' })
  area: Area;

  @Column({ nullable: false })
  areaId: string;

  // === CORRECCIÓN CLAVE AQUÍ: REMOVER 'length: 50' ===
  @Column({
    type: 'enum', // Tipo ENUM para PostgreSQL
    enum: TrabajoEstado,
    default: TrabajoEstado.ASIGNADO,
  })
  estado: TrabajoEstado; // Usar el ENUM
  // ===============================================

  @Column({ default: true })
  activo: boolean;

  @Column({ type: 'timestamp', nullable: true })
  fechaInicioReal: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  fechaFinReal: Date | null;

  @Column({
    type: 'enum',
    enum: SecuenciaPermiso,
    default: SecuenciaPermiso.ALTURA,
  })
  siguienteTipoPermiso: SecuenciaPermiso;

  @OneToMany(() => Permiso, (permiso) => permiso.trabajo)
  permisos: Permiso[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
