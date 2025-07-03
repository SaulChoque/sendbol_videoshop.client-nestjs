import { IsString, IsNumber, IsArray, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateProductoDto {
  @IsString()
  titulo: string;

  @IsNumber()
  @Min(0)
  precio: number;

  @IsNumber()
  @Min(0)
  cantidad: number;

  @IsString()
  descripcion: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imagenes?: string[];

  @IsString()
  categoria: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  plataformas?: string[];

  @IsNumber()
  @Min(0)
  stock: number;

  @IsDateString()
  @IsOptional()
  fecha?: Date;

  @IsNumber()
  @Min(0)
  @IsOptional()
  rating?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  likes?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  dislikes?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  etiquetas?: string[];
}
