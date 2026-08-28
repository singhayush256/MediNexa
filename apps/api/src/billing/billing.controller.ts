import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BillingService } from './billing.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { CreateInsuranceProviderDto } from './dto/create-provider.dto';
import { CreateClaimDto, ProcessClaimDto } from './dto/create-claim.dto';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // --- INVOICES ---
  @UseGuards(JwtAuthGuard)
  @Get('invoices')
  async getInvoices(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.billingService.getInvoices(req.user, facilityId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('invoices/:id')
  async getInvoiceById(@Param('id') id: string, @Req() req: any) {
    return this.billingService.getInvoiceById(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('invoices')
  async createInvoice(@Body() dto: CreateInvoiceDto, @Req() req: any) {
    return this.billingService.createInvoice(dto, req.user);
  }

  // --- PAYMENTS ---
  @UseGuards(JwtAuthGuard)
  @Get('payments')
  async getPayments(@Req() req: any) {
    return this.billingService.getPayments(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('payments')
  async recordPayment(@Body() dto: RecordPaymentDto, @Req() req: any) {
    return this.billingService.recordPayment(dto, req.user);
  }

  // --- INSURANCE PROVIDERS ---
  @UseGuards(JwtAuthGuard)
  @Get('providers')
  async getProviders() {
    return this.billingService.getProviders();
  }

  @UseGuards(JwtAuthGuard)
  @Post('providers')
  async createProvider(@Body() dto: CreateInsuranceProviderDto, @Req() req: any) {
    return this.billingService.createProvider(dto, req.user);
  }

  // --- INSURANCE CLAIMS ---
  @UseGuards(JwtAuthGuard)
  @Get('claims')
  async getClaims(@Req() req: any) {
    return this.billingService.getClaims(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('claims')
  async createClaim(@Body() dto: CreateClaimDto, @Req() req: any) {
    return this.billingService.createClaim(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('claims/:id/submit')
  async submitClaim(@Param('id') id: string, @Req() req: any) {
    return this.billingService.submitClaim(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('claims/:id/approve')
  async approveClaim(
    @Param('id') id: string,
    @Body() dto: ProcessClaimDto,
    @Req() req: any,
  ) {
    return this.billingService.approveClaim(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('claims/:id/reject')
  async rejectClaim(
    @Param('id') id: string,
    @Body() dto: ProcessClaimDto,
    @Req() req: any,
  ) {
    return this.billingService.rejectClaim(id, dto, req.user);
  }

  // --- ANALYTICS ---
  @UseGuards(JwtAuthGuard)
  @Get('analytics')
  async getAnalytics(@Req() req: any) {
    return this.billingService.getAnalytics(req.user);
  }
}
