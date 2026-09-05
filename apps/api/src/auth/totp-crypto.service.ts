import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class TotpCryptoService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly encryptionKey: Buffer;

  constructor() {
    // Derive a fixed 32-byte key from environment secret
    const secret =
      process.env.TOTP_ENCRYPTION_KEY ||
      process.env.JWT_SECRET ||
      'medinexa-enterprise-totp-master-encryption-key-2026';
    this.encryptionKey = crypto.createHash('sha256').update(secret).digest();
  }

  /**
   * Encrypt a plain Base32 TOTP secret using AES-256-GCM
   * Returns a format: `${ivHex}:${authTagHex}:${encryptedHex}`
   */
  encryptSecret(plainSecret: string): string {
    if (!plainSecret) return '';
    const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
    const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
    
    let encrypted = cipher.update(plainSecret, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt an AES-256-GCM encrypted TOTP secret
   */
  decryptSecret(encryptedData: string): string {
    if (!encryptedData) return '';
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      // If legacy or unencrypted fallback
      return encryptedData;
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
    
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Hash a single clean recovery code using fast, secure HMAC-SHA256
   */
  hashBackupCode(cleanCode: string): string {
    return 'hmac$' + crypto.createHmac('sha256', this.encryptionKey).update(cleanCode).digest('hex');
  }

  /**
   * Generate 8 secure, human-readable backup recovery codes (e.g. "A7K2-9XP4")
   */
  generateBackupCodes(count = 8): { plainCodes: string[]; hashedCodes: string[] } {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude ambiguous chars (0, 1, O, I)
    const plainCodes: string[] = [];
    const hashedCodes: string[] = [];

    for (let i = 0; i < count; i++) {
      let part1 = '';
      let part2 = '';
      for (let j = 0; j < 4; j++) {
        part1 += chars.charAt(crypto.randomInt(0, chars.length));
        part2 += chars.charAt(crypto.randomInt(0, chars.length));
      }
      const code = `${part1}-${part2}`;
      plainCodes.push(code);

      // Fast cryptographic HMAC hash (<0.1ms per code instead of 120ms bcrypt)
      const cleanCode = code.replace(/[\s-]/g, '').toUpperCase();
      const hashed = this.hashBackupCode(cleanCode);
      hashedCodes.push(hashed);
    }

    return { plainCodes, hashedCodes };
  }

  /**
   * Verify if a user-supplied recovery code matches any hashed backup code
   * Returns index of the matched code, or -1 if no match
   */
  verifyBackupCode(enteredCode: string, hashedCodes: string[]): number {
    if (!enteredCode || !Array.isArray(hashedCodes) || hashedCodes.length === 0) {
      return -1;
    }
    const cleanEntered = enteredCode.replace(/[\s-]/g, '').toUpperCase();
    const enteredHmac = this.hashBackupCode(cleanEntered);

    for (let i = 0; i < hashedCodes.length; i++) {
      const hashed = hashedCodes[i];
      if (!hashed) continue;

      if (hashed.startsWith('hmac$')) {
        if (hashed === enteredHmac) {
          return i;
        }
      } else {
        // Fallback for legacy bcrypt-hashed backup codes
        try {
          if (bcrypt.compareSync(cleanEntered, hashed)) {
            return i;
          }
        } catch {
          // ignore corrupted hash
        }
      }
    }
    return -1;
  }
}
