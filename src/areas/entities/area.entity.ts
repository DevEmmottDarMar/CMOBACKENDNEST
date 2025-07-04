// src/areas/entities/area.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Trabajo } from '../../trabajos/entities/trabajo.entity';
import { User } from '../../users/entities/user.entity';

@Entity('areas')
export class Area {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  nombre: string;

  @Column({ default: true })
  activo: boolean;

  // === CORRECCIÓN AQUÍ: Apuntar a la propiedad 'area' en la entidad Trabajo ===
  @OneToMany(() => Trabajo, (trabajo) => trabajo.area) // La entidad Trabajo tiene una propiedad 'area'
  trabajos: Trabajo[];

  @OneToMany(() => User, (user) => user.area)
  users: User[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
