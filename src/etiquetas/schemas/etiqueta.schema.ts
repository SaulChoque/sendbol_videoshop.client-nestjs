import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Etiqueta extends Document {
  @Prop({ required: true })
  tag: string;
}

export const EtiquetaSchema = SchemaFactory.createForClass(Etiqueta);
