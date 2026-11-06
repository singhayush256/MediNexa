import { Module, Logger } from '@nestjs/common';
import { STORAGE_PROVIDER_TOKEN } from './storage-provider.interface';
import { DisabledStorageProvider } from './providers/disabled-storage.provider';
import { LocalStorageProvider } from './providers/local-storage.provider';
import { CloudflareR2Provider } from './providers/r2-storage.provider';
import { AwsS3Provider } from './providers/s3-storage.provider';
import { SupabaseStorageProvider } from './providers/supabase-storage.provider';

/**
 * StorageModule
 *
 * Dynamically selects a storage provider based on environment variables.
 * In production the factory validates configuration **before** any provider
 * instance is constructed, avoiding eager instantiation of unused providers.
 *
 * Production rules:
 *   - STORAGE_PROVIDER=supabase → Supabase provider if **all** Supabase env vars are present;
 *                                otherwise DisabledStorageProvider.
 *   - STORAGE_PROVIDER=r2       → R2 provider if **all** R2 env vars are present;
 *                                otherwise DisabledStorageProvider.
 *   - STORAGE_PROVIDER=s3       → DisabledStorageProvider (stub S3 is not allowed in prod).
 *   - STORAGE_PROVIDER unset or any other value → DisabledStorageProvider.
 * Development / test defaults to LocalStorageProvider (or Supabase/R2 if configured).
 */
@Module({
  providers: [
    {
      provide: STORAGE_PROVIDER_TOKEN,
      useFactory: () => {
        const logger = new Logger('StorageModule');
        const providerName = (process.env.STORAGE_PROVIDER || '').toLowerCase();
        const isProduction = process.env.NODE_ENV === 'production';
        const missing: string[] = [];

        if (!isProduction) {
          if (providerName === 'supabase') {
            const hasUrl = Boolean(process.env.SUPABASE_URL);
            const hasKey = Boolean(
              process.env.SUPABASE_SERVICE_ROLE_KEY ||
              process.env.SUPABASE_SECRET_KEY ||
              process.env.SUPABASE_KEY,
            );
            if (hasUrl && hasKey) {
              return new SupabaseStorageProvider();
            }
          }
          if (providerName === 'r2') {
            const hasR2 = Boolean(
              process.env.CLOUDFLARE_R2_ACCOUNT_ID &&
              process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
              process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
              process.env.CLOUDFLARE_R2_BUCKET,
            );
            if (hasR2) {
              return new CloudflareR2Provider();
            }
          }
          // Development / test – use local filesystem storage by default.
          return new LocalStorageProvider();
        }

        // ----- Production branch -----
        if (providerName === 'supabase') {
          if (!process.env.SUPABASE_URL) missing.push('SUPABASE_URL');
          if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SECRET_KEY && !process.env.SUPABASE_KEY) {
            missing.push('SUPABASE_SERVICE_ROLE_KEY');
          }
          if (!process.env.SUPABASE_STORAGE_BUCKET && !process.env.SUPABASE_BUCKET) {
            missing.push('SUPABASE_STORAGE_BUCKET');
          }

          if (missing.length > 0) {
            logger.error(`Missing Supabase Storage credentials in production: ${missing.join(', ')}`);
            return new DisabledStorageProvider(missing);
          }

          return new SupabaseStorageProvider();
        }

        if (providerName === 'r2') {
          if (!process.env.CLOUDFLARE_R2_ACCOUNT_ID) missing.push('CLOUDFLARE_R2_ACCOUNT_ID');
          if (!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID) missing.push('CLOUDFLARE_R2_ACCESS_KEY_ID');
          if (!process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY) missing.push('CLOUDFLARE_R2_SECRET_ACCESS_KEY');
          if (!process.env.CLOUDFLARE_R2_BUCKET) missing.push('CLOUDFLARE_R2_BUCKET');

          if (missing.length > 0) {
            logger.error(`Missing Cloudflare R2 credentials in production: ${missing.join(', ')}`);
            return new DisabledStorageProvider(missing);
          }

          return new CloudflareR2Provider();
        }

        // S3 is not supported in production; treat as disabled.
        if (providerName === 's3') {
          logger.error('S3 storage is not allowed in production – disabling storage backend.');
          return new DisabledStorageProvider(['S3 storage not permitted in production']);
        }

        // Any other value (including unset) → disabled storage.
        logger.error('FATAL PRODUCTION STORAGE ERROR: STORAGE_PROVIDER must be "supabase" or "r2" in production.');
        return new DisabledStorageProvider(['STORAGE_PROVIDER not set to a supported production value (supabase or r2)']);
      },
    },
  ],
  exports: [STORAGE_PROVIDER_TOKEN],
})
export class StorageModule {}
