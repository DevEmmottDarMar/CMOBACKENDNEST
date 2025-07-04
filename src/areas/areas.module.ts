// src/areas/areas.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // <-- ¡Importar TypeOrmModule!
import { AreasService } from './areas.service';
import { AreasController } from './areas.controller';
import { Area } from './entities/area.entity'; // <-- ¡Importar la entidad Area!
import { User } from '../users/entities/user.entity'; // Si la entidad Area tiene relación inversa con User

@Module({
  imports: [
    TypeOrmModule.forFeature([Area, User]), // <-- ¡CRÍTICO! Registra la entidad Area (y User si la necesitas para relaciones en Area)
  ],
  controllers: [AreasController],
  providers: [AreasService],
  exports: [AreasService], // Exporta el servicio para que otros módulos puedan usarlo
})
export class AreasModule {}
