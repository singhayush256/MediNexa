import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { OtService } from './ot.service';
import { OtController } from './ot.controller';

@Module({
  imports: [PrismaModule],
  controllers: [OtController],
  providers: [OtService],
  exports: [OtService],
})
export class OtModule {}
