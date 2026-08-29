import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { InsuranceService } from './insurance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProviderDto, UpdateProviderDto } from './dto/create-provider.dto';
import { CreatePolicyDto, UpdatePolicyDto } from './dto/create-policy.dto';
import { CreateClaimDto } from './dto/create-claim.dto';
import { SubmitClaimDto, ApproveClaimDto, RejectClaimDto, RaiseQueryDto, RespondQueryDto, SettleClaimDto } from './dto/claim-actions.dto';
import { ClaimStatus, PolicyStatus } from '@prisma/client';

@Controller('insurance')
@UseGuards(JwtAuthGuard)
export class InsuranceController {
  constructor(private readonly insuranceService: InsuranceService) {}

  // ====================================================
  // PROVIDERS & TPAs
  // ====================================================
  @Get('providers')
  async listProviders() {
    return this.insuranceService.listProviders();
  }

  @Post('providers')
  async createProvider(@Body() dto: CreateProviderDto, @Req() req: any) {
    return this.insuranceService.createProvider(dto, req.user);
  }

  @Patch('providers/:id')
  async updateProvider(@Param('id') id: string, @Body() dto: UpdateProviderDto, @Req() req: any) {
    return this.insuranceService.updateProvider(id, dto, req.user);
  }

  // ====================================================
  // POLICIES
  // ====================================================
  @Post('policies')
  async createPolicy(@Body() dto: CreatePolicyDto, @Req() req: any) {
    return this.insuranceService.createPolicy(dto, req.user);
  }

  @Get('policies')
  async listPolicies(
    @Query('patientId') patientId: string,
    @Query('status') status: PolicyStatus,
    @Req() req: any,
  ) {
    return this.insuranceService.listPolicies(req.user, patientId, status);
  }

  @Get('policies/:id')
  async getPolicy(@Param('id') id: string, @Req() req: any) {
    return this.insuranceService.getPolicy(id, req.user);
  }

  @Patch('policies/:id')
  async updatePolicy(@Param('id') id: string, @Body() dto: UpdatePolicyDto, @Req() req: any) {
    return this.insuranceService.updatePolicy(id, dto, req.user);
  }

  // ====================================================
  // CLAIMS LIFECYCLE
  // ====================================================
  @Post('claims')
  async createClaim(@Body() dto: CreateClaimDto, @Req() req: any) {
    return this.insuranceService.createClaim(dto, req.user);
  }

  @Get('claims')
  async listClaims(
    @Query('status') status: ClaimStatus,
    @Query('patientId') patientId: string,
    @Query('facilityId') facilityId: string,
    @Req() req: any,
  ) {
    return this.insuranceService.listClaims(req.user, status, patientId, facilityId);
  }

  @Get('claims/:id')
  async getClaim(@Param('id') id: string, @Req() req: any) {
    return this.insuranceService.getClaim(id, req.user);
  }

  @Post('claims/:id/preauth')
  async requestPreauth(@Param('id') id: string, @Req() req: any) {
    return this.insuranceService.requestPreauth(id, req.user);
  }

  @Post('claims/:id/submit')
  async submitClaim(@Param('id') id: string, @Body() dto: SubmitClaimDto, @Req() req: any) {
    return this.insuranceService.submitClaim(id, dto, req.user);
  }

  @Patch('claims/:id/approve')
  async approveClaim(@Param('id') id: string, @Body() dto: ApproveClaimDto, @Req() req: any) {
    return this.insuranceService.approveClaim(id, dto, req.user);
  }

  @Patch('claims/:id/reject')
  async rejectClaim(@Param('id') id: string, @Body() dto: RejectClaimDto, @Req() req: any) {
    return this.insuranceService.rejectClaim(id, dto, req.user);
  }

  @Patch('claims/:id/query')
  async raiseQuery(@Param('id') id: string, @Body() dto: RaiseQueryDto, @Req() req: any) {
    return this.insuranceService.raiseQuery(id, dto, req.user);
  }

  @Patch('claims/:id/respond')
  async respondQuery(@Param('id') id: string, @Body() dto: RespondQueryDto, @Req() req: any) {
    return this.insuranceService.respondQuery(id, dto, req.user);
  }

  @Patch('claims/:id/settle')
  async settleClaim(@Param('id') id: string, @Body() dto: SettleClaimDto, @Req() req: any) {
    return this.insuranceService.settleClaim(id, dto, req.user);
  }

  // ====================================================
  // ANALYTICS
  // ====================================================
  @Get('analytics')
  async getAnalytics(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.insuranceService.getAnalytics(req.user, facilityId);
  }
}
