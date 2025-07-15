# Endpoints de Inicio de Trabajos - CMO Backend

## 🔧 **Endpoints Implementados**

### 1. **Iniciar Trabajo**
```
POST /trabajos/:id/iniciar
```

**Descripción:** Permite a un técnico iniciar un trabajo enviando foto inicial y comentarios para aprobación del supervisor.

**Body:**
```json
{
  "tecnicoId": "8476471a-4c5c-4938-9f0f-7b8ac9242b4c",
  "fotoInicial": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "comentarios": "Condiciones normales, equipo funcionando correctamente"
}
```

**Respuesta:**
```json
{
  "id": "e1d68650-a7c2-435e-9623-7e4249e8f00e",
  "titulo": "Mantenimiento Preventivo Sistema de Aire Acondicionado",
  "estado": "pendiente_aprobacion",
  "estaAprobado": false,
  "estaRechazado": false,
  "fechaSolicitud": "2025-01-20T10:30:00.000Z",
  "comentarios": "Condiciones normales...\n\n📸 Foto inicial: https://example.com/fotos/..."
}
```

### 2. **Obtener Estado de Aprobación**
```
GET /trabajos/:id/estado-aprobacion
```

**Descripción:** Retorna el estado actual de aprobación de un trabajo iniciado.

**Respuesta:**
```json
{
  "id": "e1d68650-a7c2-435e-9623-7e4249e8f00e",
  "titulo": "Mantenimiento Preventivo Sistema de Aire Acondicionado",
  "estado": "en_proceso",
  "estaAprobado": true,
  "estaRechazado": false,
  "fechaSolicitud": "2025-01-20T10:30:00.000Z",
  "comentarios": "Trabajo aprobado..."
}
```

### 3. **Aprobar/Rechazar Trabajo**
```
PATCH /trabajos/:id/aprobar
```

**Descripción:** Permite a un supervisor aprobar o rechazar un trabajo que está pendiente de aprobación.

**Body:**
```json
{
  "supervisorId": "8476471a-4c5c-4938-9f0f-7b8ac9242b4c",
  "aprobado": true,
  "comentarios": "Trabajo aprobado. Foto cumple con los requisitos de seguridad."
}
```

**Respuesta:**
```json
{
  "id": "e1d68650-a7c2-435e-9623-7e4249e8f00e",
  "titulo": "Mantenimiento Preventivo Sistema de Aire Acondicionado",
  "estado": "en_proceso",
  "estaAprobado": true,
  "estaRechazado": false,
  "fechaSolicitud": "2025-01-20T10:30:00.000Z",
  "comentarios": "Trabajo aprobado..."
}
```

### 4. **Obtener Trabajos Pendientes de Aprobación**
```
GET /trabajos/pendientes-aprobacion
```

**Descripción:** Retorna todos los trabajos que están pendientes de aprobación por supervisores.

**Respuesta:**
```json
[
  {
    "id": "e1d68650-a7c2-435e-9623-7e4249e8f00e",
    "titulo": "Mantenimiento Preventivo Sistema de Aire Acondicionado",
    "estado": "pendiente_aprobacion",
    "estaAprobado": false,
    "estaRechazado": false,
    "fechaSolicitud": "2025-01-20T10:30:00.000Z",
    "comentarios": "Condiciones normales..."
  }
]
```

## 🔄 **Flujo Completo**

### **1. Técnico Inicia Trabajo:**
1. Técnico toma foto inicial (permisos de altura)
2. Agrega comentarios opcionales
3. Envía `POST /trabajos/:id/iniciar`
4. Trabajo cambia a estado `pendiente_aprobacion`
5. Se notifica al supervisor (console.log por ahora)

### **2. Supervisor Revisa:**
1. Supervisor consulta `GET /trabajos/pendientes-aprobacion`
2. Ve lista de trabajos pendientes
3. Revisa foto y comentarios del técnico

### **3. Supervisor Aprueba/Rechaza:**
1. Envía `PATCH /trabajos/:id/aprobar`
2. Si aprueba: estado → `en_proceso`
3. Si rechaza: estado → `cancelado`
4. Se notifica al técnico (console.log por ahora)

### **4. Técnico Verifica Estado:**
1. Consulta `GET /trabajos/:id/estado-aprobacion`
2. Ve si fue aprobado o rechazado
3. Si fue rechazado, ve el motivo

## 🔔 **Notificaciones (TODO)**

### **WebSocket Events:**
- `trabajo_iniciado`: Cuando técnico inicia trabajo
- `trabajo_aprobado`: Cuando supervisor aprueba
- `trabajo_rechazado`: Cuando supervisor rechaza

### **Implementación Futura:**
```typescript
// En el servicio de WebSocket
socket.emit('trabajo_iniciado', {
  trabajoId: trabajo.id,
  tecnicoId: trabajo.tecnicoAsignadoId,
  titulo: trabajo.titulo,
  fecha: trabajo.fechaInicioReal
});
```

## 🛡️ **Validaciones Implementadas**

### **Para Iniciar Trabajo:**
- ✅ Trabajo existe
- ✅ Técnico está asignado al trabajo
- ✅ Técnico tiene rol correcto
- ✅ Trabajo está en estado válido (asignado/pendiente)
- ✅ Foto inicial es requerida

### **Para Aprobar Trabajo:**
- ✅ Trabajo existe
- ✅ Trabajo está pendiente de aprobación
- ✅ Supervisor tiene rol correcto
- ✅ Supervisor existe

## 📊 **Estados de Trabajo**

```typescript
enum TrabajoEstado {
  PENDIENTE = 'pendiente',
  ASIGNADO = 'asignado',
  PENDIENTE_APROBACION = 'pendiente_aprobacion', // NUEVO
  EN_PROCESO = 'en_proceso',
  EN_PROGRESO = 'en_progreso',
  COMPLETADO = 'completado',
  CANCELADO = 'cancelado',
}
```

## 🧪 **Testing con cURL**

### **Iniciar Trabajo:**
```bash
curl -X POST http://localhost:3000/trabajos/e1d68650-a7c2-435e-9623-7e4249e8f00e/iniciar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "tecnicoId": "8476471a-4c5c-4938-9f0f-7b8ac9242b4c",
    "fotoInicial": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    "comentarios": "Condiciones normales"
  }'
```

### **Aprobar Trabajo:**
```bash
curl -X PATCH http://localhost:3000/trabajos/e1d68650-a7c2-435e-9623-7e4249e8f00e/aprobar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "supervisorId": "8476471a-4c5c-4938-9f0f-7b8ac9242b4c",
    "aprobado": true,
    "comentarios": "Trabajo aprobado"
  }'
```

## 🚀 **Próximos Pasos**

1. **Implementar guardado real de imágenes** (S3 o sistema de archivos)
2. **Implementar notificaciones WebSocket** reales
3. **Agregar validaciones de imagen** (tamaño, formato)
4. **Implementar sistema de logs** más detallado
5. **Agregar tests unitarios** para los nuevos endpoints 