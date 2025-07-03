import { PartialType } from '@nestjs/mapped-types';
import { CreatePlataformaDto } from './create-plataforma.dto';

export class UpdatePlataformaDto extends PartialType(CreatePlataformaDto) {}
