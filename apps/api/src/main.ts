import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  // Performance Telemetry & Micro-Caching Middleware
  app.use((req: any, res: any, next: any) => {
    const start = process.hrtime();
    const originalSend = res.send;

    res.send = function (body: any) {
      const diff = process.hrtime(start);
      const timeMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
      if (!res.headersSent) {
        res.setHeader('X-Response-Time', `${timeMs}ms`);
        if (req.method === 'GET' && !req.url.includes('/auth/')) {
          res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=45');
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

  // Enable CORS with environment-driven origin filtering
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:3000', 'http://localhost:3001'];

  app.enableCors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 MediNexa API backend running on http://0.0.0.0:${port} (${process.env.NODE_ENV || 'development'})`);
  console.log(`🏥 Health check endpoint: http://localhost:${port}/${apiPrefix.replace(/^\//, '')}/health`);
}
bootstrap();
