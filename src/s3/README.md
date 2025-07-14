# Servicio AWS S3

Este módulo proporciona funcionalidades para interactuar con Amazon S3, incluyendo subida, descarga y eliminación de archivos.

## Configuración

Agrega las siguientes variables de entorno a tu archivo `.env`:

```env
AWS_ACCESS_KEY_ID=tu_access_key_id
AWS_SECRET_ACCESS_KEY=tu_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=tu-bucket-name
```

## Endpoints Disponibles

### 1. Subir Archivo (Multipart)
- **POST** `/s3/upload`
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `file`: Archivo a subir
  - `key`: Clave única para el archivo en S3

### 2. Subir Archivo Base64
- **POST** `/s3/upload-base64`
- **Body**:
  ```json
  {
    "base64Data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    "key": "uploads/images/profile-123.jpg",
    "contentType": "image/jpeg"
  }
  ```

### 3. Obtener URL Firmada
- **GET** `/s3/download/:key?expiresIn=3600`
- **Parámetros**:
  - `key`: Clave del archivo en S3
  - `expiresIn`: Tiempo de expiración en segundos (opcional, default: 3600)

### 4. Eliminar Archivo
- **DELETE** `/s3/:key`
- **Parámetros**:
  - `key`: Clave del archivo en S3

## Uso en Otros Servicios

Para usar el servicio S3 en otros módulos:

```typescript
import { S3Service } from '../s3/s3.service';

@Injectable()
export class MiServicio {
  constructor(private readonly s3Service: S3Service) {}

  async subirImagen(archivo: Express.Multer.File) {
    const key = `uploads/images/${Date.now()}-${archivo.originalname}`;
    return await this.s3Service.uploadFile(archivo, key);
  }
}
```

## Características

- ✅ Subida de archivos multipart
- ✅ Subida de archivos Base64
- ✅ URLs firmadas para descarga segura
- ✅ Eliminación de archivos
- ✅ Logging detallado
- ✅ Manejo de errores
- ✅ Documentación Swagger
- ✅ Validación de DTOs 