import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RevenueCycleService } from './revenue-cycle.service';
import { CreateInsuranceProviderDto } from './dto/create-provider.dto';
import { CreatePatientPolicyDto } from './dto/create-policy.dto';
import { CreateInsuranceClaimDto } from './dto/create-claim.dto';
import { ApproveClaimDto } from './dto/approve-claim.dto';
import { RejectClaimDto } from './dto/reject-claim.dto';
import { ClaimPaymentDto } from './dto/claim-payment.dto';

@UseGuards(JwtAuthGuard)
@Controller('claims')
export class RevenueCycleController {
  constructor(private readonly revenueCycleService: RevenueCycleService) {}

  // 1. Insurance Providers
  @Post('providers')
  async createProvider(@Body() dto: CreateInsuranceProviderDto, @Req() req: any) {
    return this.revenueCycleService.createProvider(dto, req.user);
  }

  @Get('providers')
  async getProviders() {
    return this.revenueCycleService.getProviders();
  }

  // 2. Patient Insurance Policies
  @Post('policies')
  async createPolicy(@Body() dto: CreatePatientPolicyDto, @Req() req: any) {
    return this.revenueCycleService.createPolicy(dto, req.user);
  }

  @Get('policies/:patientId')
  async getPatientPolicies(@Param('patientId') patientId: string, @Req() req: any) {
    return this.revenueCycleService.getPatientPolicies(patientId, req.user);
  }

  // 3. Claims Analytics (Placed before :id route)
  @Get('analytics')
  async getAnalytics(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.revenueCycleService.getAnalytics(facilityId, req.user);
  }

  // 4. Claims Lifecycle
  @Post('create')
  async createClaim(@Body() dto: CreateInsuranceClaimDto, @Req() req: any) {
    return this.revenueCycleService.createClaim(dto, req.user);
  }

  @Get()
  async getClaims(@Query() query: any, @Req() req: any) {
    return this.revenueCycleService.getClaims(query, req.user);
  }

  @Get(':id')
  async getClaimById(@Param('id') id: string, @Req() req: any) {
    return this.revenueCycleService.getClaimById(id, req.user);
  }

  @Patch(':id/submit')
  async submitClaim(@Param('id') id: string, @Req() req: any) {
    return this.revenueCycleService.submitClaim(id, req.user);
  }

  @Patch(':id/approve')
  async approveClaim(@Param('id') id: string, @Body() dto: ApproveClaimDto, @Req() req: any) {
    return this.revenueCycleService.approveClaim(id, dto, req.user);
  }

  @Patch(':id/reject')
  async rejectClaim(@Param('id') id: string, @Body() dto: RejectClaimDto, @Req() req: any) {
    return this.revenueCycleService.rejectClaim(id, dto, req.user);
  }

  @Patch(':id/payment')
  async recordClaimPayment(@Param('id') id: string, @Body() dto: ClaimPaymentDto, @Req() req: any) {
    return this.revenueCycleService.recordClaimPayment(id, dto, req.user);
  }
}
