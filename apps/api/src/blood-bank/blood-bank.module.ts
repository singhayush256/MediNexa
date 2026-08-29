import { Module } from '@nestjs/common';
import { BloodBankController } from './blood-bank.controller';
import { BloodBankService } from './blood-bank.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BloodBankController],
  providers: [BloodBankService],
  exports: [BloodBankService],
})
export class BloodBankModule {}
