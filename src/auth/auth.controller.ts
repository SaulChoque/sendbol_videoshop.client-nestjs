import { Controller, Post, Get, Body, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { SessionService } from '../services/session.service';
import { AuthGuard } from '../guards/auth.guard';
import { Session } from '../decorators/session.decorator';
import { SessionData } from 'express-session';
import { UsuariosService } from '../usuarios/usuarios.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly usuariosService: UsuariosService,
  ) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Req() request: Request,
  ) {
    try {
      // Validar credenciales con el servicio de usuarios
      const usuario = await this.usuariosService.getByCorreoYPassword(
        loginDto.correo,
        loginDto.contrasena,
      );

      if (!usuario) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      // Regenerar sesión por seguridad
      await this.sessionService.regenerateSession(request.session);

      // Establecer datos de usuario en la sesión
      this.sessionService.setUserSession(request.session, {
        userId: (usuario as any)._id.toString(),
        username: (usuario as any).nombre,
        email: (usuario as any).correo,
      });

      return { 
        success: true, 
        message: 'Login exitoso',
        user: {
          id: (usuario as any)._id,
          nombre: (usuario as any).nombre,
          correo: (usuario as any).correo,
        }
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Error en el proceso de autenticación');
    }
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Req() request: Request) {
    await this.sessionService.clearSession(request.session);
    return { success: true, message: 'Logout exitoso' };
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  getProfile(@Session() session: SessionData) {
    return {
      success: true,
      user: this.sessionService.getUserSession(session),
    };
  }

  @Get('check')
  checkAuth(@Session() session: SessionData) {
    return {
      isAuthenticated: this.sessionService.isAuthenticated(session),
      user: this.sessionService.isAuthenticated(session) 
        ? this.sessionService.getUserSession(session) 
        : null,
    };
  }

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
  ) {
    try {
      // Verificar si el usuario ya existe
      const existeUsuario = await this.usuariosService.existsByCorreo(registerDto.correo);
      if (existeUsuario) {
        throw new UnauthorizedException('El correo ya está registrado');
      }

      // Crear el usuario
      const nuevoUsuario = await this.usuariosService.create(registerDto);

      return {
        success: true,
        message: 'Usuario registrado exitosamente',
        user: {
          id: (nuevoUsuario as any)._id,
          nombre: (nuevoUsuario as any).nombre,
          correo: (nuevoUsuario as any).correo,
        }
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Error en el proceso de registro');
    }
  }
}
