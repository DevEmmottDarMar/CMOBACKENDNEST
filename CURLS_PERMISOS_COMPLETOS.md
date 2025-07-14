# 🔗 cURLs Completos - Flujo de Permisos CMO

## 📋 Índice

1. [Autenticación](#autenticación)
2. [Gestión de Permisos](#gestión-de-permisos)
3. [Gestión de Fotos](#gestión-de-fotos)
4. [Aprobación de Permisos](#aprobación-de-permisos)
5. [Utilidades](#utilidades)

---

## 🔐 Autenticación

### Login Técnico
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tecnico1@demo.com",
    "password": "123456"
  }'
```

### Login Supervisor
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "supervisor1@demo.com",
    "password": "123456"
  }'
```

### Login Admin
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin1@demo.com",
    "password": "123456"
  }'
```

---

## 📋 Gestión de Permisos

### 1. Crear Permiso ALTURA
```bash
curl -X POST http://localhost:3000/permisos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "trabajoId": "e1d68650-a7c2-435e-9623-7e4249e8f00e",
    "tecnicoId": "8476471a-4c5c-4938-9f0f-7b8ac9242b4c",
    "tipoPermisoId": "45f2674e-efdd-4e71-b727-6c6cbc4ed3eb",
    "estado": "pendiente",
    "comentariosTecnico": "Necesito acceso a áreas elevadas para realizar el mantenimiento"
  }'
```

### 2. Crear Permiso ENGANCHE
```bash
curl -X POST http://localhost:3000/permisos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "trabajoId": "e1d68650-a7c2-435e-9623-7e4249e8f00e",
    "tecnicoId": "8476471a-4c5c-4938-9f0f-7b8ac9242b4c",
    "tipoPermisoId": "6e680ae5-97d6-4944-86a1-7d2e5c36d05e",
    "estado": "pendiente",
    "comentariosTecnico": "Necesito realizar trabajos de enganche en la zona"
  }'
```

### 3. Crear Permiso CIERRE
```bash
curl -X POST http://localhost:3000/permisos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "trabajoId": "e1d68650-a7c2-435e-9623-7e4249e8f00e",
    "tecnicoId": "8476471a-4c5c-4938-9f0f-7b8ac9242b4c",
    "tipoPermisoId": "f4d943b0-82c2-4a81-abeb-64bf6fca1ddd",
    "estado": "pendiente",
    "comentariosTecnico": "Necesito realizar trabajos de cierre en el área"
  }'
```

### 4. Obtener Permisos Pendientes
```bash
curl -X GET http://localhost:3000/permisos/pendientes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Obtener Permisos por Técnico
```bash
curl -X GET http://localhost:3000/permisos/tecnico/8476471a-4c5c-4938-9f0f-7b8ac9242b4c \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Obtener Permisos por Trabajo
```bash
curl -X GET http://localhost:3000/permisos/by-trabajo/e1d68650-a7c2-435e-9623-7e4249e8f00e \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 7. Obtener Permiso por ID
```bash
curl -X GET http://localhost:3000/permisos/a1b2c3d4-e5f6-7890-1234-567890abcdef \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 8. Eliminar Permiso
```bash
curl -X DELETE http://localhost:3000/permisos/a1b2c3d4-e5f6-7890-1234-567890abcdef \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📸 Gestión de Fotos

### Subir Foto del Permiso
```bash
curl -X POST http://localhost:3000/permisos/upload-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "permisoId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "base64Data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
  }'
```

### Subir Foto con Archivo Real
```bash
# Convertir imagen a base64
base64 -i imagen.jpg | tr -d '\n' > imagen_base64.txt

# Usar el contenido en el cURL
curl -X POST http://localhost:3000/permisos/upload-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "permisoId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "base64Data": "data:image/jpeg;base64,'$(cat imagen_base64.txt)'"
  }'
```

---

## ✅ Aprobación de Permisos

### Aprobar Permiso
```bash
curl -X PATCH http://localhost:3000/permisos/a1b2c3d4-e5f6-7890-1234-567890abcdef/authorize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "estado": "aprobado",
    "supervisorId": "2879a157-654d-46ed-be30-3554a0b7a40d",
    "comentariosSupervisor": "Permiso aprobado. Asegúrate de usar el equipo de protección"
  }'
```

### Rechazar Permiso
```bash
curl -X PATCH http://localhost:3000/permisos/a1b2c3d4-e5f6-7890-1234-567890abcdef/authorize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "estado": "rechazado",
    "supervisorId": "2879a157-654d-46ed-be30-3554a0b7a40d",
    "comentariosSupervisor": "Faltan puntos de anclaje verificados"
  }'
```

---

## 🔧 Utilidades

### Obtener Tipos de Permiso
```bash
curl -X GET http://localhost:3000/tipos-permiso \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Obtener Trabajos
```bash
curl -X GET http://localhost:3000/trabajos \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Obtener Usuarios
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Obtener Áreas
```bash
curl -X GET http://localhost:3000/areas \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Obtener Roles
```bash
curl -X GET http://localhost:3000/roles \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎯 Flujo Completo de Ejemplo

### Paso 1: Login Técnico
```bash
# Obtener token del técnico
TOKEN_TECNICO=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "tecnico1@demo.com", "password": "123456"}' | jq -r '.access_token')

echo "Token técnico: $TOKEN_TECNICO"
```

### Paso 2: Crear Permiso ALTURA
```bash
# Crear permiso de altura
PERMISO_ID=$(curl -s -X POST http://localhost:3000/permisos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_TECNICO" \
  -d '{
    "trabajoId": "e1d68650-a7c2-435e-9623-7e4249e8f00e",
    "tecnicoId": "8476471a-4c5c-4938-9f0f-7b8ac9242b4c",
    "tipoPermisoId": "45f2674e-efdd-4e71-b727-6c6cbc4ed3eb",
    "estado": "pendiente",
    "comentariosTecnico": "Necesito acceso a áreas elevadas"
  }' | jq -r '.id')

echo "Permiso creado: $PERMISO_ID"
```

### Paso 3: Subir Foto
```bash
# Subir foto del permiso
curl -X POST http://localhost:3000/permisos/upload-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_TECNICO" \
  -d "{
    \"permisoId\": \"$PERMISO_ID\",
    \"base64Data\": \"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=\"
  }"
```

### Paso 4: Login Supervisor
```bash
# Obtener token del supervisor
TOKEN_SUPERVISOR=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "supervisor1@demo.com", "password": "123456"}' | jq -r '.access_token')

echo "Token supervisor: $TOKEN_SUPERVISOR"
```

### Paso 5: Ver Permisos Pendientes
```bash
# Ver permisos pendientes
curl -X GET http://localhost:3000/permisos/pendientes \
  -H "Authorization: Bearer $TOKEN_SUPERVISOR"
```

### Paso 6: Aprobar Permiso
```bash
# Aprobar el permiso
curl -X PATCH http://localhost:3000/permisos/$PERMISO_ID/authorize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_SUPERVISOR" \
  -d '{
    "estado": "aprobado",
    "supervisorId": "2879a157-654d-46ed-be30-3554a0b7a40d",
    "comentariosSupervisor": "Permiso aprobado"
  }'
```

---

## 📝 Variables Importantes

```bash
# URLs
BASE_URL="http://localhost:3000"

# IDs de Usuarios
TECNICO_ID="8476471a-4c5c-4938-9f0f-7b8ac9242b4c"
SUPERVISOR_ID="2879a157-654d-46ed-be30-3554a0b7a40d"
ADMIN_ID="admin-uuid-here"

# IDs de Trabajos
TRABAJO_ID="e1d68650-a7c2-435e-9623-7e4249e8f00e"

# IDs de Tipos de Permiso
TIPO_ALTURA="45f2674e-efdd-4e71-b727-6c6cbc4ed3eb"
TIPO_ENGANCHE="6e680ae5-97d6-4944-86a1-7d2e5c36d05e"
TIPO_CIERRE="f4d943b0-82c2-4a81-abeb-64bf6fca1ddd"

# IDs de Áreas
AREA_CENTRO="11873221-e21e-4a10-8d6f-2cd86df5e581"
AREA_SUR="70ddbbf7-1c1f-4083-a578-ad8059960ad4"
```

---

## 🔍 Script de Prueba Completo

```bash
#!/bin/bash

# Script de prueba completo del flujo de permisos
echo "🚀 Iniciando prueba del flujo de permisos..."

# Variables
BASE_URL="http://localhost:3000"
TECNICO_EMAIL="tecnico1@demo.com"
SUPERVISOR_EMAIL="supervisor1@demo.com"
PASSWORD="123456"

# Paso 1: Login Técnico
echo "📝 Paso 1: Login Técnico"
TOKEN_TECNICO=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TECNICO_EMAIL\", \"password\": \"$PASSWORD\"}" | jq -r '.access_token')

if [ "$TOKEN_TECNICO" = "null" ] || [ -z "$TOKEN_TECNICO" ]; then
  echo "❌ Error: No se pudo obtener token del técnico"
  exit 1
fi
echo "✅ Token técnico obtenido"

# Paso 2: Crear Permiso
echo "📝 Paso 2: Crear Permiso ALTURA"
PERMISO_RESPONSE=$(curl -s -X POST $BASE_URL/permisos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_TECNICO" \
  -d '{
    "trabajoId": "e1d68650-a7c2-435e-9623-7e4249e8f00e",
    "tecnicoId": "8476471a-4c5c-4938-9f0f-7b8ac9242b4c",
    "tipoPermisoId": "45f2674e-efdd-4e71-b727-6c6cbc4ed3eb",
    "estado": "pendiente",
    "comentariosTecnico": "Prueba de permiso desde script"
  }')

PERMISO_ID=$(echo $PERMISO_RESPONSE | jq -r '.id')
if [ "$PERMISO_ID" = "null" ] || [ -z "$PERMISO_ID" ]; then
  echo "❌ Error: No se pudo crear el permiso"
  echo "Respuesta: $PERMISO_RESPONSE"
  exit 1
fi
echo "✅ Permiso creado: $PERMISO_ID"

# Paso 3: Login Supervisor
echo "📝 Paso 3: Login Supervisor"
TOKEN_SUPERVISOR=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$SUPERVISOR_EMAIL\", \"password\": \"$PASSWORD\"}" | jq -r '.access_token')

if [ "$TOKEN_SUPERVISOR" = "null" ] || [ -z "$TOKEN_SUPERVISOR" ]; then
  echo "❌ Error: No se pudo obtener token del supervisor"
  exit 1
fi
echo "✅ Token supervisor obtenido"

# Paso 4: Aprobar Permiso
echo "📝 Paso 4: Aprobar Permiso"
AUTORIZACION_RESPONSE=$(curl -s -X PATCH $BASE_URL/permisos/$PERMISO_ID/authorize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_SUPERVISOR" \
  -d '{
    "estado": "aprobado",
    "supervisorId": "2879a157-654d-46ed-be30-3554a0b7a40d",
    "comentariosSupervisor": "Aprobado desde script de prueba"
  }')

ESTADO_FINAL=$(echo $AUTORIZACION_RESPONSE | jq -r '.estado')
if [ "$ESTADO_FINAL" = "aprobado" ]; then
  echo "✅ Permiso aprobado exitosamente"
else
  echo "❌ Error: No se pudo aprobar el permiso"
  echo "Respuesta: $AUTORIZACION_RESPONSE"
  exit 1
fi

echo "🎉 ¡Flujo de permisos completado exitosamente!"
```

---

## 📊 Códigos de Respuesta

| Código | Descripción |
|--------|-------------|
| 200 | ✅ Operación exitosa |
| 201 | ✅ Recurso creado exitosamente |
| 400 | ❌ Datos inválidos o error de validación |
| 401 | ❌ No autorizado - Token requerido |
| 403 | ❌ Prohibido - Rol insuficiente |
| 404 | ❌ Recurso no encontrado |
| 500 | ❌ Error interno del servidor |

---

## 💡 Tips de Uso

1. **Reemplaza `YOUR_TOKEN`** con el token obtenido del login
2. **Usa `jq`** para procesar respuestas JSON en scripts
3. **Guarda los IDs** de los recursos creados para usarlos en siguientes requests
4. **Verifica los códigos de respuesta** para detectar errores
5. **Usa variables de entorno** para configuraciones 