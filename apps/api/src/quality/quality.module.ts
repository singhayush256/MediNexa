import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { QualityService } from './quality.service';
import { QualityController } from './quality.controller';

@Module({
  imports: [PrismaModule],
  controllers: [QualityController],
  providers: [QualityService],
  exports: [QualityService],
})
export class QualityModule {}
