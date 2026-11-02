import { Module } from '@nestjs/common';
import { BusinessIntelligenceController } from './business-intelligence.controller';
import { BusinessIntelligenceService } from './business-intelligence.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BusinessIntelligenceController],
  providers: [BusinessIntelligenceService],
  exports: [BusinessIntelligenceService],
})
export class BusinessIntelligenceModule {}
