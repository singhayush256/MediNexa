import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CommandCenterService } from './command-center.service';
import { CommandCenterController } from './command-center.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CommandCenterController],
  providers: [CommandCenterService],
  exports: [CommandCenterService],
})
export class CommandCenterModule {}
