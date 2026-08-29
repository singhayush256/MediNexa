import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProcurementService } from './procurement.service';
import { ProcurementController } from './procurement.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ProcurementController],
  providers: [ProcurementService],
  exports: [ProcurementService],
})
export class ProcurementModule {}
