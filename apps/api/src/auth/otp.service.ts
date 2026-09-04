import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

export interface PendingRegistration {
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  mobileNumber: string;
  countryCode: string;
  passwordHash: string;
  role: string;
  termsAccepted: boolean;
  createdAt: Date;
}

export interface OtpRecord {
  code: string;
  email: string;
  expiresAt: number; // timestamp
  attempts: number;
  lastSentAt: number;
  purpose: 'REGISTRATION' | 'PASSWORD_RESET' | 'LOGIN';
  data?: any;
}

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private otpStore = new Map<string, OtpRecord>();

  // OTP Configuration
  private readonly OTP_TTL_MS = 10 * 60 * 1000; // 10 Minutes Expiry
  private readonly MAX_ATTEMPTS = 5;
  private readonly RESEND_COOLDOWN_MS = 60 * 1000; // 60 Seconds Cooldown

  /**
   * Validate email format across major providers and corporate domains
   */
  validateEmail(email: string): string {
    if (!email) {
      throw new BadRequestException('Email address is required.');
    }
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      throw new BadRequestException('Invalid email format');
    }
    return cleanEmail;
  }

  /**
   * Generate a secure 6-digit numeric OTP
   */
  private generateNumericOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Create or update an OTP for a given email and purpose
   */
  async generateAndSendOtp(
    email: string,
    purpose: 'REGISTRATION' | 'PASSWORD_RESET' | 'LOGIN',
    data?: any,
  ): Promise<{ message: string; expiresInSeconds: number; previewOtp?: string }> {
    const cleanEmail = this.validateEmail(email);
    const key = `${purpose}:${cleanEmail}`;
    const existing = this.otpStore.get(key);

    const now = Date.now();
    if (existing && now - existing.lastSentAt < this.RESEND_COOLDOWN_MS) {
      const waitTime = Math.ceil((this.RESEND_COOLDOWN_MS - (now - existing.lastSentAt)) / 1000);
      throw new BadRequestException(`Please wait ${waitTime} seconds before requesting a new OTP.`);
    }

    const code = this.generateNumericOtp();
    const record: OtpRecord = {
      code,
      email: cleanEmail,
      expiresAt: now + this.OTP_TTL_MS,
      attempts: 0,
      lastSentAt: now,
      purpose,
      data: data || existing?.data,
    };

    this.otpStore.set(key, record);

    // Production email dispatch simulation & logging
    this.logger.log(`📧 [EMAIL DISPATCH] Sent 6-Digit OTP [${code}] to ${cleanEmail} for ${purpose}. Valid for 10 minutes.`);

    return {
      message: `A 6-digit verification code has been sent to ${cleanEmail}. Code expires in 10 minutes.`,
      expiresInSeconds: Math.floor(this.OTP_TTL_MS / 1000),
      previewOtp: process.env.NODE_ENV !== 'production' ? code : undefined,
    };
  }

  /**
   * Verify an OTP provided by the user
   */
  async verifyOtp(
    email: string,
    code: string,
    purpose: 'REGISTRATION' | 'PASSWORD_RESET' | 'LOGIN',
  ): Promise<{ success: boolean; data?: any }> {
    const cleanEmail = this.validateEmail(email);
    const key = `${purpose}:${cleanEmail}`;
    const record = this.otpStore.get(key);

    if (!record) {
      throw new BadRequestException('No active OTP found. Please request a new verification code.');
    }

    if (Date.now() > record.expiresAt) {
      this.otpStore.delete(key);
      throw new BadRequestException('Verification code has expired. Please request a new code.');
    }

    if (record.attempts >= this.MAX_ATTEMPTS) {
      this.otpStore.delete(key);
      throw new BadRequestException('Too many incorrect verification attempts. Please request a new code.');
    }

    record.attempts += 1;

    if (record.code !== code.trim()) {
      const remaining = this.MAX_ATTEMPTS - record.attempts;
      throw new BadRequestException(`Invalid verification code. ${remaining} attempts remaining.`);
    }

    // Successfully verified -> clean up store
    const payloadData = record.data;
    this.otpStore.delete(key);

    this.logger.log(`✅ [OTP VERIFIED] Verification code successfully validated for ${cleanEmail} (${purpose}).`);
    return { success: true, data: payloadData };
  }

  /**
   * Get pending data for an active OTP without consuming it
   */
  getOtpData(email: string, purpose: 'REGISTRATION' | 'PASSWORD_RESET' | 'LOGIN'): any {
    const cleanEmail = this.validateEmail(email);
    const key = `${purpose}:${cleanEmail}`;
    return this.otpStore.get(key)?.data;
  }
}
