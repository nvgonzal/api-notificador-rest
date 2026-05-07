import { Body, Controller, Get, Post, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { LowercaseEmailPipe } from '../users/pipes/lowercase-email.pipe';
import { Public } from './decorators/public.decorator';
import { User } from '../entity/user.entity';
import { CurrentUser } from './decorators/current-user.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Inicia sesion en el sistema.' })
  @ApiResponse({
    status: 200,
    description: 'Inicia sesion exitoso, retorna JWT.',
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales no validas',
  })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    return this.authService.login(user);
  }

  @Public()
  @Post('register')
  @UsePipes(LowercaseEmailPipe)
  @ApiOperation({ summary: 'Registra un nuevo usuario.' })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente.' })
  @ApiResponse({ status: 409, description: 'Email ya registrado' })
  async register(@Body() userDto: CreateUserDto) {
    return this.authService.register(userDto);
  }

  @Get('profile')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Carga el perfil del usuario autenticado.' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario' })
  @ApiResponse({ status: 401, description: 'Token no valido' })
  getProfile(@CurrentUser() user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      lastName: user.lastName,
      createdAt: user.createdAt,
    };
  }
}
