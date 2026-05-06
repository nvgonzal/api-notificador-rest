import { Body, Controller, Get, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  @Get('me')
  getMe(@CurrentUser('id') userId: number) {
    return this.userService.getOne(userId);
  }
  @Patch('me')
  updateMe(
    @CurrentUser('id') userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(updateUserDto, userId);
  }
}
