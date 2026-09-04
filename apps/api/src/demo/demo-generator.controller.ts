import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { DemoGeneratorService } from './demo-generator.service';

@Controller('demo')
export class DemoGeneratorController {
  constructor(private readonly demoService: DemoGeneratorService) {}

  @Get('status')
  async getStatus() {
    return this.demoService.getDatasetStatus();
  }

  @Post('generate-indian-dataset')
  async generateIndianDataset() {
    return this.demoService.generateIndianDataset();
  }
}
