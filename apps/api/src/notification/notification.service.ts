import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async createNotification(dto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type as any,
        title: dto.title,
        message: dto.message,
        entityType: dto.entityType,
        entityId: dto.entityId,
      },
    });

    return notification;
  }

  async getUserNotifications(userId: string, requestingUser: any) {
    if (requestingUser.id !== userId && requestingUser.role !== 'MEDINEXA_ADMIN') {
      throw new ForbiddenException('Users can only access their own notifications');
    }

    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getUnreadCount(userId: string, requestingUser: any) {
    if (requestingUser.id !== userId && requestingUser.role !== 'MEDINEXA_ADMIN') {
      throw new ForbiddenException('Users can only access their own unread count');
    }

    const count = await this.prisma.notification.count({
      where: { userId, readAt: null },
    });

    return { count };
  }

  async markAsRead(id: string, requestingUser: any) {
    const notif = await this.prisma.notification.findUnique({ where: { id } });
    if (!notif) throw new NotFoundException('Notification not found');

    if (notif.userId !== requestingUser.id && requestingUser.role !== 'MEDINEXA_ADMIN') {
      throw new ForbiddenException('Users can only manage their own notifications');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string, requestingUser: any) {
    if (requestingUser.id !== userId && requestingUser.role !== 'MEDINEXA_ADMIN') {
      throw new ForbiddenException('Users can only manage their own notifications');
    }

    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });

    return { success: true };
  }
}
