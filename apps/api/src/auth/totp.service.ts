import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';
import { TotpCryptoService } from './totp-crypto.service';

export interface GenerateTotpSetupResult {
  base32Secret: string;
  encryptedSecret: string;
  qrCodeUrl: string;
  manualSetupKey: string;
  plainBackupCodes: string[];
  hashedBackupCodes: string[];
  otpauthUrl: string;
}

@Injectable()
export class TotpService {
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_MINUTES = 15;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: TotpCryptoService,
  ) {}

  /**
   * Generate a fresh TOTP secret, QR code, manual setup key, and single-use backup recovery codes
   */
  async generateSetupCredentials(email: string, appName = 'MediNexa'): Promise<GenerateTotpSetupResult> {
    const cleanEmail = email.toLowerCase().trim();

    // 1. Generate unique RFC 6238 Base32 secret
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `${appName} (${cleanEmail})`,
      issuer: appName,
    });

    const base32Secret = secret.base32;
    const otpauthUrl =
      secret.otpauth_url ||
      speakeasy.otpauthURL({
        secret: base32Secret,
        label: `${appName}:${cleanEmail}`,
        issuer: appName,
        encoding: 'base32',
      });

    // 2. Generate high-resolution QR Code data URL (PNG Base64)
    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 256,
      color: {
        dark: '#020617', // Dark navy slate
        light: '#FFFFFF',
      },
    });

    // 3. Encrypt secret for storage
    const encryptedSecret = this.cryptoService.encryptSecret(base32Secret);

    // 4. Generate 8 single-use backup recovery codes
    const { plainCodes, hashedCodes } = this.cryptoService.generateBackupCodes(8);

    return {
      base32Secret,
      encryptedSecret,
      qrCodeUrl,
      manualSetupKey: base32Secret, // Clean Base32 key for manual typing into authenticator
      plainBackupCodes: plainCodes,
      hashedBackupCodes: hashedCodes,
      otpauthUrl,
    };
  }

  /**
   * Verify a 6-digit TOTP code against a plain Base32 secret
   */
  verifyCodeAgainstPlainSecret(plainBase32Secret: string, code: string): boolean {
    if (!plainBase32Secret || !code) return false;
    const cleanCode = code.toString().replace(/\s+/g, '').trim();
    if (!/^\d{6}$/.test(cleanCode)) return false;

    return speakeasy.totp.verify({
      secret: plainBase32Secret,
      encoding: 'base32',
      token: cleanCode,
      window: 1, // 1 step tolerance (±30s) for minor clock discrepancies
    });
  }

  /**
   * Verify a 6-digit TOTP code against an encrypted secret
   */
  verifyCodeAgainstEncryptedSecret(encryptedSecret: string, code: string): boolean {
    if (!encryptedSecret) return false;
    const plainSecret = this.cryptoService.decryptSecret(encryptedSecret);
    return this.verifyCodeAgainstPlainSecret(plainSecret, code);
  }

  /**
   * Check if a user's 2FA account is currently locked out
   */
  checkUserLockout(user: { totpLockedUntil?: Date | null; failedTotpAttempts?: number }): void {
    if (user.totpLockedUntil && new Date(user.totpLockedUntil) > new Date()) {
      const remainingMs = new Date(user.totpLockedUntil).getTime() - Date.now();
      const remainingMinutes = Math.ceil(remainingMs / 60000);
      throw new ForbiddenException(
        `Account is temporarily locked due to multiple failed verification attempts. Please try again in ${remainingMinutes} minute${
          remainingMinutes > 1 ? 's' : ''
        }.`,
      );
    }
  }

  /**
   * Record a failed verification attempt and potentially lock the account
   */
  async handleFailedAttempt(userId: string, currentFailedAttempts: number): Promise<void> {
    const nextFailed = currentFailedAttempts + 1;
    const isLocking = nextFailed >= this.MAX_FAILED_ATTEMPTS;
    const lockedUntil = isLocking
      ? new Date(Date.now() + this.LOCKOUT_MINUTES * 60 * 1000)
      : null;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedTotpAttempts: nextFailed,
        totpLockedUntil: lockedUntil,
      },
    });

    if (isLocking) {
      throw new ForbiddenException(
        `Too many failed verification attempts. Account has been locked for ${this.LOCKOUT_MINUTES} minutes.`,
      );
    } else {
      const remaining = this.MAX_FAILED_ATTEMPTS - nextFailed;
      throw new UnauthorizedException(
        `Invalid authenticator code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before temporary account lockout.`,
      );
    }
  }

  /**
   * Reset failed attempt counters upon successful verification
   */
  async handleSuccessfulVerification(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedTotpAttempts: 0,
        totpLockedUntil: null,
        lastVerificationTime: new Date(),
      },
    });
  }

  /**
   * Verify login TOTP (either standard 6-digit TOTP code or an 8-character backup recovery code)
   */
  async verifyUserLoginTotp(
    userId: string,
    code: string,
  ): Promise<{ success: boolean; usedBackupCode: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        totpSecret: true,
        twoFactorEnabled: true,
        backupCodes: true,
        failedTotpAttempts: true,
        totpLockedUntil: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.twoFactorEnabled || !user.totpSecret) {
      // 2FA not enabled on user
      return { success: true, usedBackupCode: false };
    }

    // Check account lockout
    this.checkUserLockout(user);

    const cleanCode = code.toString().trim();

    // Check if entered code is a backup code (typically 8-9 chars with dash)
    const isBackupFormat = cleanCode.replace(/[\s-]/g, '').length >= 8;
    if (isBackupFormat) {
      const backupIndex = this.cryptoService.verifyBackupCode(cleanCode, user.backupCodes);
      if (backupIndex >= 0) {
        // Valid backup code! Remove the used code from user's list
        const updatedBackupCodes = [...user.backupCodes];
        updatedBackupCodes.splice(backupIndex, 1);

        await this.prisma.user.update({
          where: { id: userId },
          data: {
            backupCodes: updatedBackupCodes,
            failedTotpAttempts: 0,
            totpLockedUntil: null,
            lastVerificationTime: new Date(),
          },
        });

        return { success: true, usedBackupCode: true };
      }
    }

    // Otherwise verify as standard 6-digit TOTP
    const isTotpValid = this.verifyCodeAgainstEncryptedSecret(user.totpSecret, cleanCode);
    if (!isTotpValid) {
      await this.handleFailedAttempt(user.id, user.failedTotpAttempts);
      return { success: false, usedBackupCode: false };
    }

    // Success!
    await this.handleSuccessfulVerification(user.id);
    return { success: true, usedBackupCode: false };
  }
}
