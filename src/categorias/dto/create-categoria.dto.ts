import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateCategoriaDto {
  @IsString()
  titulo: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  etiquetas?: string[];
}
