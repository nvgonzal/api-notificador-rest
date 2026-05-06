import {
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  // GET /notifications?userId=1
  @Get()
  findByUser(@CurrentUser('id') userId: number) {
    return this.notificationsService.findByUser(userId);
  }

  // GET /notifications/unread?userId=1
  @Get('unread')
  findUnread(@CurrentUser('id') userId: number) {
    return this.notificationsService.findUnreadByUser(userId);
  }

  // GET /notifications/unread/count?userId=1
  @Get('unread/count')
  countUnread(@CurrentUser('id') userId: number) {
    return this.notificationsService.countUnread(userId);
  }

  // PATCH /notifications/:id/read?userId=1
  @Patch(':id/read')
  markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.notificationsService.markAsRead(id, userId);
  }

  // PATCH /notifications/read-all?userId=1
  @Patch('read-all')
  markAllAsRead(@CurrentUser('id') userId: number) {
    return this.notificationsService.markAllAsRead(userId);
  }
}
