import { Module } from '@nestjs/common';
import { AbdmController } from './abdm.controller';
import { AbdmService } from './abdm.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AbdmController],
  providers: [AbdmService],
  exports: [AbdmService],
})
export class AbdmModule {}
