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
import { PharmacyService } from './pharmacy.service';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { DispensePrescriptionDto } from './dto/dispense-prescription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleCode, PrescriptionStatus } from '@medinexa/types';

@Controller()
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  // =========================================================================
  // MEDICATION CATALOG ENDPOINTS
  // =========================================================================

  @Get('medications')
  async getMedications() {
    return this.pharmacyService.getMedications();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.PHARMACY_STAFF, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('medications')
  async createMedication(@Body() dto: CreateMedicationDto) {
    return this.pharmacyService.createMedication(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.PHARMACY_STAFF, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Patch('medications/:id')
  async updateMedication(@Param('id') id: string, @Body() dto: Partial<CreateMedicationDto>) {
    return this.pharmacyService.updateMedication(id, dto);
  }

  // =========================================================================
  // PRESCRIPTION ENDPOINTS
  // =========================================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('prescriptions')
  async createPrescription(@Body() dto: CreatePrescriptionDto, @Request() req: any) {
    return this.pharmacyService.createPrescription(dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('prescriptions/:id/issue')
  async issuePrescription(@Param('id') id: string, @Request() req: any) {
    return this.pharmacyService.issuePrescription(id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('prescriptions/:id/cancel')
  async cancelPrescription(@Param('id') id: string, @Request() req: any) {
    return this.pharmacyService.cancelPrescription(id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.NURSE, RoleCode.PHARMACY_STAFF, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Get('prescriptions')
  async getPrescriptions(
    @Query('facilityId') facilityId?: string,
    @Query('patientId') patientId?: string,
    @Query('status') status?: PrescriptionStatus,
  ) {
    return this.pharmacyService.getPrescriptions({ facilityId, patientId, status });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.NURSE, RoleCode.PHARMACY_STAFF, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Get('prescriptions/:id')
  async getPrescriptionById(@Param('id') id: string) {
    return this.pharmacyService.getPrescriptionById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.NURSE, RoleCode.PHARMACY_STAFF, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Get('encounters/:id/prescriptions')
  async getEncounterPrescriptions(@Param('id') encounterId: string) {
    return this.pharmacyService.getEncounterPrescriptions(encounterId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('patients/me/prescriptions')
  async getMyPrescriptions(@Request() req: any) {
    if (!req.user.patientProfile) {
      throw new ForbiddenException('User does not have an active patient profile');
    }
    return this.pharmacyService.getPatientPrescriptions(req.user.patientProfile.id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.NURSE, RoleCode.PHARMACY_STAFF, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, RoleCode.PATIENT)
  @Get('patients/:patientId/prescriptions')
  async getPatientPrescriptions(@Param('patientId') patientId: string, @Request() req: any) {
    return this.pharmacyService.getPatientPrescriptions(patientId, req.user);
  }

  // =========================================================================
  // PHARMACY DISPENSING ENDPOINTS
  // =========================================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.PHARMACY_STAFF, RoleCode.DOCTOR, RoleCode.NURSE, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('pharmacy/prescriptions/:id/dispense')
  async dispensePrescription(
    @Param('id') prescriptionId: string,
    @Body() dto: DispensePrescriptionDto,
    @Request() req: any,
  ) {
    return this.pharmacyService.dispensePrescription(prescriptionId, dto, req.user);
  }
}
