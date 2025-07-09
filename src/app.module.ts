// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Importar TODAS las entidades
import { User } from './users/entities/user.entity';
import { Trabajo } from './trabajos/entities/trabajo.entity';
import { Permiso } from './permisos/entities/permiso.entity';
import { Area } from './areas/entities/area.entity';
import { TipoPermiso } from './tipos-permiso/entities/tipo-permiso.entity'; // <-- ¡IMPORTAR TipoPermiso!
import { Image } from './images/entities/image.entity';

// Importar módulos
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TrabajosModule } from './trabajos/trabajos.module';
import { PermisosModule } from './permisos/permisos.module';
import { EventsModule } from './events/events.module';
import { AreasModule } from './areas/areas.module';
import { TiposPermisoModule } from './tipos-permiso/tipos-permiso.module'; // <-- ¡IMPORTAR TiposPermisoModule!
import { S3Module } from './s3/s3.module';
import { ImagesModule } from './images/images.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [User, Trabajo, Permiso, Area, TipoPermiso, Image], // <-- ¡INCLUIR TipoPermiso en entities!
        synchronize: true, // ¡SOLO EN DESARROLLO!
        logging: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    TrabajosModule,
    PermisosModule,
    EventsModule,
    AreasModule,
    TiposPermisoModule, // <-- ¡INCLUIR TiposPermisoModule en imports!
    S3Module,
    ImagesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
