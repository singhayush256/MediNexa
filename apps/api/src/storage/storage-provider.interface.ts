export interface UploadFileResult {
  storageKey: string;
  publicUrl?: string;
  checksum: string;
}

export interface IStorageProvider {
  uploadFile(buffer: Buffer, fileName: string, mimeType: string): Promise<UploadFileResult>;
  deleteFile(storageKey: string): Promise<boolean>;
  getFileBuffer(storageKey: string): Promise<Buffer>;
}

export const STORAGE_PROVIDER_TOKEN = 'STORAGE_PROVIDER_TOKEN';
