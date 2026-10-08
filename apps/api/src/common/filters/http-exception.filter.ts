import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { isAllowedCorsOrigin } from '../utils/cors-origin.util';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let errorName = 'InternalServerError';
    let details: any = undefined;
    let serverDiagnostic = '';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, any>;
        message = resObj.message || exception.message;
        errorName = resObj.error || exception.name;
        details = resObj.details;
      } else {
        message = exception.message;
        errorName = exception.name;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        // Duplicate entry / unique constraint violation
        status = HttpStatus.CONFLICT;
        const target = (exception.meta?.target as string[]) || [];
        const isEmail = target.some((f) => f.toLowerCase().includes('email'));
        if (isEmail) {
          message = 'An account with this email address already exists. Please sign in instead.';
        } else {
          const fieldName = target.join(', ') || 'field';
          message = `A record with this ${fieldName} already exists.`;
        }
        errorName = 'Conflict';
        serverDiagnostic = `[MediNexa DB Error] Unique constraint violation (P2002) on target: [${target.join(', ')}]`;
      } else if (exception.code === 'P2025') {
        // Record not found
        status = HttpStatus.NOT_FOUND;
        message = 'Requested record could not be found.';
        errorName = 'NotFound';
      } else if (exception.code === 'P2021') {
        // Table missing
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = 'Database service is temporarily unavailable due to pending schema maintenance. Please retry in a moment.';
        errorName = 'DatabaseTableMissingError';
        const missingTable = (exception.meta as any)?.table || 'unknown';
        serverDiagnostic = `[MediNexa DB Error] Schema table missing (P2021): table '${missingTable}' does not exist. Pending migration deployment may be required (run 'npm run db:migrate'). Raw error: ${exception.message}`;
      } else if (exception.code === 'P2022') {
        // Column missing
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = 'Database service is temporarily unavailable due to pending schema maintenance. Please retry in a moment.';
        errorName = 'DatabaseColumnMissingError';
        const missingCol = (exception.meta as any)?.column || 'unknown';
        const missingTable = (exception.meta as any)?.table || 'unknown';
        serverDiagnostic = `[MediNexa DB Error] Schema column missing (P2022): column '${missingCol}' in table '${missingTable}' does not exist. Pending migration deployment may be required (run 'npm run db:migrate'). Raw error: ${exception.message}`;
      } else if (exception.code === 'P1001') {
        // Database unreachable
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = 'Database service is currently unreachable. Please retry in a moment.';
        errorName = 'DatabaseUnavailableError';
        serverDiagnostic = `[MediNexa DB Error] Cannot reach database server (P1001): ${exception.message}`;
      } else if (
        exception.code === 'P1002' ||
        exception.code === 'P1008' ||
        exception.code === 'P2024'
      ) {
        // Connection timeout
        status = HttpStatus.GATEWAY_TIMEOUT;
        message = 'Database operation timed out. Please retry in a moment.';
        errorName = 'DatabaseTimeoutError';
        serverDiagnostic = `[MediNexa DB Error] Database timeout (${exception.code}): ${exception.message}`;
      } else if (exception.code.startsWith('P30')) {
        // Migration error
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = 'Database schema update is in progress. Please retry in a moment.';
        errorName = 'DatabaseMigrationError';
        serverDiagnostic = `[MediNexa DB Error] Prisma migration error (${exception.code}): ${exception.message}`;
      } else {
        // Generic database query error - do not return raw SQL to browser
        status = HttpStatus.BAD_REQUEST;
        message = 'A database request error occurred. Please verify your request parameters and retry.';
        errorName = 'DatabaseRequestError';
        serverDiagnostic = `[MediNexa DB Error] Query error (${exception.code}): ${exception.message}`;
      }
    } else if (exception instanceof Prisma.PrismaClientInitializationError) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'Database service is currently unreachable. Please ensure PostgreSQL is running.';
      errorName = 'DatabaseConnectionError';
      serverDiagnostic = `[MediNexa DB Error] PrismaClientInitializationError: ${exception.message}`;
    } else if (exception instanceof Prisma.PrismaClientRustPanicError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'An unexpected database engine error occurred.';
      errorName = 'DatabaseEnginePanicError';
      serverDiagnostic = `[MediNexa DB Error] PrismaClientRustPanicError: ${exception.message}`;
    } else if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'An unexpected database error occurred. Please try again later.';
      errorName = 'DatabaseUnknownError';
      serverDiagnostic = `[MediNexa DB Error] PrismaClientUnknownRequestError: ${exception.message}`;
    } else if (exception instanceof Error) {
      message = exception.message;
      errorName = exception.name;
    }

    // Sanitize request body to remove sensitive fields from logs
    const sanitizedBody = { ...request.body };
    if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
    if (sanitizedBody.confirmPassword) sanitizedBody.confirmPassword = '[REDACTED]';
    if (sanitizedBody.code) sanitizedBody.code = '[REDACTED]';
    if (sanitizedBody.totpSecret) sanitizedBody.totpSecret = '[REDACTED]';
    if (sanitizedBody.registrationToken) sanitizedBody.registrationToken = '[REDACTED_TOKEN]';

    const logMessage = `[${request.method}] ${request.url} - Status: ${status} | Error: ${errorName} | Message: ${
      Array.isArray(message) ? message.join(', ') : message
    }`;

    if (status >= 500) {
      this.logger.error(
        `${logMessage}${serverDiagnostic ? `\nDiagnostic: ${serverDiagnostic}` : ''}\nPayload: ${JSON.stringify(
          sanitizedBody,
        )}\nStack: ${exception instanceof Error ? exception.stack : 'N/A'}`,
      );
    } else {
      this.logger.warn(
        `${logMessage}${serverDiagnostic ? ` | Diagnostic: ${serverDiagnostic}` : ''} | Body: ${JSON.stringify(
          sanitizedBody,
        )}`,
      );
    }

    // Ensure CORS headers are explicitly set on error responses only for allowed origins
    const reqOrigin = request.headers.origin;
    if (reqOrigin && !response.headersSent && isAllowedCorsOrigin(reqOrigin)) {
      response.setHeader('Access-Control-Allow-Origin', reqOrigin);
      response.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: errorName,
      message,
      ...(details ? { details } : {}),
    });
  }
}
