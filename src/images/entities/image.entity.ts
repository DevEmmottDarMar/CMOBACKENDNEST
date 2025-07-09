import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Permiso } from '../../permisos/entities/permiso.entity';
import { Trabajo } from '../../trabajos/entities/trabajo.entity';

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  s3Key: string; // La clave del objeto en S3 (path/filename.ext)

  @Column({ type: 'varchar', length: 500 })
  url: string; // La URL pública de la imagen

  @Column({ type: 'varchar', nullable: true })
  altText: string | null; // Texto alternativo para accesibilidad

  @Column({ type: 'varchar' })
  mimetype: string; // Tipo MIME del archivo

  @Column({ type: 'bigint' })
  size: number; // Tamaño del archivo en bytes

  // Relaciones (opcionales, según cómo quieras vincular las imágenes)
  @ManyToOne(() => User, user => user.imagenesSubidas, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy: User | null;
  @Column({ type: 'uuid', nullable: true })
  uploadedById: string | null;

  @ManyToOne(() => Permiso, permiso => permiso.images, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'permisoId' })
  permiso: Permiso | null;
  @Column({ type: 'uuid', nullable: true })
  permisoId: string | null;

  @ManyToOne(() => Trabajo, trabajo => trabajo.images, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'trabajoId' })
  trabajo: Trabajo | null;
  @Column({ type: 'uuid', nullable: true })
  trabajoId: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
} 