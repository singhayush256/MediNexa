import { describe, it, beforeEach, afterEach } from 'node:test';
import * as assert from 'node:assert';
import { RateLimiterGuard } from '../dist/common/guards/rate-limiter.guard.js';
import { HttpStatus } from '@nestjs/common';

let originalEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  originalEnv = { ...process.env };
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe('MediNexa Redis Rate Limiting & Resilience Suite', () => {
  // Helper to create mock ExecutionContext
  const createMockContext = (ip = '192.168.1.100', url = '/api/v1/clinical/encounters', body = {}) => {
    const headers: Record<string, any> = { 'x-forwarded-for': ip };
    const resHeaders: Record<string, any> = {};

    const req = {
      headers,
      url,
      body,
      socket: { remoteAddress: ip },
      ip,
    };

    const res = {
      setHeader: (name: string, val: any) => {
        resHeaders[name] = val;
      },
      getHeader: (name: string) => resHeaders[name],
    };

    return {
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => res,
      }),
      resHeaders,
    };
  };

  it('reports memory_fallback when REDIS_URL is not configured', () => {
    delete process.env.REDIS_URL;
    const status = RateLimiterGuard.getRedisStatus();

    assert.strictEqual(status.configured, false);
    assert.strictEqual(status.connected, false);
    assert.strictEqual(status.mode, 'memory_fallback');
  });

  it('allows normal clinical requests within rate limit thresholds', async () => {
    process.env.RATE_LIMIT_MAX_REQUESTS = '100';
    process.env.RATE_LIMIT_TTL_SECONDS = '60';

    const guard = new RateLimiterGuard();
    const mockCtx = createMockContext('10.0.0.1', '/api/v1/patient-portal/profile');

    const allowed = await guard.canActivate(mockCtx as any);
    assert.strictEqual(allowed, true);
    assert.strictEqual(mockCtx.resHeaders['X-RateLimit-Limit'], 100);
    assert.strictEqual(mockCtx.resHeaders['X-RateLimit-Remaining'], 99);
    assert.ok(mockCtx.resHeaders['X-RateLimit-Reset'] > 0);
  });

  it('blocks requests and returns HTTP 429 when IP rate limit is exceeded', async () => {
    process.env.RATE_LIMIT_MAX_REQUESTS = '5';
    process.env.RATE_LIMIT_TTL_SECONDS = '60';

    const guard = new RateLimiterGuard();
    const testIp = '10.0.0.99';

    // Consume all 5 allowed requests
    for (let i = 0; i < 5; i++) {
      const ctx = createMockContext(testIp, '/api/v1/resource');
      await guard.canActivate(ctx as any);
    }

    // 6th request must throw 429 Too Many Requests
    let threw429 = false;
    try {
      const blockedCtx = createMockContext(testIp, '/api/v1/resource');
      await guard.canActivate(blockedCtx as any);
    } catch (err: any) {
      if (err.getStatus?.() === HttpStatus.TOO_MANY_REQUESTS) {
        threw429 = true;
        const res = err.getResponse();
        assert.strictEqual(res.statusCode, 429);
        assert.ok(res.message.includes('Rate limit exceeded for this IP'));
      }
    }
    assert.strictEqual(threw429, true, '6th request must be rejected with HTTP 429');
  });

  it('applies stricter account-level rate limiting on sensitive /auth/login routes', async () => {
    const guard = new RateLimiterGuard();
    const targetEmail = 'victim_dr_deshmukh@medinexa.in';

    // 10 login attempts allowed per account
    for (let i = 0; i < 10; i++) {
      const ctx = createMockContext(`192.168.10.${i}`, '/api/v1/auth/login', { email: targetEmail });
      await guard.canActivate(ctx as any);
    }

    // 11th attempt against the same target account (even from a different IP) must trigger brute-force block
    let accountBlocked = false;
    try {
      const blockedCtx = createMockContext('192.168.10.200', '/api/v1/auth/login', { email: targetEmail });
      await guard.canActivate(blockedCtx as any);
    } catch (err: any) {
      if (err.getStatus?.() === HttpStatus.TOO_MANY_REQUESTS) {
        accountBlocked = true;
        const res = err.getResponse();
        assert.ok(res.message.includes('Too many authentication attempts for this account'));
      }
    }
    assert.strictEqual(accountBlocked, true, 'Account brute-force attack must be blocked with HTTP 429');
  });
});

