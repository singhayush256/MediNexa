import { Module } from '@nestjs/common';
import { CdssController } from './cdss.controller';
import { CdssService } from './cdss.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CdssController],
  providers: [CdssService],
  exports: [CdssService],
})
export class CdssModule {}
