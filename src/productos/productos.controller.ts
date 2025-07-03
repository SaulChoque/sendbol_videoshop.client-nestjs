import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  BadRequestException 
} from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { LikesDislikesDto, RatingDto } from './dto/productos-query.dto';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  // 1. Obtener todos los productos
  @Get()
  findAll() {
    return this.productosService.findAll();
  }

  // 2. Buscar productos por título
  @Get('search')
  searchByTitulo(@Query('q') query: string) {
    if (!query) {
      throw new BadRequestException('Query parameter "q" is required');
    }
    return this.productosService.searchByTitulo(query);
  }

  // 3. Obtener productos por array de IDs
  @Post('by-ids')
  getByIds(@Body() body: { ids: string[] }) {
    return this.productosService.findByIds(body.ids);
  }

  // 4. Obtener productos por categoría
  @Get('categoria/:categoria')
  getByCategoria(@Param('categoria') categoria: string) {
    return this.productosService.findByCategoria(categoria);
  }

  // 5. Obtener productos por plataforma
  @Get('plataforma/:plataforma')
  getByPlataforma(@Param('plataforma') plataforma: string) {
    return this.productosService.findByPlataforma(plataforma);
  }

  // 6. Obtener productos por rango de precio
  @Get('rango-precio')
  getByRangoPrecio(
    @Query('min') min: string,
    @Query('max') max: string
  ) {
    const minPrice = parseFloat(min);
    const maxPrice = parseFloat(max);
    
    if (isNaN(minPrice) || isNaN(maxPrice)) {
      throw new BadRequestException('Min and max must be valid numbers');
    }
    
    return this.productosService.findByRangoPrecio(minPrice, maxPrice);
  }

  // 7. Obtener productos ordenados por rating
  @Get('top-ranking')
  getTopRanking(
    @Query('cantidad') cantidad: string = '10',
    @Query('sortOrder') sortOrder: string = 'false'
  ) {
    const cantidadNum = parseInt(cantidad);
    const sortOrderBool = sortOrder === 'true';
    
    if (isNaN(cantidadNum)) {
      throw new BadRequestException('Cantidad must be a valid number');
    }
    
    return this.productosService.getProductosPorRatingDesc(cantidadNum, sortOrderBool);
  }

  // 8. Obtener productos ordenados por likes
  @Get('top-likes')
  getTopLikes(
    @Query('cantidad') cantidad: string = '10',
    @Query('sortOrder') sortOrder: string = 'false'
  ) {
    const cantidadNum = parseInt(cantidad);
    const sortOrderBool = sortOrder === 'true';
    
    if (isNaN(cantidadNum)) {
      throw new BadRequestException('Cantidad must be a valid number');
    }
    
    return this.productosService.getProductosPorLikesDesc(cantidadNum, sortOrderBool);
  }

  // 9. Filtrar productos con múltiples criterios
  @Get('filtrar')
  filtrar(
    @Query('categoria') categoria?: string,
    @Query('plataforma') plataforma?: string,
    @Query('min') min?: string,
    @Query('max') max?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string
  ) {
    const minPrice = min ? parseFloat(min) : undefined;
    const maxPrice = max ? parseFloat(max) : undefined;
    const sortOrderBool = sortOrder === 'true';
    
    if (min && isNaN(minPrice!)) {
      throw new BadRequestException('Min must be a valid number');
    }
    if (max && isNaN(maxPrice!)) {
      throw new BadRequestException('Max must be a valid number');
    }
    
    return this.productosService.filtrarProductos(
      categoria,
      plataforma,
      minPrice,
      maxPrice,
      sortBy,
      sortOrderBool
    );
  }

  // 10. Obtener producto por ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productosService.findOne(id);
  }

  // 11. Crear nuevo producto
  @Post()
  create(@Body() createProductoDto: CreateProductoDto) {
    return this.productosService.create(createProductoDto);
  }

  // 12. Actualizar producto
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductoDto: UpdateProductoDto) {
    return this.productosService.update(id, updateProductoDto);
  }

  // 13. Eliminar producto
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productosService.remove(id);
  }

  // 14. Actualizar rating en Redis
  @Post('update-rating/:id')
  async updateRatingRedis(@Param('id') id: string, @Body() dto: RatingDto) {
    await this.productosService.updateRating(id, dto.rating);
    return { message: 'Rating actualizado en Redis.' };
  }

  // 15. Actualizar likes y dislikes en Redis
  @Post('update-likes-dislikes/:id')
  async updateLikesDislikesRedis(@Param('id') id: string, @Body() dto: LikesDislikesDto) {
    await this.productosService.updateLikesDislikesRedis(id, dto.likes, dto.dislikes);
    return { message: 'Likes y dislikes actualizados en Redis.' };
  }
}
