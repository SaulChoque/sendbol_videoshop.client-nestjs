import { IsString } from 'class-validator';

export class CreatePlataformaDto {
  @IsString()
  nombre: string;

  @IsString()
  icon: string;
}
