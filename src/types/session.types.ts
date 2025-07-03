import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    username?: string;
    email?: string;
    isAuthenticated?: boolean;
    // Agrega aquí otros campos que necesites almacenar en la sesión
  }
}
