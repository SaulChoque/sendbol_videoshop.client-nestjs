export const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'sendbol-videoshop-secret-key',
  name: '.Sendbol.Session',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 3600000, // 1 hora (igual que tu configuración de ASP.NET)
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS en producción
    sameSite: 'lax' as const,
  },
};

export const redisConfig = {
  host: 'redis-12332.crce181.sa-east-1-2.ec2.redns.redis-cloud.com',
  port: 12332,
  password: 'zW0YWoixB6i84cCIWbCU7O4c7uaCbahK',
  username: 'default',
};
