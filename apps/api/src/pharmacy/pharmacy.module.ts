import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PharmacyService } from './pharmacy.service';
import { PharmacyController } from './pharmacy.controller';
import { PrescriptionController } from './prescription.controller';
import { WardModule } from '../ward/ward.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, WardModule, AuditModule],
  controllers: [PharmacyController, PrescriptionController],
  providers: [PharmacyService],
  exports: [PharmacyService],
})
export class PharmacyModule {}
