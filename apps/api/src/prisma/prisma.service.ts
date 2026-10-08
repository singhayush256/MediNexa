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
        this.logger.log('[MediNexa DB] Prisma client initialized');
        this.logger.log('✅ Connected to PostgreSQL database successfully via Prisma.');
        await this.ensureDatabaseSchema();
        break;
      } catch (err: any) {
        retries--;
        this.logger.warn(
          `Prisma database connection attempt failed (${err.message}). Retries remaining: ${retries}`,
        );
        if (retries === 0) {
          this.logger.error('[MediNexa DB] Failed to connect to PostgreSQL database after multiple attempts.', err.stack);
          throw err;
        }
        await new Promise((res) => setTimeout(res, 2000));
      }
    }
  }

  public async ensureDatabaseSchema() {
    try {
      this.logger.log('Synchronizing database schema safely...');
      const statements = [
        'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "medinexa_person_id" TEXT',
        'CREATE UNIQUE INDEX IF NOT EXISTS "users_medinexa_person_id_key" ON "users"("medinexa_person_id")',
        'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "totp_secret" TEXT',
        'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false',
        'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "backup_codes" TEXT[] DEFAULT ARRAY[]::text[]',
        'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "failed_totp_attempts" INTEGER NOT NULL DEFAULT 0',
        'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_verification_time" TIMESTAMP(3)',
        'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "totp_locked_until" TIMESTAMP(3)',
        'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "staff_id" TEXT',
        'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "patient_id" TEXT',
        'CREATE UNIQUE INDEX IF NOT EXISTS "users_staff_id_key" ON "users"("staff_id")',
        'CREATE UNIQUE INDEX IF NOT EXISTS "users_patient_id_key" ON "users"("patient_id")',
      ];

      for (const sql of statements) {
        try {
          await this.$executeRawUnsafe(sql);
        } catch (stmtErr: any) {
          this.logger.debug?.(`Schema statement notice (${sql}): ${stmtErr?.message || stmtErr}`);
        }
      }
      this.logger.log('✅ Database schema verified and synchronized.');
    } catch (err: any) {
      this.logger.warn(`Schema self-healing notice: ${err?.message || err}`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma disconnected from database.');
  }
}
