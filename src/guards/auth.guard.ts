import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { SessionService } from '../services/session.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const session = request.session;

    if (!session || !this.sessionService.isAuthenticated(session)) {
      throw new UnauthorizedException('No estás autenticado');
    }

    return true;
  }
}
