# 🚀 Guía Completa para Crear la App Flutter (Web y Móvil) - Sistema de Permisos CMO

## 1. Introducción
Esta guía te permitirá crear una app Flutter multiplataforma (web y móvil) para el sistema de permisos CMO, diferenciando perfiles de usuario y cubriendo los principales flujos del sistema.

---

## 2. Estructura de Carpetas Recomendada

```
lib/
├── main.dart
├── core/
│   ├── services/
│   │   └── api_service.dart
│   └── utils/
│       └── constants.dart
├── models/
│   ├── user.dart
│   ├── permiso.dart
│   ├── trabajo.dart
│   └── area.dart
├── providers/
│   └── auth_provider.dart
├── screens/
│   ├── login_screen.dart
│   ├── dashboard_screen.dart
│   ├── permisos/
│   │   ├── permisos_list_screen.dart
│   │   └── permiso_form_screen.dart
│   ├── trabajos/
│   │   ├── trabajos_list_screen.dart
│   │   └── trabajo_form_screen.dart
│   └── imagenes/
│       └── subir_imagen_screen.dart
├── widgets/
│   ├── custom_button.dart
│   └── custom_input.dart
└── .env
```

---

## 3. Dependencias Sugeridas

```bash
flutter pub add http provider shared_preferences image_picker file_picker flutter_dotenv go_router flutter_web_plugins
```

---

## 4. Configuración de Entorno

Crea un archivo `.env` en la raíz del proyecto:
```
API_URL=https://cmobackendnest-production.up.railway.app
```
Agrega en `pubspec.yaml`:
```yaml
assets:
  - .env
```

---

## 5. Modelos de Datos (Dart)

### user.dart
```dart
class User {
  final String id;
  final String nombre;
  final String email;
  final String rol;
  final String areaId;

  User({required this.id, required this.nombre, required this.email, required this.rol, required this.areaId});

  factory User.fromJson(Map<String, dynamic> json) => User(
    id: json['id'],
    nombre: json['nombre'],
    email: json['email'],
    rol: json['rol'] ?? json['role'] ?? '',
    areaId: json['areaId'] ?? '',
  );
}
```

### permiso.dart
```dart
class Permiso {
  final String id;
  final String descripcion;
  final String estado;
  final String trabajoId;
  final String tecnicoId;

  Permiso({required this.id, required this.descripcion, required this.estado, required this.trabajoId, required this.tecnicoId});

  factory Permiso.fromJson(Map<String, dynamic> json) => Permiso(
    id: json['id'],
    descripcion: json['descripcion'],
    estado: json['estado'],
    trabajoId: json['trabajoId'],
    tecnicoId: json['tecnicoId'],
  );
}
```

---

## 6. Ejemplo de Consumo de API

### api_service.dart
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class ApiService {
  static String baseUrl = dotenv.env['API_URL']!;

  static Future<String?> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['access_token'];
    }
    return null;
  }

  static Future<List<Permiso>> getPermisos(String token) async {
    final response = await http.get(
      Uri.parse('$baseUrl/permisos'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (response.statusCode == 200) {
      final List permisosJson = jsonDecode(response.body);
      return permisosJson.map((e) => Permiso.fromJson(e)).toList();
    }
    throw Exception('Error al obtener permisos');
  }
}
```

---

## 7. Manejo de Autenticación y Token

- Guarda el token JWT en `SharedPreferences` tras login.
- Usa el token en el header `Authorization` para todas las peticiones protegidas.

### auth_provider.dart (ejemplo básico)
```dart
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthProvider with ChangeNotifier {
  String? _token;
  String? get token => _token;

  Future<void> setToken(String token) async {
    _token = token;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
    notifyListeners();
  }

  Future<void> loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token');
    notifyListeners();
  }
}
```

---

## 8. Ejemplo de Subida de Imágenes

### subir_imagen_screen.dart
```dart
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import 'dart:io';

Future<void> subirImagen(String token, String permisoId) async {
  final picker = ImagePicker();
  final pickedFile = await picker.pickImage(source: ImageSource.camera);
  if (pickedFile == null) return;
  var request = http.MultipartRequest('POST', Uri.parse('${dotenv.env['API_URL']}/permisos/upload-image'));
  request.headers['Authorization'] = 'Bearer $token';
  request.files.add(await http.MultipartFile.fromPath('file', pickedFile.path));
  request.fields['permisoId'] = permisoId;
  var response = await request.send();
  if (response.statusCode == 201) {
    print('Imagen subida correctamente');
  } else {
    print('Error al subir imagen');
  }
}
```

---

## 9. Ejemplo de Widget: Login

### login_screen.dart
```dart
import 'package:flutter/material.dart';
import '../core/services/api_service.dart';

class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  String? error;

  void login() async {
    final token = await ApiService.login(emailController.text, passwordController.text);
    if (token != null) {
      // Guardar token y navegar
      setState(() { error = null; });
      // Navegar según rol...
    } else {
      setState(() { error = 'Credenciales incorrectas'; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextField(controller: emailController, decoration: InputDecoration(labelText: 'Email')),
            TextField(controller: passwordController, decoration: InputDecoration(labelText: 'Contraseña'), obscureText: true),
            if (error != null) Text(error!, style: TextStyle(color: Colors.red)),
            SizedBox(height: 20),
            ElevatedButton(onPressed: login, child: Text('Iniciar sesión')),
          ],
        ),
      ),
    );
  }
}
```

---

## 10. Manejo de Errores y Respuestas
- Usa try/catch en todas las llamadas a la API.
- Muestra mensajes claros al usuario.
- Si el token expira, redirige al login.

---

## 11. Compilar para Web y Móvil

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

## 12. Sugerencias de Buenas Prácticas
- Usa Provider o Riverpod para el manejo de estado.
- Separa lógica de negocio y UI.
- Usa rutas nombradas para navegación.
- Implementa control de roles en la UI.
- Usa variables de entorno para la URL de la API.

---

**¡Con esta guía, cualquier desarrollador puede crear la app Flutter para tu sistema de permisos!**

¿Quieres que te genere archivos base reales o ejemplos de más pantallas? ¡Solo pídelo! 