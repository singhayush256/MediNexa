// Updated StorageModule – no eager provider instantiation, no Logger injection, and DisabledStorageProvider is instantiated manually.
import { Module, Logger } from '@nestjs/common';
import { STORAGE_PROVIDER_TOKEN } from './storage-provider.interface';
import { DisabledStorageProvider } from './providers/disabled-storage.provider';
import { LocalStorageProvider } from './providers/local-storage.provider';
import { CloudflareR2Provider } from './providers/r2-storage.provider';
import { AwsS3Provider } from './providers/s3-storage.provider';

/**
 * StorageModule
 *
 * Dynamically selects a storage provider based on environment variables.
 * In production the factory validates configuration **before** any provider
 * instance is constructed, avoiding eager instantiation of unused providers.
 *
 * Production rules:
 *   - STORAGE_PROVIDER=r2   → R2 provider if **all** R2 env vars are present;
 *                            otherwise DisabledStorageProvider.
 *   - STORAGE_PROVIDER=s3   → DisabledStorageProvider (stub S3 is not allowed in prod).
 *   - STORAGE_PROVIDER unset or any other value → DisabledStorageProvider.
 * Development / test defaults to LocalStorageProvider.
 */
@Module({
  providers: [
    // No class providers here – we instantiate everything manually in the factory.
    {
      provide: STORAGE_PROVIDER_TOKEN,
      useFactory: () => {
        const logger = new Logger('StorageModule');
        const providerName = (process.env.STORAGE_PROVIDER || '').toLowerCase();
        const isProduction = process.env.NODE_ENV === 'production';
        const missing: string[] = [];

        if (!isProduction) {
          // Development / test – use local filesystem storage.
          return new LocalStorageProvider();
        }

        // ----- Production branch -----
        if (providerName === 'r2') {
          if (!process.env.CLOUDFLARE_R2_ACCOUNT_ID) missing.push('CLOUDFLARE_R2_ACCOUNT_ID');
          if (!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID) missing.push('CLOUDFLARE_R2_ACCESS_KEY_ID');
          if (!process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY) missing.push('CLOUDFLARE_R2_SECRET_ACCESS_KEY');
          if (!process.env.CLOUDFLARE_R2_BUCKET) missing.push('CLOUDFLARE_R2_BUCKET');

          if (missing.length > 0) {
            logger.error(`Missing Cloudflare R2 credentials in production: ${missing.join(', ')}`);
            return new DisabledStorageProvider(missing);
          }

          // All required credentials are present – instantiate the real provider.
          return new CloudflareR2Provider();
        }

        // S3 is not supported in production; treat as disabled.
        if (providerName === 's3') {
          logger.error('S3 storage is not allowed in production – disabling storage backend.');
          return new DisabledStorageProvider(['S3 storage not permitted in production']);
        }

        // Any other value (including unset) → disabled storage.
        logger.error('FATAL PRODUCTION STORAGE ERROR: STORAGE_PROVIDER must be "r2" in production.');
        return new DisabledStorageProvider(['STORAGE_PROVIDER not set to a supported production value']);
      },
      // No inject array – we create Logger manually.
    },
  ],
  exports: [STORAGE_PROVIDER_TOKEN],
})
export class StorageModule {}
