import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  // GET /notifications?userId=1
  @Get()
  findByUser(@Req() request) {
    return this.notificationsService.findByUser(request.user.id);
  }

  // GET /notifications/unread?userId=1
  @Get('unread')
  findUnread(@Req() request) {
    return this.notificationsService.findUnreadByUser(request.user.id);
  }

  // GET /notifications/unread/count?userId=1
  @Get('unread/count')
  countUnread(@Req() request) {
    return this.notificationsService.countUnread(request.user.id);
  }

  // PATCH /notifications/:id/read?userId=1
  @Patch(':id/read')
  markAsRead(@Param('id', ParseIntPipe) id: number, @Req() request) {
    return this.notificationsService.markAsRead(id, request.user.id);
  }

  // PATCH /notifications/read-all?userId=1
  @Patch('read-all')
  markAllAsRead(@Req() request) {
    return this.notificationsService.markAllAsRead(request.user.id);
  }
}
