import { Module } from '@nestjs/common';
import { EhrService } from './ehr.service';
import { EhrController } from './ehr.controller';
import { WardModule } from '../ward/ward.module';
import { BedModule } from '../bed/bed.module';
import { AdmissionModule } from '../admission/admission.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [WardModule, BedModule, AdmissionModule, AuditModule],
  controllers: [EhrController],
  providers: [EhrService],
  exports: [EhrService],
})
export class EhrModule {}
