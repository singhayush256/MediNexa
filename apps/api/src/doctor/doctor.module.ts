import { Module } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorAvailabilityService } from './doctor-availability.service';
import { DoctorController } from './doctor.controller';

@Module({
  controllers: [DoctorController],
  providers: [DoctorService, DoctorAvailabilityService],
  exports: [DoctorService, DoctorAvailabilityService],
})
export class DoctorModule {}
