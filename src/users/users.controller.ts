import { Body, Controller, Get, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiBearerAuth('JWT')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  @Get('me')
  @ApiOperation({ summary: 'Obtiene informacion del usuario autenticado.' })
  @ApiResponse({ status: 200, description: 'Obtiene informacion del usuario.' })
  getMe(@CurrentUser('id') userId: number) {
    return this.userService.getOne(userId);
  }
  @Patch('me')
  @ApiOperation({ summary: 'Actualiza informacion el usuario' })
  @ApiResponse({
    status: 200,
    description: 'Informacion el usuario actualizada',
  })
  updateMe(
    @CurrentUser('id') userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(updateUserDto, userId);
  }
}
