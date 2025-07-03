import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Model } from 'mongoose';
import { Redis } from 'ioredis';
import { Producto } from './schemas/producto.schema';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductosService {
  constructor(
    @InjectModel(Producto.name) private productoModel: Model<Producto>,
    @InjectRedis() private readonly redisClient: Redis,
  ) {}

  // 1. Obtener todos los productos
  async findAll(): Promise<Producto[]> {
    return this.productoModel.find().exec();
  }

  // 2. Buscar productos por título
  async searchByTitulo(search: string): Promise<Producto[]> {
    return this.productoModel
      .find({ titulo: { $regex: search, $options: 'i' } })
      .exec();
  }

  // 3. Obtener productos por array de IDs
  async findByIds(ids: string[]): Promise<Producto[]> {
    return this.productoModel.find({ _id: { $in: ids } }).exec();
  }

  // 4. Obtener productos por categoría
  async findByCategoria(categoria: string): Promise<Producto[]> {
    return this.productoModel.find({ categoria }).exec();
  }

  // 5. Obtener productos por plataforma
  async findByPlataforma(plataforma: string): Promise<Producto[]> {
    return this.productoModel.find({ plataformas: plataforma }).exec();
  }

  // 6. Obtener productos por rango de precio
  async findByRangoPrecio(min: number, max: number): Promise<Producto[]> {
    return this.productoModel
      .find({ precio: { $gte: min, $lte: max } })
      .exec();
  }

  // 7. Obtener producto por ID
  async findOne(id: string): Promise<Producto> {
    const producto = await this.productoModel.findById(id).exec();
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }
    return producto;
  }

  // 8. Crear nuevo producto
  async create(createProductoDto: CreateProductoDto): Promise<Producto> {
    const producto = new this.productoModel(createProductoDto);
    return producto.save();
  }

  // 9. Actualizar producto
  async update(id: string, updateProductoDto: UpdateProductoDto): Promise<Producto> {
    const producto = await this.productoModel
      .findByIdAndUpdate(id, updateProductoDto, { new: true })
      .exec();
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }
    return producto;
  }

  // 10. Eliminar producto
  async remove(id: string): Promise<void> {
    const result = await this.productoModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Producto no encontrado');
    }
  }

  // 11. Actualizar likes y dislikes en MongoDB
  async updateLikesDislikes(id: string, likes: number, dislikes: number): Promise<void> {
    const producto = await this.productoModel
      .findByIdAndUpdate(id, { likes, dislikes }, { new: true })
      .exec();
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }
  }

  // 12. Actualizar likes y dislikes en Redis
  async updateLikesDislikesRedis(id: string, likes: number, dislikes: number): Promise<void> {
    await this.sincronizarLikesDislikesRedis();
    await this.redisClient.zadd('productosMetricas:likes', likes, id);
    await this.redisClient.zadd('productosMetricas:dislikes', dislikes, id);
  }

  // 13. Actualizar rating en Redis
  async updateRating(id: string, rating: number): Promise<void> {
    await this.sincronizarRatingRedis();
    await this.redisClient.zadd('productosMetricas:ranking', rating, id);
  }

  // 14. Sincronizar likes y dislikes a Redis
  private async sincronizarLikesDislikesRedis(): Promise<void> {
    const likesCount = await this.redisClient.zcard('productosMetricas:likes');
    const dislikesCount = await this.redisClient.zcard('productosMetricas:dislikes');

    if (likesCount > 0 && dislikesCount > 0) return;

    const productos = await this.productoModel.find().exec();
    const pipeline = this.redisClient.pipeline();

    productos.forEach((producto) => {
      pipeline.zadd('productosMetricas:likes', producto.likes, producto.id);
      pipeline.zadd('productosMetricas:dislikes', producto.dislikes, producto.id);
    });

    await pipeline.exec();
  }

  // 15. Sincronizar rating a Redis
  private async sincronizarRatingRedis(): Promise<void> {
    const ratingCount = await this.redisClient.zcard('productosMetricas:ranking');
    if (ratingCount > 0) return;

    const productos = await this.productoModel.find().exec();
    const pipeline = this.redisClient.pipeline();

    productos.forEach((producto) => {
      pipeline.zadd('productosMetricas:ranking', producto.rating, producto.id);
    });

    await pipeline.exec();
  }

  // 16. Obtener productos por rating descendente
  async getProductosPorRatingDesc(cantidad: number, order: boolean): Promise<Producto[]> {
    await this.sincronizarRatingRedis();
    
    const ordenRedis = order ? 'ASC' : 'DESC';
    const ids = await this.redisClient.zrevrange('productosMetricas:ranking', 0, cantidad - 1);
    
    if (ordenRedis === 'ASC') {
      ids.reverse();
    }

    const productos = await this.productoModel.find({ _id: { $in: ids } }).exec();
    
    // Mantener el orden de Redis
    const productosOrdenados = ids
      .map(id => productos.find(p => p.id === id))
      .filter(producto => producto !== undefined) as Producto[];

    return productosOrdenados;
  }

  // 17. Obtener productos por likes descendente
  async getProductosPorLikesDesc(cantidad: number, order: boolean): Promise<Producto[]> {
    await this.sincronizarLikesDislikesRedis();
    
    // Calcular likes - dislikes usando Redis
    const likes = await this.redisClient.zrevrange('productosMetricas:likes', 0, -1, 'WITHSCORES');
    const dislikes = await this.redisClient.zrevrange('productosMetricas:dislikes', 0, -1, 'WITHSCORES');

    // Crear mapa de diferencias (likes - dislikes)
    const diferencias: { id: string; score: number }[] = [];
    
    for (let i = 0; i < likes.length; i += 2) {
      const id = likes[i];
      const likesScore = parseInt(likes[i + 1]);
      const dislikesIndex = dislikes.indexOf(id);
      const dislikesScore = dislikesIndex >= 0 ? parseInt(dislikes[dislikesIndex + 1]) : 0;
      
      diferencias.push({
        id,
        score: likesScore - dislikesScore
      });
    }

    // Ordenar por diferencia
    diferencias.sort((a, b) => order ? a.score - b.score : b.score - a.score);
    
    // Tomar solo la cantidad solicitada
    const topIds = diferencias.slice(0, cantidad).map(item => item.id);
    
    const productos = await this.productoModel.find({ _id: { $in: topIds } }).exec();
    
    // Mantener el orden
    const productosOrdenados = topIds
      .map(id => productos.find(p => p.id === id))
      .filter(producto => producto !== undefined) as Producto[];

    return productosOrdenados;
  }

  // 18. Filtrar productos con múltiples criterios
  async filtrarProductos(
    categoria?: string,
    plataforma?: string,
    min?: number,
    max?: number,
    sortBy?: string,
    sortOrder?: boolean
  ): Promise<Producto[]> {
    const filter: any = {};

    if (categoria) filter.categoria = categoria;
    if (plataforma) filter.plataformas = plataforma;
    if (min !== undefined) filter.precio = { ...filter.precio, $gte: min };
    if (max !== undefined) filter.precio = { ...filter.precio, $lte: max };

    let query = this.productoModel.find(filter);

    // Si el ordenamiento es por métricas de Redis
    if (sortBy && (sortBy.toLowerCase() === 'ranking' || sortBy.toLowerCase() === 'likes')) {
      let productos: Producto[];
      
      if (sortBy.toLowerCase() === 'ranking') {
        productos = await this.getProductosPorRatingDesc(1000, sortOrder || false);
      } else {
        productos = await this.getProductosPorLikesDesc(1000, sortOrder || false);
      }

      // Filtrar los productos obtenidos por Redis según los criterios
      return productos.filter(producto => {
        if (categoria && producto.categoria !== categoria) return false;
        if (plataforma && !producto.plataformas.includes(plataforma)) return false;
        if (min !== undefined && producto.precio < min) return false;
        if (max !== undefined && producto.precio > max) return false;
        return true;
      });
    } else {
      // Ordenamiento por campos de MongoDB
      if (sortBy) {
        const sortDirection = sortOrder ? 1 : -1;
        query = query.sort({ [sortBy]: sortDirection });
      }
      
      return query.exec();
    }
  }
}
