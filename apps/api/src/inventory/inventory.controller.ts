import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-item.dto';
import { CreateInventoryTransactionDto } from './dto/create-transaction.dto';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { CreatePurchaseRequisitionDto } from './dto/create-requisition.dto';
import { CreateProcurementPODto } from './dto/create-po.dto';
import { CreateHospitalAssetDto } from './dto/create-asset.dto';
import { CreateMaintenanceTicketDto, ResolveMaintenanceTicketDto } from './dto/create-ticket.dto';
import { RoleCode } from '@medinexa/types';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, 'ADMIN', 'SUPER_ADMIN', RoleCode.PHARMACY_STAFF, 'PHARMACIST')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // --- ITEMS ---
  @Get('items')
  async getItems(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.inventoryService.getItems(req.user, facilityId);
  }

  @Post('items')
  async createItem(@Body() dto: CreateInventoryItemDto, @Req() req: any) {
    return this.inventoryService.createItem(dto, req.user);
  }

  // --- TRANSACTIONS ---
  @Get('transactions')
  async getTransactions(@Req() req: any) {
    return this.inventoryService.getTransactions(req.user);
  }

  @Post('transactions')
  async createTransaction(@Body() dto: CreateInventoryTransactionDto, @Req() req: any) {
    return this.inventoryService.createTransaction(dto, req.user);
  }

  // --- VENDORS ---
  @Get('vendors')
  async getVendors() {
    return this.inventoryService.getVendors();
  }

  @Post('vendors')
  async createVendor(@Body() dto: CreateVendorDto, @Req() req: any) {
    return this.inventoryService.createVendor(dto, req.user);
  }

  // --- REQUISITIONS ---
  @Post('requisitions')
  async createRequisition(@Body() dto: CreatePurchaseRequisitionDto, @Req() req: any) {
    return this.inventoryService.createRequisition(dto, req.user);
  }

  @Patch('requisitions/:id/approve')
  async approveRequisition(@Param('id') id: string, @Req() req: any) {
    return this.inventoryService.approveRequisition(id, req.user);
  }

  // --- PURCHASE ORDERS & GOODS RECEIPT ---
  @Post('purchase-orders')
  async createPurchaseOrder(@Body() dto: CreateProcurementPODto, @Req() req: any) {
    return this.inventoryService.createPurchaseOrder(dto, req.user);
  }

  @Patch('purchase-orders/:id/receive')
  async receivePurchaseOrder(@Param('id') id: string, @Req() req: any) {
    return this.inventoryService.receivePurchaseOrder(id, req.user);
  }

  // --- ASSETS ---
  @Get('assets')
  async getAssets(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.inventoryService.getAssets(req.user, facilityId);
  }

  @Post('assets')
  async createAsset(@Body() dto: CreateHospitalAssetDto, @Req() req: any) {
    return this.inventoryService.createAsset(dto, req.user);
  }

  // --- MAINTENANCE ---
  @Post('maintenance')
  async createMaintenanceTicket(@Body() dto: CreateMaintenanceTicketDto, @Req() req: any) {
    return this.inventoryService.createMaintenanceTicket(dto, req.user);
  }

  @Patch('maintenance/:id/resolve')
  async resolveMaintenanceTicket(
    @Param('id') id: string,
    @Body() dto: ResolveMaintenanceTicketDto,
    @Req() req: any,
  ) {
    return this.inventoryService.resolveMaintenanceTicket(id, dto, req.user);
  }

  // --- ANALYTICS ---
  @Get('analytics')
  async getAnalytics(@Req() req: any) {
    return this.inventoryService.getAnalytics(req.user);
  }
}
