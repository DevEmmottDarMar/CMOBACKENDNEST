# Módulo de Imágenes

Este módulo proporciona funcionalidades completas para gestionar imágenes en el sistema, incluyendo subida a AWS S3, almacenamiento en base de datos y relaciones con otras entidades.

## Características

- ✅ Subida de imágenes a AWS S3
- ✅ Soporte para archivos multipart y Base64
- ✅ Relaciones con Usuarios, Permisos y Trabajos
- ✅ URLs firmadas para acceso seguro
- ✅ Validación de DTOs
- ✅ Documentación Swagger completa
- ✅ Logging detallado

## Estructura de la Base de Datos

### Tabla `images`
- `id` (UUID, Primary Key)
- `s3Key` (VARCHAR, Unique) - Clave del archivo en S3
- `url` (VARCHAR) - URL pública de la imagen
- `altText` (VARCHAR, Nullable) - Texto alternativo para accesibilidad
- `mimetype` (VARCHAR) - Tipo MIME del archivo
- `size` (BIGINT) - Tamaño del archivo en bytes
- `uploadedById` (UUID, Nullable) - Usuario que subió la imagen
- `permisoId` (UUID, Nullable) - Permiso relacionado
- `trabajoId` (UUID, Nullable) - Trabajo relacionado
- `createdAt` (TIMESTAMP) - Fecha de creación

## Endpoints Disponibles

### 1. Crear Imagen
- **POST** `/images`
- **Body**: `CreateImageDto`

### 2. Subir Imagen (Multipart)
- **POST** `/images/upload`
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `file`: Archivo de imagen
  - `altText` (opcional): Texto alternativo
  - `uploadedById` (opcional): ID del usuario
  - `permisoId` (opcional): ID del permiso
  - `trabajoId` (opcional): ID del trabajo

### 3. Subir Imagen Base64
- **POST** `/images/upload-base64`
- **Body**:
  ```json
  {
    "base64Data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    "contentType": "image/jpeg",
    "altText": "Descripción de la imagen",
    "uploadedById": "uuid-del-usuario",
    "permisoId": "uuid-del-permiso",
    "trabajoId": "uuid-del-trabajo"
  }
  ```

### 4. Obtener Todas las Imágenes
- **GET** `/images`

### 5. Obtener Imagen por ID
- **GET** `/images/:id`

### 6. Obtener Imágenes por Permiso
- **GET** `/images/by-permiso/:permisoId`

### 7. Obtener Imágenes por Trabajo
- **GET** `/images/by-trabajo/:trabajoId`

### 8. Obtener Imágenes por Usuario
- **GET** `/images/by-user/:userId`

### 9. Obtener URL Firmada
- **GET** `/images/:id/signed-url?expiresIn=3600`

### 10. Actualizar Imagen
- **PATCH** `/images/:id`
- **Body**: `UpdateImageDto`

### 11. Eliminar Imagen
- **DELETE** `/images/:id`

## Relaciones

### Con Usuario
- Un usuario puede subir múltiples imágenes
- Relación: `User` → `Image` (OneToMany)

### Con Permiso
- Un permiso puede tener múltiples imágenes
- Relación: `Permiso` → `Image` (OneToMany)

### Con Trabajo
- Un trabajo puede tener múltiples imágenes
- Relación: `Trabajo` → `Image` (OneToMany)

## Uso en Otros Servicios

```typescript
import { ImagesService } from '../images/images.service';

@Injectable()
export class MiServicio {
  constructor(private readonly imagesService: ImagesService) {}

  async subirImagenParaPermiso(
    file: Express.Multer.File,
    permisoId: string,
    userId: string,
  ) {
    return await this.imagesService.uploadImage(file, {
      permisoId,
      uploadedById: userId,
      altText: 'Imagen del permiso',
    });
  }

  async obtenerImagenesDePermiso(permisoId: string) {
    return await this.imagesService.findByPermiso(permisoId);
  }
}
```

## Configuración Requerida

Asegúrate de tener configuradas las variables de entorno para AWS S3:

```env
AWS_ACCESS_KEY_ID=tu_access_key_id
AWS_SECRET_ACCESS_KEY=tu_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=tu-bucket-name
```

## Validaciones

- Los archivos deben ser imágenes válidas
- El tamaño máximo recomendado es 10MB
- Los tipos MIME soportados: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- Las claves S3 deben ser únicas
- Los UUIDs deben ser válidos para las relaciones

## Seguridad

- Las imágenes se suben con ACL público para facilitar el acceso
- Se generan URLs firmadas para acceso temporal seguro
- Se valida el tipo MIME de los archivos
- Se calcula el tamaño real de los archivos Base64 