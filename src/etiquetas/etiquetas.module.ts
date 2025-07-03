import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EtiquetasService } from './etiquetas.service';
import { EtiquetasController } from './etiquetas.controller';
import { Etiqueta, EtiquetaSchema } from './schemas/etiqueta.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Etiqueta.name, schema: EtiquetaSchema }]),
  ],
  controllers: [EtiquetasController],
  providers: [EtiquetasService],
})
export class EtiquetasModule {}
