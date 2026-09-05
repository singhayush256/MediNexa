import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
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
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('facilities')
  async createFacility(@Body() dto: CreateFacilityDto) {
    return this.organizationService.createFacility(dto);
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
}
