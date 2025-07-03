import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Model } from 'mongoose';
import { Redis } from 'ioredis';
import { Categoria } from './schemas/categoria.schema';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriasService {
  private readonly collectionName = 'Categorias';

  constructor(
    @InjectModel(Categoria.name) private categoriaModel: Model<Categoria>,
    @InjectRedis() private readonly redisClient: Redis,
  ) {}

  // 1. Obtener todas las categorías usando Redis como caché
  async findAll(): Promise<Categoria[]> {
    const categoriasRedis = await this.getAllCategoriasFromRedis();
    
    if (categoriasRedis.length > 0) {
      console.log(this.collectionName + ' Datos desde Redis kkk');
      return categoriasRedis;
    } else {
      console.log(this.collectionName + ' Datos desde MongoDB gg');
      // Ejecuta la clonación en paralelo sin esperar
      this.clonarCategoriasMongoARedis().catch(console.error);
      return this.categoriaModel.find().exec();
    }
  }

  // 2. Clonar todas las categorías de MongoDB a Redis
  private async clonarCategoriasMongoARedis(): Promise<void> {
    const categorias = await this.categoriaModel.find().exec();
    
    const json = JSON.stringify(categorias);
    await this.redisClient.set('categorias:all', json);
  }

  // 3. Obtener todas las categorías desde Redis
  private async getAllCategoriasFromRedis(): Promise<Categoria[]> {
    const json = await this.redisClient.get('categorias:all');
    if (!json) {
      return [];
    }

    try {
      const categorias = JSON.parse(json);
      return categorias || [];
    } catch (error) {
      console.error('Error parsing categorias from Redis:', error);
      return [];
    }
  }

  // 4. Obtener una categoría por ID usando Redis
  async findOne(id: string): Promise<Categoria> {
    const json = await this.redisClient.get('categorias:all');
    if (json) {
      try {
        const categorias = JSON.parse(json);
        const categoria = categorias?.find((c: any) => c.id === id || c._id === id);
        if (categoria) {
          return categoria;
        }
      } catch (error) {
        console.error('Error parsing categorias from Redis:', error);
      }
    }

    // Si no está en Redis, buscar en MongoDB
    const categoriaMongo = await this.categoriaModel.findById(id).exec();
    if (!categoriaMongo) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return categoriaMongo;
  }

  // 5. Buscar categorías por título usando Redis
  async searchByTitulo(search: string): Promise<Categoria[]> {
    const categoriasRedis = await this.findAll();
    return categoriasRedis.filter(c => 
      c.titulo && c.titulo.toLowerCase().includes(search.toLowerCase())
    );
  }

  // 6. Crear nueva categoría
  async create(createCategoriaDto: CreateCategoriaDto): Promise<Categoria> {
    const categoria = new this.categoriaModel(createCategoriaDto);
    const savedCategoria = await categoria.save();

    // Invalidar caché de Redis para forzar recarga
    await this.redisClient.del('categorias:all');

    return savedCategoria;
  }

  // 7. Actualizar categoría
  async update(id: string, updateCategoriaDto: UpdateCategoriaDto): Promise<Categoria> {
    const categoria = await this.categoriaModel
      .findByIdAndUpdate(id, updateCategoriaDto, { new: true })
      .exec();
    
    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Invalidar caché de Redis para forzar recarga
    await this.redisClient.del('categorias:all');

    return categoria;
  }

  // 8. Eliminar categoría
  async remove(id: string): Promise<void> {
    const result = await this.categoriaModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Invalidar caché de Redis para forzar recarga
    await this.redisClient.del('categorias:all');
  }

  // 9. Sincronizar datos entre MongoDB y Redis
  async sincronizar(): Promise<void> {
    await this.clonarCategoriasMongoARedis();
  }
}
