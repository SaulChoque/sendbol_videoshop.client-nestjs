# Guía de Depuración del Error session-user

## Pasos para identificar el origen del error

### 1. Verificar que no haya código obsoleto ejecutándose

Ejecuta estos comandos para asegurarte de que estás usando la versión más reciente:

```bash
# Limpiar build anterior
npm run build

# Reiniciar la aplicación en modo desarrollo
npm run start:dev
```

### 2. Probar endpoints individualmente

#### Endpoint que debe funcionar (sin autenticación):
```bash
curl -X GET http://localhost:3000/auth/check
```

#### Endpoint que puede causar el error (con autenticación):
```bash
curl -X GET http://localhost:3000/usuarios/me
```

### 3. Si el error persiste, buscar en el código

El error indica que se está intentando buscar un usuario con ID "session-user", lo cual no debería pasar con el código actual.

### 4. Posibles causas

1. **Caché de código anterior**: El servidor puede estar ejecutando código en caché
2. **Sesión corrupta**: Puede haber una sesión antigua con datos incorrectos
3. **Otro endpoint**: El error puede venir de otro controlador que use `UsuariosService.findOne()`

### 5. Script de diagnóstico

```bash
# Limpiar todas las sesiones de Redis
npm run clear-sessions

# Reiniciar completamente
npm run start:dev
```

### 6. Si nada funciona

Revisar todos los controladores que usen `UsuariosService`:

```bash
grep -r "usuariosService.findOne" src/
grep -r "session-user" src/
```
