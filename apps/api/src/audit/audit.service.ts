import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface LogPhiAccessParams {
  userId?: string;
  role?: string;
  facilityId?: string;
  action: string;
  resource: string;
  details?: Record<string, any> | string;
  ipAddress?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async logPhiAccess(params: LogPhiAccessParams) {
    try {
      let detailsString: string | null = null;
      if (params.details) {
        if (typeof params.details === 'object') {
          const sanitized = { ...params.details };
          delete sanitized.password;
          delete sanitized.token;
          delete sanitized.accessToken;
          delete sanitized.authorization;
          delete sanitized.jwt;
          delete sanitized.secret;
          detailsString = JSON.stringify(sanitized);
        } else {
          detailsString = String(params.details);
        }
      }

      const audit = await this.prisma.auditEvent.create({
        data: {
          userId: params.userId || null,
          role: params.role || null,
          facilityId: params.facilityId || null,
          action: params.action,
          resource: params.resource,
          details: detailsString,
          ipAddress: params.ipAddress || null,
        },
      });

      return audit;
    } catch (err: any) {
      this.logger.error(`Failed to write PHI audit log: ${err.message}`, err.stack);
    }
  }

  async getAuditLogs(requestingUser: any, query?: { patientId?: string; action?: string }) {
    const roleCode = requestingUser.roleCode || (requestingUser.role && requestingUser.role.code);

    if (roleCode !== 'HOSPITAL_ADMIN' && roleCode !== 'MEDINEXA_ADMIN') {
      throw new ForbiddenException('Access denied. Only system administrators can query PHI audit logs.');
    }

    const where: any = {};
    if (roleCode === 'HOSPITAL_ADMIN' && requestingUser.facilityId) {
      where.facilityId = requestingUser.facilityId;
    }
    if (query?.action) {
      where.action = query.action;
    }
    if (query?.patientId) {
      where.resource = { contains: query.patientId };
    }

    return this.prisma.auditEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
