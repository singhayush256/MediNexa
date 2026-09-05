import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl) {
    return envUrl;
  }
  return 'postgresql://postgres:postgres@localhost:5432/medinexa?schema=public';
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      datasources: {
        db: {
          url: getDatabaseUrl(),
        },
      },
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    let retries = 5;
    while (retries > 0) {
      try {
        await this.$connect();
        this.logger.log('✅ Connected to PostgreSQL database successfully via Prisma.');
        break;
      } catch (err: any) {
        retries--;
        this.logger.warn(
          `Prisma database connection attempt failed (${err.message}). Retries remaining: ${retries}`,
        );
        if (retries === 0) {
          this.logger.error('❌ Failed to connect to PostgreSQL database after multiple attempts.', err.stack);
          throw err;
        }
        await new Promise((res) => setTimeout(res, 2000));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma disconnected from database.');
  }
}
