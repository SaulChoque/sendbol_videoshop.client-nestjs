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
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  // 1. Obtener todas las categorías
  @Get()
  findAll() {
    return this.categoriasService.findAll();
  }

  // 2. Buscar categorías por título
  @Get('search')
  searchByTitulo(@Query('q') query: string) {
    if (!query) {
      throw new BadRequestException('Query parameter "q" is required');
    }
    return this.categoriasService.searchByTitulo(query);
  }

  // 3. Obtener categoría por ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriasService.findOne(id);
  }

  // 4. Crear nueva categoría
  @Post()
  create(@Body() createCategoriaDto: CreateCategoriaDto) {
    return this.categoriasService.create(createCategoriaDto);
  }

  // 5. Actualizar categoría
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoriaDto: UpdateCategoriaDto) {
    return this.categoriasService.update(id, updateCategoriaDto);
  }

  // 6. Eliminar categoría
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriasService.remove(id);
  }

  // 7. Sincronizar datos entre MongoDB y Redis
  @Post('sincronizar')
  async sincronizar() {
    await this.categoriasService.sincronizar();
    return { message: 'Datos de categorías sincronizados correctamente entre MongoDB y Redis.' };
  }
}
