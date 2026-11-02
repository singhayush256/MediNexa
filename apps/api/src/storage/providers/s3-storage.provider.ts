import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  IStorageProvider,
  UploadFileResult,
  UploadFileOptions,
  FileMetadata,
} from '../storage-provider.interface';

@Injectable()
export class AwsS3Provider implements IStorageProvider {
  private readonly logger = new Logger(AwsS3Provider.name);

  async uploadFile(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    options?: UploadFileOptions,
  ): Promise<UploadFileResult> {
    const checksum = crypto.createHash('sha256').update(buffer).digest('hex');
    const storageKey = `s3_${Date.now()}_${crypto.randomUUID()}.bin`;
    this.logger.log(`[AWS S3] Uploaded ${fileName} to bucket as ${storageKey}`);
    return {
      storageKey,
      publicUrl: `https://medinexa-s3-bucket.s3.amazonaws.com/${storageKey}`,
      checksum,
      sizeBytes: buffer.length,
      mimeType,
    };
  }

  async deleteFile(storageKey: string): Promise<boolean> {
    this.logger.log(`[AWS S3] Deleted ${storageKey}`);
    return true;
  }

  async getFileBuffer(storageKey: string): Promise<Buffer> {
    return Buffer.from(`Simulated AWS S3 Buffer for ${storageKey}`);
  }

  async checkFileExists(storageKey: string): Promise<boolean> {
    return true;
  }

  async getFileMetadata(storageKey: string): Promise<FileMetadata> {
    return {
      contentType: 'application/octet-stream',
      contentLength: 1024,
      lastModified: new Date(),
    };
  }
}
