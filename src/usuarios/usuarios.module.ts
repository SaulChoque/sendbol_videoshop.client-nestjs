import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { Usuario, UsuarioSchema } from './schemas/usuario.schema';
import { SessionService } from '../services/session.service';
import { AuthGuard } from '../guards/auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }]),
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService, SessionService, AuthGuard],
  exports: [UsuariosService], // Exportar el servicio para uso en otros módulos
})
export class UsuariosModule {}
