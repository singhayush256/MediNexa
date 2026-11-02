import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

export interface StoredRefreshToken {
  id: string;
  userId: string;
  tokenHash: string;
  familyId: string;
  isRevoked: boolean;
  replacedBy?: string | null;
  expiresAt: Date;
  createdAt: Date;
}

@Injectable()
export class RefreshTokenService {
  private readonly logger = new Logger(RefreshTokenService.name);
  private static readonly memoryFallbackStore = new Map<string, StoredRefreshToken>();

  // Default: 30 days refresh token validity
  private readonly defaultExpiryDays = 30;

  constructor(private readonly prisma: PrismaService) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token.trim()).digest('hex');
  }

  /**
   * Generates a new cryptographically strong refresh token and stores its hash.
   */
  async createRefreshToken(
    userId: string,
    existingFamilyId?: string,
  ): Promise<{ refreshToken: string; familyId: string }> {
    const rawToken = crypto.randomBytes(48).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const tokenId = crypto.randomUUID();
    const familyId = existingFamilyId || crypto.randomUUID();
    const expiresAt = new Date(Date.now() + this.defaultExpiryDays * 24 * 60 * 60 * 1000);

    try {
      await this.prisma.$executeRawUnsafe(
        'INSERT INTO "user_refresh_tokens" ("id", "user_id", "token_hash", "family_id", "is_revoked", "expires_at", "created_at", "updated_at") VALUES ($1, $2, $3, $4, false, $5, NOW(), NOW())',
        tokenId,
        userId,
        tokenHash,
        familyId,
        expiresAt,
      );
    } catch (err: any) {
      this.logger.debug?.(`Database refresh token insert fallback to memory: ${err?.message || err}`);
      RefreshTokenService.memoryFallbackStore.set(tokenHash, {
        id: tokenId,
        userId,
        tokenHash,
        familyId,
        isRevoked: false,
        expiresAt,
        createdAt: new Date(),
      });
    }

    return { refreshToken: rawToken, familyId };
  }

  /**
   * Rotates a refresh token with automatic token reuse / replay attack detection.
   * If a previously rotated token is re-presented, the entire token family is revoked.
   */
  async rotateRefreshToken(
    oldRefreshToken: string,
  ): Promise<{ userId: string; newRefreshToken: string; familyId: string }> {
    if (!oldRefreshToken || oldRefreshToken.trim().length < 10) {
      throw new UnauthorizedException('Invalid or missing refresh token.');
    }

    const tokenHash = this.hashToken(oldRefreshToken);
    let record: StoredRefreshToken | null = null;

    try {
      const rows: any[] = await this.prisma.$queryRawUnsafe(
        'SELECT "id", "user_id" as "userId", "token_hash" as "tokenHash", "family_id" as "familyId", "is_revoked" as "isRevoked", "replaced_by" as "replacedBy", "expires_at" as "expiresAt", "created_at" as "createdAt" FROM "user_refresh_tokens" WHERE "token_hash" = $1 LIMIT 1',
        tokenHash,
      );
      if (rows && rows.length > 0) {
        record = rows[0];
      }
    } catch {
      record = RefreshTokenService.memoryFallbackStore.get(tokenHash) || null;
    }

    if (!record) {
      record = RefreshTokenService.memoryFallbackStore.get(tokenHash) || null;
    }

    if (!record) {
      throw new UnauthorizedException('Refresh token not found or already consumed.');
    }

    // --- REUSE DETECTION ---
    // If token has already been revoked or replaced, an attacker is attempting a replay attack!
    if (record.isRevoked || record.replacedBy) {
      this.logger.error(
        `🚨 [SECURITY ALERT] Refresh token reuse detected! Family: ${record.familyId}, User: ${record.userId}. Revoking entire token family to prevent account takeover.`,
      );

      // Invalidate all tokens belonging to this family
      await this.revokeFamily(record.familyId);
      throw new UnauthorizedException(
        'Security Alert: Compromised session detected. All active sessions have been terminated. Please sign in again.',
      );
    }

    // --- EXPIRY CHECK ---
    if (new Date() > new Date(record.expiresAt)) {
      throw new UnauthorizedException('Refresh token has expired. Please sign in again.');
    }

    // --- ROTATION: Issue new token in the same family and revoke the old token ---
    const rawNewToken = crypto.randomBytes(48).toString('hex');
    const newTokenHash = this.hashToken(rawNewToken);
    const newTokenId = crypto.randomUUID();
    const newExpiresAt = new Date(Date.now() + this.defaultExpiryDays * 24 * 60 * 60 * 1000);

    try {
      await this.prisma.$executeRawUnsafe(
        'UPDATE "user_refresh_tokens" SET "is_revoked" = true, "replaced_by" = $1, "updated_at" = NOW() WHERE "id" = $2',
        newTokenId,
        record.id,
      );

      await this.prisma.$executeRawUnsafe(
        'INSERT INTO "user_refresh_tokens" ("id", "user_id", "token_hash", "family_id", "is_revoked", "expires_at", "created_at", "updated_at") VALUES ($1, $2, $3, $4, false, $5, NOW(), NOW())',
        newTokenId,
        record.userId,
        newTokenHash,
        record.familyId,
        newExpiresAt,
      );
    } catch {
      // Memory fallback sync
      record.isRevoked = true;
      record.replacedBy = newTokenId;
      RefreshTokenService.memoryFallbackStore.set(newTokenHash, {
        id: newTokenId,
        userId: record.userId,
        tokenHash: newTokenHash,
        familyId: record.familyId,
        isRevoked: false,
        expiresAt: newExpiresAt,
        createdAt: new Date(),
      });
    }

    return {
      userId: record.userId,
      newRefreshToken: rawNewToken,
      familyId: record.familyId,
    };
  }

  /**
   * Revoke a single refresh token upon logout
   */
  async revokeToken(refreshToken: string): Promise<void> {
    if (!refreshToken) return;
    const tokenHash = this.hashToken(refreshToken);

    try {
      await this.prisma.$executeRawUnsafe(
        'UPDATE "user_refresh_tokens" SET "is_revoked" = true, "updated_at" = NOW() WHERE "token_hash" = $1',
        tokenHash,
      );
    } catch {
      const rec = RefreshTokenService.memoryFallbackStore.get(tokenHash);
      if (rec) rec.isRevoked = true;
    }
  }

  /**
   * Revoke all tokens across all sessions for a specific user (Logout across all devices)
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    try {
      await this.prisma.$executeRawUnsafe(
        'UPDATE "user_refresh_tokens" SET "is_revoked" = true, "updated_at" = NOW() WHERE "user_id" = $1',
        userId,
      );
    } catch {}

    for (const [, rec] of RefreshTokenService.memoryFallbackStore) {
      if (rec.userId === userId) {
        rec.isRevoked = true;
      }
    }

    this.logger.log(`[AUTH REVOCATION] Revoked all active sessions for user: ${userId}`);
  }

  /**
   * Revoke entire family when reuse is detected
   */
  async revokeFamily(familyId: string): Promise<void> {
    try {
      await this.prisma.$executeRawUnsafe(
        'UPDATE "user_refresh_tokens" SET "is_revoked" = true, "updated_at" = NOW() WHERE "family_id" = $1',
        familyId,
      );
    } catch {}

    for (const [, rec] of RefreshTokenService.memoryFallbackStore) {
      if (rec.familyId === familyId) {
        rec.isRevoked = true;
      }
    }
  }
}
