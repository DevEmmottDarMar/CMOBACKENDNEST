# 📋 FLUJO PLANIFICADOR - Creación y Gestión de Trabajos

## 🎯 Descripción General

Este flujo permite al **Planificador** crear, asignar y gestionar trabajos de mantenimiento en el sistema CMO. El planificador puede crear trabajos, asignar técnicos, definir áreas de trabajo y establecer el tipo de permiso requerido.

## 🔐 Autenticación

### Login como Planificador

```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "planificador1@demo.com",
  "password": "123456"
}
```

**Respuesta exitosa:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "nombre": "Carlos Planificador",
    "email": "planificador1@demo.com",
    "role": {
      "id": "role-planificador-id",
      "nombre": "Planificador"
    },
    "area": {
      "id": "area-id",
      "nombre": "Área de Planificación"
    }
  }
}
```

## 🏢 Gestión de Áreas

### Obtener Áreas Disponibles

```bash
GET http://localhost:3000/areas
Authorization: Bearer {{access_token}}
```

**Respuesta:**

```json
[
  {
    "id": "11873221-e21e-4a10-8d6f-2cd86df5e581",
    "nombre": "CYR CENTRO",
    "descripcion": "Área Centro de Operaciones",
    "activo": true
  },
  {
    "id": "70ddbbf7-1c1f-4083-a578-ad8059960ad4",
    "nombre": "CYR SUR",
    "descripcion": "Área Sur de Operaciones",
    "activo": true
  }
]
```

## 🔧 Creación de Trabajos

### 1. Crear Trabajo - Instalación de Transformador

```bash
POST http://localhost:3000/trabajos
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "titulo": "Instalación de Transformador CYR SUR",
  "descripcion": "Instalación de nuevo transformador de 500 KVA en subestación CYR SUR. Incluye conexión de alta tensión y pruebas de funcionamiento.",
  "areaId": "70ddbbf7-1c1f-4083-a578-ad8059960ad4",
  "tecnicoAsignadoId": "30e8713d-6f23-4b09-8c06-e948e20ccf16",
  "estado": "pendiente",
  "fechaProgramada": "2024-01-15T08:00:00.000Z",
  "siguienteTipoPermiso": "altura",
  "comentarios": "Trabajo requiere permisos de altura, enganche y cierre. Coordinar con equipo de seguridad."
}
```

**Respuesta exitosa:**

```json
{
  "id": "350c3256-2b34-452a-b488-91eadb1e5e52",
  "titulo": "Instalación de Transformador CYR SUR",
  "descripcion": "Instalación de nuevo transformador de 500 KVA en subestación CYR SUR. Incluye conexión de alta tensión y pruebas de funcionamiento.",
  "estado": "pendiente",
  "fechaProgramada": "2024-01-15T08:00:00.000Z",
  "siguienteTipoPermiso": "altura",
  "comentarios": "Trabajo requiere permisos de altura, enganche y cierre. Coordinar con equipo de seguridad.",
  "fechaCreacion": "2024-01-10T10:30:00.000Z",
  "area": {
    "id": "70ddbbf7-1c1f-4083-a578-ad8059960ad4",
    "nombre": "CYR SUR"
  },
  "tecnicoAsignado": {
    "id": "30e8713d-6f23-4b09-8c06-e948e20ccf16",
    "nombre": "Juan Técnico",
    "email": "tecnico1@demo.com"
  }
}
```

### 2. Crear Trabajo - Mantenimiento Preventivo

```bash
POST http://localhost:3000/trabajos
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "titulo": "Mantenimiento Preventivo Red Eléctrica Centro",
  "descripcion": "Mantenimiento preventivo de la red eléctrica del área centro. Incluye revisión de conexiones, limpieza de aisladores y verificación de sistemas de protección.",
  "areaId": "11873221-e21e-4a10-8d6f-2cd86df5e581",
  "tecnicoAsignadoId": "30e8713d-6f23-4b09-8c06-e948e20ccf16",
  "estado": "pendiente",
  "fechaProgramada": "2024-01-16T09:00:00.000Z",
  "siguienteTipoPermiso": "enganche",
  "comentarios": "Requiere coordinación con operaciones para desenergizar circuitos."
}
```

## 📊 Gestión de Trabajos

### Verificar Trabajos Creados

```bash
GET http://localhost:3000/trabajos
Authorization: Bearer {{access_token}}
```

**Respuesta:**

```json
[
  {
    "id": "350c3256-2b34-452a-b488-91eadb1e5e52",
    "titulo": "Instalación de Transformador CYR SUR",
    "estado": "pendiente",
    "fechaProgramada": "2024-01-15T08:00:00.000Z",
    "area": {
      "id": "70ddbbf7-1c1f-4083-a578-ad8059960ad4",
      "nombre": "CYR SUR"
    },
    "tecnicoAsignado": {
      "id": "30e8713d-6f23-4b09-8c06-e948e20ccf16",
      "nombre": "Juan Técnico"
    }
  },
  {
    "id": "trabajo-centro-id",
    "titulo": "Mantenimiento Preventivo Red Eléctrica Centro",
    "estado": "pendiente",
    "fechaProgramada": "2024-01-16T09:00:00.000Z",
    "area": {
      "id": "11873221-e21e-4a10-8d6f-2cd86df5e581",
      "nombre": "CYR CENTRO"
    },
    "tecnicoAsignado": {
      "id": "30e8713d-6f23-4b09-8c06-e948e20ccf16",
      "nombre": "Juan Técnico"
    }
  }
]
```

### Actualizar Estado de Trabajo

```bash
PATCH http://localhost:3000/trabajos/350c3256-2b34-452a-b488-91eadb1e5e52
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "estado": "en_progreso",
  "fechaInicioReal": "2024-01-15T08:30:00.000Z",
  "comentarios": "Trabajo iniciado según cronograma. Técnico en sitio."
}
```

### Reasignar Técnico

```bash
PATCH http://localhost:3000/trabajos/{{trabajo_id}}
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "tecnicoAsignadoId": "30e8713d-6f23-4b09-8c06-e948e20ccf16",
  "comentarios": "Reasignación por disponibilidad de técnico especializado."
}
```

## 🎯 Campos del DTO CreateTrabajoDto

### Campos Obligatorios

- **titulo**: string (5-200 caracteres)
- **descripcion**: string (10-1000 caracteres)
- **areaId**: UUID del área donde se realizará el trabajo
- **estado**: enum ['pendiente', 'en_progreso', 'completado', 'cancelado']

### Campos Opcionales

- **tecnicoAsignadoId**: UUID del técnico asignado
- **fechaProgramada**: fecha ISO 8601 para el inicio programado
- **fechaInicioReal**: fecha ISO 8601 del inicio real
- **fechaFinReal**: fecha ISO 8601 de finalización real
- **siguienteTipoPermiso**: enum ['altura', 'enganche', 'cierre', 'electrico', 'mecanico', 'finalizado']
- **comentarios**: string (máximo 500 caracteres)

## 🔄 Estados de Trabajo

1. **pendiente**: Trabajo creado, esperando inicio
2. **en_progreso**: Trabajo en ejecución
3. **completado**: Trabajo finalizado exitosamente
4. **cancelado**: Trabajo cancelado

## 🎯 Tipos de Permisos

- **altura**: Trabajos que requieren acceso a alturas
- **enganche**: Trabajos que requieren uso de grúas o equipos de elevación
- **cierre**: Trabajos que requieren desenergización de circuitos
- **electrico**: Trabajos eléctricos generales
- **mecanico**: Trabajos mecánicos
- **finalizado**: Trabajo que no requiere más permisos

## 📋 IDs de Referencia del Sistema

### Áreas

- **CYR CENTRO**: `11873221-e21e-4a10-8d6f-2cd86df5e581`
- **CYR SUR**: `70ddbbf7-1c1f-4083-a578-ad8059960ad4`

### Técnico

- **Juan Técnico**: `30e8713d-6f23-4b09-8c06-e948e20ccf16`

### Usuarios de Prueba

- **planificador1@demo.com**: password "123456"
- **tecnico1@demo.com**: password "123456"
- **supervisor1@demo.com**: password "123456"
- **admin1@demo.com**: password "123456"

## 🚀 Flujo Completo en Postman

1. **Importar** la colección `POSTMAN_COLLECTION_COMPLETA.json`
2. **Navegar** a la carpeta "📋 FLUJO PLANIFICADOR - Creación de Trabajos"
3. **Ejecutar** las requests en orden:
   - Login como Planificador
   - Obtener Áreas Disponibles
   - Crear Trabajo - Instalación Transformador
   - Crear Trabajo - Mantenimiento Red Centro
   - Verificar Trabajos Creados
   - Actualizar Trabajo - Cambiar Estado
   - Reasignar Técnico

## ✅ Validaciones

- El planificador debe estar autenticado
- El área debe existir y estar activa
- El técnico debe existir y tener rol "Técnico"
- Los campos obligatorios deben estar presentes
- Las fechas deben estar en formato ISO 8601
- Los enums deben tener valores válidos

## 🔗 Siguiente Paso

Después de crear el trabajo, el **técnico** puede:

1. Ver sus trabajos asignados
2. Solicitar permisos específicos para el trabajo
3. Iniciar el trabajo cuando tenga los permisos aprobados

El **supervisor** puede:

1. Aprobar o rechazar los permisos solicitados
2. Supervisar el progreso del trabajo
3. Validar la finalización del trabajo
