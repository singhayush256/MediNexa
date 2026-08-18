import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<(string)[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new UnauthorizedException('Authentication required prior to authorization check.');
    }

    const userRoleCode = user.roleCode || (user.role && user.role.code);

    const hasRole = requiredRoles.some((role) => role === userRoleCode);

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Role '${userRoleCode}' does not possess permission to access this resource.`,
      );
    }

    return true;
  }
}
