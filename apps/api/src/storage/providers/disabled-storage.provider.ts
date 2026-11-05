import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { IStorageProvider, UploadFileResult, UploadFileOptions, FileMetadata } from '../storage-provider.interface';

/**
 * DisabledStorageProvider
 *
 * Returned when storage backend cannot be configured (e.g., missing R2 credentials in production).
 * All methods throw HTTP 503 Service Unavailable with a clear message, preventing silent file loss.
 */
@Injectable()
export class DisabledStorageProvider implements IStorageProvider {
  private readonly missing: string[];

  constructor(missing: string[] = []) {
    this.missing = missing;
  }

  private unavailable(): never {
    const msg =
      this.missing.length > 0
        ? `Storage unavailable – missing credentials: ${this.missing.join(', ')}`
        : 'Storage backend is not configured for this environment.';
    throw new HttpException({ message: msg }, HttpStatus.SERVICE_UNAVAILABLE);
  }

  async uploadFile(_buffer: Buffer, _fileName: string, _mimeType: string, _options?: UploadFileOptions): Promise<UploadFileResult> {
    this.unavailable();
  }

  async deleteFile(_storageKey: string): Promise<boolean> {
    this.unavailable();
  }

  async getFileBuffer(_storageKey: string): Promise<Buffer> {
    this.unavailable();
  }

  async checkFileExists(_storageKey: string): Promise<boolean> {
    this.unavailable();
  }

  async getFileMetadata(_storageKey: string): Promise<FileMetadata> {
    this.unavailable();
  }

  async getSignedDownloadUrl(_storageKey: string, _expiresInSeconds?: number): Promise<string> {
    this.unavailable();
  }
}

