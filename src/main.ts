import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Configuración CORS
  app.enableCors({
    origin: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  });

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Sistema de Permisos de Trabajo')
    .setDescription('API completa para el sistema de gestión de permisos de trabajo')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Configuración de validación
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuración de WebSocket
  app.useWebSocketAdapter(new WsAdapter(app));

  const port = configService.get<string>('PORT') || 3000;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Application is running on: ${await app.getUrl()}`);
  console.log(`📚 Swagger documentation: ${await app.getUrl()}/api`);
  console.log(`❤️  Health check: ${await app.getUrl()}/health`);
}
bootstrap();
