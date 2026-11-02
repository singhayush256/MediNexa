import { Module } from '@nestjs/common';
import { AmbulanceService } from './ambulance.service';
import { AmbulanceController } from './ambulance.controller';
import { WardModule } from '../ward/ward.module';

@Module({
  imports: [WardModule],
  controllers: [AmbulanceController],
  providers: [AmbulanceService],
  exports: [AmbulanceService],
})
export class AmbulanceModule {}
