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
import { RadiologyService } from './radiology.service';
import { CreateRadiologyOrderDto } from './dto/create-radiology-order.dto';
import { ScheduleStudyDto } from './dto/schedule-study.dto';
import { UploadStudyDto } from './dto/upload-study.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { VerifyReportDto } from './dto/verify-report.dto';
import { RadiologyOrderStatus } from '@prisma/client';

@Controller('radiology')
@UseGuards(JwtAuthGuard)
export class RadiologyController {
  constructor(private readonly radiologyService: RadiologyService) {}

  // ====================================================
  // 1. ORDERS
  // ====================================================
  @Post('orders')
  async createOrder(@Body() dto: CreateRadiologyOrderDto, @Req() req: any) {
    return this.radiologyService.createOrder(dto, req.user);
  }

  @Get('orders')
  async getOrders(
    @Query('facilityId') facilityId: string,
    @Query('status') status: RadiologyOrderStatus,
    @Req() req: any,
  ) {
    return this.radiologyService.getOrders(req.user, facilityId, status);
  }

  @Get('orders/:id')
  async getOrderById(@Param('id') id: string, @Req() req: any) {
    return this.radiologyService.getOrderById(id, req.user);
  }

  @Patch('orders/:id/schedule')
  async scheduleOrder(
    @Param('id') id: string,
    @Body() dto: ScheduleStudyDto,
    @Req() req: any,
  ) {
    return this.radiologyService.scheduleOrder(id, dto, req.user);
  }

  @Patch('orders/:id/start')
  async startOrder(@Param('id') id: string, @Req() req: any) {
    return this.radiologyService.startOrder(id, req.user);
  }

  @Patch('orders/:id/complete')
  async completeOrder(@Param('id') id: string, @Req() req: any) {
    return this.radiologyService.completeOrder(id, req.user);
  }

  // ====================================================
  // 2. STUDIES (PACS ARCHIVE)
  // ====================================================
  @Post('studies')
  async createStudy(@Body() dto: UploadStudyDto, @Req() req: any) {
    return this.radiologyService.createStudy(dto, req.user);
  }

  @Get('studies')
  async getStudies(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.radiologyService.getStudies(req.user, facilityId);
  }

  @Get('studies/:id')
  async getStudyById(@Param('id') id: string, @Req() req: any) {
    return this.radiologyService.getStudyById(id, req.user);
  }

  // ====================================================
  // 3. REPORTS
  // ====================================================
  @Post('reports')
  async createReport(@Body() dto: CreateReportDto, @Req() req: any) {
    return this.radiologyService.createReport(dto, req.user);
  }

  @Patch('reports/:id/verify')
  async verifyReport(
    @Param('id') id: string,
    @Body() dto: VerifyReportDto,
    @Req() req: any,
  ) {
    return this.radiologyService.verifyReport(id, dto, req.user);
  }

  @Get('reports/:id')
  async getReportById(@Param('id') id: string, @Req() req: any) {
    return this.radiologyService.getReportById(id, req.user);
  }

  // ====================================================
  // 4. CRITICAL FINDINGS ALERTS
  // ====================================================
  @Get('critical-alerts')
  async getCriticalAlerts(
    @Query('facilityId') facilityId: string,
    @Query('unacknowledgedOnly') unacknowledgedOnly: boolean,
    @Req() req: any,
  ) {
    return this.radiologyService.getCriticalAlerts(req.user, facilityId, unacknowledgedOnly);
  }

  @Patch('critical-alerts/:id/acknowledge')
  async acknowledgeCriticalAlert(@Param('id') id: string, @Req() req: any) {
    return this.radiologyService.acknowledgeCriticalAlert(id, req.user);
  }

  // ====================================================
  // 5. ANALYTICS
  // ====================================================
  @Get('analytics')
  async getAnalytics(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.radiologyService.getAnalytics(req.user, facilityId);
  }

  // ====================================================
  // 6. BACKWARDS COMPATIBILITY
  // ====================================================
  @Post('studies/upload')
  async uploadStudy(@Body() dto: UploadStudyDto, @Req() req: any) {
    return this.radiologyService.uploadStudy(dto, req.user);
  }

  @Post('report')
  async createReportLegacy(@Body() dto: CreateReportDto, @Req() req: any) {
    return this.radiologyService.createReport(dto, req.user);
  }

  @Patch('report/:id/sign')
  async signReport(@Param('id') id: string, @Req() req: any) {
    return this.radiologyService.signReport(id, req.user);
  }

  @Get('reports/order/:orderId')
  async getReportByOrderId(@Param('orderId') orderId: string, @Req() req: any) {
    return this.radiologyService.getReportByOrderId(orderId, req.user);
  }

  @Get('patient-history/:patientId')
  async getPatientHistory(@Param('patientId') patientId: string, @Req() req: any) {
    return this.radiologyService.getPatientHistory(patientId, req.user);
  }
}
