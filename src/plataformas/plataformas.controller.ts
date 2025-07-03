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
import { PlataformasService } from './plataformas.service';
import { CreatePlataformaDto } from './dto/create-plataforma.dto';
import { UpdatePlataformaDto } from './dto/update-plataforma.dto';

@Controller('plataformas')
export class PlataformasController {
  constructor(private readonly plataformasService: PlataformasService) {}

  // 1. Obtener todas las plataformas
  @Get()
  findAll() {
    return this.plataformasService.findAll();
  }

  // 2. Buscar plataformas por nombre
  @Get('search')
  searchByNombre(@Query('q') query: string) {
    if (!query) {
      throw new BadRequestException('Query parameter "q" is required');
    }
    return this.plataformasService.searchByNombre(query);
  }

  // 3. Obtener plataforma por ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plataformasService.findOne(id);
  }

  // 4. Crear nueva plataforma
  @Post()
  create(@Body() createPlataformaDto: CreatePlataformaDto) {
    return this.plataformasService.create(createPlataformaDto);
  }

  // 5. Actualizar plataforma
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlataformaDto: UpdatePlataformaDto) {
    return this.plataformasService.update(id, updatePlataformaDto);
  }

  // 6. Eliminar plataforma
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.plataformasService.remove(id);
  }

  // 7. Sincronizar datos entre MongoDB y Redis
  @Post('sincronizar')
  async sincronizar() {
    await this.plataformasService.sincronizar();
    return { message: 'Datos sincronizados correctamente entre MongoDB y Redis.' };
  }
}
