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
import { EtiquetasService } from './etiquetas.service';
import { CreateEtiquetaDto } from './dto/create-etiqueta.dto';
import { UpdateEtiquetaDto } from './dto/update-etiqueta.dto';

@Controller('etiquetas')
export class EtiquetasController {
  constructor(private readonly etiquetasService: EtiquetasService) {}

  // 1. Obtener todas las etiquetas
  @Get()
  findAll() {
    return this.etiquetasService.findAll();
  }

  // 2. Buscar etiquetas por tag
  @Get('search')
  searchByTag(@Query('q') query: string) {
    if (!query) {
      throw new BadRequestException('Query parameter "q" is required');
    }
    return this.etiquetasService.searchByTag(query);
  }

  // 3. Obtener etiqueta por ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.etiquetasService.findOne(id);
  }

  // 4. Crear nueva etiqueta
  @Post()
  create(@Body() createEtiquetaDto: CreateEtiquetaDto) {
    return this.etiquetasService.create(createEtiquetaDto);
  }

  // 5. Actualizar etiqueta
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEtiquetaDto: UpdateEtiquetaDto) {
    return this.etiquetasService.update(id, updateEtiquetaDto);
  }

  // 6. Eliminar etiqueta
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.etiquetasService.remove(id);
  }

  // 7. Sincronizar datos entre MongoDB y Redis
  @Post('sincronizar')
  async sincronizar() {
    await this.etiquetasService.sincronizar();
    return { message: 'Datos de etiquetas sincronizados correctamente entre MongoDB y Redis.' };
  }
}
