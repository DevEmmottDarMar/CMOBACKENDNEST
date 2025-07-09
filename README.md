# Sistema de Permisos de Trabajo - Backend

Backend completo para un sistema de gestión de permisos de trabajo desarrollado con NestJS, TypeScript y PostgreSQL.

## 🚀 Características

- **Autenticación JWT**: Sistema seguro de autenticación con tokens JWT
- **Gestión de Usuarios**: Técnicos, supervisores y administradores
- **Gestión de Áreas**: Organización de trabajos por áreas específicas
- **Sistema de Permisos**: Solicitud, revisión y autorización de permisos
- **Subida de Imágenes**: Integración con AWS S3 para almacenamiento de imágenes
- **WebSockets**: Comunicación en tiempo real entre usuarios
- **Documentación Completa**: API completamente documentada con Swagger/OpenAPI

## 📋 Prerrequisitos

- Node.js (v18 o superior)
- PostgreSQL (v12 o superior)
- AWS S3 (para almacenamiento de imágenes)

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd simple-permisos-backend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Editar `.env` con tus configuraciones:
   ```env
   # Base de datos
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=tu_password
   DB_DATABASE=permisos_db
   
   # JWT
   JWT_SECRET=tu_jwt_secret_super_seguro
   
   # AWS S3
   AWS_ACCESS_KEY_ID=tu_access_key
   AWS_SECRET_ACCESS_KEY=tu_secret_key
   AWS_REGION=sa-east-1
   AWS_S3_BUCKET=tu_bucket_name
   
   # Puerto del servidor
   PORT=3000
   ```

4. **Ejecutar migraciones**
   ```bash
   npm run migration:run
   ```

5. **Iniciar el servidor**
   ```bash
   npm run start:dev
   ```

## 📚 Documentación de la API

### Acceso a Swagger UI

Una vez que el servidor esté ejecutándose, puedes acceder a la documentación interactiva de la API en:

```
http://localhost:3000/api
```

### Características de la Documentación

- **Documentación Completa**: Todos los endpoints, DTOs y entidades están completamente documentados
- **Ejemplos de Uso**: Cada endpoint incluye ejemplos de request y response
- **Autenticación Integrada**: Puedes probar endpoints protegidos directamente desde Swagger UI
- **Validación en Tiempo Real**: Los esquemas de validación están integrados
- **Organización por Tags**: Endpoints organizados por funcionalidad

### Estructura de la Documentación

La API está organizada en los siguientes módulos:

#### 🔐 Auth
- **POST /auth/login**: Iniciar sesión y obtener token JWT

#### 👥 Users
- **POST /users**: Crear nuevo usuario
- **GET /users**: Obtener todos los usuarios
- **GET /users/tecnicos**: Obtener solo técnicos
- **GET /users/:id**: Obtener usuario por ID
- **GET /users/area/:areaId**: Obtener usuarios por área
- **PATCH /users/:id**: Actualizar usuario
- **DELETE /users/:id**: Eliminar usuario

#### 🏢 Areas
- **POST /areas**: Crear nueva área
- **GET /areas**: Obtener todas las áreas
- **GET /areas/:id**: Obtener área por ID
- **PATCH /areas/:id**: Actualizar área
- **DELETE /areas/:id**: Eliminar área

#### 🔧 Trabajos
- **POST /trabajos**: Crear nuevo trabajo
- **GET /trabajos**: Obtener todos los trabajos
- **GET /trabajos/:id**: Obtener trabajo por ID
- **PATCH /trabajos/:id**: Actualizar trabajo
- **DELETE /trabajos/:id**: Eliminar trabajo

#### 📋 Permisos
- **POST /permisos**: Crear nuevo permiso
- **GET /permisos/tecnico/:tecnicoId**: Obtener permisos por técnico
- **GET /permisos/by-trabajo/:trabajoId**: Obtener permisos por trabajo
- **GET /permisos/pendientes**: Obtener permisos pendientes
- **GET /permisos/:id**: Obtener permiso por ID
- **PATCH /permisos/:id/authorize**: Autorizar/rechazar permiso
- **DELETE /permisos/:id**: Eliminar permiso
- **POST /permisos/upload-image**: Subir imagen para permiso

#### 🏷️ Tipos de Permiso
- **POST /tipos-permiso**: Crear nuevo tipo de permiso
- **GET /tipos-permiso**: Obtener todos los tipos
- **GET /tipos-permiso/:id**: Obtener tipo por ID
- **PATCH /tipos-permiso/:id**: Actualizar tipo
- **DELETE /tipos-permiso/:id**: Eliminar tipo

## 🔐 Autenticación

### Obtener Token JWT

1. Ve a `POST /auth/login` en Swagger UI
2. Proporciona las credenciales:
   ```json
   {
     "email": "usuario@example.com",
     "password": "password123"
   }
   ```
3. Copia el token JWT de la respuesta

### Usar Token JWT

1. En Swagger UI, haz clic en el botón "Authorize" (🔒)
2. Ingresa el token en el formato: `Bearer tu_token_aqui`
3. Haz clic en "Authorize"
4. Ahora puedes probar todos los endpoints protegidos

## 👥 Roles de Usuario

### Técnico
- Puede solicitar permisos para trabajos asignados
- Puede ver sus propios permisos
- Puede subir imágenes para sus permisos
- Recibe notificaciones en tiempo real

### Supervisor
- Puede ver permisos pendientes de su área
- Puede aprobar o rechazar permisos
- Puede ver técnicos conectados de su área
- Recibe notificaciones en tiempo real

### Administrador
- Acceso completo a todas las funcionalidades
- Puede gestionar usuarios, áreas, trabajos y tipos de permiso
- Puede ver todos los permisos del sistema

## 🌐 WebSockets

El sistema incluye comunicación en tiempo real mediante WebSockets:

- **Conexión**: `ws://localhost:3000`
- **Autenticación**: Enviar token JWT en el mensaje de conexión
- **Eventos**:
  - `userList`: Lista de usuarios conectados
  - `permisoUpdate`: Actualizaciones de permisos
  - `notification`: Notificaciones generales

## 🗄️ Base de Datos

### Entidades Principales

- **User**: Usuarios del sistema (técnicos, supervisores, admin)
- **Area**: Áreas de trabajo
- **Trabajo**: Trabajos asignados a técnicos
- **Permiso**: Permisos solicitados por técnicos
- **TipoPermiso**: Tipos de permisos disponibles

### Relaciones

- Un usuario pertenece a un área (opcional para admin)
- Un trabajo pertenece a un área
- Un trabajo puede tener múltiples permisos
- Un permiso pertenece a un trabajo, técnico y tipo de permiso

## 🚀 Comandos Útiles

```bash
# Desarrollo
npm run start:dev

# Producción
npm run start:prod

# Tests
npm run test
npm run test:e2e

# Migraciones
npm run migration:generate
npm run migration:run
npm run migration:revert

# Linting
npm run lint
npm run lint:fix

# Formateo
npm run format
```

## 📝 Ejemplos de Uso

### Crear un Técnico
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Carlos Técnico",
    "email": "carlos@example.com",
    "password": "password123",
    "rol": "tecnico",
    "areaId": "uuid-del-area"
  }'
```

### Solicitar un Permiso
```bash
curl -X POST http://localhost:3000/permisos \
  -H "Authorization: Bearer tu_token_jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "trabajoId": "uuid-del-trabajo",
    "tecnicoId": "uuid-del-tecnico",
    "tipoPermisoId": "uuid-del-tipo-permiso",
    "estado": "pendiente",
    "comentariosTecnico": "Necesito acceso a áreas elevadas"
  }'
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación en Swagger UI
2. Verifica los logs del servidor
3. Asegúrate de que todas las variables de entorno estén configuradas correctamente
4. Abre un issue en el repositorio

---

**¡Disfruta usando el Sistema de Permisos de Trabajo! 🎉**
