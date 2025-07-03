import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { SessionService } from '../services/session.service';
import { AuthGuard } from '../guards/auth.guard';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [UsuariosModule],
  controllers: [AuthController],
  providers: [SessionService, AuthGuard],
  exports: [SessionService, AuthGuard],
})
export class AuthModule {}
