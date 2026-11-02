import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { HealthScoreController } from './health-score.controller';
import { HealthScoreService } from './health-score.service';
import { HealthScoreCalculatorService } from './health-score-calculator.service';
import { EmergencyGuardianService } from './emergency-guardian.service';

@Module({
  imports: [PrismaModule],
  controllers: [HealthScoreController],
  providers: [HealthScoreService, HealthScoreCalculatorService, EmergencyGuardianService],
  exports: [HealthScoreService, HealthScoreCalculatorService, EmergencyGuardianService],
})
export class HealthScoreModule {}
