import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ClinicalCopilotController } from './clinical-copilot.controller';
import { ClinicalCopilotService } from './clinical-copilot.service';

@Module({
  imports: [PrismaModule],
  controllers: [ClinicalCopilotController],
  providers: [ClinicalCopilotService],
  exports: [ClinicalCopilotService],
})
export class ClinicalCopilotModule {}
