import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { RecordRefundDto } from './dto/record-refund.dto';
import { CreateCostCenterDto } from './dto/create-cost-center.dto';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { PaymentStatus } from '@prisma/client';

@Controller('finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // 1. INVOICES
  @Post('invoices')
  async createInvoice(@Body() dto: CreateInvoiceDto, @Req() req: any) {
    return this.financeService.createInvoice(dto, req.user);
  }

  @Get('invoices')
  async getInvoices(
    @Query('facilityId') facilityId: string,
    @Query('patientId') patientId: string,
    @Query('paymentStatus') paymentStatus: PaymentStatus,
    @Req() req: any,
  ) {
    return this.financeService.getInvoices(req.user, facilityId, patientId, paymentStatus);
  }

  @Get('invoices/:id')
  async getInvoiceById(@Param('id') id: string, @Req() req: any) {
    return this.financeService.getInvoiceById(id, req.user);
  }

  // 2. PAYMENTS & REFUNDS
  @Post('payments')
  async recordPayment(@Body() dto: RecordPaymentDto, @Req() req: any) {
    return this.financeService.recordPayment(dto, req.user);
  }

  @Post('refunds')
  async recordRefund(@Body() dto: RecordRefundDto, @Req() req: any) {
    return this.financeService.recordRefund(dto, req.user);
  }

  // 3. COST CENTERS
  @Get('cost-centers')
  async getCostCenters(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.financeService.getCostCenters(req.user, facilityId);
  }

  @Post('cost-centers')
  async createCostCenter(@Body() dto: CreateCostCenterDto, @Req() req: any) {
    return this.financeService.createCostCenter(dto, req.user);
  }

  // 4. GENERAL LEDGER & JOURNAL ENTRIES
  @Get('gl')
  async getGeneralLedger(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.financeService.getGeneralLedger(req.user, facilityId);
  }

  @Post('journal-entry')
  async postJournalEntry(@Body() dto: CreateJournalEntryDto, @Req() req: any) {
    return this.financeService.postJournalEntry(dto, req.user);
  }

  // 5. FINANCIAL INTELLIGENCE REPORTS
  @Get('reports/revenue')
  async getRevenueReport(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.financeService.getRevenueReport(req.user, facilityId);
  }

  @Get('reports/collections')
  async getCollectionsReport(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.financeService.getCollectionsReport(req.user, facilityId);
  }

  @Get('reports/outstanding')
  async getOutstandingReport(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.financeService.getOutstandingReport(req.user, facilityId);
  }

  @Get('reports/profitability')
  async getProfitabilityReport(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.financeService.getProfitabilityReport(req.user, facilityId);
  }
}
