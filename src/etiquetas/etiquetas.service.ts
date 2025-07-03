import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Model } from 'mongoose';
import { Redis } from 'ioredis';
import { Etiqueta } from './schemas/etiqueta.schema';
import { CreateEtiquetaDto } from './dto/create-etiqueta.dto';
import { UpdateEtiquetaDto } from './dto/update-etiqueta.dto';

@Injectable()
export class EtiquetasService {
  private readonly collectionName = 'Etiquetas';

  constructor(
    @InjectModel(Etiqueta.name) private etiquetaModel: Model<Etiqueta>,
    @InjectRedis() private readonly redisClient: Redis,
  ) {}

  // 1. Obtener todas las etiquetas usando Redis como caché
  async findAll(): Promise<Etiqueta[]> {
    const etiquetasRedis = await this.getAllEtiquetasFromRedis();
    
    if (etiquetasRedis.length > 0) {
      console.log(this.collectionName + ' Datos desde Redis');
      return etiquetasRedis;
    } else {
      console.log(this.collectionName + ' Datos desde MongoDB');
      // Ejecuta la clonación en paralelo sin esperar
      this.clonarEtiquetasMongoARedis().catch(console.error);
      return this.etiquetaModel.find().exec();
    }
  }

  // 2. Clonar todas las etiquetas de MongoDB a Redis
  private async clonarEtiquetasMongoARedis(): Promise<void> {
    const etiquetas = await this.etiquetaModel.find().exec();
    const json = JSON.stringify(etiquetas);
    await this.redisClient.set('etiquetas:all', json);
  }

  // 3. Obtener todas las etiquetas desde Redis
  private async getAllEtiquetasFromRedis(): Promise<Etiqueta[]> {
    const json = await this.redisClient.get('etiquetas:all');
    if (!json) {
      return [];
    }

    try {
      const etiquetas = JSON.parse(json);
      return etiquetas || [];
    } catch (error) {
      console.error('Error parsing etiquetas from Redis:', error);
      return [];
    }
  }

  // 4. Obtener una etiqueta por ID usando Redis
  async findOne(id: string): Promise<Etiqueta> {
    const etiquetas = await this.getAllEtiquetasFromRedis();
    const etiqueta = etiquetas.find(e => e.id === id);
    
    if (etiqueta) {
      return etiqueta;
    }

    // Si no está en Redis, buscar en MongoDB
    const etiquetaMongo = await this.etiquetaModel.findById(id).exec();
    if (!etiquetaMongo) {
      throw new NotFoundException('Etiqueta no encontrada');
    }

    return etiquetaMongo;
  }

  // 5. Buscar etiquetas por tag usando Redis
  async searchByTag(search: string): Promise<Etiqueta[]> {
    const etiquetasRedis = await this.getAllEtiquetasFromRedis();
    return etiquetasRedis.filter(e => 
      e.tag && e.tag.toLowerCase().includes(search.toLowerCase())
    );
  }

  // 6. Crear nueva etiqueta
  async create(createEtiquetaDto: CreateEtiquetaDto): Promise<Etiqueta> {
    const etiqueta = new this.etiquetaModel(createEtiquetaDto);
    const savedEtiqueta = await etiqueta.save();

    // Invalidar caché de Redis para forzar recarga
    await this.redisClient.del('etiquetas:all');

    return savedEtiqueta;
  }

  // 7. Actualizar etiqueta
  async update(id: string, updateEtiquetaDto: UpdateEtiquetaDto): Promise<Etiqueta> {
    const etiqueta = await this.etiquetaModel
      .findByIdAndUpdate(id, updateEtiquetaDto, { new: true })
      .exec();
    
    if (!etiqueta) {
      throw new NotFoundException('Etiqueta no encontrada');
    }

    // Invalidar caché de Redis para forzar recarga
    await this.redisClient.del('etiquetas:all');

    return etiqueta;
  }

  // 8. Eliminar etiqueta
  async remove(id: string): Promise<void> {
    const result = await this.etiquetaModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Etiqueta no encontrada');
    }

    // Invalidar caché de Redis para forzar recarga
    await this.redisClient.del('etiquetas:all');
  }

  // 9. Sincronizar datos entre MongoDB y Redis
  async sincronizar(): Promise<void> {
    await this.clonarEtiquetasMongoARedis();
  }
}
