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
        status = HttpStatus.CONFLICT;
        const target = (exception.meta?.target as string[]) || [];
        const fieldName = target.join(', ') || 'field';
        message = `A record with this ${fieldName} already exists.`;
        errorName = 'Conflict';
      } else if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = 'Requested record could not be found.';
        errorName = 'NotFound';
      } else {
        status = HttpStatus.BAD_REQUEST;
        message = `Database query error: ${exception.message.split('\n').pop() || exception.code}`;
        errorName = 'DatabaseError';
      }
    } else if (exception instanceof Prisma.PrismaClientInitializationError) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'Database service is currently unreachable. Please ensure PostgreSQL is running.';
      errorName = 'DatabaseConnectionError';
    } else if (exception instanceof Error) {
      message = exception.message;
      errorName = exception.name;
    }

    // Sanitize request body to remove sensitive fields from logs
    const sanitizedBody = { ...request.body };
    if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
    if (sanitizedBody.confirmPassword) sanitizedBody.confirmPassword = '[REDACTED]';
    if (sanitizedBody.code) sanitizedBody.code = '[REDACTED]';

    const logMessage = `[${request.method}] ${request.url} - Status: ${status} | Error: ${errorName} | Message: ${
      Array.isArray(message) ? message.join(', ') : message
    }`;

    if (status >= 500) {
      this.logger.error(
        `${logMessage}\nPayload: ${JSON.stringify(sanitizedBody)}\nStack: ${
          exception instanceof Error ? exception.stack : 'N/A'
        }`,
      );
    } else {
      this.logger.warn(`${logMessage} | Body: ${JSON.stringify(sanitizedBody)}`);
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
