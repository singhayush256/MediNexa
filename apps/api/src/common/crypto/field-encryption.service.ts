import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/**
 * FieldEncryptionService
 *
 * Implements military-grade AES-256-GCM authenticated encryption for sensitive
 * healthcare records (PHI / PII) in compliance with HIPAA and Indian DPDP Act.
 *
 * Features:
 * - Authenticated symmetric encryption with 256-bit keys
 * - Unique 96-bit Initialization Vector (IV) generated per encryption
 * - 128-bit authentication tag verification to prevent ciphertext tampering
 * - PII/PHI deterministic masking for UI safe display
 */
@Injectable()
export class FieldEncryptionService {
  private readonly logger = new Logger(FieldEncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    const rawSecret =
      this.configService.get<string>('ENCRYPTION_KEY') ||
      this.configService.get<string>('JWT_SECRET') ||
      'medinexa-production-aes-256-gcm-master-key-seed-2026';

    // Derive a fixed 32-byte (256-bit) key using SHA-256
    this.key = crypto.createHash('sha256').update(rawSecret).digest();
  }

  /**
   * Encrypts plaintext string using AES-256-GCM.
   * Returns formatted string: "enc:v1:<iv_hex>:<authTag_hex>:<ciphertext_hex>"
   */
  encrypt(plainText: string): string {
    if (!plainText) return plainText;

    try {
      // Generate a cryptographically secure 12-byte (96-bit) IV for GCM mode
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

      let encrypted = cipher.update(plainText, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag().toString('hex');

      return `enc:v1:${iv.toString('hex')}:${authTag}:${encrypted}`;
    } catch (err: any) {
      this.logger.error(`Field encryption failed: ${err.message}`, err.stack);
      return plainText;
    }
  }

  /**
   * Decrypts ciphertext formatted as "enc:v1:<iv_hex>:<authTag_hex>:<ciphertext_hex>".
   * Returns original plaintext or raw string if not encrypted.
   */
  decrypt(cipherText: string): string {
    if (!cipherText || !cipherText.startsWith('enc:v1:')) {
      return cipherText;
    }

    try {
      const parts = cipherText.split(':');
      if (parts.length !== 5) {
        return cipherText;
      }

      const iv = Buffer.from(parts[2], 'hex');
      const authTag = Buffer.from(parts[3], 'hex');
      const encryptedHex = parts[4];

      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (err: any) {
      this.logger.warn(`Decryption or authentication tag verification failed for field: ${err.message}`);
      return '[ENCRYPTED_PHI]';
    }
  }

  /**
   * Mask Indian National ID / ABHA / Aadhaar number for safe display.
   * Input: "1234 5678 9012" or "91-1234-5678-9012" -> "XXXX-XXXX-9012"
   */
  maskNationalId(id: string): string {
    if (!id) return '';
    const clean = id.replace(/[^0-9A-Za-z]/g, '');
    if (clean.length <= 4) return '****';
    const last4 = clean.slice(-4);
    return `XXXX-XXXX-${last4}`;
  }

  /**
   * Mask telephone number for safe display.
   * Input: "+91 8114240263" -> "+91 ******0263"
   */
  maskPhone(phone: string): string {
    if (!phone) return '';
    const digits = phone.replace(/[^0-9]/g, '');
    if (digits.length <= 4) return '******';
    const last4 = digits.slice(-4);
    return `+91 ******${last4}`;
  }

  /**
   * Mask email address for safe display.
   * Input: "patient@medinexa.com" -> "p***t@medinexa.com"
   */
  maskEmail(email: string): string {
    if (!email || !email.includes('@')) return email;
    const [local, domain] = email.split('@');
    if (local.length <= 2) return `*@${domain}`;
    const first = local[0];
    const last = local[local.length - 1];
    return `${first}***${last}@${domain}`;
  }
}
