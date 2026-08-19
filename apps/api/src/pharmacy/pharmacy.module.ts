import { Module } from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';
import { PharmacyController } from './pharmacy.controller';
import { WardModule } from '../ward/ward.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [WardModule, AuditModule],
  controllers: [PharmacyController],
  providers: [PharmacyService],
  exports: [PharmacyService],
})
export class PharmacyModule {}
