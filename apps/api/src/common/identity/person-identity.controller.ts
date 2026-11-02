import {
  Controller,
  Get,
  Post,
  Param,
  Req,
  UseGuards,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PersonIdentityService } from './person-identity.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RoleCode } from '@medinexa/types';

@Controller('persons')
export class PersonIdentityController {
  constructor(private readonly personIdentityService: PersonIdentityService) {}

  /**
   * Authenticated lookup by permanent MediNexa Person ID (NAME-0000-AA).
   */
  @Get('by-id/:personId')
  @UseGuards(JwtAuthGuard)
  async lookupPersonById(@Param('personId') personId: string, @Req() req: any) {
    if (!personId || personId.trim().length === 0) {
      throw new BadRequestException('personId parameter is required');
    }
    return this.personIdentityService.lookupPerson(personId, req.user);
  }

  /**
   * Returns current authenticated user's MediNexa Person ID and identity profile.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyPersonIdentity(@Req() req: any) {
    const user = req.user;
    if (!user || !user.id) {
      throw new ForbiddenException('Authentication required');
    }
    const personId = await this.personIdentityService.assignPersonIdToUser(user.id);
    return this.personIdentityService.lookupPerson(personId, req.user);
  }

  /**
   * Triggers idempotent backfill migration (Admins only).
   */
  @Post('migrate')
  @UseGuards(JwtAuthGuard)
  async triggerMigration(@Req() req: any) {
    const role = req.user?.roleCode || req.user?.role?.code || req.user?.role;
    if (
      role !== RoleCode.HOSPITAL_ADMIN &&
      role !== RoleCode.MEDINEXA_ADMIN &&
      role !== RoleCode.SUPER_ADMIN &&
      role !== 'ADMIN'
    ) {
      throw new ForbiddenException('Only Administrators can trigger Person ID migration.');
    }
    return this.personIdentityService.migrateExistingUsers();
  }
}
