import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BedService } from './bed.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleCode } from '@medinexa/types';

@Controller('bed-availability')
export class BedAvailabilityController {
  constructor(private readonly bedService: BedService) {}

  /**
   * Live Bed Availability status (Dashboard widget & live view)
   * Real-time metrics refreshed every 30 seconds
   * Supports facilityId and hospital name search filter
   */
  @Get('live')
  async getLiveBedAvailability(
    @Query('facilityId') facilityId?: string,
    @Query('search') search?: string,
  ) {
    return this.bedService.getLiveBedAvailability(facilityId, search);
  }

  /**
   * Nearby Hospital Bed Search with Geolocation & Radius filter (5km, 10km, 25km)
   */
  @Get('nearby')
  async getNearbyHospitals(
    @Query('latitude') latitude?: string,
    @Query('longitude') longitude?: string,
    @Query('radius') radius?: string,
    @Query('bedType') bedType?: string,
  ) {
    const lat = latitude ? parseFloat(latitude) : undefined;
    const lng = longitude ? parseFloat(longitude) : undefined;
    const rad = radius ? parseFloat(radius) : 25;
    return this.bedService.getNearbyHospitals(lat, lng, rad, bedType);
  }

  /**
   * Get specific facility bed status
   */
  @Get(':facilityId')
  async getFacilityBedStatus(@Param('facilityId') facilityId: string) {
    return this.bedService.getLiveBedAvailability(facilityId);
  }

  /**
   * Update facility bed count (Staff / Admin only: Nurse, Receptionist, Doctor, Admin)
   * Note: Patients cannot invoke this mutation endpoint.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, RoleCode.RECEPTIONIST, RoleCode.NURSE, RoleCode.DOCTOR)
  @Patch(':facilityId')
  async updateFacilityBedStatus(
    @Param('facilityId') facilityId: string,
    @Body() body: any,
  ) {
    return this.bedService.updateBedStatus(facilityId, body);
  }
}
