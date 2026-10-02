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
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { MatchPatientDto } from './dto/match-patient.dto';
import { CreateHospitalRegistrationDto } from './dto/hospital-registration.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleCode } from '@medinexa/types';

@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get('me')
  async getMyPatientProfile(@Request() req: any) {
    return this.patientService.getPatientByUserId(req.user.id);
  }

  @UseGuards(RolesGuard)
  @Roles(
    RoleCode.PATIENT,
    RoleCode.DOCTOR,
    RoleCode.NURSE,
    RoleCode.RECEPTIONIST,
    RoleCode.HOSPITAL_ADMIN,
    RoleCode.MEDINEXA_ADMIN,
    RoleCode.SUPER_ADMIN,
    RoleCode.MANAGER,
    RoleCode.WARD_MANAGER,
    RoleCode.LAB_STAFF,
    RoleCode.PHARMACY_STAFF,
    RoleCode.BILLING_STAFF,
  )
  @Get()
  async getPatients(@Request() req: any) {
    return this.patientService.getPatients(req.user);
  }

  @UseGuards(RolesGuard)
  @Roles(
    RoleCode.RECEPTIONIST,
    RoleCode.DOCTOR,
    RoleCode.NURSE,
    RoleCode.HOSPITAL_ADMIN,
    RoleCode.MEDINEXA_ADMIN,
    RoleCode.SUPER_ADMIN,
    RoleCode.MANAGER,
    RoleCode.WARD_MANAGER,
    RoleCode.LAB_STAFF,
    RoleCode.PHARMACY_STAFF,
    RoleCode.BILLING_STAFF,
  )
  @Post('match')
  async matchPatient(@Body() dto: MatchPatientDto, @Request() req: any) {
    return this.patientService.matchPatient(dto, req.user);
  }

  @UseGuards(RolesGuard)
  @Roles(
    RoleCode.RECEPTIONIST,
    RoleCode.HOSPITAL_ADMIN,
    RoleCode.MEDINEXA_ADMIN,
    RoleCode.SUPER_ADMIN,
    RoleCode.MANAGER,
    RoleCode.DOCTOR,
  )
  @Post('hospital-registration')
  async createHospitalRegistration(
    @Body() dto: CreateHospitalRegistrationDto,
    @Request() req: any,
  ) {
    return this.patientService.createHospitalRegistration(dto, req.user);
  }

  @UseGuards(RolesGuard)
  @Roles(
    RoleCode.RECEPTIONIST,
    RoleCode.DOCTOR,
    RoleCode.NURSE,
    RoleCode.HOSPITAL_ADMIN,
    RoleCode.MEDINEXA_ADMIN,
    RoleCode.SUPER_ADMIN,
    RoleCode.MANAGER,
    RoleCode.WARD_MANAGER,
    RoleCode.LAB_STAFF,
    RoleCode.PHARMACY_STAFF,
    RoleCode.BILLING_STAFF,
  )
  @Get('hospital-directory')
  async getHospitalPatientDirectory(
    @Query('facilityId') facilityId: string,
    @Query('search') search: string,
    @Request() req: any,
  ) {
    return this.patientService.getHospitalPatientDirectory(facilityId, search, req.user);
  }

  @Get(':id/hospital-registrations')
  async getPatientHospitalRegistrations(@Param('id') id: string, @Request() req: any) {
    return this.patientService.getPatientHospitalRegistrations(id, req.user);
  }

  @Get(':id')
  async getPatientById(@Param('id') id: string, @Request() req: any) {
    return this.patientService.getPatientById(id, req.user);
  }

  @Get(':id/360')
  async getPatient360(@Param('id') id: string, @Request() req: any) {
    return this.patientService.getPatient360(id, req.user);
  }

  @Post()
  async createPatientProfile(@Body() dto: CreatePatientDto, @Request() req: any) {
    return this.patientService.createPatientProfile(dto, req.user);
  }

  @Patch(':id')
  async updatePatientProfile(
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
    @Request() req: any,
  ) {
    return this.patientService.updatePatientProfile(id, dto, req.user);
  }
}
