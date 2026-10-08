import { Module } from '@nestjs/common';
import { STORAGE_PROVIDER_TOKEN } from './storage-provider.interface';
import { LocalStorageProvider } from './providers/local-storage.provider';
import { CloudflareR2Provider } from './providers/r2-storage.provider';
import { AwsS3Provider } from './providers/s3-storage.provider';

@Module({
  providers: [
    LocalStorageProvider,
    CloudflareR2Provider,
    AwsS3Provider,
    {
      provide: STORAGE_PROVIDER_TOKEN,
      useFactory: (
        r2Provider: CloudflareR2Provider,
        localProvider: LocalStorageProvider,
        s3Provider: AwsS3Provider,
      ) => {
        const providerName = (process.env.STORAGE_PROVIDER || '').toLowerCase();
        const isProduction = process.env.NODE_ENV === 'production';

        if (isProduction) {
          if (providerName === 'r2') {
            return r2Provider;
          }
          if (providerName === 's3') {
            return s3Provider;
          }
          // Production MUST NOT silently fall back to local disk!
          throw new Error(
            'FATAL PRODUCTION STORAGE ERROR: STORAGE_PROVIDER must be explicitly configured as "r2" in production. Local filesystem storage is prohibited on Render ephemeral containers.',
          );
        }

        // Development / Test environments
        if (providerName === 'r2') {
          return r2Provider;
        }
        if (providerName === 's3') {
          return s3Provider;
        }
        return localProvider;
      },
      inject: [CloudflareR2Provider, LocalStorageProvider, AwsS3Provider],
    },
  ],
  exports: [
    STORAGE_PROVIDER_TOKEN,
    CloudflareR2Provider,
    LocalStorageProvider,
    AwsS3Provider,
  ],
})
export class StorageModule {}
