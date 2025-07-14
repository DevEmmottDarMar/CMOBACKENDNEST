// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WsAdapter } from '@nestjs/platform-ws'; // <-- ¡IMPORTAR WsAdapter!

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Deshabilitar el body parser por defecto
  });
  const configService = app.get(ConfigService);

  // Configurar Express para aceptar peticiones grandes ANTES de que NestJS configure el suyo
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use(require('express').json({ limit: '50mb' }));
  expressApp.use(require('express').urlencoded({ limit: '50mb', extended: true }));

  // === CONFIGURACIÓN DE SWAGGER ===
  const config = new DocumentBuilder()
    .setTitle('API de Sistema de Permisos de Trabajo')
    .setDescription(`
      ## Descripción General
      
      API completa para el sistema de gestión de permisos de trabajo. Permite a técnicos solicitar permisos para realizar trabajos específicos y a supervisores aprobar o rechazar estos permisos.
      
      ## Características Principales
      
      - **Gestión de Usuarios**: Crear y gestionar técnicos, supervisores y administradores
      - **Gestión de Áreas**: Organizar trabajos por áreas específicas
      - **Gestión de Trabajos**: Crear y asignar trabajos a técnicos
      - **Sistema de Permisos**: Solicitar, revisar y autorizar permisos de trabajo
      - **Tipos de Permiso**: Configurar diferentes tipos de permisos (altura, enganche, etc.)
      - **Subida de Imágenes**: Asociar imágenes a permisos mediante S3
      - **WebSockets**: Comunicación en tiempo real entre técnicos y supervisores
      
      ## Autenticación
      
      La API utiliza autenticación JWT. Para usar los endpoints protegidos:
      1. Obtén un token mediante POST /auth/login
      2. Incluye el token en el header: Authorization: Bearer {token}
      
      ## Roles de Usuario
      
      - **Técnico**: Puede solicitar permisos y ver sus propios permisos
      - **Supervisor**: Puede aprobar/rechazar permisos de su área
      - **Admin**: Acceso completo al sistema
    `)
    .setVersion('1.0')
    .addTag('auth', 'Autenticación y autorización de usuarios')
    .addTag('users', 'Gestión de usuarios (técnicos, supervisores, administradores)')
    .addTag('areas', 'Gestión de áreas de trabajo')
    .addTag('trabajos', 'Gestión de trabajos y asignaciones')
    .addTag('permisos', 'Sistema de permisos de trabajo')
    .addTag('tipos-permiso', 'Configuración de tipos de permisos')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa el token JWT obtenido del endpoint /auth/login',
        in: 'header',
      },
      'JWT-auth', // This name here is important for references
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'API Sistema de Permisos',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #2c3e50; font-size: 36px; }
      .swagger-ui .info .description { font-size: 16px; line-height: 1.6; }
    `,
  });
  // ================================

  // Configuración CORS simplificada y robusta
  app.enableCors({
    origin: true, // Permitir todos los orígenes temporalmente
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Configurar límite de tamaño para peticiones (para subida de imágenes)
  app.use((req, res, next) => {
    res.setHeader('Content-Length', '50mb');
    next();
  });

  // Configurar límite de tamaño para el body parser
  app.use((req, res, next) => {
    req.setTimeout(300000); // 5 minutos
    res.setTimeout(300000); // 5 minutos
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = configService.get<string>('PORT') || 3000;

  // === ¡CORRECCIÓN CLAVE AQUÍ: Usar el adaptador de WebSockets puros! ===
  app.useWebSocketAdapter(new WsAdapter(app)); // <--- Esto le dice a NestJS que use 'ws'
  // ====================================================================

  await app.listen(port, '0.0.0.0'); // Escuchar en todas las interfaces
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger documentation is running on: ${await app.getUrl()}/api`);
}
bootstrap();// CORS configurado para Flutter web
// Forzar redespliegue - Mon Jul 14 01:11:05 -04 2025
