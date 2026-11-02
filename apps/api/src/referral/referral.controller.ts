import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReferralService } from './referral.service';
import { CreateReferralDto } from './dto/create-referral.dto';
import { AuthorizeRecordAccessDto } from './dto/authorize-record.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleCode, ReferralStatus } from '@medinexa/types';

@Controller()
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  // =========================================================================
  // NETWORK CAPACITY ENDPOINTS
  // =========================================================================

  @UseGuards(JwtAuthGuard)
  @Get('network/facilities/capacity')
  async getNetworkFacilityCapacity(
    @Query('facilityId') facilityId?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.referralService.getNetworkFacilityCapacity({ facilityId, departmentId });
  }

  @UseGuards(JwtAuthGuard)
  @Get('network/facilities/available-beds')
  async getNetworkAvailableBeds(
    @Query('facilityId') facilityId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('bedType') bedType?: string,
  ) {
    return this.referralService.getNetworkAvailableBeds({ facilityId, departmentId, bedType });
  }

  // =========================================================================
  // REFERRAL ENDPOINTS
  // =========================================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('referrals')
  async createReferral(@Body() dto: CreateReferralDto, @Request() req: any) {
    return this.referralService.createReferral(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('referrals')
  async getReferrals(
    @Query('facilityId') facilityId?: string,
    @Query('sourceFacilityId') sourceFacilityId?: string,
    @Query('destinationFacilityId') destinationFacilityId?: string,
    @Query('patientId') patientId?: string,
    @Query('status') status?: ReferralStatus,
  ) {
    return this.referralService.getReferrals({ facilityId, sourceFacilityId, destinationFacilityId, patientId, status });
  }

  @UseGuards(JwtAuthGuard)
  @Get('referrals/:id')
  async getReferralById(@Param('id') id: string) {
    return this.referralService.getReferralById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('referrals/:id/submit')
  async submitReferral(@Param('id') id: string, @Request() req: any) {
    return this.referralService.submitReferral(id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('referrals/:id/accept')
  async acceptReferral(
    @Param('id') id: string,
    @Body() body: { receivingDoctorId?: string; destinationBedId?: string },
    @Request() req: any,
  ) {
    return this.referralService.acceptReferral(id, body, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('referrals/:id/reject')
  async rejectReferral(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req: any,
  ) {
    return this.referralService.rejectReferral(id, reason, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('referrals/:id/cancel')
  async cancelReferral(@Param('id') id: string, @Request() req: any) {
    return this.referralService.cancelReferral(id, req.user);
  }

  // =========================================================================
  // CROSS-FACILITY PATIENT TRANSFER ENDPOINTS
  // =========================================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.NURSE, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('referrals/:id/start-transfer')
  async startTransfer(
    @Param('id') referralId: string,
    @Body() body: { ambulanceDispatchId?: string; sourceAdmissionId?: string; sourceBedId?: string; destinationBedId?: string },
    @Request() req: any,
  ) {
    return this.referralService.startTransfer(referralId, body, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.NURSE, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('referrals/:id/complete')
  async completeReferralTransfer(@Param('id') referralId: string, @Request() req: any) {
    const ref = await this.referralService.getReferralById(referralId);
    if (ref.crossFacilityTransfers && ref.crossFacilityTransfers.length > 0) {
      const activeXft = ref.crossFacilityTransfers[0];
      return this.referralService.completeTransfer(activeXft.id, req.user);
    }
    throw new Error('No active cross-facility transfer found for referral');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.NURSE, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('transfers/:id/complete')
  async completeTransfer(@Param('id') transferId: string, @Request() req: any) {
    return this.referralService.completeTransfer(transferId, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('patients/:patientId/referrals')
  async getPatientReferrals(@Param('patientId') patientId: string, @Request() req: any) {
    return this.referralService.getPatientReferrals(patientId, req.user);
  }

  // =========================================================================
  // MEDICAL RECORD TRANSFER AUTHORIZATION ENDPOINTS
  // =========================================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.NURSE, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('referrals/:id/record-access-request')
  async requestRecordAccess(@Param('id') referralId: string, @Request() req: any) {
    return this.referralService.requestRecordAccess(referralId, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('referrals/:id/record-access-authorize')
  async authorizeRecordAccess(
    @Param('id') referralId: string,
    @Body() dto: AuthorizeRecordAccessDto,
    @Request() req: any,
  ) {
    return this.referralService.authorizeRecordAccess(referralId, dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('referrals/:id/record-access-revoke')
  async revokeRecordAccess(@Param('id') authorizationId: string, @Request() req: any) {
    return this.referralService.revokeRecordAccess(authorizationId, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('referrals/:id/transferable-records')
  async getTransferableRecords(@Param('id') referralId: string, @Request() req: any) {
    return this.referralService.getTransferableRecords(referralId, req.user);
  }
}
