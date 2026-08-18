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
import { EmergencyService } from './emergency.service';
import { CreateEmergencyRequestDto } from './dto/create-emergency.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleCode, EmergencyStatus, EmergencySeverity } from '@medinexa/types';

@Controller()
export class EmergencyController {
  constructor(private readonly emergencyService: EmergencyService) {}

  @Post('emergencies')
  async createEmergency(@Body() dto: CreateEmergencyRequestDto, @Request() req: any) {
    return this.emergencyService.createEmergency(dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.NURSE, RoleCode.RECEPTIONIST, RoleCode.AMBULANCE_DRIVER, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Get('emergencies')
  async getEmergencies(
    @Query('facilityId') facilityId?: string,
    @Query('status') status?: EmergencyStatus,
  ) {
    return this.emergencyService.getEmergencies({ facilityId, status });
  }

  @UseGuards(JwtAuthGuard)
  @Get('emergencies/:id')
  async getEmergencyById(@Param('id') id: string) {
    return this.emergencyService.getEmergencyById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.NURSE, RoleCode.RECEPTIONIST, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('emergencies/:id/triage')
  async triageEmergency(
    @Param('id') id: string,
    @Body('severity') severity: EmergencySeverity,
    @Request() req: any,
  ) {
    return this.emergencyService.triageEmergency(id, severity, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.NURSE, RoleCode.RECEPTIONIST, RoleCode.AMBULANCE_DRIVER, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Patch('emergencies/:id/status')
  async updateEmergencyStatus(
    @Param('id') id: string,
    @Body('status') status: EmergencyStatus,
    @Request() req: any,
  ) {
    return this.emergencyService.updateEmergencyStatus(id, status, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.NURSE, RoleCode.RECEPTIONIST, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('emergencies/:id/cancel')
  async cancelEmergency(@Param('id') id: string, @Request() req: any) {
    return this.emergencyService.cancelEmergency(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('patients/:patientId/emergencies')
  async getPatientEmergencies(@Param('patientId') patientId: string, @Request() req: any) {
    return this.emergencyService.getPatientEmergencies(patientId, req.user);
  }
}
