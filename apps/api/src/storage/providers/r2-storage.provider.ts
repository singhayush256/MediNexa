import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { IStorageProvider, UploadFileResult } from '../storage-provider.interface';

@Injectable()
export class CloudflareR2Provider implements IStorageProvider {
  private readonly logger = new Logger(CloudflareR2Provider.name);

  async uploadFile(buffer: Buffer, fileName: string, mimeType: string): Promise<UploadFileResult> {
    const checksum = crypto.createHash('sha256').update(buffer).digest('hex');
    const storageKey = `r2_${Date.now()}_${fileName}`;
    this.logger.log(`[CLOUDFLARE R2] Uploaded ${fileName} as ${storageKey}`);
    return {
      storageKey,
      publicUrl: `https://r2.medinexa.com/${storageKey}`,
      checksum,
    };
  }

  async deleteFile(storageKey: string): Promise<boolean> {
    this.logger.log(`[CLOUDFLARE R2] Deleted ${storageKey}`);
    return true;
  }

  async getFileBuffer(storageKey: string): Promise<Buffer> {
    return Buffer.from(`Simulated Cloudflare R2 Buffer for ${storageKey}`);
  }
}
