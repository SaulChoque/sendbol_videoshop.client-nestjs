import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class ProdInfoItem {
  @Prop({ required: true })
  idProd: string;

  @Prop()
  status: number;

  @Prop()
  ranking: number;
}

export const ProdInfoItemSchema = SchemaFactory.createForClass(ProdInfoItem);

@Schema()
export class Usuario extends Document {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  apellido: string;

  @Prop({ required: true, unique: true })
  correo: string;

  @Prop({ required: true })
  contrasena: string;

  @Prop()
  telefono: string;

  @Prop()
  fechaNacimiento: Date;

  @Prop({ default: Date.now })
  fechaCreacion: Date;

  @Prop()
  pais: string;

  @Prop({ type: [ProdInfoItemSchema], default: [] })
  prodInfo: ProdInfoItem[];
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);