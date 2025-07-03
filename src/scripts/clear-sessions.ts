import { createClient } from 'redis';
import { redisConfig } from '../config/session.config';

async function clearAllSessions() {
  const redisClient = createClient({
    socket: {
      host: redisConfig.host,
      port: redisConfig.port,
    },
    username: redisConfig.username,
    password: redisConfig.password,
  });

  try {
    await redisClient.connect();
    console.log('Conectado a Redis');

    // Buscar todas las claves de sesión
    const sessionKeys = await redisClient.keys('sess:*');
    console.log(`Encontradas ${sessionKeys.length} sesiones`);

    if (sessionKeys.length > 0) {
      // Eliminar todas las sesiones
      await redisClient.del(sessionKeys);
      console.log(`Eliminadas ${sessionKeys.length} sesiones`);
    } else {
      console.log('No hay sesiones para eliminar');
    }

    await redisClient.disconnect();
    console.log('Desconectado de Redis');
  } catch (error) {
    console.error('Error al limpiar sesiones:', error);
  }
}

// Ejecutar el script
clearAllSessions().then(() => {
  console.log('Script de limpieza completado');
  process.exit(0);
}).catch((error) => {
  console.error('Error en el script:', error);
  process.exit(1);
});
