# Pruebas de Sesiones con Redis

Una vez que tu aplicación esté ejecutándose, puedes probar las funcionalidades de sesión usando estos comandos curl:

## 0. Registrar un nuevo usuario (opcional)
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Juan", "apellido": "Pérez", "correo": "juan@example.com", "contrasena": "password123"}'
```

## 2. Verificar estado de autenticación inicial
```bash
curl -c cookies.txt -X GET http://localhost:3000/auth/check
```

## 3. Hacer login
```bash
curl -b cookies.txt -c cookies.txt -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo": "juan@example.com", "contrasena": "password123"}'
```

**Nota**: Usa las credenciales del usuario que registraste anteriormente.

## 4. Verificar perfil (requiere autenticación)
```bash
curl -b cookies.txt -X GET http://localhost:3000/auth/profile
```

## 5. Obtener usuario actual
```bash
curl -b cookies.txt -X GET http://localhost:3000/usuarios/me
```

## 6. Hacer logout
```bash
curl -b cookies.txt -c cookies.txt -X POST http://localhost:3000/auth/logout
```

## 7. Verificar que la sesión se limpió
```bash
curl -b cookies.txt -X GET http://localhost:3000/auth/check
```

## Ejemplo con Postman

1. **Registro**: POST a `http://localhost:3000/auth/register` con body:
   ```json
   {
     "nombre": "Juan",
     "apellido": "Pérez", 
     "correo": "juan@example.com",
     "contrasena": "password123"
   }
   ```

2. **Login**: POST a `http://localhost:3000/auth/login` con body:
   ```json
   {
     "correo": "juan@example.com",
     "contrasena": "password123"
   }
   ```

3. **Verificar sesión**: GET a `http://localhost:3000/auth/profile`

4. **Logout**: POST a `http://localhost:3000/auth/logout`

**Importante**: Asegúrate de habilitar cookies en Postman o usar un cliente que maneje cookies automáticamente.

## Verificación en Redis

Puedes conectarte directamente a Redis para ver las sesiones almacenadas:

```bash
redis-cli -h redis-12332.crce181.sa-east-1-2.ec2.redns.redis-cloud.com -p 12332 -a zW0YWoixB6i84cCIWbCU7O4c7uaCbahK
```

Luego ejecuta:
```redis
KEYS sess:*
GET sess:SESSION_ID_AQUI
```

## Diferencias con ASP.NET

| Funcionalidad | ASP.NET Core | NestJS |
|---------------|--------------|--------|
| **Iniciar sesión** | `HttpContext.Session.SetString("UserId", userId)` | `sessionService.setUserSession(session, userData)` |
| **Leer sesión** | `HttpContext.Session.GetString("UserId")` | `sessionService.getUserSession(session)` |
| **Verificar autenticación** | `HttpContext.Session.GetString("UserId") != null` | `sessionService.isAuthenticated(session)` |
| **Limpiar sesión** | `HttpContext.Session.Clear()` | `sessionService.clearSession(session)` |
| **Proteger rutas** | `[Authorize]` attribute | `@UseGuards(AuthGuard)` |

La migración mantiene la misma funcionalidad core pero adapta la sintaxis y patrones a NestJS.
