import { Module } from '@nestjs/common';
import { ReferralService } from './referral.service';
import { ReferralController } from './referral.controller';
import { WardModule } from '../ward/ward.module';
import { AdmissionModule } from '../admission/admission.module';
import { BedModule } from '../bed/bed.module';

@Module({
  imports: [WardModule, AdmissionModule, BedModule],
  controllers: [ReferralController],
  providers: [ReferralService],
  exports: [ReferralService],
})
export class ReferralModule {}
