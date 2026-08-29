import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { IcuController } from './icu.controller';
import { IcuService } from './icu.service';

@Module({
  imports: [PrismaModule],
  controllers: [IcuController],
  providers: [IcuService],
  exports: [IcuService],
})
export class IcuModule {}
