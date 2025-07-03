import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosModule } from './usuarios/usuarios.module';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ProductosModule } from './productos/productos.module';
import { PlataformasModule } from './plataformas/plataformas.module';
import { EtiquetasModule } from './etiquetas/etiquetas.module';
import { CategoriasModule } from './categorias/categorias.module';
import { StorageModule } from './storage/storage.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://ClusterBol:fede4363451@clusterbol.y9h22.mongodb.net/videoshop?retryWrites=true&w=majority&appName=ClusterBol'), // URL de conexión
    RedisModule.forRoot({
      type: 'single',
      url: 'redis://default:zW0YWoixB6i84cCIWbCU7O4c7uaCbahK@redis-12332.crce181.sa-east-1-2.ec2.redns.redis-cloud.com:12332',
    }),
    UsuariosModule,
    ProductosModule,
    PlataformasModule,
    EtiquetasModule,
    CategoriasModule,
    StorageModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}