// src/trabajos/trabajos.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrabajosService } from './trabajos.service';
import { TrabajosController } from './trabajos.controller';
import { Trabajo } from './entities/trabajo.entity';
import { User } from '../users/entities/user.entity';
import { Area } from '../areas/entities/area.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Trabajo, User, Area])],
  controllers: [TrabajosController],
  providers: [TrabajosService],
  // 👇 ¡AÑADE ESTA LÍNEA PARA EXPORTAR EL SERVICIO!
  exports: [TrabajosService],
})
export class TrabajosModule {}
