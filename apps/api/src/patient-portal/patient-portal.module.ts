import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PatientPortalService } from './patient-portal.service';
import { PatientPortalController } from './patient-portal.controller';

@Module({
  imports: [PrismaModule],
  controllers: [PatientPortalController],
  providers: [PatientPortalService],
  exports: [PatientPortalService],
})
export class PatientPortalModule {}
