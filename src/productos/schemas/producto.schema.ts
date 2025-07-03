import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Producto extends Document {
  @Prop({ required: true })
  titulo: string;

  @Prop({ required: true, type: Number })
  precio: number;

  @Prop({ required: true, type: Number })
  cantidad: number;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ type: [String], default: [] })
  imagenes: string[];

  @Prop({ required: true })
  categoria: string;

  @Prop({ type: [String], default: [] })
  plataformas: string[];

  @Prop({ required: true, type: Number })
  stock: number;

  @Prop({ default: Date.now })
  fecha: Date;

  @Prop({ type: Number, default: 0 })
  rating: number;

  @Prop({ type: Number, default: 0 })
  likes: number;

  @Prop({ type: Number, default: 0 })
  dislikes: number;

  @Prop({ type: [String], default: [] })
  etiquetas: string[];
}

export const ProductoSchema = SchemaFactory.createForClass(Producto);
