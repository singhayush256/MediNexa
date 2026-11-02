import { Module } from '@nestjs/common';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { AuditModule } from '../audit/audit.module';
import { BedModule } from '../bed/bed.module';

@Module({
  imports: [AuditModule, BedModule],
  controllers: [PatientController],
  providers: [PatientService],
  exports: [PatientService],
})
export class PatientModule {}
