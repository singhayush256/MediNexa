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
import { EhrService } from './ehr.service';
import { CreateEncounterDto } from './dto/create-encounter.dto';
import { CreateClinicalNoteDto } from './dto/create-clinical-note.dto';
import { AmendClinicalNoteDto } from './dto/amend-clinical-note.dto';
import { RecordVitalSignDto } from './dto/record-vital-sign.dto';
import { CreateDiagnosisDto, UpdateDiagnosisDto } from './dto/create-diagnosis.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleCode, EncounterStatus, EncounterType } from '@medinexa/types';

@Controller()
export class EhrController {
  constructor(private readonly ehrService: EhrService) {}

  // =========================================================================
  // ENCOUNTER ENDPOINTS
  // =========================================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.NURSE, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, RoleCode.RECEPTIONIST)
  @Post('encounters')
  async createEncounter(@Body() dto: CreateEncounterDto, @Request() req: any) {
    return this.ehrService.createEncounter(dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.NURSE, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, RoleCode.RECEPTIONIST)
  @Get('encounters')
  async getEncounters(
    @Query('facilityId') facilityId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('doctorId') doctorId?: string,
    @Query('patientId') patientId?: string,
    @Query('encounterType') encounterType?: EncounterType,
    @Query('status') status?: EncounterStatus,
    @Request() req?: any,
  ) {
    return this.ehrService.getEncounters(
      {
        facilityId,
        departmentId,
        doctorId,
        patientId,
        encounterType,
        status,
      },
      req?.user,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('patients/me/encounters')
  async getMyEncounters(@Request() req: any) {
    if (!req.user.patientProfile) {
      throw new ForbiddenException('User does not have an active patient profile');
    }
    return this.ehrService.getEncounters({ patientId: req.user.patientProfile.id });
  }

  @UseGuards(JwtAuthGuard)
  @Get('doctors/me/encounters')
  async getMyDoctorEncounters(@Request() req: any) {
    if (!req.user.doctorProfile) {
      throw new ForbiddenException('User does not have an active doctor profile');
    }
    return this.ehrService.getEncounters({ doctorId: req.user.doctorProfile.id });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.NURSE, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, RoleCode.PATIENT)
  @Get('encounters/:id')
  async getEncounterById(@Param('id') id: string, @Request() req: any) {
    const enc = await this.ehrService.getEncounterById(id);
    if (req.user.role === RoleCode.PATIENT && req.user.patientProfile?.id !== enc.patientId) {
      throw new ForbiddenException('Patients can only view their own encounter details');
    }
    return enc;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.NURSE, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Patch('encounters/:id/status')
  async updateEncounterStatus(
    @Param('id') id: string,
    @Body('status') status: EncounterStatus,
    @Request() req: any,
  ) {
    return this.ehrService.updateEncounterStatus(id, status, req.user);
  }

  // =========================================================================
  // CLINICAL NOTES ENDPOINTS
  // =========================================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.NURSE, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('encounters/:id/notes')
  async createClinicalNote(
    @Param('id') encounterId: string,
    @Body() dto: CreateClinicalNoteDto,
    @Request() req: any,
  ) {
    return this.ehrService.createClinicalNote(encounterId, dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.NURSE, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Patch('notes/:id')
  async updateDraftNote(
    @Param('id') id: string,
    @Body('content') content: string,
    @Request() req: any,
  ) {
    return this.ehrService.updateDraftNote(id, content, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.NURSE, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('notes/:id/sign')
  async signNote(@Param('id') id: string, @Request() req: any) {
    return this.ehrService.signNote(id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.NURSE, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('notes/:id/amend')
  async amendNote(
    @Param('id') id: string,
    @Body() dto: AmendClinicalNoteDto,
    @Request() req: any,
  ) {
    return this.ehrService.amendNote(id, dto, req.user);
  }

  // =========================================================================
  // VITAL SIGNS ENDPOINTS
  // =========================================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.NURSE, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('encounters/:id/vitals')
  async recordVitalSign(
    @Param('id') encounterId: string,
    @Body() dto: RecordVitalSignDto,
    @Request() req: any,
  ) {
    return this.ehrService.recordVitalSign(encounterId, dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.NURSE, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, RoleCode.PATIENT)
  @Get('patients/:patientId/vitals')
  async getPatientVitals(@Param('patientId') patientId: string, @Request() req: any) {
    if (req.user.role === RoleCode.PATIENT && req.user.patientProfile?.id !== patientId) {
      throw new ForbiddenException('Patients can only view their own vital signs history');
    }
    return this.ehrService.getPatientVitals(patientId);
  }

  // =========================================================================
  // DIAGNOSES ENDPOINTS
  // =========================================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('encounters/:id/diagnoses')
  async createDiagnosis(
    @Param('id') encounterId: string,
    @Body() dto: CreateDiagnosisDto,
    @Request() req: any,
  ) {
    return this.ehrService.createDiagnosis(encounterId, dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Patch('diagnoses/:id')
  async updateDiagnosis(
    @Param('id') id: string,
    @Body() dto: UpdateDiagnosisDto,
    @Request() req: any,
  ) {
    return this.ehrService.updateDiagnosis(id, dto, req.user);
  }

  // =========================================================================
  // PATIENT CLINICAL TIMELINE ENDPOINTS
  // =========================================================================

  @UseGuards(JwtAuthGuard)
  @Get('patients/me/clinical-timeline')
  async getMyClinicalTimeline(@Request() req: any) {
    if (!req.user.patientProfile) {
      throw new ForbiddenException('User does not have an active patient profile');
    }
    return this.ehrService.getPatientClinicalTimeline(req.user.patientProfile.id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.NURSE, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, RoleCode.PATIENT)
  @Get('patients/:patientId/clinical-timeline')
  async getPatientClinicalTimeline(@Param('patientId') patientId: string, @Request() req: any) {
    return this.ehrService.getPatientClinicalTimeline(patientId, req.user);
  }
}
