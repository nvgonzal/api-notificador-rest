import {
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Notifications')
@ApiBearerAuth('JWT')
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  // GET /notifications?userId=1
  @Get()
  @ApiOperation({
    summary: 'Lista las notificaciones del usuario autenticado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista las notificaciones del usuario',
  })
  findByUser(@CurrentUser('id') userId: number) {
    return this.notificationsService.findByUser(userId);
  }

  // GET /notifications/unread?userId=1
  @Get('unread')
  @ApiOperation({
    summary: 'Lista las notificaciones no leidas del usuario autenticado.',
  })
  @ApiResponse({ status: 200, description: 'Lista notificaciones no leidas.' })
  findUnread(@CurrentUser('id') userId: number) {
    return this.notificationsService.findUnreadByUser(userId);
  }

  // GET /notifications/unread/count?userId=1
  @Get('unread/count')
  @ApiOperation({
    summary: 'Cuenta las notificaciones no leidas del usuario autenticado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cantidad de notificaciones no leidas.',
  })
  countUnread(@CurrentUser('id') userId: number) {
    return this.notificationsService.countUnread(userId);
  }

  // PATCH /notifications/:id/read?userId=1
  @Patch(':id/read')
  @ApiOperation({ summary: 'Marca una notficacion como leida.' })
  @ApiResponse({ status: 200, description: 'Notificacion marcada como leida.' })
  @ApiResponse({ status: 404, description: 'Notificacion no encontrada' })
  markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.notificationsService.markAsRead(id, userId);
  }

  // PATCH /notifications/read-all?userId=1
  @Patch('read-all')
  @ApiOperation({
    summary:
      'Marca como leida todas las notifcaciones del usuario autenticado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Notificaciones marcada como leidas.',
  })
  markAllAsRead(@CurrentUser('id') userId: number) {
    return this.notificationsService.markAllAsRead(userId);
  }
}
