import { BadRequestException } from '@nestjs/common';

export interface FileValidationOptions {
  maxSizeBytes?: number; // default: 15 MB
  allowedExtensions?: string[];
  allowedMimes?: string[];
}

/**
 * FileSecurityUtil
 *
 * Implements strict Zero Trust file upload validation:
 * 1. Extension whitelisting
 * 2. MIME type verification
 * 3. File magic-byte signature validation (prevents renaming evil.exe to report.pdf)
 * 4. File size quota enforcement
 */
export class FileSecurityUtil {
  public static readonly DEFAULT_MAX_SIZE = 15 * 1024 * 1024; // 15 MB

  public static readonly ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'docx'];

  public static readonly ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  public static readonly DISALLOWED_DANGEROUS_EXTENSIONS = [
    'exe', 'bat', 'cmd', 'sh', 'php', 'js', 'py', 'pl', 'jar', 'vbs', 'scr', 'dll', 'so',
  ];

  /**
   * Validates uploaded file buffer and metadata against security policies.
   */
  public static validateUpload(
    file: { originalname: string; mimetype: string; size: number; buffer: Buffer },
    options?: FileValidationOptions,
  ): boolean {
    const maxSize = options?.maxSizeBytes || this.DEFAULT_MAX_SIZE;
    const allowedExts = options?.allowedExtensions || this.ALLOWED_EXTENSIONS;
    const allowedMimes = options?.allowedMimes || this.ALLOWED_MIME_TYPES;

    if (!file || !file.buffer) {
      throw new BadRequestException('Invalid file upload: empty or missing file content');
    }

    // 1. Enforce size quota
    if (file.size > maxSize || file.buffer.length > maxSize) {
      throw new BadRequestException(`File size exceeds maximum allowed limit of ${Math.round(maxSize / (1024 * 1024))} MB.`);
    }

    // 2. Validate file extension
    const ext = file.originalname.split('.').pop()?.toLowerCase() || '';
    if (this.DISALLOWED_DANGEROUS_EXTENSIONS.includes(ext)) {
      throw new BadRequestException(`Security violation: File type '.${ext}' is strictly prohibited for medical document storage.`);
    }

    if (!allowedExts.includes(ext)) {
      throw new BadRequestException(`Unsupported file extension '.${ext}'. Allowed formats: ${allowedExts.map((e) => '.' + e).join(', ')}`);
    }

    // 3. Validate MIME type
    if (!allowedMimes.includes(file.mimetype.toLowerCase())) {
      throw new BadRequestException(`Invalid file MIME type: '${file.mimetype}'.`);
    }

    // 4. Verify Magic Byte Signatures
    const isValidSignature = this.verifyMagicBytes(file.buffer, ext);
    if (!isValidSignature) {
      throw new BadRequestException('Security violation: File signature does not match declared extension. Content may be corrupted or disguised.');
    }

    return true;
  }

  /**
   * Inspects binary header magic bytes.
   */
  private static verifyMagicBytes(buffer: Buffer, extension: string): boolean {
    if (buffer.length < 4) return false;

    // PDF Magic Bytes: %PDF (0x25 0x50 0x44 0x46)
    if (extension === 'pdf') {
      return (
        buffer[0] === 0x25 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x44 &&
        buffer[3] === 0x46
      );
    }

    // PNG Magic Bytes: \x89PNG (0x89 0x50 0x4E 0x47)
    if (extension === 'png') {
      return (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47
      );
    }

    // JPEG / JPG Magic Bytes: \xFF\xD8\xFF (0xFF 0xD8 0xFF)
    if (extension === 'jpg' || extension === 'jpeg') {
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    }

    // DOCX Magic Bytes: PK\x03\x04 (ZIP container signature for OpenXML: 0x50 0x4B 0x03 0x04)
    if (extension === 'docx') {
      return (
        buffer[0] === 0x50 &&
        buffer[1] === 0x4b &&
        buffer[2] === 0x03 &&
        buffer[3] === 0x04
      );
    }

    return true;
  }
}
