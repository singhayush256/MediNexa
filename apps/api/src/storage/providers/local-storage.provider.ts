import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { IStorageProvider, UploadFileResult } from '../storage-provider.interface';

@Injectable()
export class LocalStorageProvider implements IStorageProvider {
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'attachments');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(buffer: Buffer, fileName: string, mimeType: string): Promise<UploadFileResult> {
    const ext = path.extname(fileName) || '.dat';
    const uniqueId = crypto.randomUUID();
    const storageKey = `att_${Date.now()}_${uniqueId}${ext}`;
    const filePath = path.join(this.uploadDir, storageKey);

    await fs.promises.writeFile(filePath, buffer);
    const checksum = crypto.createHash('sha256').update(buffer).digest('hex');

    this.logger.log(`[LOCAL STORAGE] File saved: ${storageKey} (${buffer.length} bytes)`);

    return {
      storageKey,
      publicUrl: `/api/v1/attachments/${storageKey}/download`,
      checksum,
    };
  }

  async deleteFile(storageKey: string): Promise<boolean> {
    const filePath = path.join(this.uploadDir, storageKey);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      this.logger.log(`[LOCAL STORAGE] File deleted: ${storageKey}`);
      return true;
    }
    return false;
  }

  async getFileBuffer(storageKey: string): Promise<Buffer> {
    const filePath = path.join(this.uploadDir, storageKey);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File attachment '${storageKey}' not found on storage engine.`);
    }
    return fs.promises.readFile(filePath);
  }
}
