import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BillingService } from './billing.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { AddInvoiceItemDto } from './dto/add-item.dto';
import { AddPaymentDto } from './dto/add-payment.dto';
import { ProcessRefundDto } from './dto/refund.dto';
import { CreateInsuranceProviderDto } from './dto/create-provider.dto';
import { CreateClaimDto, ProcessClaimDto } from './dto/create-claim.dto';

import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleCode } from '@medinexa/types';

@Controller('billing')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, 'ADMIN', 'SUPER_ADMIN', 'BILLING_STAFF', 'INSURANCE_COORDINATOR')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // ====================================================
  // 1. INVOICES & CHARGES
  // ====================================================
  @Get('invoices')
  async getInvoices(
    @Query('facilityId') facilityId: string,
    @Query('patientId') patientId: string,
    @Req() req: any,
  ) {
    return this.billingService.getInvoices(req.user, facilityId, patientId);
  }

  @Get('invoices/:id')
  async getInvoiceById(@Param('id') id: string, @Req() req: any) {
    return this.billingService.getInvoiceById(id, req.user);
  }

  @Post('invoices')
  async createInvoice(@Body() dto: CreateInvoiceDto, @Req() req: any) {
    return this.billingService.createInvoice(dto, req.user);
  }

  @Post('invoices/:id/add-item')
  async addItemToInvoice(
    @Param('id') id: string,
    @Body() dto: AddInvoiceItemDto,
    @Req() req: any,
  ) {
    return this.billingService.addItemToInvoice(id, dto, req.user);
  }

  // ====================================================
  // 2. PAYMENTS & SPLIT BILLING
  // ====================================================
  @Get('payments')
  async getPayments(@Req() req: any) {
    return this.billingService.getPayments(req.user);
  }

  @Post('payments')
  async recordPayment(@Body() dto: AddPaymentDto, @Req() req: any) {
    return this.billingService.recordPayment(dto, req.user);
  }

  // ====================================================
  // 3. REFUNDS & REVERSALS
  // ====================================================
  @Post('refunds')
  async processRefund(@Body() dto: ProcessRefundDto, @Req() req: any) {
    return this.billingService.processRefund(dto, req.user);
  }

  // ====================================================
  // 4. REVENUE LEDGER
  // ====================================================
  @Get('revenue')
  async getRevenueLedger(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.billingService.getRevenueLedger(req.user, facilityId);
  }

  // ====================================================
  // 5. RCM ANALYTICS & AR AGING
  // ====================================================
  @Get('analytics')
  async getAnalytics(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.billingService.getAnalytics(req.user, facilityId);
  }

  // ====================================================
  // 6. LEGACY INSURANCE PROVIDERS & CLAIMS
  // ====================================================
  @Get('providers')
  async getProviders() {
    return this.billingService.getProviders();
  }

  @Post('providers')
  async createProvider(@Body() dto: CreateInsuranceProviderDto, @Req() req: any) {
    return this.billingService.createProvider(dto, req.user);
  }

  @Get('claims')
  async getClaims(@Req() req: any) {
    return this.billingService.getClaims(req.user);
  }

  @Post('claims')
  async createClaim(@Body() dto: CreateClaimDto, @Req() req: any) {
    return this.billingService.createClaim(dto, req.user);
  }

  @Patch('claims/:id/submit')
  async submitClaim(@Param('id') id: string, @Req() req: any) {
    return this.billingService.submitClaim(id, req.user);
  }

  @Patch('claims/:id/approve')
  async approveClaim(
    @Param('id') id: string,
    @Body() dto: ProcessClaimDto,
    @Req() req: any,
  ) {
    return this.billingService.approveClaim(id, dto, req.user);
  }

  @Patch('claims/:id/reject')
  async rejectClaim(
    @Param('id') id: string,
    @Body() dto: ProcessClaimDto,
    @Req() req: any,
  ) {
    return this.billingService.rejectClaim(id, dto, req.user);
  }
}
