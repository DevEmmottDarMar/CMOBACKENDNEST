// src/tipos-permiso/entities/tipo-permiso.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Permiso } from '../../permisos/entities/permiso.entity';

@Entity('tipos_permiso')
export class TipoPermiso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  nombre: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ default: true })
  activo: boolean;

  // === CORRECCIÓN AQUÍ ===
  // La función lambda debe apuntar a la propiedad 'tipoPermiso' en la entidad Permiso
  @OneToMany(() => Permiso, (permiso) => permiso.tipoPermiso)
  permisos: Permiso[];
  // =====================

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
