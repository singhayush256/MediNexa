import { Module } from '@nestjs/common';
import { LabService } from './lab.service';
import { LabController } from './lab.controller';
import { WardModule } from '../ward/ward.module';

@Module({
  imports: [WardModule],
  controllers: [LabController],
  providers: [LabService],
  exports: [LabService],
})
export class LabModule {}
