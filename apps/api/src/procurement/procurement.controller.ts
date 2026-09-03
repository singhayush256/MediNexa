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
import { ProcurementService } from './procurement.service';
import { CreateVendorDto, UpdateVendorDto } from './dto/create-vendor.dto';
import { CreatePurchaseRequisitionDto } from './dto/create-requisition.dto';
import { CreateRFQDto, SubmitQuotationResponseDto } from './dto/create-rfq.dto';
import { CreatePurchaseOrderDto } from './dto/create-po.dto';
import { CreateGoodsReceiptDto } from './dto/create-grn.dto';
import { CreateVendorInvoiceDto } from './dto/create-invoice.dto';
import { CreateVendorPaymentDto } from './dto/create-payment.dto';
import { VendorStatus, ProcurementStatus, RFQStatus } from '@prisma/client';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleCode } from '@medinexa/types';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, 'ADMIN', 'SUPER_ADMIN', RoleCode.PHARMACY_STAFF, 'PHARMACIST')
@Controller('procurement')
export class ProcurementController {
  constructor(private readonly procurementService: ProcurementService) {}

  // ====================================================
  // 1. VENDORS
  // ====================================================
  @Post('vendors')
  async createVendor(@Body() dto: CreateVendorDto, @Req() req: any) {
    return this.procurementService.createVendor(dto, req.user);
  }

  @Get('vendors')
  async getVendors(@Query('status') status: VendorStatus, @Req() req: any) {
    return this.procurementService.getVendors(req.user, status);
  }

  @Get('vendors/:id')
  async getVendorById(@Param('id') id: string, @Req() req: any) {
    return this.procurementService.getVendorById(id, req.user);
  }

  @Patch('vendors/:id')
  async updateVendor(
    @Param('id') id: string,
    @Body() dto: UpdateVendorDto,
    @Req() req: any,
  ) {
    return this.procurementService.updateVendor(id, dto, req.user);
  }

  // ====================================================
  // 2. REQUISITIONS
  // ====================================================
  @Post('requisitions')
  async createRequisition(@Body() dto: CreatePurchaseRequisitionDto, @Req() req: any) {
    return this.procurementService.createRequisition(dto, req.user);
  }

  @Get('requisitions')
  async getRequisitions(
    @Query('facilityId') facilityId: string,
    @Query('status') status: ProcurementStatus,
    @Req() req: any,
  ) {
    return this.procurementService.getRequisitions(req.user, facilityId, status);
  }

  @Get('requisitions/:id')
  async getRequisitionById(@Param('id') id: string, @Req() req: any) {
    return this.procurementService.getRequisitionById(id, req.user);
  }

  @Patch('requisitions/:id/approve')
  async approveRequisition(@Param('id') id: string, @Req() req: any) {
    return this.procurementService.approveRequisition(id, req.user);
  }

  @Patch('requisitions/:id/reject')
  async rejectRequisition(@Param('id') id: string, @Req() req: any) {
    return this.procurementService.rejectRequisition(id, req.user);
  }

  // ====================================================
  // 3. RFQ (REQUEST FOR QUOTATION)
  // ====================================================
  @Post('rfq')
  async createRFQ(@Body() dto: CreateRFQDto, @Req() req: any) {
    return this.procurementService.createRFQ(dto, req.user);
  }

  @Get('rfq')
  async getRFQs(@Query('status') status: RFQStatus, @Req() req: any) {
    return this.procurementService.getRFQs(req.user, status);
  }

  @Get('rfq/:id')
  async getRFQById(@Param('id') id: string, @Req() req: any) {
    return this.procurementService.getRFQById(id, req.user);
  }

  @Post('rfq/:id/response')
  async submitQuotationResponse(
    @Param('id') id: string,
    @Body() dto: SubmitQuotationResponseDto,
    @Req() req: any,
  ) {
    return this.procurementService.submitQuotationResponse(id, dto, req.user);
  }

  @Patch('rfq/:id/award')
  async awardRFQ(
    @Param('id') id: string,
    @Body('vendorId') vendorId: string,
    @Req() req: any,
  ) {
    return this.procurementService.awardRFQ(id, req.user, vendorId);
  }

  // ====================================================
  // 4. PURCHASE ORDERS
  // ====================================================
  @Post('purchase-orders')
  async createPurchaseOrder(@Body() dto: CreatePurchaseOrderDto, @Req() req: any) {
    return this.procurementService.createPurchaseOrder(dto, req.user);
  }

  @Get('purchase-orders')
  async getPurchaseOrders(
    @Query('facilityId') facilityId: string,
    @Query('status') status: ProcurementStatus,
    @Req() req: any,
  ) {
    return this.procurementService.getPurchaseOrders(req.user, facilityId, status);
  }

  @Get('purchase-orders/:id')
  async getPurchaseOrderById(@Param('id') id: string, @Req() req: any) {
    return this.procurementService.getPurchaseOrderById(id, req.user);
  }

  // ====================================================
  // 5. GOODS RECEIPT NOTES (GRN)
  // ====================================================
  @Post('grn')
  async createGoodsReceipt(@Body() dto: CreateGoodsReceiptDto, @Req() req: any) {
    return this.procurementService.createGoodsReceipt(dto, req.user);
  }

  @Get('grn')
  async getGoodsReceipts(@Query('purchaseOrderId') purchaseOrderId: string, @Req() req: any) {
    return this.procurementService.getGoodsReceipts(req.user, purchaseOrderId);
  }

  // ====================================================
  // 6. VENDOR INVOICES
  // ====================================================
  @Post('invoices')
  async createInvoice(@Body() dto: CreateVendorInvoiceDto, @Req() req: any) {
    return this.procurementService.createInvoice(dto, req.user);
  }

  @Get('invoices')
  async getInvoices(
    @Query('purchaseOrderId') purchaseOrderId: string,
    @Query('vendorId') vendorId: string,
    @Req() req: any,
  ) {
    return this.procurementService.getInvoices(req.user, purchaseOrderId, vendorId);
  }

  // ====================================================
  // 7. VENDOR PAYMENTS
  // ====================================================
  @Post('payments')
  async createPayment(@Body() dto: CreateVendorPaymentDto, @Req() req: any) {
    return this.procurementService.createPayment(dto, req.user);
  }

  @Get('payments')
  async getPayments(@Query('vendorInvoiceId') vendorInvoiceId: string, @Req() req: any) {
    return this.procurementService.getPayments(req.user, vendorInvoiceId);
  }

  // ====================================================
  // 8. ANALYTICS
  // ====================================================
  @Get('analytics')
  async getAnalytics(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.procurementService.getAnalytics(req.user, facilityId);
  }
}
