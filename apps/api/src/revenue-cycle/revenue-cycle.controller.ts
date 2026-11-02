import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RevenueCycleService } from './revenue-cycle.service';
import { CreateReceivableDto } from './dto/create-receivable.dto';
import { UpdateReceivableDto } from './dto/update-receivable.dto';
import { CreateContractDto } from './dto/create-contract.dto';
import { CreateCorporateInvoiceDto } from './dto/create-invoice.dto';
import { CreateCollectionActivityDto } from './dto/collection-activity.dto';
import { CreateForecastDto } from './dto/forecast.dto';
import { AllocatePaymentDto } from './dto/allocate-payment.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { ReceivableType, CollectionStatus } from '@prisma/client';
import { RoleCode } from '@medinexa/types';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, 'ADMIN', 'SUPER_ADMIN', 'BILLING_STAFF')
@Controller('revenue')
export class RevenueCycleController {
  constructor(private readonly revenueCycleService: RevenueCycleService) {}

  // ====================================================
  // 1. DASHBOARD
  // ====================================================
  @Get('dashboard')
  async getDashboard(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.revenueCycleService.getDashboard(req.user, facilityId);
  }

  // ====================================================
  // 2. RECEIVABLES
  // ====================================================
  @Post('receivables')
  async createReceivable(@Body() dto: CreateReceivableDto, @Req() req: any) {
    return this.revenueCycleService.createReceivable(dto, req.user);
  }

  @Get('receivables')
  async getReceivables(
    @Query('facilityId') facilityId: string,
    @Query('type') type: ReceivableType,
    @Query('status') status: CollectionStatus,
    @Req() req: any,
  ) {
    return this.revenueCycleService.getReceivables(req.user, facilityId, type, status);
  }

  @Get('receivables/:id')
  async getReceivableById(@Param('id') id: string, @Req() req: any) {
    return this.revenueCycleService.getReceivableById(id, req.user);
  }

  @Patch('receivables/:id')
  async updateReceivable(
    @Param('id') id: string,
    @Body() dto: UpdateReceivableDto,
    @Req() req: any,
  ) {
    return this.revenueCycleService.updateReceivable(id, dto, req.user);
  }

  // ====================================================
  // 3. COLLECTION ACTIVITIES
  // ====================================================
  @Post('collections')
  async createCollectionActivity(@Body() dto: CreateCollectionActivityDto, @Req() req: any) {
    return this.revenueCycleService.createCollectionActivity(dto, req.user);
  }

  @Get('collections')
  async getCollectionActivities(@Query('receivableId') receivableId: string, @Req() req: any) {
    return this.revenueCycleService.getCollectionActivities(req.user, receivableId);
  }

  // ====================================================
  // 4. CORPORATE CONTRACTS
  // ====================================================
  @Post('contracts')
  async createContract(@Body() dto: CreateContractDto, @Req() req: any) {
    return this.revenueCycleService.createContract(dto, req.user);
  }

  @Get('contracts')
  async getContracts(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.revenueCycleService.getContracts(req.user, facilityId);
  }

  @Patch('contracts/:id')
  async updateContract(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.revenueCycleService.updateContract(id, dto, req.user);
  }

  // ====================================================
  // 5. CORPORATE INVOICES
  // ====================================================
  @Post('invoices')
  async createCorporateInvoice(@Body() dto: CreateCorporateInvoiceDto, @Req() req: any) {
    return this.revenueCycleService.createCorporateInvoice(dto, req.user);
  }

  @Get('invoices')
  async getCorporateInvoices(@Query('contractId') contractId: string, @Req() req: any) {
    return this.revenueCycleService.getCorporateInvoices(req.user, contractId);
  }

  @Patch('invoices/:id/pay')
  async payCorporateInvoice(
    @Param('id') id: string,
    @Body() dto: RecordPaymentDto,
    @Req() req: any,
  ) {
    return this.revenueCycleService.payCorporateInvoice(id, dto, req.user);
  }

  // ====================================================
  // 6. PAYMENT ALLOCATION
  // ====================================================
  @Post('payments/allocate')
  async allocatePayment(@Body() dto: AllocatePaymentDto, @Req() req: any) {
    return this.revenueCycleService.allocatePayment(dto, req.user);
  }

  // ====================================================
  // 7. REVENUE FORECAST
  // ====================================================
  @Post('forecast')
  async createForecast(@Body() dto: CreateForecastDto, @Req() req: any) {
    return this.revenueCycleService.createForecast(dto, req.user);
  }

  @Get('forecast')
  async getForecasts(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.revenueCycleService.getForecasts(req.user, facilityId);
  }
}
