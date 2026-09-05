import { Module } from '@nestjs/common';
import { BedService } from './bed.service';
import { BedController } from './bed.controller';
import { BedAvailabilityController } from './bed-availability.controller';
import { BedGateway } from './events/bed.gateway';
import { WardModule } from '../ward/ward.module';

@Module({
  imports: [WardModule],
  controllers: [BedController, BedAvailabilityController],
  providers: [BedService, BedGateway],
  exports: [BedService, BedGateway],
})
export class BedModule {}
