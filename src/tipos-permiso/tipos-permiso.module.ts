// src/tipos-permiso/tipos-permiso.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TiposPermisoService } from './tipos-permiso.service';
import { TiposPermisoController } from './tipos-permiso.controller';
import { TipoPermiso } from './entities/tipo-permiso.entity'; // <-- ¡Importa la entidad TipoPermiso!

@Module({
  imports: [TypeOrmModule.forFeature([TipoPermiso])], // <-- ¡Registra la entidad!
  controllers: [TiposPermisoController],
  providers: [TiposPermisoService],
  exports: [TiposPermisoService],
})
export class TiposPermisoModule {}