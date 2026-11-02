import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BedModule } from '../bed/bed.module';
import { DischargeController } from './discharge.controller';
import { DischargeService } from './discharge.service';

@Module({
  imports: [PrismaModule, forwardRef(() => BedModule)],
  controllers: [DischargeController],
  providers: [DischargeService],
  exports: [DischargeService],
})
export class DischargeModule {}
