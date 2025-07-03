import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import { createClient } from 'redis';
import * as connectRedis from 'connect-redis';
import { sessionConfig, redisConfig } from './config/session.config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Configurar CORS
  app.enableCors({
    origin: ['http://localhost:54993', 'https://localhost:54993', 'http://0.0.0.0:54993', 'https://26.211.167.41:54993', 'https://192.168.137.1:54993', 'http://192.168.137.1:54993'],
    credentials: true, // Necesario para que las cookies de sesión funcionen
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Configurar Redis para sesiones
  const RedisStore = connectRedis(session);
  const redisClient = createClient({
    socket: {
      host: redisConfig.host,
      port: redisConfig.port,
    },
    username: redisConfig.username,
    password: redisConfig.password,
  });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    console.log('Redis Client Connected');
  });

  await redisClient.connect();

  // Configurar sesiones
  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      ...sessionConfig,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();