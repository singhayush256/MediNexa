import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { AttachmentController } from './attachment.controller';
import { AttachmentService } from './attachment.service';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [AttachmentController],
  providers: [AttachmentService],
  exports: [AttachmentService],
})
export class AttachmentModule {}
