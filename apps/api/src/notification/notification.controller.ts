import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getMyNotifications(@Request() req: any) {
    return this.notificationService.getUserNotifications(req.user.id, req.user);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    return this.notificationService.getUnreadCount(req.user.id, req.user);
  }

  @Post(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    return this.notificationService.markAsRead(id, req.user);
  }

  @Post('read-all')
  async markAllAsRead(@Request() req: any) {
    return this.notificationService.markAllAsRead(req.user.id, req.user);
  }
}
