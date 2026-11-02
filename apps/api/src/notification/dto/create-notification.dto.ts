import { NotificationType } from '@medinexa/types';

export class CreateNotificationDto {
  userId!: string;
  type!: NotificationType;
  title!: string;
  message!: string;
  entityType?: string;
  entityId?: string;
}
