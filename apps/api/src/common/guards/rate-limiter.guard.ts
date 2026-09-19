import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimiterGuard implements CanActivate {
  private readonly logger = new Logger(RateLimiterGuard.name);
  private static readonly tracker = new Map<string, RateLimitRecord>();

  // Default: 120 requests per 60 seconds for general endpoints
  private readonly defaultTtlMs = 60000;
  private readonly defaultLimit = 120;

  // Stricter limits for authentication endpoints (login, register, otp)
  private readonly authTtlMs = 60000;
  private readonly authLimit = 20;

  canActivate(context: ExecutionContext): boolean {
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
      url.includes('/auth/forgot-password');

    const limit = isAuthRoute ? this.authLimit : this.defaultLimit;
    const ttlMs = isAuthRoute ? this.authTtlMs : this.defaultTtlMs;
    const key = `${clientIp}:${isAuthRoute ? 'auth' : 'api'}`;

    const now = Date.now();
    const record = RateLimiterGuard.tracker.get(key);

    if (!record || now > record.resetAt) {
      RateLimiterGuard.tracker.set(key, {
        count: 1,
        resetAt: now + ttlMs,
      });

      if (res && res.setHeader) {
        res.setHeader('X-RateLimit-Limit', limit);
        res.setHeader('X-RateLimit-Remaining', limit - 1);
        res.setHeader('X-RateLimit-Reset', Math.ceil((now + ttlMs) / 1000));
      }
      return true;
    }

    record.count += 1;
    const remaining = Math.max(0, limit - record.count);

    if (res && res.setHeader) {
      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetAt / 1000));
    }

    if (record.count > limit) {
      this.logger.warn(`Rate limit exceeded for IP: ${clientIp} on path: ${url}`);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please wait a moment before trying again.',
          retryAfterSeconds: Math.ceil((record.resetAt - now) / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
