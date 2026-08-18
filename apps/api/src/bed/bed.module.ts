import { Module } from '@nestjs/common';
import { BedService } from './bed.service';
import { BedController } from './bed.controller';
import { BedGateway } from './events/bed.gateway';
import { WardModule } from '../ward/ward.module';

@Module({
  imports: [WardModule],
  controllers: [BedController],
  providers: [BedService, BedGateway],
  exports: [BedService, BedGateway],
})
export class BedModule {}
