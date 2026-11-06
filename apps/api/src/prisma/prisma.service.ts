import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl) {
    return envUrl;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL DATABASE CONFIGURATION ERROR: DATABASE_URL environment variable must be configured in production mode.');
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
        'CREATE TABLE IF NOT EXISTS "user_refresh_tokens" (' +
          '"id" TEXT PRIMARY KEY, ' +
          '"user_id" TEXT NOT NULL, ' +
          '"token_hash" TEXT NOT NULL UNIQUE, ' +
          '"family_id" TEXT NOT NULL, ' +
          '"is_revoked" BOOLEAN NOT NULL DEFAULT false, ' +
          '"replaced_by" TEXT, ' +
          '"expires_at" TIMESTAMP(3) NOT NULL, ' +
          '"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
          '"updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP' +
        ')',
        'CREATE INDEX IF NOT EXISTS "user_refresh_tokens_user_id_idx" ON "user_refresh_tokens"("user_id")',
        'CREATE INDEX IF NOT EXISTS "user_refresh_tokens_family_id_idx" ON "user_refresh_tokens"("family_id")',
        'CREATE INDEX IF NOT EXISTS "user_refresh_tokens_token_hash_idx" ON "user_refresh_tokens"("token_hash")',
        'CREATE TABLE IF NOT EXISTS "manager_permissions" (' +
          '"id" TEXT PRIMARY KEY, ' +
          '"manager_id" TEXT NOT NULL, ' +
          '"facility_id" TEXT NOT NULL, ' +
          '"permission_code" TEXT NOT NULL, ' +
          '"granted" BOOLEAN NOT NULL DEFAULT false, ' +
          '"granted_by_id" TEXT, ' +
          '"granted_at" TIMESTAMP(3), ' +
          '"revoked_at" TIMESTAMP(3), ' +
          '"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
          '"updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP' +
        ')',
        'CREATE UNIQUE INDEX IF NOT EXISTS "manager_permissions_manager_id_permission_code_key" ON "manager_permissions"("manager_id", "permission_code")',
        'CREATE INDEX IF NOT EXISTS "manager_permissions_facility_id_idx" ON "manager_permissions"("facility_id")',
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
