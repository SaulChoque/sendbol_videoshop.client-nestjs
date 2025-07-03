import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  nombre: string;

  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  apellido: string;

  @IsEmail({}, { message: 'El correo debe ser una dirección válida' })
  correo: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  contrasena: string;
}
