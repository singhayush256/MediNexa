import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { IStorageProvider, UploadFileResult } from '../storage-provider.interface';

@Injectable()
export class AwsS3Provider implements IStorageProvider {
  private readonly logger = new Logger(AwsS3Provider.name);

  async uploadFile(buffer: Buffer, fileName: string, mimeType: string): Promise<UploadFileResult> {
    const checksum = crypto.createHash('sha256').update(buffer).digest('hex');
    const storageKey = `s3_${Date.now()}_${fileName}`;
    this.logger.log(`[AWS S3] Uploaded ${fileName} to bucket as ${storageKey}`);
    return {
      storageKey,
      publicUrl: `https://medinexa-s3-bucket.s3.amazonaws.com/${storageKey}`,
      checksum,
    };
  }

  async deleteFile(storageKey: string): Promise<boolean> {
    this.logger.log(`[AWS S3] Deleted ${storageKey}`);
    return true;
  }

  async getFileBuffer(storageKey: string): Promise<Buffer> {
    return Buffer.from(`Simulated AWS S3 Buffer for ${storageKey}`);
  }
}
