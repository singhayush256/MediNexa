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

@Controller('bed-availability')
export class BedAvailabilityController {
  constructor(private readonly bedService: BedService) {}

  /**
   * Live Bed Availability status (Dashboard widget & live view)
   * Real-time metrics refreshed every 30 seconds
   */
  @Get('live')
  async getLiveBedAvailability(@Query('facilityId') facilityId?: string) {
    return this.bedService.getLiveBedAvailability(facilityId);
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
   * Update facility bed count (Staff / Admin)
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':facilityId')
  async updateFacilityBedStatus(
    @Param('facilityId') facilityId: string,
    @Body() body: any,
  ) {
    return this.bedService.updateBedStatus(facilityId, body);
  }
}
