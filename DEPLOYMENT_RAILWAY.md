# 🚀 Guía de Despliegue en Railway

## 📋 Requisitos Previos

1. **Cuenta en Railway**: [railway.app](https://railway.app)
2. **Cuenta en AWS** (para S3): [aws.amazon.com](https://aws.amazon.com)
3. **Base de datos PostgreSQL** (Railway puede proporcionar una)

## 🔧 Configuración en Railway

### 1. Conectar el Repositorio

1. Ve a [Railway Dashboard](https://railway.app/dashboard)
2. Haz clic en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Conecta tu repositorio de GitHub
5. Selecciona el repositorio `simple-permisos-backend`

### 2. Configurar Base de Datos

1. En tu proyecto de Railway, haz clic en "New Service"
2. Selecciona "Database" → "PostgreSQL"
3. Railway generará automáticamente la variable `DATABASE_URL`

### 3. Configurar Variables de Entorno

En la pestaña "Variables" de tu servicio, agrega:

```bash
# JWT Secret (genera uno seguro)
JWT_SECRET=tu_jwt_secret_super_seguro_aqui_cambialo

# AWS S3 (configura tu bucket)
AWS_ACCESS_KEY_ID=tu_access_key_id
AWS_SECRET_ACCESS_KEY=tu_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=tu-bucket-name

# Entorno
NODE_ENV=production

# CORS (agrega tu dominio de frontend)
CORS_ORIGIN=https://tu-frontend-domain.com,http://localhost:3000
```

### 4. Configurar Puerto

Railway asignará automáticamente el puerto, pero asegúrate de que tu aplicación use la variable `PORT`:

```typescript
const port = configService.get<string>('PORT') || 3000;
```

## 🚀 Despliegue

### Opción 1: Despliegue Automático

1. Conecta tu repositorio de GitHub
2. Railway detectará automáticamente que es un proyecto Node.js
3. Usará el comando `npm run start:prod` del `package.json`
4. Se desplegará automáticamente en cada push a `main`

### Opción 2: Despliegue Manual

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Inicializar proyecto
railway init

# Desplegar
railway up
```

## 🔍 Verificación del Despliegue

### 1. Health Check

Tu aplicación incluye un endpoint de health check en `/api` (Swagger).

### 2. Logs

Revisa los logs en Railway Dashboard para verificar que todo funcione correctamente.

### 3. Base de Datos

Railway creará automáticamente las tablas gracias a `synchronize: true` en desarrollo.

## 🛠️ Solución de Problemas

### Error de Conexión a Base de Datos

- Verifica que `DATABASE_URL` esté configurada correctamente
- En producción, SSL debe estar habilitado

### Error de CORS

- Agrega tu dominio de frontend a `CORS_ORIGIN`
- Separa múltiples dominios con comas

### Error de AWS S3

- Verifica que las credenciales de AWS sean correctas
- Asegúrate de que el bucket exista y tenga los permisos correctos

## 📝 Notas Importantes

1. **SSL**: En producción, Railway requiere SSL para la base de datos
2. **Variables de Entorno**: Nunca subas credenciales reales al repositorio
3. **Base de Datos**: Railway proporciona PostgreSQL automáticamente
4. **Dominio**: Railway asignará un dominio automáticamente

## 🔗 URLs Importantes

- **API**: `https://tu-app.railway.app`
- **Swagger**: `https://tu-app.railway.app/api`
- **Health Check**: `https://tu-app.railway.app/api`

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Railway Dashboard
2. Verifica las variables de entorno
3. Asegúrate de que todos los servicios estén conectados correctamente 