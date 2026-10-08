import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { RateLimiterGuard } from './common/guards/rate-limiter.guard';
import { HospitalTenantGuard } from './common/guards/hospital-tenant.guard';
import { SecurityAuditInterceptor } from './common/interceptors/security-audit.interceptor';
import { InputSanitizerMiddleware } from './common/middleware/input-sanitizer.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Register global structured exception filter with error logging
  app.useGlobalFilters(new HttpExceptionFilter());

  // Register global guards: Rate limiting (brute force protection) + Hospital Multi-Tenant Isolation
  app.useGlobalGuards(new RateLimiterGuard(), new HospitalTenantGuard());

  // Register global Zero Trust security audit interceptor (HIPAA / ABDM immutable audit trail)
  app.useGlobalInterceptors(app.get(SecurityAuditInterceptor));

  // Mount global deep input sanitizer middleware against XSS, SQLi, and null bytes
  const sanitizer = new InputSanitizerMiddleware();
  app.use((req: any, res: any, next: any) => sanitizer.use(req, res, next));

  // Enable global DTO validation pipe with strict production parameters
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Set global API prefix to /api/v1
  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(apiPrefix.replace(/^\//, ''));

  // Production Security Headers: HSTS, Anti-Clickjacking, MIME Sniffing & XSS Protection
  app.use((req: any, res: any, next: any) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=()');
    next();
  });

  // Performance Telemetry & Healthcare PHI Cache-Control Middleware
  app.use((req: any, res: any, next: any) => {
    const start = process.hrtime();
    const originalSend = res.send;

    res.send = function (body: any) {
      const diff = process.hrtime(start);
      const timeMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
      if (!res.headersSent) {
        res.setHeader('X-Response-Time', `${timeMs}ms`);
        // Public static resources or public health endpoints
        const isPublicStatic = req.url.startsWith('/public/') || req.url.startsWith('/uploads/') || req.url.endsWith('/health');
        if (isPublicStatic && req.method === 'GET') {
          res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
        } else {
          // Strictly protect PHI, healthcare data, and API responses from shared caching
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
      }
      return originalSend.call(this, body);
    };

    next();
  });

  // Resilient route rewrite: support both unprefixed /ai/* and prefixed /api/v1/ai/*
  app.use((req: any, res: any, next: any) => {
    if (req.url && (req.url === '/ai/chat' || req.url.startsWith('/ai/'))) {
      req.url = `/api/v1${req.url}`;
    }
    next();
  });

  // Enable CORS with strict production domain whitelist and local dev support
  const isProduction = process.env.NODE_ENV === 'production';
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, server-to-server, curl)
      if (!origin) {
        return callback(null, true);
      }

      // Check against explicit CORS_ORIGIN if set
      if (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== '*') {
        const allowed = process.env.CORS_ORIGIN.split(',').map((o) => o.trim().toLowerCase());
        if (allowed.includes(origin.toLowerCase())) {
          return callback(null, true);
        }
      }

      // Allowed domains for MediNexa production & staging
      try {
        const url = new URL(origin);
        const host = url.hostname.toLowerCase();

        // Trusted production origins
        if (
          host === 'medinexa.com' ||
          host.endsWith('.medinexa.com') ||
          host.endsWith('.medinexa.health') ||
          host.endsWith('.vercel.app') ||
          host.endsWith('.onrender.com')
        ) {
          return callback(null, true);
        }

        // Development-only origins
        if (!isProduction && (host === 'localhost' || host === '127.0.0.1')) {
          return callback(null, true);
        }

        // In non-production, if CORS_ORIGIN is wildcard, permit for local debugging
        if (!isProduction && (!process.env.CORS_ORIGIN || process.env.CORS_ORIGIN === '*')) {
          return callback(null, true);
        }
      } catch {
        // Fallback for non-standard origin
      }

      // If in non-production, allow dynamic reflection
      if (!isProduction) {
        return callback(null, true);
      }

      // In production, reject untrusted origins
      return callback(new Error(`Origin ${origin} not allowed by MediNexa Production CORS policy.`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
      'X-Response-Time',
    ],
    exposedHeaders: ['X-Response-Time', 'Content-Disposition'],
  });

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`[MediNexa API] Server started on port ${port} (${process.env.NODE_ENV || 'development'})`);
  console.log(`🚀 MediNexa API backend running on http://0.0.0.0:${port} (${process.env.NODE_ENV || 'development'})`);
  console.log(`🏥 Health check endpoint: http://localhost:${port}/${apiPrefix.replace(/^\//, '')}/health`);
}
bootstrap();
