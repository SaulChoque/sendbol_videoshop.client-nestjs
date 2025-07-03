import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Plataforma extends Document {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  icon: string;
}

export const PlataformaSchema = SchemaFactory.createForClass(Plataforma);
