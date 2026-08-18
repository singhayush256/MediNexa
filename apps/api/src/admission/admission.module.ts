import { Module } from '@nestjs/common';
import { AdmissionService } from './admission.service';
import { AdmissionController } from './admission.controller';
import { BedModule } from '../bed/bed.module';
import { WardModule } from '../ward/ward.module';

@Module({
  imports: [BedModule, WardModule],
  controllers: [AdmissionController],
  providers: [AdmissionService],
  exports: [AdmissionService],
})
export class AdmissionModule {}
