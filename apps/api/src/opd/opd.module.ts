import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { OpdController } from './opd.controller';
import { OpdService } from './opd.service';

@Module({
  imports: [PrismaModule],
  controllers: [OpdController],
  providers: [OpdService],
  exports: [OpdService],
})
export class OpdModule {}
