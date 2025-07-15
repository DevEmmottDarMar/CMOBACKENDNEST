# CMO Backend NestJS

Backend para el sistema de gestión de permisos de trabajo CMO.

## Características

- Autenticación JWT
- Gestión de usuarios (técnicos, supervisores, administradores)
- Sistema de permisos de trabajo
- WebSockets para notificaciones en tiempo real
- Subida de imágenes a S3
- API documentada con Swagger

## Despliegue

Este proyecto está desplegado en Railway.

**Última actualización:** $(date)

## Endpoints principales

- `GET /health` - Health check
- `GET /status` - Status del servidor
- `GET /api` - Documentación Swagger 