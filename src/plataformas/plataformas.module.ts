import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlataformasService } from './plataformas.service';
import { PlataformasController } from './plataformas.controller';
import { Plataforma, PlataformaSchema } from './schemas/plataforma.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Plataforma.name, schema: PlataformaSchema }]),
  ],
  controllers: [PlataformasController],
  providers: [PlataformasService],
})
export class PlataformasModule {}
