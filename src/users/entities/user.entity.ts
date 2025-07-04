// src/users/entities/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Trabajo } from '../../trabajos/entities/trabajo.entity';
import { Permiso } from '../../permisos/entities/permiso.entity';
import { Area } from '../../areas/entities/area.entity'; // Importar la entidad Area

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 50, default: 'tecnico' })
  rol: string; // 'tecnico', 'supervisor', 'admin'

  // === CORRECCIÓN CLAVE AQUÍ: Simplificar la definición de areaId ===
  @ManyToOne(() => Area, (area) => area.users, { nullable: true })
  @JoinColumn({ name: 'areaId' })
  area: Area;

  // Usar 'uuid' como tipo explícito y remover 'length'
  @Column({ type: 'uuid', nullable: true }) // <-- ¡CORRECCIÓN!
  areaId: string | null;
  // ==========================================================

  @OneToMany(() => Trabajo, (trabajo) => trabajo.tecnicoAsignado)
  trabajosAsignados: Trabajo[];

  @OneToMany(() => Permiso, (permiso) => permiso.tecnico)
  permisosEnviados: Permiso[];

  @OneToMany(() => Permiso, (permiso) => permiso.supervisor)
  permisosRevisados: Permiso[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
