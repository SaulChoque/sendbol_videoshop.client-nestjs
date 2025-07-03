// create-usuario.dto.ts
import { IsString, IsEmail, IsDate, IsOptional, IsArray } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsEmail()
  correo: string;

  @IsString()
  contrasena: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsDate()
  @IsOptional()
  fechaNacimiento?: Date;

  @IsString()
  @IsOptional()
  pais?: string;

  @IsArray()
  @IsOptional()
  prodInfo?: any[];
}