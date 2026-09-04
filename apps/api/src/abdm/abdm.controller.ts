import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AbdmService } from './abdm.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LinkAbhaDto } from './dto/link-abha.dto';
import { RequestConsentDto } from './dto/request-consent.dto';
import { ApproveConsentDto } from './dto/approve-consent.dto';
import { RejectConsentDto } from './dto/reject-consent.dto';
import { RevokeConsentDto } from './dto/revoke-consent.dto';
import { ShareRecordsDto } from './dto/share-records.dto';
import { AbdmConsentStatus } from '@prisma/client';

@Controller('abdm')
@UseGuards(JwtAuthGuard)
export class AbdmController {
  constructor(private readonly abdmService: AbdmService) {}

  // 1. LINK ABHA NUMBER TO PATIENT
  @Post('abha/link')
  async linkAbha(@Body() dto: LinkAbhaDto, @Req() req: any) {
    return this.abdmService.linkAbha(dto, req.user);
  }

  // 2. FETCH ABHA PROFILE
  @Get('abha/:patientId')
  async getAbhaProfile(@Param('patientId') patientId: string, @Req() req: any) {
    return this.abdmService.getAbhaProfile(patientId, req.user);
  }

  // 3. GENERATE ABDM CONSENT REQUEST
  @Post('consent/request')
  async requestConsent(@Body() dto: RequestConsentDto, @Req() req: any) {
    return this.abdmService.requestConsent(dto, req.user);
  }

  // 4. APPROVE / GRANT CONSENT
  @Post('consent/approve')
  async approveConsent(@Body() dto: ApproveConsentDto, @Req() req: any) {
    return this.abdmService.approveConsent(dto, req.user);
  }

  // 5. REJECT / DENY CONSENT
  @Post('consent/reject')
  async rejectConsent(@Body() dto: RejectConsentDto, @Req() req: any) {
    return this.abdmService.rejectConsent(dto, req.user);
  }

  // 6. REVOKE CONSENT
  @Post('consent/revoke')
  async revokeConsent(@Body() dto: RevokeConsentDto, @Req() req: any) {
    return this.abdmService.revokeConsent(dto, req.user);
  }

  // 7. LIST PATIENT CONSENTS
  @Get('consents')
  async getConsents(
    @Query('patientId') patientId: string,
    @Query('status') status: AbdmConsentStatus,
    @Query('facilityId') facilityId: string,
    @Req() req: any,
  ) {
    return this.abdmService.getConsents(req.user, patientId, status, facilityId);
  }

  // 8. SHARE HEALTH RECORDS USING CONSENT
  @Post('share-records')
  async shareRecords(@Body() dto: ShareRecordsDto, @Req() req: any) {
    return this.abdmService.shareRecords(dto, req.user);
  }

  // 9. RETRIEVE RECORD SHARING HISTORY
  @Get('shared-records')
  async getSharedRecords(
    @Query('patientId') patientId: string,
    @Query('facilityId') facilityId: string,
    @Req() req: any,
  ) {
    return this.abdmService.getSharedRecords(req.user, patientId, facilityId);
  }

  // 10. ABDM AUDIT LOGS
  @Get('audit-logs')
  async getAuditLogs(
    @Query('patientId') patientId: string,
    @Query('facilityId') facilityId: string,
    @Req() req: any,
  ) {
    return this.abdmService.getAuditLogs(req.user, facilityId, patientId);
  }

  // 11. ABDM ANALYTICS
  @Get('analytics')
  async getAnalytics(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.abdmService.getAnalytics(req.user, facilityId);
  }
}
