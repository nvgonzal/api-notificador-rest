import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entity/user.entity';
import { CreateUserDto } from '../users/dtos/create-user.dto';

export interface JwtPayload {
  sub: number;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private jwtService: JwtService,
  ) {}
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.validateCredentials(email, password);
    if (!user) {
      throw new UnauthorizedException('Email o contraseña incorrectas.');
    }
    return user;
  }
  login(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      accessToken: this.jwtService.sign(payload),
    };
  }
  async register(dto: CreateUserDto) {
    const user = await this.userService.create(dto);
    return this.login(user);
  }
}
