# 🚀 Guía para Crear la App Flutter (Web y Móvil) - Sistema de Permisos CMO

## 📋 Objetivo
- **Web:** Para administradores, supervisores y planificadores (gestión completa).
- **Móvil:** Para técnicos (subida de fotos y solicitud de permisos).

---

## 1. Requisitos Previos
- Tener instalado [Flutter](https://docs.flutter.dev/get-started/install) (recomendado versión 3.19+)
- Tener instalado [Android Studio](https://developer.android.com/studio) o [VSCode](https://code.visualstudio.com/)
- Tener una cuenta de [GitHub](https://github.com/) y acceso al backend desplegado

---

## 2. Crear el Proyecto Flutter

```bash
flutter create cmo_permisos_app
cd cmo_permisos_app
```

---

## 3. Estructura Recomendada

```
lib/
├── main.dart
├── core/
│   └── services/
│       └── api_service.dart
├── models/
├── screens/
│   ├── login/
│   ├── dashboard/
│   ├── permisos/
│   ├── trabajos/
│   ├── areas/
│   ├── roles/
│   └── imagenes/
├── widgets/
├── providers/
└── utils/
```

---

## 4. Dependencias Sugeridas

```bash
flutter pub add http provider shared_preferences image_picker file_picker
flutter pub add flutter_dotenv
flutter pub add go_router
flutter pub add flutter_web_plugins
```

---

## 5. Configurar Entorno (API URL)

Crea un archivo `.env` en la raíz:

```
API_URL=https://cmobackendnest-production.up.railway.app
```

Agrega en `pubspec.yaml`:

```yaml
assets:
  - .env
```

---

## 6. Diferenciar Web y Móvil
- Usa `kIsWeb` para detectar si es web o móvil y mostrar la interfaz adecuada.
- En el login, según el rol (`admin`, `supervisor`, `planificador`, `tecnico`), redirige a la pantalla correspondiente.

---

## 7. Funcionalidades por Perfil

### Web (admin, supervisor, planificador):
- Login
- Gestión de usuarios, áreas, trabajos, permisos, roles, tipos de permiso
- Visualización y descarga de imágenes

### Móvil (técnico):
- Login
- Solicitud de permisos
- Subida de fotos (usando cámara o galería)
- Visualización de permisos propios

---

## 8. Ejemplo de Llamada a la API (login)

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<String?> login(String email, String password) async {
  final response = await http.post(
    Uri.parse('${dotenv.env['API_URL']}/auth/login'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'email': email, 'password': password}),
  );
  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    return data['access_token'];
  }
  return null;
}
```

---

## 9. Compilar para Web y Móvil

- **Web:**  
  ```bash
  flutter run -d chrome
  flutter build web
  ```

- **Android/iOS:**  
  ```bash
  flutter run -d android
  flutter run -d ios
  flutter build apk
  flutter build ios
  ```

---

## 10. Siguientes pasos
- Implementar autenticación y gestión de sesión
- Crear pantallas según el perfil
- Probar subida de imágenes y permisos desde móvil
- Probar gestión completa desde web

---

¿Quieres que te genere la estructura base del proyecto o algún ejemplo de pantalla? 