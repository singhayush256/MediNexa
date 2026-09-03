import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleCode } from '@medinexa/types';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, 'ADMIN', 'SUPER_ADMIN')
  async getAuditLogs(
    @Request() req: any,
    @Query('patientId') patientId?: string,
    @Query('action') action?: string,
    @Query('role') role?: string,
    @Query('module') module?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.getAuditLogs(req.user, {
      patientId,
      action,
      role,
      module,
      search,
      limit: limit ? parseInt(limit, 10) : 100,
    });
  }
}
