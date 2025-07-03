import { Injectable, BadRequestException } from '@nestjs/common';
import { SessionData } from 'express-session';
import { isValidObjectId } from 'mongoose';
import '../types/session.types';

@Injectable()
export class SessionService {
  // Establecer datos de usuario en la sesión
  setUserSession(session: SessionData, userData: { userId: string; username: string; email: string }) {
    // Validar que el userId sea un ObjectId válido
    if (!isValidObjectId(userData.userId)) {
      throw new BadRequestException(`ID de usuario inválido: ${userData.userId}`);
    }
    
    session.userId = userData.userId;
    session.username = userData.username;
    session.email = userData.email;
    session.isAuthenticated = true;
  }

  // Obtener datos del usuario de la sesión
  getUserSession(session: SessionData) {
    return {
      userId: session.userId,
      username: session.username,
      email: session.email,
      isAuthenticated: session.isAuthenticated || false,
    };
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(session: SessionData): boolean {
    return session.isAuthenticated === true && !!session.userId;
  }

  // Limpiar la sesión (logout)
  clearSession(session: any): Promise<void> {
    return new Promise((resolve, reject) => {
      session.destroy((err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // Regenerar ID de sesión (útil después del login para seguridad)
  regenerateSession(session: any): Promise<void> {
    return new Promise((resolve, reject) => {
      session.regenerate((err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
