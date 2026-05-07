import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsDateString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'Juan',
    description: 'Nombre de usuario',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
  @ApiProperty({
    example: 'Perez',
    description: 'Apellido de usuario',
  })
  @IsString()
  lastName: string;
  @ApiProperty({
    example: 'example@email.com',
    description: 'Email de usuario',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @ApiProperty({
    example: '1990-01-01',
    description: 'Fecha de nacimiento del usuario',
  })
  @IsDateString()
  bday: Date;
  @ApiProperty({
    example: '12345678',
    description: 'Contraseña del usuario',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
