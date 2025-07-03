import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Usuario} from './schemas/usuario.schema';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
  ) {}

  async findAll(): Promise<Usuario[]> {
    return this.usuarioModel.find().exec();
  }

  async findOne(id: string): Promise<Usuario> {
    // Validar que el ID sea un ObjectId válido
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`ID de usuario inválido: ${id}`);
    }
    
    const usuario = await this.usuarioModel.findById(id).exec();
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }

  async existsByCorreo(correo: string): Promise<boolean> {
    const exists = await this.usuarioModel.exists({ correo });
    return !!exists;
  }

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const hash = await bcrypt.hash(createUsuarioDto.contrasena, 10);
    const usuario = new this.usuarioModel({
      ...createUsuarioDto,
      contrasena: hash,
    });
    return usuario.save();
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.usuarioModel.findByIdAndUpdate(id, updateUsuarioDto, { new: true });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }

  async remove(id: string): Promise<void> {
    const result = await this.usuarioModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Usuario no encontrado');
  }

  async getByCorreoYPassword(correo: string, contrasena: string): Promise<Usuario | null> {
    const usuario = await this.usuarioModel.findOne({ correo });
    if (!usuario) return null;
    const isMatch = await bcrypt.compare(contrasena, usuario.contrasena);
    return isMatch ? usuario : null;
  }

  async updateProdInfo(usuarioId: string, prodInfoItem: any, accion: string): Promise<boolean> {
    const usuario = await this.usuarioModel.findById(usuarioId);
    if (!usuario) return false;

    const index = usuario.prodInfo.findIndex(p => p.idProd === prodInfoItem.idProd);

    if (index >= 0) {
      switch (accion) {
        case 'like':
          usuario.prodInfo[index].status = 1;
          break;
        case 'dislike':
          usuario.prodInfo[index].status = 0;
          break;
        case 'rating':
          usuario.prodInfo[index].ranking = prodInfoItem.ranking;
          break;
        default:
          return false;
      }
    } else {
      switch (accion) {
        case 'like':
          prodInfoItem.status = 1;
          usuario.prodInfo.push(prodInfoItem);
          break;
        case 'dislike':
          prodInfoItem.status = 0;
          usuario.prodInfo.push(prodInfoItem);
          break;
        case 'rating':
          usuario.prodInfo.push(prodInfoItem);
          break;
        default:
          return false;
      }
    }

    await usuario.save();
    return true;
  }
}