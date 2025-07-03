# Manejo de Sesiones con Redis en NestJS

Este proyecto ahora incluye un sistema completo de manejo de sesiones usando Redis, migrado desde la funcionalidad de ASP.NET.

## Configuración

### Dependencias Instaladas
- `express-session`: Para el manejo de sesiones en Express
- `connect-redis`: Para almacenar sesiones en Redis
- `redis`: Cliente de Redis
- `@types/express-session`: Tipos de TypeScript para sesiones

### Configuración de Redis
La configuración de Redis se encuentra en `src/config/session.config.ts`:

```typescript
export const redisConfig = {
  host: 'redis-12332.crce181.sa-east-1-2.ec2.redns.redis-cloud.com',
  port: 12332,
  password: 'zW0YWoixB6i84cCIWbCU7O4c7uaCbahK',
  username: 'default',
};
```

### Configuración de Sesiones
Las sesiones están configuradas para:
- Durar 1 hora (3600000 ms)
- Usar cookies httpOnly para seguridad
- Nombre de cookie: `.Sendbol.Session`
- Almacenamiento en Redis

## Uso

### Servicios Disponibles

#### SessionService
Proporciona métodos para manejar sesiones:

```typescript
// Establecer datos de usuario en la sesión
sessionService.setUserSession(session, { userId, username, email });

// Obtener datos del usuario
const userData = sessionService.getUserSession(session);

// Verificar autenticación
const isAuth = sessionService.isAuthenticated(session);

// Limpiar sesión (logout)
await sessionService.clearSession(session);

// Regenerar ID de sesión
await sessionService.regenerateSession(session);
```

### Decoradores

#### @Session()
Inyecta la sesión en los controladores:

```typescript
@Get('profile')
getProfile(@Session() session: SessionData) {
  return this.sessionService.getUserSession(session);
}
```

### Guards

#### AuthGuard
Protege rutas que requieren autenticación:

```typescript
@Get('protected')
@UseGuards(AuthGuard)
getProtectedResource() {
  return { message: 'Solo usuarios autenticados pueden ver esto' };
}
```

## Endpoints de Autenticación

### POST /auth/login
Autentica un usuario y crea una sesión:

```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña"
}
```

### POST /auth/logout
Cierra la sesión del usuario (requiere autenticación).

### GET /auth/profile
Obtiene el perfil del usuario autenticado (requiere autenticación).

### GET /auth/check
Verifica el estado de autenticación sin requerir autenticación.

## Migración desde ASP.NET

Las características migradas incluyen:

1. **Almacenamiento en Redis**: Igual que `AddStackExchangeRedisCache` en ASP.NET
2. **Configuración de cookies**: Equivalente a `Cookie.HttpOnly`, `Cookie.Name`, etc.
3. **Tiempo de expiración**: `IdleTimeout` se mapea a `maxAge`
4. **CORS con credenciales**: `AllowCredentials()` se mapea a `credentials: true`

## Comparación de Funcionalidades

| ASP.NET Core | NestJS |
|--------------|--------|
| `AddStackExchangeRedisCache()` | `connect-redis` con `redis` client |
| `AddSession()` | `express-session` middleware |
| `UseSession()` | Configurado en `main.ts` |
| `HttpContext.Session` | `@Session()` decorator |
| `Session.SetString()` | `sessionService.setUserSession()` |
| `Session.GetString()` | `sessionService.getUserSession()` |

## Seguridad

- Las cookies de sesión son httpOnly
- HTTPS requerido en producción
- Regeneración de ID de sesión después del login
- Validación de autenticación en rutas protegidas

## Variables de Entorno

Puedes configurar las siguientes variables de entorno:

```env
SESSION_SECRET=tu-clave-secreta-super-segura
REDIS_HOST=tu-host-redis
REDIS_PORT=6379
REDIS_PASSWORD=tu-password-redis
REDIS_USERNAME=default
NODE_ENV=production
```
