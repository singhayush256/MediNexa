import { Module } from '@nestjs/common';
import { STORAGE_PROVIDER_TOKEN } from './storage-provider.interface';
import { LocalStorageProvider } from './providers/local-storage.provider';

@Module({
  providers: [
    {
      provide: STORAGE_PROVIDER_TOKEN,
      useClass: LocalStorageProvider,
    },
  ],
  exports: [STORAGE_PROVIDER_TOKEN],
})
export class StorageModule {}
