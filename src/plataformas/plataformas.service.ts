import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Model } from 'mongoose';
import { Redis } from 'ioredis';
import { Plataforma } from './schemas/plataforma.schema';
import { CreatePlataformaDto } from './dto/create-plataforma.dto';
import { UpdatePlataformaDto } from './dto/update-plataforma.dto';

@Injectable()
export class PlataformasService {
  constructor(
    @InjectModel(Plataforma.name) private plataformaModel: Model<Plataforma>,
    @InjectRedis() private readonly redisClient: Redis,
  ) {}

  // 1. Obtener todas las plataformas usando Redis como caché
  async findAll(): Promise<Plataforma[]> {
    const plataformasRedis = await this.getAllPlataformasFromRedis();
    if (plataformasRedis.length > 0) {
      return plataformasRedis;
    }

    await this.clonarPlataformasMongoARedis();
    return this.getAllPlataformasFromRedis();
  }

  // 2. Clonar todas las plataformas de MongoDB a Redis
  private async clonarPlataformasMongoARedis(): Promise<void> {
    const plataformas = await this.plataformaModel.find().exec();

    for (const plataforma of plataformas) {
      const key = `plataformas:${plataforma.id}`;
      const dict = {
        Id: plataforma.id,
        Nombre: plataforma.nombre,
        Icon: plataforma.icon,
      };

      await this.redisClient.hmset(key, dict);
    }
  }

  // 3. Obtener todas las plataformas desde Redis
  private async getAllPlataformasFromRedis(): Promise<Plataforma[]> {
    const keys = await this.redisClient.keys('plataformas:*');
    const plataformasList: Plataforma[] = [];

    for (const key of keys) {
      const hashData = await this.redisClient.hgetall(key);
      if (Object.keys(hashData).length > 0) {
        // Crear objeto plataforma sin usar el modelo de Mongoose
        const plataforma = {
          id: hashData.Id,
          nombre: hashData.Nombre || '',
          icon: hashData.Icon || '',
        } as Plataforma;
        plataformasList.push(plataforma);
      }
    }

    return plataformasList;
  }

  // 4. Obtener una plataforma por ID usando Redis
  async findOne(id: string): Promise<Plataforma> {
    const key = `plataformas:${id}`;
    const hashData = await this.redisClient.hgetall(key);

    if (Object.keys(hashData).length > 0) {
      // Crear objeto plataforma sin usar el modelo de Mongoose
      const plataforma = {
        id: hashData.Id,
        nombre: hashData.Nombre || '',
        icon: hashData.Icon || '',
      } as Plataforma;
      return plataforma;
    }

    // Si no está en Redis, intenta clonar desde MongoDB y buscar de nuevo
    await this.clonarPlataformasMongoARedis();
    const hashDataRetry = await this.redisClient.hgetall(key);
    
    if (Object.keys(hashDataRetry).length > 0) {
      const plataforma = {
        id: hashDataRetry.Id,
        nombre: hashDataRetry.Nombre || '',
        icon: hashDataRetry.Icon || '',
      } as Plataforma;
      return plataforma;
    }

    throw new NotFoundException('Plataforma no encontrada');
  }

  // 5. Buscar plataformas por nombre usando Redis
  async searchByNombre(search: string): Promise<Plataforma[]> {
    const plataformasRedis = await this.getAllPlataformasFromRedis();
    return plataformasRedis.filter(p => 
      p.nombre && p.nombre.toLowerCase().includes(search.toLowerCase())
    );
  }

  // 6. Crear nueva plataforma
  async create(createPlataformaDto: CreatePlataformaDto): Promise<Plataforma> {
    const plataforma = new this.plataformaModel(createPlataformaDto);
    const savedPlataforma = await plataforma.save();

    // Actualizar Redis
    const key = `plataformas:${savedPlataforma.id}`;
    const dict = {
      Id: savedPlataforma.id,
      Nombre: savedPlataforma.nombre,
      Icon: savedPlataforma.icon,
    };
    await this.redisClient.hmset(key, dict);

    return savedPlataforma;
  }

  // 7. Actualizar plataforma
  async update(id: string, updatePlataformaDto: UpdatePlataformaDto): Promise<Plataforma> {
    const plataforma = await this.plataformaModel
      .findByIdAndUpdate(id, updatePlataformaDto, { new: true })
      .exec();
    
    if (!plataforma) {
      throw new NotFoundException('Plataforma no encontrada');
    }

    // Actualizar Redis
    const key = `plataformas:${plataforma.id}`;
    const dict = {
      Id: plataforma.id,
      Nombre: plataforma.nombre,
      Icon: plataforma.icon,
    };
    await this.redisClient.hmset(key, dict);

    return plataforma;
  }

  // 8. Eliminar plataforma
  async remove(id: string): Promise<void> {
    const result = await this.plataformaModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Plataforma no encontrada');
    }

    // Eliminar de Redis
    const key = `plataformas:${id}`;
    await this.redisClient.del(key);
  }

  // 9. Sincronizar datos entre MongoDB y Redis
  async sincronizar(): Promise<void> {
    await this.clonarPlataformasMongoARedis();
  }
}
