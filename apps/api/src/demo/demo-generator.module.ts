import { Module } from '@nestjs/common';
import { DemoGeneratorService } from './demo-generator.service';
import { DemoGeneratorController } from './demo-generator.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DemoGeneratorController],
  providers: [DemoGeneratorService],
  exports: [DemoGeneratorService],
})
export class DemoGeneratorModule {}
