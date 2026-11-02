import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  Optional,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { normalizeRoleCode, isRoleAuthorized } from '@medinexa/validation';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Optional() private prisma?: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const { user } = req;

    if (!user) {
      throw new UnauthorizedException('Authentication required prior to authorization check.');
    }

    const userRoleCode = user.roleCode || (user.role && user.role.code) || user.role;

    if (!userRoleCode) {
      throw new ForbiddenException('Access denied. No active role associated with user.');
    }

    const normalizedUserRole = normalizeRoleCode(userRoleCode);

    // SUPER_ADMIN and MEDINEXA_ADMIN hold global administrative privileges
    if (normalizedUserRole === 'MEDINEXA_ADMIN') {
      return true;
    }

    // Check authorization using role normalization and aliases
    const hasRole = isRoleAuthorized(userRoleCode, requiredRoles);

    if (!hasRole) {
      const clientIp =
        req.ip ||
        (req.headers && (req.headers['x-forwarded-for'] as string)) ||
        '127.0.0.1';
      const resourceUrl = req.originalUrl || req.url || 'API_ENDPOINT';

      // Asynchronously log denied attempt to audit events
      if (this.prisma) {
        this.prisma.auditEvent
          .create({
            data: {
              userId: user.id || null,
              role: userRoleCode,
              facilityId: user.facilityId || null,
              action: 'ACCESS_DENIED',
              resource: resourceUrl,
              details: JSON.stringify({
                requiredRoles,
                userRole: userRoleCode,
                normalizedUserRole,
                method: req.method,
              }),
              ipAddress: clientIp,
            },
          })
          .catch(() => {});
      }

      throw new ForbiddenException(
        `Access denied. Role '${userRoleCode}' does not possess permission to access this resource. Required roles: [${requiredRoles.join(
          ', ',
        )}].`,
      );
    }

    return true;
  }
}
