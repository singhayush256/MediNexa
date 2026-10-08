import { Controller, Post, Get, UseGuards, ForbiddenException } from '@nestjs/common';
import { DemoGeneratorService } from './demo-generator.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleCode } from '@medinexa/types';

@Controller('demo')
export class DemoGeneratorController {
  constructor(private readonly demoService: DemoGeneratorService) {}

  @Get('status')
  async getStatus() {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Demo operations are strictly disabled in production environments.');
    }
    return this.demoService.getDatasetStatus();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('generate-indian-dataset')
  async generateIndianDataset() {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Demo dataset generation is strictly disabled in production environments.');
    }
    return this.demoService.generateIndianDataset();
  }
}
