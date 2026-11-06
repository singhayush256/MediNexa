import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleCode } from '@medinexa/types';

@Controller()
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get('organizations')
  async getOrganizations() {
    return this.organizationService.getOrganizations();
  }

  @Get('facilities')
  async getFacilities() {
    return this.organizationService.getFacilities();
  }

  @Get('facilities/nearby')
  async getNearbyFacilities(
    @Query('latitude') latitude?: number,
    @Query('longitude') longitude?: number,
    @Query('radiusKm') radiusKm?: number,
    @Query('bedType') bedType?: string,
    @Query('minAvailableBeds') minAvailableBeds?: number,
    @Query('search') search?: string,
  ) {
    return this.organizationService.findNearbyHospitals({
      latitude,
      longitude,
      radiusKm,
      bedType,
      minAvailableBeds,
      search,
    });
  }

  @Get('facilities/:id/capacity')
  async getFacilityCapacity(@Param('id') id: string) {
    return this.organizationService.getFacilityCapacity(id);
  }

  @Get('facilities/:id')
  async getFacilityById(@Param('id') id: string) {
    return this.organizationService.getFacilityById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.MEDINEXA_ADMIN, 'SUPER_ADMIN')
  @Post('facilities')
  async createFacility(@Body() dto: CreateFacilityDto, @Req() req: any) {
    return this.organizationService.createFacility(dto, req.user);
  }

  @Get('facilities/:id/departments')
  async getDepartmentsByFacility(@Param('id') id: string) {
    return this.organizationService.getDepartmentsByFacility(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('departments')
  async createDepartment(@Body() dto: CreateDepartmentDto) {
    return this.organizationService.createDepartment(dto);
  }

  // --- HOSPITAL ONBOARDING WORKFLOW ---
  @Post('organization/onboarding/apply')
  async submitOnboardingApplication(@Body() dto: any) {
    return this.organizationService.submitOnboardingApplication(dto);
  }

  @Get('organization/onboarding/status/:id')
  async getOnboardingStatus(@Param('id') id: string) {
    return this.organizationService.getOnboardingStatus(id);
  }

  // --- STAFF INVITATIONS ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, 'ADMIN', 'SUPER_ADMIN')
  @Post('organization/invitations')
  async createStaffInvitation(@Body() dto: any, @Req() req: any) {
    return this.organizationService.createStaffInvitation(dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, 'ADMIN', 'SUPER_ADMIN')
  @Get('organization/invitations')
  async getStaffInvitations(@Query('facilityId') facilityId: string) {
    return this.organizationService.getStaffInvitations(facilityId);
  }

  @Post('organization/invitations/accept')
  async acceptStaffInvitation(@Body() dto: any) {
    return this.organizationService.acceptStaffInvitation(dto);
  }

  // --- HOSPITAL WORKSPACE SETTINGS ---
  @UseGuards(JwtAuthGuard)
  @Get('organization/settings')
  async getHospitalSettings(@Query('facilityId') facilityId: string, @Req() req: any) {
    const targetFacility = facilityId || req.user.facilityId;
    return this.organizationService.getHospitalSettings(targetFacility);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, 'ADMIN', 'SUPER_ADMIN')
  @Patch('organization/settings')
  async updateHospitalSettings(@Body() dto: any, @Req() req: any) {
    const targetFacility = dto.facilityId || req.user.facilityId;
    return this.organizationService.updateHospitalSettings(targetFacility, dto);
  }

  // --- PILOT READINESS CHECKLIST ---
  @UseGuards(JwtAuthGuard)
  @Get('organization/pilot-readiness/:facilityId')
  async getPilotReadinessChecklist(@Param('facilityId') facilityId: string) {
    return this.organizationService.getPilotReadinessChecklist(facilityId);
  }
}
