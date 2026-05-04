import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { LowercaseEmailPipe } from '../users/pipes/lowercase-email.pipe';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Public()
  @Post('login')
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
  async register(@Body() userDto: CreateUserDto) {
    return this.authService.register(userDto);
  }
}
