# 🚀 Documentación Completa para Frontend Vite.js + React - Sistema CMO Permisos

## 📋 Índice

1. [Información General](#información-general)
2. [Configuración del Proyecto](#configuración-del-proyecto)
3. [Autenticación](#autenticación)
4. [Endpoints Disponibles](#endpoints-disponibles)
5. [Flujo Completo de Permisos](#flujo-completo-de-permisos)
6. [Estructura de Datos](#estructura-de-datos)
7. [Ejemplos de Integración React](#ejemplos-de-integración-react)
8. [Estados y Roles](#estados-y-roles)

---

## 📊 Información General

### Backend URL

- **Desarrollo**: `http://localhost:3000`
- **Producción**: Tu URL de despliegue

### Usuarios de Prueba (password: `123456`)

- **Admin**: `admin1@demo.com`
- **Técnico**: `tecnico1@demo.com`
- **Supervisor**: `supervisor1@demo.com`
- **Planificador**: `planificador1@demo.com`

### IDs Importantes

```javascript
// Áreas
const AREAS = {
  CYR_CENTRO: '11873221-e21e-4a10-8d6f-2cd86df5e581',
  CYR_SUR: '70ddbbf7-1c1f-4083-a578-ad8059960ad4',
};

// Tipos de Permisos
const TIPOS_PERMISO = {
  ALTURA: '45f2674e-efdd-4e71-b727-6c6cbc4ed3eb',
  ENGANCHE: '6e680ae5-97d6-4944-86a1-7d2e5c36d05e',
  CIERRE: 'f4d943b0-82c2-4a81-abeb-64bf6fca1ddd',
};

// Usuarios
const USUARIOS = {
  TECNICO: '30e8713d-6f23-4b09-8c06-e948e20ccf16',
  SUPERVISOR: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  PLANIFICADOR: 'p1l2a3n4-i5f6-7890-cdef-ab1234567890',
};
```

---

## ⚙️ Configuración del Proyecto

### Crear Proyecto con Vite.js

```bash
# Crear proyecto React con Vite
npm create vite@latest cmo-frontend -- --template react-ts

# Navegar al directorio
cd cmo-frontend

# Instalar dependencias
npm install

# Dependencias adicionales necesarias
npm install axios react-router-dom @tanstack/react-query
npm install @types/node --save-dev
```

### Configuración de Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

### Estructura del Proyecto

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── permisos/
│   │   ├── SolicitudPermiso.tsx
│   │   ├── AprobacionPermisos.tsx
│   │   └── ListaPermisos.tsx
│   ├── trabajos/
│   │   ├── CrearTrabajoForm.tsx
│   │   └── ListaTrabajos.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Modal.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── usePermisos.ts
│   └── useTrabajos.ts
├── services/
│   ├── api.ts
│   ├── authService.ts
│   └── permisosService.ts
├── stores/
│   └── authStore.ts
├── types/
│   ├── auth.ts
│   ├── permisos.ts
│   └── trabajos.ts
├── utils/
│   ├── constants.ts
│   └── helpers.ts
└── App.tsx
```

---

## 🔐 Autenticación

### Servicio de Autenticación

```typescript
// services/authService.ts
import axios from 'axios';

const API_BASE = 'http://localhost:3000';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    nombre: string;
    role: {
      id: string;
      nombre: string;
    };
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axios.post(`${API_BASE}/auth/login`, credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  getToken(): string | null {
    return localStorage.getItem('access_token');
  },

  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
```

### Hook de Autenticación

```typescript
// hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { authService, LoginCredentials, AuthResponse } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(authService.getUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);
      
      // Guardar en localStorage
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error de autenticación';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setError(null);
  }, []);

  const isAuthenticated = useCallback(() => {
    return !!user && authService.isAuthenticated();
  }, [user]);

  const hasRole = useCallback((role: string) => {
    return user?.role?.nombre === role;
  }, [user]);

  useEffect(() => {
    // Verificar token al cargar
    if (!authService.isAuthenticated()) {
      setUser(null);
    }
  }, []);

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
    hasRole,
  };
};
```

### Componente de Login

```tsx
// components/auth/LoginForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const LoginForm: React.FC = () => {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(credentials);
      navigate('/dashboard');
    } catch (err) {
      // Error ya manejado en el hook
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Iniciar Sesión
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Correo electrónico"
                value={credentials.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <input
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={credentials.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

---

## 📋 FLUJO PERMISOS - Gestión de Permisos

### 🎯 Descripción del Flujo

Los técnicos pueden solicitar permisos para realizar trabajos específicos. Cada permiso puede incluir fotos como evidencia y requiere la aprobación de un supervisor. Los permisos deben seguir una secuencia específica.

### 🔧 Hook para Gestión de Permisos

```typescript
// hooks/usePermisos.ts
import { useState, useEffect, useCallback } from 'react';
import { permisosService } from '../services/permisosService';

export interface Permiso {
  id: string;
  trabajoId: string;
  tecnicoId: string;
  tipoPermisoId: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  comentariosTecnico?: string;
  comentariosSupervisor?: string;
  fotoKey?: string;
  enviadoAt?: string;
  autorizadoAt?: string;
  autorizadoPor?: string;
  createdAt: string;
  updatedAt: string;
  trabajo?: any;
  tecnico?: any;
  supervisor?: any;
  tipoPermiso?: any;
}

export const usePermisos = () => {
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Crear permiso
  const crearPermiso = useCallback(async (datos: {
    trabajoId: string;
    tecnicoId: string;
    tipoPermisoId: string;
    comentariosTecnico?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const nuevoPermiso = await permisosService.crear(datos);
      setPermisos(prev => [nuevoPermiso, ...prev]);
      return nuevoPermiso;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al crear permiso';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Subir foto
  const subirFoto = useCallback(async (permisoId: string, base64Data: string) => {
    try {
      return await permisosService.subirFoto(permisoId, base64Data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al subir imagen';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Obtener permisos pendientes
  const obtenerPermisosPendientes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await permisosService.obtenerPendientes();
      setPermisos(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al obtener permisos';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Autorizar permiso
  const autorizarPermiso = useCallback(async (
    permisoId: string,
    datos: {
      estado: 'aprobado' | 'rechazado';
      supervisorId: string;
      comentariosSupervisor?: string;
    }
  ) => {
    setLoading(true);
    setError(null);

    try {
      const permisoActualizado = await permisosService.autorizar(permisoId, datos);
      setPermisos(prev =>
        prev.map(p => (p.id === permisoId ? permisoActualizado : p))
      );
      return permisoActualizado;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al autorizar permiso';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener permisos por técnico
  const obtenerPermisosPorTecnico = useCallback(async (tecnicoId: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await permisosService.obtenerPorTecnico(tecnicoId);
      setPermisos(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al obtener permisos';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    permisos,
    loading,
    error,
    crearPermiso,
    subirFoto,
    obtenerPermisosPendientes,
    autorizarPermiso,
    obtenerPermisosPorTecnico,
  };
};
```

### 🎨 Componente - Formulario de Solicitud de Permisos

```tsx
// components/permisos/SolicitudPermiso.tsx
import React, { useState } from 'react';
import { usePermisos } from '../../hooks/usePermisos';

interface SolicitudPermisoProps {
  trabajoId: string;
  tecnicoId: string;
  tiposPermiso: Array<{ id: string; nombre: string }>;
  onPermisoCreado?: (permiso: any) => void;
}

export const SolicitudPermiso: React.FC<SolicitudPermisoProps> = ({
  trabajoId,
  tecnicoId,
  tiposPermiso,
  onPermisoCreado,
}) => {
  const { crearPermiso, subirFoto, loading, error } = usePermisos();
  const [tipoPermisoId, setTipoPermisoId] = useState('');
  const [comentarios, setComentarios] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string>('');

  const handleFotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      // Crear permiso
      const permiso = await crearPermiso({
        trabajoId,
        tecnicoId,
        tipoPermisoId,
        comentariosTecnico: comentarios,
      });

      // Subir foto si existe
      if (foto && fotoPreview) {
        await subirFoto(permiso.id, fotoPreview);
      }

      // Limpiar formulario
      setTipoPermisoId('');
      setComentarios('');
      setFoto(null);
      setFotoPreview('');

      onPermisoCreado?.(permiso);
    } catch (err) {
      console.error('Error al crear permiso:', err);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">📋 Solicitar Permiso</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="tipoPermiso" className="block text-sm font-medium text-gray-700">
            Tipo de Permiso:
          </label>
          <select
            id="tipoPermiso"
            value={tipoPermisoId}
            onChange={(e) => setTipoPermisoId(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Selecciona un tipo</option>
            {tiposPermiso.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="comentarios" className="block text-sm font-medium text-gray-700">
            Comentarios:
          </label>
          <textarea
            id="comentarios"
            value={comentarios}
            onChange={(e) => setComentarios(e.target.value)}
            placeholder="Describe el motivo del permiso..."
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="foto" className="block text-sm font-medium text-gray-700">
            Foto (opcional):
          </label>
          <input
            type="file"
            id="foto"
            accept="image/*"
            onChange={handleFotoChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {fotoPreview && (
            <div className="mt-2">
              <img 
                src={fotoPreview} 
                alt="Vista previa" 
                className="w-32 h-32 object-cover rounded border"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? '⏳ Creando...' : '✅ Crear Permiso'}
        </button>
      </form>
    </div>
  );
};
```

### 🎨 Componente - Aprobación de Permisos

```tsx
// components/permisos/AprobacionPermisos.tsx
import React, { useEffect } from 'react';
import { usePermisos } from '../../hooks/usePermisos';
import { useAuth } from '../../hooks/useAuth';

interface AprobacionPermisosProps {
  supervisorId: string;
}

export const AprobacionPermisos: React.FC<AprobacionPermisosProps> = ({
  supervisorId,
}) => {
  const { permisos, loading, error, obtenerPermisosPendientes, autorizarPermiso } = usePermisos();
  const { user } = useAuth();

  useEffect(() => {
    obtenerPermisosPendientes();
  }, [obtenerPermisosPendientes]);

  const handleAutorizar = async (permisoId: string, estado: 'aprobado' | 'rechazado', comentarios: string) => {
    try {
      await autorizarPermiso(permisoId, {
        estado,
        supervisorId,
        comentariosSupervisor: comentarios,
      });
      
      // Recargar permisos pendientes
      obtenerPermisosPendientes();
    } catch (err) {
      console.error('Error al autorizar:', err);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <span className="ml-2">Cargando permisos...</span>
    </div>
  );

  if (error) return (
    <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      ❌ Error: {error}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold mb-6">🔍 Permisos Pendientes de Aprobación</h3>
      
      {permisos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay permisos pendientes de aprobación
        </div>
      ) : (
        <div className="grid gap-6">
          {permisos.map((permiso) => (
            <div key={permiso.id} className="bg-white p-6 rounded-lg shadow-md border">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-medium">
                  Permiso de {permiso.tipoPermiso?.nombre}
                </h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  permiso.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                  permiso.estado === 'aprobado' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {permiso.estado.toUpperCase()}
                </span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p><strong>Trabajo:</strong> {permiso.trabajo?.titulo}</p>
                  <p><strong>Técnico:</strong> {permiso.tecnico?.nombre}</p>
                  <p><strong>Fecha:</strong> {new Date(permiso.enviadoAt || permiso.createdAt).toLocaleString()}</p>
                </div>
                
                {permiso.comentariosTecnico && (
                  <div>
                    <p><strong>Comentarios:</strong></p>
                    <p className="text-gray-600">{permiso.comentariosTecnico}</p>
                  </div>
                )}
              </div>

              {permiso.fotoKey && (
                <div className="mb-4">
                  <p className="font-medium mb-2">Foto del permiso:</p>
                  <img 
                    src={`https://tu-bucket-s3.s3.amazonaws.com/${permiso.fotoKey}`}
                    alt="Foto del permiso"
                    className="w-48 h-48 object-cover rounded border"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleAutorizar(permiso.id, 'aprobado', '')}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  ✅ Aprobar
                </button>
                <button
                  onClick={() => {
                    const comentarios = prompt('Comentarios de rechazo:');
                    if (comentarios !== null) {
                      handleAutorizar(permiso.id, 'rechazado', comentarios);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  ❌ Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## 📋 FLUJO PLANIFICADOR - Gestión de Trabajos

### 🔧 Hook para Gestión de Trabajos

```typescript
// hooks/useTrabajos.ts
import { useState, useEffect, useCallback } from 'react';
import { trabajosService } from '../services/trabajosService';

export interface Trabajo {
  id: string;
  titulo: string;
  descripcion: string;
  estado: 'pendiente' | 'en_progreso' | 'completado' | 'cancelado';
  areaId: string;
  planificadorId: string;
  createdAt: string;
  updatedAt: string;
  area?: any;
  planificador?: any;
  permisos?: any[];
}

export const useTrabajos = () => {
  const [trabajos, setTrabajos] = useState<Trabajo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener todos los trabajos
  const obtenerTrabajos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await trabajosService.obtenerTodos();
      setTrabajos(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al obtener trabajos';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nuevo trabajo
  const crearTrabajo = useCallback(async (datos: {
    titulo: string;
    descripcion: string;
    areaId: string;
    planificadorId: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const nuevoTrabajo = await trabajosService.crear(datos);
      setTrabajos(prev => [nuevoTrabajo, ...prev]);
      return nuevoTrabajo;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al crear trabajo';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar trabajo
  const actualizarTrabajo = useCallback(async (trabajoId: string, datos: Partial<Trabajo>) => {
    setLoading(true);
    setError(null);

    try {
      const trabajoActualizado = await trabajosService.actualizar(trabajoId, datos);
      setTrabajos(prev =>
        prev.map(t => (t.id === trabajoId ? trabajoActualizado : t))
      );
      return trabajoActualizado;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar trabajo';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Computed properties
  const trabajosPendientes = trabajos.filter(t => t.estado === 'pendiente');
  const trabajosEnProgreso = trabajos.filter(t => t.estado === 'en_progreso');
  const trabajosCompletados = trabajos.filter(t => t.estado === 'completado');

  return {
    trabajos,
    loading,
    error,
    obtenerTrabajos,
    crearTrabajo,
    actualizarTrabajo,
    trabajosPendientes,
    trabajosEnProgreso,
    trabajosCompletados,
  };
};
```

### 🎨 Componente - Formulario de Creación de Trabajo

```tsx
// components/trabajos/CrearTrabajoForm.tsx
import React, { useState } from 'react';
import { useTrabajos } from '../../hooks/useTrabajos';
import { useAuth } from '../../hooks/useAuth';

interface CrearTrabajoFormProps {
  onTrabajoCreado?: (trabajo: any) => void;
}

export const CrearTrabajoForm: React.FC<CrearTrabajoFormProps> = ({
  onTrabajoCreado,
}) => {
  const { crearTrabajo, loading, error } = useTrabajos();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    areaId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const trabajo = await crearTrabajo({
        ...formData,
        planificadorId: user!.id,
      });

      // Limpiar formulario
      setFormData({
        titulo: '',
        descripcion: '',
        areaId: '',
      });

      onTrabajoCreado?.(trabajo);
    } catch (err) {
      console.error('Error al crear trabajo:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">➕ Crear Nuevo Trabajo</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">
            Título del Trabajo:
          </label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
            Descripción:
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            required
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="areaId" className="block text-sm font-medium text-gray-700">
            Área:
          </label>
          <select
            id="areaId"
            name="areaId"
            value={formData.areaId}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Selecciona un área</option>
            <option value="11873221-e21e-4a10-8d6f-2cd86df5e581">CYR Centro</option>
            <option value="70ddbbf7-1c1f-4083-a578-ad8059960ad4">CYR Sur</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? '⏳ Creando...' : '✅ Crear Trabajo'}
        </button>
      </form>
    </div>
  );
};
```

---

## 🔔 Notificaciones en Tiempo Real

### Hook para WebSocket

```typescript
// hooks/useWebSocket.ts
import { useEffect, useRef, useCallback } from 'react';

export const useWebSocket = (url: string, onMessage: (data: any) => void) => {
  const ws = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log('WebSocket conectado');
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.current.onclose = () => {
      console.log('WebSocket desconectado');
      // Reconectar después de 5 segundos
      setTimeout(connect, 5000);
    };
  }, [url, onMessage]);

  useEffect(() => {
    connect();

    return () => {
      ws.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback((message: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  return { sendMessage };
};
```

### Uso en Componentes

```tsx
// En el componente de permisos
import { useWebSocket } from '../hooks/useWebSocket';

export const PermisosComponent: React.FC = () => {
  const { permisos, obtenerPermisosPendientes } = usePermisos();

  useWebSocket('ws://localhost:3000', (data) => {
    if (data.type === 'permiso_notification') {
      // Recargar permisos cuando hay cambios
      obtenerPermisosPendientes();
    }
  });

  // ... resto del componente
};
```

---

## 🎨 Componentes UI Reutilizables

### Button Component

```tsx
// components/ui/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';
  
  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};
```

### Input Component

```tsx
// components/ui/Input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${className} ${
          error ? 'border-red-500' : ''
        }`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
```

---

## 🚀 Configuración de Rutas

```tsx
// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginForm } from './components/auth/LoginForm';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Dashboard } from './components/Dashboard';
import { SolicitudPermiso } from './components/permisos/SolicitudPermiso';
import { AprobacionPermisos } from './components/permisos/AprobacionPermisos';
import { CrearTrabajoForm } from './components/trabajos/CrearTrabajoForm';
import { useAuth } from './hooks/useAuth';

const queryClient = new QueryClient();

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route 
              path="/login" 
              element={isAuthenticated() ? <Navigate to="/dashboard" /> : <LoginForm />} 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/permisos/solicitar" 
              element={
                <ProtectedRoute>
                  <SolicitudPermiso />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/permisos/aprobar" 
              element={
                <ProtectedRoute requiredRole="supervisor">
                  <AprobacionPermisos />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/trabajos/crear" 
              element={
                <ProtectedRoute requiredRole="planificador">
                  <CrearTrabajoForm />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
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

## 🎯 Flujo Completo de Ejemplo

1. **Login Técnico** → Obtener token
2. **Crear Permiso ALTURA** → Estado: pendiente
3. **Subir Foto** → Evidencia visual
4. **Login Supervisor** → Obtener token
5. **Ver Permisos Pendientes** → Lista de permisos
6. **Aprobar Permiso** → Estado: aprobado
7. **Crear Permiso ENGANCHE** → Siguiente en secuencia
8. **Repetir proceso** → Hasta completar todos los permisos

Este flujo garantiza que los permisos se soliciten en el orden correcto y que cada uno tenga la aprobación necesaria del supervisor antes de continuar con el siguiente. 