import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-item.dto';
import { CreateInventoryTransactionDto } from './dto/create-transaction.dto';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { CreatePurchaseRequisitionDto } from './dto/create-requisition.dto';
import { CreateProcurementPODto } from './dto/create-po.dto';
import { CreateHospitalAssetDto } from './dto/create-asset.dto';
import { CreateMaintenanceTicketDto, ResolveMaintenanceTicketDto } from './dto/create-ticket.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // --- ITEMS ---
  @UseGuards(JwtAuthGuard)
  @Get('items')
  async getItems(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.inventoryService.getItems(req.user, facilityId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('items')
  async createItem(@Body() dto: CreateInventoryItemDto, @Req() req: any) {
    return this.inventoryService.createItem(dto, req.user);
  }

  // --- TRANSACTIONS ---
  @UseGuards(JwtAuthGuard)
  @Get('transactions')
  async getTransactions(@Req() req: any) {
    return this.inventoryService.getTransactions(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('transactions')
  async createTransaction(@Body() dto: CreateInventoryTransactionDto, @Req() req: any) {
    return this.inventoryService.createTransaction(dto, req.user);
  }

  // --- VENDORS ---
  @UseGuards(JwtAuthGuard)
  @Get('vendors')
  async getVendors() {
    return this.inventoryService.getVendors();
  }

  @UseGuards(JwtAuthGuard)
  @Post('vendors')
  async createVendor(@Body() dto: CreateVendorDto, @Req() req: any) {
    return this.inventoryService.createVendor(dto, req.user);
  }

  // --- REQUISITIONS ---
  @UseGuards(JwtAuthGuard)
  @Post('requisitions')
  async createRequisition(@Body() dto: CreatePurchaseRequisitionDto, @Req() req: any) {
    return this.inventoryService.createRequisition(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('requisitions/:id/approve')
  async approveRequisition(@Param('id') id: string, @Req() req: any) {
    return this.inventoryService.approveRequisition(id, req.user);
  }

  // --- PURCHASE ORDERS & GOODS RECEIPT ---
  @UseGuards(JwtAuthGuard)
  @Post('purchase-orders')
  async createPurchaseOrder(@Body() dto: CreateProcurementPODto, @Req() req: any) {
    return this.inventoryService.createPurchaseOrder(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('purchase-orders/:id/receive')
  async receivePurchaseOrder(@Param('id') id: string, @Req() req: any) {
    return this.inventoryService.receivePurchaseOrder(id, req.user);
  }

  // --- ASSETS ---
  @UseGuards(JwtAuthGuard)
  @Get('assets')
  async getAssets(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.inventoryService.getAssets(req.user, facilityId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('assets')
  async createAsset(@Body() dto: CreateHospitalAssetDto, @Req() req: any) {
    return this.inventoryService.createAsset(dto, req.user);
  }

  // --- MAINTENANCE ---
  @UseGuards(JwtAuthGuard)
  @Post('maintenance')
  async createMaintenanceTicket(@Body() dto: CreateMaintenanceTicketDto, @Req() req: any) {
    return this.inventoryService.createMaintenanceTicket(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('maintenance/:id/resolve')
  async resolveMaintenanceTicket(
    @Param('id') id: string,
    @Body() dto: ResolveMaintenanceTicketDto,
    @Req() req: any,
  ) {
    return this.inventoryService.resolveMaintenanceTicket(id, dto, req.user);
  }

  // --- ANALYTICS ---
  @UseGuards(JwtAuthGuard)
  @Get('analytics')
  async getAnalytics(@Req() req: any) {
    return this.inventoryService.getAnalytics(req.user);
  }
}
