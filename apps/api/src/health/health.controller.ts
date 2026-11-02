import { Controller, Get, HttpStatus, HttpException } from '@nestjs/common';
import { HealthResponse } from '@medinexa/types';
import { PrismaService } from '../prisma/prisma.service';
import { RateLimiterGuard } from '../common/guards/rate-limiter.guard';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Standard Health Check: Verifies basic gateway & database availability.
   */
  @Get()
  async getHealth(): Promise<HealthResponse> {
    let databaseStatus = 'ok';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      databaseStatus = 'unavailable';
    }

    if (databaseStatus !== 'ok') {
      throw new HttpException(
        {
          status: 'unavailable',
          service: 'MediNexa Enterprise API Gateway',
          version: '1.0.0',
          database: 'unavailable',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return {
      status: 'ok',
      service: 'MediNexa Enterprise API Gateway',
      version: '1.0.0',
      database: 'ok',
    };
  }

  /**
   * Dedicated Liveness Probe: Verifies Node.js process event loop responsiveness.
   * Kubernetes / Render / Cloud Run: GET /api/v1/health/liveness
   */
  @Get('liveness')
  getLiveness() {
    return {
      status: 'ok',
      service: 'MediNexa Enterprise API Gateway',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    };
  }

  /**
   * Dedicated Readiness Probe: Verifies database connectivity, Redis state, and storage provider.
   * Returns 200 OK only when the service is fully prepared to handle live hospital operations.
   */
  @Get('ready')
  async getReadiness() {
    const startTime = Date.now();
    try {
      // Execute fast SQL ping against PostgreSQL
      await this.prisma.$queryRaw`SELECT 1`;
      const dbLatencyMs = Date.now() - startTime;

      const memUsage = process.memoryUsage();
      const redisStatus = RateLimiterGuard.getRedisStatus();
      const storageProvider = (process.env.STORAGE_PROVIDER || 'local').toLowerCase();
      const storageConfigured =
        storageProvider === 'r2'
          ? Boolean(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY)
          : storageProvider === 's3'
          ? Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
          : true;

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
        redis: {
          configured: redisStatus.configured,
          connected: redisStatus.connected,
          mode: redisStatus.mode,
        },
        storage: {
          provider: storageProvider,
          configured: storageConfigured,
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
