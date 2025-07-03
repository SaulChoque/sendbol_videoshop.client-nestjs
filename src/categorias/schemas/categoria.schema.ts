import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Categoria extends Document {
  @Prop({ required: true })
  titulo: string;

  @Prop({ type: [String], default: [] })
  etiquetas: string[];
}

export const CategoriaSchema = SchemaFactory.createForClass(Categoria);
