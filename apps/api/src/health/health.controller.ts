import { Controller, Get, HttpStatus, HttpException } from '@nestjs/common';
import { HealthResponse } from '@medinexa/types';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Liveness Probe: Verifies HTTP server is responding.
   * Used by load balancers, Kubernetes, and Cloud Run liveness checks.
   */
  @Get()
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      service: 'MediNexa Enterprise API Gateway',
      version: '1.0.0',
    };
  }

  /**
   * Readiness Probe: Verifies database connectivity and operational resources.
   * Returns 200 OK only when the service is fully ready to handle live traffic.
   */
  @Get('ready')
  async getReadiness() {
    const startTime = Date.now();
    try {
      // Execute fast SQL ping against PostgreSQL
      await this.prisma.$queryRaw`SELECT 1`;
      const dbLatencyMs = Date.now() - startTime;

      const memUsage = process.memoryUsage();

      return {
        status: 'ok',
        service: 'MediNexa Enterprise API Gateway',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        database: {
          status: 'connected',
          latencyMs: dbLatencyMs,
        },
        system: {
          memoryRssMb: Math.round(memUsage.rss / (1024 * 1024)),
          heapUsedMb: Math.round(memUsage.heapUsed / (1024 * 1024)),
          heapTotalMb: Math.round(memUsage.heapTotal / (1024 * 1024)),
          nodeVersion: process.version,
          environment: process.env.NODE_ENV || 'development',
        },
      };
    } catch (error: any) {
      throw new HttpException(
        {
          status: 'degraded',
          service: 'MediNexa Enterprise API Gateway',
          timestamp: new Date().toISOString(),
          error: error.message || 'Database connection unreachable',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
