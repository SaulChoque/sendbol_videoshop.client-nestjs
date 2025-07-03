import { IsString } from 'class-validator';

export class CreateEtiquetaDto {
  @IsString()
  tag: string;
}
