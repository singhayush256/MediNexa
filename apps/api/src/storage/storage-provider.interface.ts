export interface UploadFileOptions {
  facilityId?: string;
  patientId?: string;
  category?: string;
}

export interface UploadFileResult {
  storageKey: string;
  publicUrl?: string;
  checksum: string;
  sizeBytes?: number;
  mimeType?: string;
}

export interface FileMetadata {
  contentType?: string;
  contentLength?: number;
  lastModified?: Date;
  eTag?: string;
}

export interface IStorageProvider {
  uploadFile(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    options?: UploadFileOptions,
  ): Promise<UploadFileResult>;
  deleteFile(storageKey: string): Promise<boolean>;
  getFileBuffer(storageKey: string): Promise<Buffer>;
  checkFileExists(storageKey: string): Promise<boolean>;
  getFileMetadata(storageKey: string): Promise<FileMetadata>;
  getSignedDownloadUrl?(storageKey: string, expiresInSeconds?: number): Promise<string>;
}

export const STORAGE_PROVIDER_TOKEN = 'STORAGE_PROVIDER_TOKEN';

