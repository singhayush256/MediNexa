import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import Redis from 'ioredis';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

/**
 * Distributed RateLimiterGuard
 *
 * Implements Redis-backed atomic rate limiting for distributed deployments,
 * with automatic, resilient fallback to in-memory tracking when Redis is not configured.
 *
 * Provides dual-layer protection:
 * 1. IP-based rate limiting (network and brute-force flooding defense)
 * 2. Account-based rate limiting (credential stuffing and account takeover defense)
 */
@Injectable()
export class RateLimiterGuard implements CanActivate {
  private readonly logger = new Logger(RateLimiterGuard.name);
  private static redisClient: Redis | null = null;
  private static redisInitialized = false;
  private static readonly memoryTracker = new Map<string, RateLimitRecord>();

  constructor() {
    RateLimiterGuard.initRedis();
  }

  private static initRedis() {
    if (RateLimiterGuard.redisInitialized) return;
    RateLimiterGuard.redisInitialized = true;

    const redisUrl = process.env.REDIS_URL?.trim();
    if (redisUrl) {
      try {
        const client = new Redis(redisUrl, {
          maxRetriesPerRequest: 1,
          connectTimeout: 3000,
          lazyConnect: true,
          retryStrategy: (times) => (times > 3 ? null : Math.min(times * 500, 2000)),
        });

        client.on('error', () => {
          // Suppress noise if Redis is temporarily offline; fail-open to memory tracker
        });

        client
          .connect()
          .then(() => {
            RateLimiterGuard.redisClient = client;
          })
          .catch(() => {
            RateLimiterGuard.redisClient = null;
          });
      } catch {
        RateLimiterGuard.redisClient = null;
      }
    }
  }

  public static getRedisStatus(): { configured: boolean; connected: boolean; mode: 'redis' | 'memory_fallback' } {
    const configured = Boolean(process.env.REDIS_URL?.trim());
    const connected = Boolean(RateLimiterGuard.redisClient && RateLimiterGuard.redisClient.status === 'ready');
    return {
      configured,
      connected,
      mode: connected ? 'redis' : 'memory_fallback',
    };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const clientIp =
      req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      req.ip ||
      'unknown-ip';

    const url = req.url || '';
    const isAuthRoute =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/verify-totp') ||
      url.includes('/auth/forgot-password') ||
      url.includes('/auth/reset-password') ||
      url.includes('/auth/demo-switch') ||
      url.includes('/public/otp/');

    const defaultLimit = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '120', 10);
    const authLimit = parseInt(process.env.AUTH_RATE_LIMIT_MAX || '20', 10);
    const ipLimit = isAuthRoute ? authLimit : defaultLimit;
    const ttlSeconds = parseInt(process.env.RATE_LIMIT_TTL_SECONDS || '60', 10);

    // Account identifier for account-based brute-force protection
    const accountIdentifier = (
      req.body?.email ||
      req.body?.identifier ||
      req.body?.phone ||
      req.user?.email ||
      ''
    )
      .toString()
      .toLowerCase()
      .trim();

    // 1. Check IP-based limit
    const ipKey = `rl:ip:${clientIp}:${isAuthRoute ? 'auth' : 'api'}`;
    const ipResult = await this.consumeLimit(ipKey, ipLimit, ttlSeconds);

    if (res && res.setHeader) {
      res.setHeader('X-RateLimit-Limit', ipLimit);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, ipLimit - ipResult.current));
      res.setHeader('X-RateLimit-Reset', Math.ceil(ipResult.resetAt / 1000));
    }

    if (ipResult.current > ipLimit) {
      this.logger.warn(`[RATE LIMIT EXCEEDED] IP: ${clientIp} on path: ${url}`);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too Many Requests',
          message: 'Rate limit exceeded for this IP. Please wait a moment before trying again.',
          retryAfterSeconds: Math.ceil(Math.max(0, ipResult.resetAt - Date.now()) / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 2. Check Account-based limit for sensitive auth endpoints
    if (isAuthRoute && accountIdentifier && accountIdentifier.length > 3) {
      const accountLimit = 10; // Stricter account limit: 10 attempts per minute per account
      const acctKey = `rl:acct:${accountIdentifier}`;
      const acctResult = await this.consumeLimit(acctKey, accountLimit, ttlSeconds);

      if (acctResult.current > accountLimit) {
        this.logger.warn(
          `[RATE LIMIT EXCEEDED] Account brute-force block for: ${accountIdentifier} on path: ${url}`,
        );
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            error: 'Too Many Requests',
            message:
              'Too many authentication attempts for this account. Please wait a moment before trying again.',
            retryAfterSeconds: Math.ceil(Math.max(0, acctResult.resetAt - Date.now()) / 1000),
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    return true;
  }

  private async consumeLimit(
    key: string,
    limit: number,
    ttlSeconds: number,
  ): Promise<{ current: number; resetAt: number }> {
    const redis = RateLimiterGuard.redisClient;

    if (redis && redis.status === 'ready') {
      try {
        const pipeline = redis.pipeline();
        pipeline.incr(key);
        pipeline.ttl(key);
        const results = await pipeline.exec();

        if (results && results.length >= 2) {
          const current = (results[0][1] as number) || 1;
          let ttl = (results[1][1] as number) || -1;

          if (ttl === -1) {
            await redis.expire(key, ttlSeconds);
            ttl = ttlSeconds;
          }

          return {
            current,
            resetAt: Date.now() + Math.max(1, ttl) * 1000,
          };
        }
      } catch {
        // Fall through to memory tracker if Redis command fails
      }
    }

    // Fallback: In-Memory tracker
    const now = Date.now();
    const ttlMs = ttlSeconds * 1000;
    const record = RateLimiterGuard.memoryTracker.get(key);

    if (!record || now > record.resetAt) {
      const resetAt = now + ttlMs;
      RateLimiterGuard.memoryTracker.set(key, { count: 1, resetAt });
      return { current: 1, resetAt };
    }

    record.count += 1;
    return { current: record.count, resetAt: record.resetAt };
  }
}
