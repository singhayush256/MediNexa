import { Injectable, Logger, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';
import * as path from 'path';
import {
  IStorageProvider,
  UploadFileResult,
  UploadFileOptions,
  FileMetadata,
} from '../storage-provider.interface';

@Injectable()
export class SupabaseStorageProvider implements IStorageProvider {
  private readonly logger = new Logger(SupabaseStorageProvider.name);
  private supabaseClient: SupabaseClient | null = null;
  private bucketName: string = 'medinexa-vault';
  private projectUrl: string = '';

  constructor() {
    this.initClient();
  }

  /**
   * Initialize Supabase Storage Client with strict credentials validation and fail-closed handling
   */
  public initClient(clientOverride?: SupabaseClient) {
    if (clientOverride) {
      this.supabaseClient = clientOverride;
      this.bucketName = process.env.SUPABASE_STORAGE_BUCKET || process.env.SUPABASE_BUCKET || 'medinexa-vault';
      return;
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const isSupabaseEnabled = (process.env.STORAGE_PROVIDER || '').toLowerCase() === 'supabase';

    const url = process.env.SUPABASE_URL?.trim();
    const serviceRoleKey = (
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_KEY
    )?.trim();
    const bucket = (process.env.SUPABASE_STORAGE_BUCKET || process.env.SUPABASE_BUCKET || 'medinexa-vault').trim();

    if (isSupabaseEnabled && isProduction) {
      const missingVars: string[] = [];
      if (!url) missingVars.push('SUPABASE_URL');
      if (!serviceRoleKey) missingVars.push('SUPABASE_SERVICE_ROLE_KEY');
      if (!bucket) missingVars.push('SUPABASE_STORAGE_BUCKET');

      if (missingVars.length > 0) {
        this.logger.error(
          `[SUPABASE STORAGE ERROR] Missing required Supabase credentials in production: ${missingVars.join(', ')}`,
        );
        return;
      }
    }

    if (url && serviceRoleKey) {
      this.projectUrl = url;
      this.bucketName = bucket;

      this.supabaseClient = createClient(url, serviceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });

      this.logger.log(
        `[SUPABASE STORAGE] Client initialized for private bucket '${this.bucketName}' on ${url.replace(/\/$/, '')}`,
      );
    } else {
      this.logger.warn(
        '[SUPABASE STORAGE] Incomplete credentials. Supabase client uninitialized. (Permitted in non-production development/test mode only)',
      );
    }
  }

  private getClient(): SupabaseClient {
    if (!this.supabaseClient) {
      throw new InternalServerErrorException(
        'Supabase storage provider is not initialized with active credentials.',
      );
    }
    return this.supabaseClient;
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
   * Upload file to private Supabase Storage bucket
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

    const { error } = await client.storage.from(this.bucketName).upload(storageKey, buffer, {
      contentType: mimeType,
      upsert: false,
    });

    if (error) {
      this.logger.error(`[SUPABASE STORAGE] Upload failed for key '${storageKey}': ${error.message}`);
      throw new InternalServerErrorException(`Supabase storage upload failed: ${error.message}`);
    }

    this.logger.log(
      `[SUPABASE STORAGE] Uploaded private object: ${storageKey} (${buffer.length} bytes, sha256: ${checksum.slice(0, 8)}...)`,
    );

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
   * Download file buffer directly from private Supabase Storage bucket for authenticated API streaming
   */
  async getFileBuffer(storageKey: string): Promise<Buffer> {
    if (storageKey.includes('..') || path.isAbsolute(storageKey)) {
      throw new BadRequestException('Path traversal rejected in storage key.');
    }

    const client = this.getClient();
    const { data, error } = await client.storage.from(this.bucketName).download(storageKey);

    if (error || !data) {
      this.logger.error(`[SUPABASE STORAGE] Download failed for '${storageKey}': ${error?.message || 'Empty response'}`);
      throw new NotFoundException(`File '${storageKey}' not found in Supabase storage.`);
    }

    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Delete object from private Supabase Storage bucket
   */
  async deleteFile(storageKey: string): Promise<boolean> {
    if (storageKey.includes('..') || path.isAbsolute(storageKey)) {
      throw new BadRequestException('Path traversal rejected in storage key.');
    }

    const client = this.getClient();
    const { error } = await client.storage.from(this.bucketName).remove([storageKey]);

    if (error) {
      this.logger.error(`[SUPABASE STORAGE] Delete failed for '${storageKey}': ${error.message}`);
      throw new InternalServerErrorException(`Supabase storage delete failed: ${error.message}`);
    }

    this.logger.log(`[SUPABASE STORAGE] Deleted object: ${storageKey}`);
    return true;
  }

  /**
   * Verify object existence in private bucket
   */
  async checkFileExists(storageKey: string): Promise<boolean> {
    if (storageKey.includes('..') || path.isAbsolute(storageKey)) return false;

    try {
      const client = this.getClient();
      const normalizedPath = storageKey.replace(/\\/g, '/');
      const dir = path.dirname(normalizedPath);
      const base = path.basename(normalizedPath);
      const searchDir = dir === '.' ? '' : dir;

      const { data, error } = await client.storage.from(this.bucketName).list(searchDir, {
        search: base,
        limit: 10,
      });

      if (error || !data) return false;
      return data.some((item) => item.name === base);
    } catch {
      return false;
    }
  }

  /**
   * Retrieve object metadata (content-type, content-length, lastModified, eTag)
   */
  async getFileMetadata(storageKey: string): Promise<FileMetadata> {
    if (storageKey.includes('..') || path.isAbsolute(storageKey)) {
      throw new BadRequestException('Path traversal rejected in storage key.');
    }

    const client = this.getClient();
    const normalizedPath = storageKey.replace(/\\/g, '/');
    const dir = path.dirname(normalizedPath);
    const base = path.basename(normalizedPath);
    const searchDir = dir === '.' ? '' : dir;

    const { data, error } = await client.storage.from(this.bucketName).list(searchDir, {
      search: base,
      limit: 10,
    });

    if (error || !data || data.length === 0) {
      throw new NotFoundException(`File metadata for '${storageKey}' not found in Supabase storage.`);
    }

    const item = data.find((f) => f.name === base);
    if (!item) {
      throw new NotFoundException(`File '${storageKey}' not found in Supabase bucket.`);
    }

    const metadata = (item as any).metadata;
    return {
      contentType: metadata?.mimetype || 'application/octet-stream',
      contentLength: metadata?.size,
      lastModified: item.updated_at ? new Date(item.updated_at) : (item.created_at ? new Date(item.created_at) : undefined),
      eTag: item.id || metadata?.eTag,
    };
  }

  /**
   * Generate short-lived presigned download URL (default 300 seconds / 5 minutes)
   */
  async getSignedDownloadUrl(storageKey: string, expiresInSeconds = 300): Promise<string> {
    if (storageKey.includes('..') || path.isAbsolute(storageKey)) {
      throw new BadRequestException('Path traversal rejected in storage key.');
    }

    const client = this.getClient();
    const { data, error } = await client.storage.from(this.bucketName).createSignedUrl(storageKey, expiresInSeconds);

    if (error || !data?.signedUrl) {
      this.logger.error(`[SUPABASE STORAGE] Signed URL creation failed for '${storageKey}': ${error?.message}`);
      throw new InternalServerErrorException(
        `Supabase signed download URL generation failed: ${error?.message || 'Empty signedUrl'}`,
      );
    }

    return data.signedUrl;
  }
}

