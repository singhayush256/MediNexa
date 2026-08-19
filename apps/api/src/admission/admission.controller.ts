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
  ForbiddenException,
} from '@nestjs/common';
import { AdmissionService } from './admission.service';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { DischargeAdmissionDto } from './dto/discharge-admission.dto';
import { TransferAdmissionDto } from './dto/transfer-admission.dto';
import { UpdateAdmissionStatusDto } from './dto/update-admission-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleCode, AdmissionStatus, AdmissionType } from '@medinexa/types';

@Controller('admissions')
export class AdmissionController {
  constructor(private readonly admissionService: AdmissionService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, RoleCode.RECEPTIONIST, RoleCode.NURSE)
  @Post()
  async createAdmission(@Body() dto: CreateAdmissionDto, @Request() req: any) {
    return this.admissionService.createAdmission(dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, RoleCode.RECEPTIONIST, RoleCode.NURSE, RoleCode.DOCTOR)
  @Get()
  async getAdmissions(
    @Query('facilityId') facilityId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: AdmissionStatus,
    @Query('admissionType') admissionType?: AdmissionType,
    @Query('patientId') patientId?: string,
  ) {
    return this.admissionService.getAdmissions({
      facilityId,
      departmentId,
      status,
      admissionType,
      patientId,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    RoleCode.HOSPITAL_ADMIN,
    RoleCode.MEDINEXA_ADMIN,
    RoleCode.RECEPTIONIST,
    RoleCode.NURSE,
    RoleCode.DOCTOR,
    RoleCode.PATIENT,
  )
  @Get(':id')
  async getAdmissionById(@Param('id') id: string, @Request() req: any) {
    const adm = await this.admissionService.getAdmissionById(id);
    if (req.user.role === RoleCode.PATIENT && req.user.patientProfile?.id !== adm.patientId) {
      throw new ForbiddenException('Patients can only view their own admission details');
    }
    return adm;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    RoleCode.HOSPITAL_ADMIN,
    RoleCode.MEDINEXA_ADMIN,
    RoleCode.RECEPTIONIST,
    RoleCode.NURSE,
    RoleCode.DOCTOR,
    RoleCode.PATIENT,
  )
  @Get(':id/current-bed')
  async getAdmissionCurrentBed(@Param('id') id: string, @Request() req: any) {
    const adm = await this.admissionService.getAdmissionById(id);
    if (req.user.role === RoleCode.PATIENT && req.user.patientProfile?.id !== adm.patientId) {
      throw new ForbiddenException('Patients can only view their own admission bed details');
    }
    return this.admissionService.getAdmissionCurrentBed(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    RoleCode.HOSPITAL_ADMIN,
    RoleCode.MEDINEXA_ADMIN,
    RoleCode.RECEPTIONIST,
    RoleCode.NURSE,
    RoleCode.DOCTOR,
    RoleCode.PATIENT,
  )
  @Get(':id/discharge-summary')
  async getDischargeSummary(@Param('id') id: string, @Request() req: any) {
    return this.admissionService.getDischargeSummary(id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, RoleCode.RECEPTIONIST, RoleCode.NURSE, RoleCode.DOCTOR)
  @Patch(':id/status')
  async updateAdmissionStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAdmissionStatusDto,
    @Request() req: any,
  ) {
    return this.admissionService.updateAdmissionStatus(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, RoleCode.RECEPTIONIST, RoleCode.NURSE, RoleCode.DOCTOR)
  @Post(':id/discharge')
  async dischargeAdmission(
    @Param('id') id: string,
    @Body() dto: DischargeAdmissionDto,
    @Request() req: any,
  ) {
    return this.admissionService.dischargeAdmission(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, RoleCode.RECEPTIONIST, RoleCode.NURSE, RoleCode.DOCTOR)
  @Post(':id/transfer')
  async transferAdmission(
    @Param('id') id: string,
    @Body() dto: TransferAdmissionDto,
    @Request() req: any,
  ) {
    return this.admissionService.transferAdmission(id, dto, req.user);
  }
}
