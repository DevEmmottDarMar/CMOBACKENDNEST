// src/permisos/entities/permiso.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Trabajo } from '../../trabajos/entities/trabajo.entity';
import { User } from '../../users/entities/user.entity';
import { TipoPermiso } from 'src/tipos-permiso/entities/tipo-permiso.entity';

// Definición del ENUM de estados de permiso
export enum PermisoEstado {
  PENDIENTE = 'pendiente',
  APROBADO = 'aprobado',
  RECHAZADO = 'rechazado',
}

@Entity('permisos')
export class Permiso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Trabajo, (trabajo) => trabajo.permisos)
  @JoinColumn({ name: 'trabajoId' })
  trabajo: Trabajo;

  @Column()
  trabajoId: string;

  @ManyToOne(() => User, (user) => user.permisosEnviados)
  @JoinColumn({ name: 'tecnicoId' })
  tecnico: User;

  @Column()
  tecnicoId: string;

  // === ¡ESTA LÍNEA DEBE SER EXACTA! ===
  @Column({ type: 'varchar', nullable: true, length: 255 }) // Usar 'varchar' con una longitud
  fotoKey: string | null;
  // ===================================

  // === ESTADO DEL PERMISO COMO ENUM ===
  @Column({
    type: 'enum', // Tipo ENUM para PostgreSQL
    enum: PermisoEstado,
    default: PermisoEstado.PENDIENTE,
  })
  estado: PermisoEstado; // Usar el ENUM
  // ===================================

  @Column({ type: 'text', nullable: true })
  comentariosTecnico: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  enviadoAt: Date;

  @ManyToOne(() => User, (user) => user.permisosRevisados, { nullable: true })
  @JoinColumn({ name: 'supervisorId' })
  supervisor: User;

  @Column({ nullable: true })
  supervisorId: string | null;

  @Column({ type: 'text', nullable: true })
  comentariosSupervisor: string | null;

  @Column({ type: 'timestamp', nullable: true })
  revisadoAt: Date | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @ManyToOne(() => TipoPermiso, { eager: false, nullable: false })
  tipoPermiso: TipoPermiso;
}
