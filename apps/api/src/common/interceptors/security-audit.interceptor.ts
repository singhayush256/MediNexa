import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * SecurityAuditInterceptor
 *
 * Automatically records immutable audit trail entries for all state modifications
 * and sensitive PHI reads across MediNexa in compliance with HIPAA & ABDM standards.
 *
 * Features:
 * - Asynchronous background writes to ensure zero impact on API response latency
 * - Automatic redaction of sensitive credentials, tokens, and authorization headers
 * - Actor, role, facility, client IP, HTTP status, and duration tracking
 */
@Injectable()
export class SecurityAuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SecurityAuditInterceptor.name);

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const startTime = Date.now();

    const method = (req.method || 'GET').toUpperCase();
    const url = req.originalUrl || req.url || '';

    // Only audit mutating actions or sensitive PHI reads
    const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    const isSensitivePhiRead =
      method === 'GET' &&
      (url.includes('/ehr') ||
        url.includes('/lab') ||
        url.includes('/prescription') ||
        url.includes('/medical-record') ||
        url.includes('/billing') ||
        url.includes('/patient'));

    if (!isMutating && !isSensitivePhiRead) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: () => {
          this.recordAuditEvent(req, res.statusCode || 200, startTime, null);
        },
        error: (err) => {
          this.recordAuditEvent(req, err.status || 500, startTime, err.message);
        },
      }),
    );
  }

  private recordAuditEvent(req: any, statusCode: number, startTime: number, errorMessage: string | null) {
    const user = req.user;
    const durationMs = Date.now() - startTime;
    const clientIp =
      req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      req.ip ||
      '127.0.0.1';

    const action = `${req.method} ${req.route?.path || req.url}`;
    const resource = req.url || 'API_ENDPOINT';

    const detailsObj: Record<string, any> = {
      method: req.method,
      statusCode,
      durationMs,
      userAgent: req.headers['user-agent'] || 'unknown',
    };

    if (errorMessage) {
      detailsObj.error = errorMessage;
    }

    if (req.body && typeof req.body === 'object') {
      const sanitizedBody = { ...req.body };
      delete sanitizedBody.password;
      delete sanitizedBody.confirmPassword;
      delete sanitizedBody.currentPassword;
      delete sanitizedBody.token;
      delete sanitizedBody.accessToken;
      delete sanitizedBody.refreshToken;
      delete sanitizedBody.secret;
      delete sanitizedBody.cvv;
      delete sanitizedBody.cardNumber;
      detailsObj.body = sanitizedBody;
    }

    // Write asynchronously to Prisma AuditEvent table without awaiting
    this.prisma.auditEvent
      .create({
        data: {
          userId: user?.id || null,
          role: user?.roleCode || user?.role?.code || 'UNAUTHENTICATED',
          facilityId: user?.facilityId || user?.facility?.id || null,
          action,
          resource,
          details: JSON.stringify(detailsObj),
          ipAddress: clientIp,
        },
      })
      .catch((err) => {
        // Non-blocking logging failure notice
        this.logger.debug(`Audit log write notice: ${err.message}`);
      });
  }
}
