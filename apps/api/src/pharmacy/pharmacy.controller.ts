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
import { PharmacyService } from './pharmacy.service';
import { CreateMedicationOrderDto } from './dto/create-medication-order.dto';
import { DispenseMedicationDto } from './dto/dispense-medication.dto';
import { InventoryAdjustmentDto } from './dto/inventory-adjustment.dto';

@Controller('pharmacy')
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  @UseGuards(JwtAuthGuard)
  @Post('orders')
  async createOrder(@Body() dto: CreateMedicationOrderDto, @Req() req: any) {
    return this.pharmacyService.createOrder(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders')
  async getOrders(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.pharmacyService.getOrders(req.user, facilityId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('prescriptions')
  async createPrescription(@Body() dto: CreateMedicationOrderDto, @Req() req: any) {
    return this.pharmacyService.createOrder(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('prescriptions')
  async getPrescriptions(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.pharmacyService.getOrders(req.user, facilityId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders/:id')
  async getOrderById(@Param('id') id: string, @Req() req: any) {
    return this.pharmacyService.getOrderById(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('dispense')
  async dispenseMedication(@Body() dto: DispenseMedicationDto, @Req() req: any) {
    return this.pharmacyService.dispenseMedication(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('orders/:id/cancel')
  async cancelOrder(@Param('id') id: string, @Req() req: any) {
    return this.pharmacyService.cancelOrder(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('inventory')
  async getInventory(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.pharmacyService.getInventory(req.user, facilityId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('inventory')
  async addInventoryStock(@Body() dto: InventoryAdjustmentDto, @Req() req: any) {
    return this.pharmacyService.addInventoryStock(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('inventory/:id')
  async adjustInventoryStock(
    @Param('id') id: string,
    @Body() dto: InventoryAdjustmentDto,
    @Req() req: any,
  ) {
    return this.pharmacyService.adjustInventoryStock(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('low-stock')
  async getLowStockAlerts(@Req() req: any) {
    return this.pharmacyService.getLowStockAlerts(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('expiry-alerts')
  async getExpiryAlerts(@Query('days') days: string, @Req() req: any) {
    const daysNum = days ? parseInt(days, 10) : 90;
    return this.pharmacyService.getExpiryAlerts(req.user, daysNum);
  }

  @UseGuards(JwtAuthGuard)
  @Get('analytics')
  async getAnalytics(@Req() req: any) {
    return this.pharmacyService.getAnalytics(req.user);
  }

  // --- DRUGS CATALOG ---
  @UseGuards(JwtAuthGuard)
  @Get('drugs')
  async getDrugs(@Req() req: any) {
    return this.pharmacyService.getDrugs(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('drugs')
  async createDrug(@Body() dto: any, @Req() req: any) {
    return this.pharmacyService.createDrug(dto, req.user);
  }

  // --- PURCHASE ORDERS ---
  @UseGuards(JwtAuthGuard)
  @Get('purchase-orders')
  async getPurchaseOrders(@Req() req: any) {
    return this.pharmacyService.getPurchaseOrders(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('purchase-orders')
  async createPurchaseOrder(@Body() dto: any, @Req() req: any) {
    return this.pharmacyService.createPurchaseOrder(dto, req.user);
  }

  // --- GOODS RECEIPT NOTES (GRN) ---
  @UseGuards(JwtAuthGuard)
  @Get('grn')
  async getGRNs(@Req() req: any) {
    return this.pharmacyService.getGRNs(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('grn')
  async createGRN(@Body() dto: any, @Req() req: any) {
    return this.pharmacyService.createGRN(dto, req.user);
  }

  // --- CONTROLLED SUBSTANCE AUDITS ---
  @UseGuards(JwtAuthGuard)
  @Get('audits')
  async getControlledAudits(@Req() req: any) {
    return this.pharmacyService.getControlledAudits(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('audits')
  async createControlledAudit(@Body() dto: any, @Req() req: any) {
    return this.pharmacyService.createControlledAudit(dto, req.user);
  }

  // --- AI INVENTORY FORECASTING ---
  @UseGuards(JwtAuthGuard)
  @Get('forecasting')
  async getForecasting(@Req() req: any) {
    return this.pharmacyService.getInventoryForecasting(req.user);
  }
}
