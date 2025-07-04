// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// 👇 --- 1. IMPORTAR LAS CLASES DE SWAGGER ---
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 👇 --- 2. CONFIGURAR LA DOCUMENTACIÓN DE SWAGGER ---
  const config = new DocumentBuilder()
    .setTitle('API de Permisos de Trabajo')
    .setDescription(
      'Documentación de la API para el sistema de gestión de permisos y trabajos.',
    )
    .setVersion('1.0')
    .addTag('trabajos', 'Operaciones relacionadas a Trabajos') // Puedes agregar más tags
    .addTag('permisos', 'Operaciones relacionadas a Permisos')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // Elige la ruta para tu documentación, por ejemplo /api
  SwaggerModule.setup('api', app, document);
  // --------------------------------------------------------

  app.enableCors({
    origin: [
      /^http:\/\/localhost:\d+$/,
      'http://192.168.8.167:3000',
      'http://10.0.2.2:3000',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = configService.get<string>('PORT') || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`Application is running on: ${await app.getUrl()}`);
  // 👇 --- 3. AÑADIR UN LOG PARA LA URL DE SWAGGER ---
  console.log(`Swagger documentation is running on: ${await app.getUrl()}/api`);
}
bootstrap();
