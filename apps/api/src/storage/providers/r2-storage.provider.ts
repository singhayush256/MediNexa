import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';
import * as path from 'path';
import {
  IStorageProvider,
  UploadFileResult,
  UploadFileOptions,
  FileMetadata,
} from '../storage-provider.interface';

@Injectable()
export class CloudflareR2Provider implements IStorageProvider {
  private readonly logger = new Logger(CloudflareR2Provider.name);
  private s3Client: S3Client | null = null;
  private bucketName: string = '';
  private accountId: string = '';

  constructor() {
    this.initClient();
  }

  /**
   * Initialize R2 S3Client with strict credential validation and fail-closed handling
   */
  public initClient(clientOverride?: S3Client) {
    if (clientOverride) {
      this.s3Client = clientOverride;
      this.bucketName = process.env.CLOUDFLARE_R2_BUCKET || 'medinexa-records-vault';
      return;
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const isR2Enabled = (process.env.STORAGE_PROVIDER || '').toLowerCase() === 'r2' || isProduction;

    const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
    const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
    const bucket = process.env.CLOUDFLARE_R2_BUCKET;

    if (isR2Enabled && isProduction) {
      const missingVars: string[] = [];
      if (!accountId) missingVars.push('CLOUDFLARE_R2_ACCOUNT_ID');
      if (!accessKeyId) missingVars.push('CLOUDFLARE_R2_ACCESS_KEY_ID');
      if (!secretAccessKey) missingVars.push('CLOUDFLARE_R2_SECRET_ACCESS_KEY');
      if (!bucket) missingVars.push('CLOUDFLARE_R2_BUCKET');

      if (missingVars.length > 0) {
        this.logger.error(
          `[R2 CONFIG ERROR] Missing required Cloudflare R2 credentials in production: ${missingVars.join(', ')}`,
        );
        throw new Error(
          `FATAL PRODUCTION STORAGE ERROR: Cloudflare R2 credentials missing: ${missingVars.join(', ')}. Local filesystem fallback is disabled in production.`,
        );
      }
    }

    if (accountId && accessKeyId && secretAccessKey && bucket) {
      this.accountId = accountId;
      this.bucketName = bucket;
      const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;

      this.s3Client = new S3Client({
        region: 'auto',
        endpoint,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });

      this.logger.log(`[CLOUDFLARE R2] S3 Client connected to private bucket '${bucket}' via endpoint ${endpoint}`);
    } else {
      this.logger.warn(
        '[CLOUDFLARE R2] Incomplete credentials. R2 client uninitialized. (Permitted in non-production development/test mode only)',
      );
    }
  }

  private getClient(): S3Client {
    if (!this.s3Client) {
      throw new InternalServerErrorException(
        'Cloudflare R2 storage provider is not initialized with active credentials.',
      );
    }
    return this.s3Client;
  }

  /**
   * Generate an anonymous, secure object storage key
   * Format: facilities/{facilityId}/patients/{patientId}/{uuid}{ext}
   * Never contains patient names, phone numbers, or UHID.
   */
  public generateSafeKey(fileName: string, mimeType: string, options?: UploadFileOptions): string {
    const rawFac = options?.facilityId || 'general';
    const rawPat = options?.patientId || 'unassigned';

    // Sanitize to only alphanumeric and dashes
    const facilityId = rawFac.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'general';
    const patientId = rawPat.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'unassigned';

    const uniqueId = crypto.randomUUID();
    const rawExt = path.extname(fileName).toLowerCase().slice(0, 10);
    const safeExt = /^\.[a-z0-9]{1,8}$/.test(rawExt) ? rawExt : '.bin';

    return `facilities/${facilityId}/patients/${patientId}/${uniqueId}${safeExt}`;
  }

  /**
   * Upload file to private Cloudflare R2 bucket
   */
  async uploadFile(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    options?: UploadFileOptions,
  ): Promise<UploadFileResult> {
    const client = this.getClient();
    const storageKey = this.generateSafeKey(fileName, mimeType, options);
    const checksum = crypto.createHash('sha256').update(buffer).digest('hex');

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: storageKey,
      Body: buffer,
      ContentType: mimeType,
      Metadata: {
        checksum,
        originalExtension: path.extname(fileName).toLowerCase().slice(0, 10),
      },
    });

    await client.send(command);

    this.logger.log(`[CLOUDFLARE R2] Uploaded private object: ${storageKey} (${buffer.length} bytes, sha256: ${checksum.slice(0, 8)}...)`);

    return {
      storageKey,
      checksum,
      sizeBytes: buffer.length,
      mimeType,
      // Bucket is strictly PRIVATE - never return a public web URL
      publicUrl: undefined,
    };
  }

  /**
   * Download file buffer directly from private R2 bucket for authenticated API streaming
   */
  async getFileBuffer(storageKey: string): Promise<Buffer> {
    if (storageKey.includes('..') || path.isAbsolute(storageKey)) {
      throw new BadRequestException('Path traversal rejected in storage key.');
    }

    const client = this.getClient();
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: storageKey,
    });

    const response = await client.send(command);
    if (!response.Body) {
      throw new InternalServerErrorException(`Empty body returned from R2 for '${storageKey}'.`);
    }

    // Convert stream to Buffer
    const byteArray = await response.Body.transformToByteArray();
    return Buffer.from(byteArray);
  }

  /**
   * Delete object from R2 bucket
   */
  async deleteFile(storageKey: string): Promise<boolean> {
    if (storageKey.includes('..') || path.isAbsolute(storageKey)) {
      throw new BadRequestException('Path traversal rejected in storage key.');
    }

    const client = this.getClient();
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: storageKey,
    });

    await client.send(command);
    this.logger.log(`[CLOUDFLARE R2] Deleted object: ${storageKey}`);
    return true;
  }

  /**
   * Verify object existence via HeadObject
   */
  async checkFileExists(storageKey: string): Promise<boolean> {
    if (storageKey.includes('..') || path.isAbsolute(storageKey)) return false;

    const client = this.getClient();
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: storageKey,
      });
      await client.send(command);
      return true;
    } catch (err: any) {
      if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw err;
    }
  }

  /**
   * Retrieve object metadata (content-type, content-length, eTag)
   */
  async getFileMetadata(storageKey: string): Promise<FileMetadata> {
    if (storageKey.includes('..') || path.isAbsolute(storageKey)) {
      throw new BadRequestException('Path traversal rejected in storage key.');
    }

    const client = this.getClient();
    const command = new HeadObjectCommand({
      Bucket: this.bucketName,
      Key: storageKey,
    });

    const head = await client.send(command);
    return {
      contentType: head.ContentType,
      contentLength: head.ContentLength,
      lastModified: head.LastModified,
      eTag: head.ETag,
    };
  }

  /**
   * Generate short-lived presigned download URL (default 5 minutes)
   */
  async getSignedDownloadUrl(storageKey: string, expiresInSeconds = 300): Promise<string> {
    if (storageKey.includes('..') || path.isAbsolute(storageKey)) {
      throw new BadRequestException('Path traversal rejected in storage key.');
    }

    const client = this.getClient();
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: storageKey,
    });

    return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  }
}
