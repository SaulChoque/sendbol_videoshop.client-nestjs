import { Controller, Get, Post, Body, Param, Patch, Delete, NotFoundException, BadRequestException, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { AuthGuard } from '../guards/auth.guard';
import { Session } from '../decorators/session.decorator';
import { SessionData } from 'express-session';
import { SessionService } from '../services/session.service';

@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly sessionService: SessionService,
  ) {}

  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getCurrentUser(@Session() session: SessionData) {
    const userData = this.sessionService.getUserSession(session);
    
    if (!userData.userId) {
      throw new BadRequestException('ID de usuario no encontrado en la sesión');
    }
    
    return this.usuariosService.findOne(userData.userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(id);
  }

  @Get('exists/:correo')
  async exists(@Param('correo') correo: string) {
    const exists = await this.usuariosService.existsByCorreo(correo);
    if (!exists) throw new NotFoundException('El usuario con el correo especificado no existe.');
    return { message: 'El usuario existe.' };
  }

  @Post('login')
  async login(@Body() body: { correo: string; contrasena: string }) {
    const usuario = await this.usuariosService.getByCorreoYPassword(body.correo, body.contrasena);
    if (!usuario) throw new BadRequestException('Credenciales incorrectas');
    // Aquí puedes implementar lógica de sesión/token si lo necesitas
    return { message: 'Sesión iniciada', usuarioId: usuario._id };
  }

  @Post(':usuarioId/like')
  likeProducto(@Param('usuarioId') usuarioId: string, @Body() prodInfoItem: any) {
    return this.usuariosService.updateProdInfo(usuarioId, prodInfoItem, 'like');
  }

  @Post(':usuarioId/dislike')
  dislikeProducto(@Param('usuarioId') usuarioId: string, @Body() prodInfoItem: any) {
    return this.usuariosService.updateProdInfo(usuarioId, prodInfoItem, 'dislike');
  }

  @Post(':usuarioId/rating')
  ratingProducto(@Param('usuarioId') usuarioId: string, @Body() prodInfoItem: any) {
    return this.usuariosService.updateProdInfo(usuarioId, prodInfoItem, 'rating');
  }
}