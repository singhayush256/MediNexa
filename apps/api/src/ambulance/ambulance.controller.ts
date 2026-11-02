import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AmbulanceService } from './ambulance.service';
import { CreateAmbulanceDto } from './dto/create-ambulance.dto';
import { CreateDriverDto } from './dto/create-driver.dto';
import { DispatchAmbulanceDto } from './dto/dispatch-ambulance.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleCode, AmbulanceStatus } from '@medinexa/types';

@Controller()
export class AmbulanceController {
  constructor(private readonly ambulanceService: AmbulanceService) {}

  // =========================================================================
  // AMBULANCE FLEET ENDPOINTS
  // =========================================================================

  @UseGuards(JwtAuthGuard)
  @Get('ambulances')
  async getAmbulances(@Query('facilityId') facilityId?: string) {
    return this.ambulanceService.getAmbulances(facilityId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('ambulances')
  async createAmbulance(@Body() dto: CreateAmbulanceDto, @Request() req: any) {
    return this.ambulanceService.createAmbulance(dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Patch('ambulances/:id')
  async updateAmbulance(
    @Param('id') id: string,
    @Body() dto: Partial<CreateAmbulanceDto & { status: AmbulanceStatus }>,
    @Request() req: any,
  ) {
    return this.ambulanceService.updateAmbulance(id, dto, req.user);
  }

  // =========================================================================
  // AMBULANCE DRIVER PROFILE ENDPOINTS
  // =========================================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, RoleCode.RECEPTIONIST)
  @Get('ambulance-drivers')
  async getDrivers(@Query('facilityId') facilityId?: string) {
    return this.ambulanceService.getDrivers(facilityId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('ambulance-drivers')
  async createDriverProfile(@Body() dto: CreateDriverDto, @Request() req: any) {
    return this.ambulanceService.createDriverProfile(dto, req.user);
  }

  // =========================================================================
  // DISPATCH ENGINE ENDPOINTS
  // =========================================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.NURSE, RoleCode.RECEPTIONIST, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('emergencies/:id/dispatch')
  async dispatchAmbulance(
    @Param('id') emergencyRequestId: string,
    @Body() dto: Omit<DispatchAmbulanceDto, 'emergencyRequestId'>,
    @Request() req: any,
  ) {
    return this.ambulanceService.dispatchAmbulance(
      { ...dto, emergencyRequestId },
      req.user,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.AMBULANCE_DRIVER, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('dispatches/:id/accept')
  async acceptDispatch(@Param('id') id: string, @Request() req: any) {
    return this.ambulanceService.acceptDispatch(id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.AMBULANCE_DRIVER, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('dispatches/:id/start')
  async startDispatch(@Param('id') id: string, @Request() req: any) {
    return this.ambulanceService.startDispatch(id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.AMBULANCE_DRIVER, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('dispatches/:id/arrive')
  async arriveAtPickup(@Param('id') id: string, @Request() req: any) {
    return this.ambulanceService.arriveAtPickup(id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.AMBULANCE_DRIVER, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('dispatches/:id/patient-onboard')
  async patientOnboard(@Param('id') id: string, @Request() req: any) {
    return this.ambulanceService.patientOnboard(id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.AMBULANCE_DRIVER, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('dispatches/:id/complete')
  async completeDispatch(@Param('id') id: string, @Request() req: any) {
    return this.ambulanceService.completeDispatch(id, req.user);
  }

  // =========================================================================
  // GPS LOCATION TELEMETRY ENDPOINTS
  // =========================================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.AMBULANCE_DRIVER, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('ambulances/:id/location')
  async updateAmbulanceLocation(
    @Param('id') id: string,
    @Body() dto: UpdateLocationDto,
    @Request() req: any,
  ) {
    return this.ambulanceService.updateAmbulanceLocation(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('ambulances/:id/location')
  async getAmbulanceLocation(@Param('id') id: string) {
    return this.ambulanceService.getAmbulanceLocation(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('ambulances/:id/location-history')
  async getAmbulanceLocationHistory(@Param('id') id: string) {
    return this.ambulanceService.getAmbulanceLocationHistory(id);
  }
}
