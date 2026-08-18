import { Controller, Get } from '@nestjs/common';
import { HealthResponse } from '@medinexa/types';

@Controller('health')
export class HealthController {
  @Get()
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      service: 'MediNexa API',
      version: '1.0.0',
    };
  }
}
