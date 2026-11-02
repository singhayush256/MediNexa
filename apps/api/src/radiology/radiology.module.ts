import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RadiologyController } from './radiology.controller';
import { RadiologyService } from './radiology.service';
import { LocalPacsProvider } from './pacs/local-pacs.provider';

@Module({
  imports: [PrismaModule],
  controllers: [RadiologyController],
  providers: [RadiologyService, LocalPacsProvider],
  exports: [RadiologyService],
})
export class RadiologyModule {}
