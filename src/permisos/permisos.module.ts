// src/permisos/permisos.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermisosService } from './permisos.service';
import { PermisosController } from './permisos.controller';
import { Permiso } from './entities/permiso.entity';
import { Trabajo } from '../trabajos/entities/trabajo.entity';
import { User } from '../users/entities/user.entity';
import { EventsModule } from '../events/events.module';
import { TrabajosModule } from '../trabajos/trabajos.module';

// === IMPORTAR EL MÓDULO DE TIPOS DE PERMISO ===
import { TipoPermiso } from '../tipos-permiso/entities/tipo-permiso.entity'; // Importa la entidad
import { TiposPermisoModule } from '../tipos-permiso/tipos-permiso.module'; // <-- ¡IMPORTAR EL MÓDULO!
// ===========================================

@Module({
  imports: [
    TypeOrmModule.forFeature([Permiso, Trabajo, User, TipoPermiso]), // <-- ¡Asegúrate de que TipoPermiso esté aquí!
    EventsModule,
    TrabajosModule,
    TiposPermisoModule, // <-- ¡AGREGAR TiposPermisoModule a los imports!
  ],
  controllers: [PermisosController],
  providers: [PermisosService],
  exports: [PermisosService],
})
export class PermisosModule {}
