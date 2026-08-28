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
import { CreateImagingOrderDto } from './dto/create-imaging-order.dto';
import { UploadStudyDto } from './dto/upload-study.dto';
import { CreateRadiologyReportDto } from './dto/create-radiology-report.dto';

@Controller('radiology')
export class RadiologyController {
  constructor(private readonly radiologyService: RadiologyService) {}

  @UseGuards(JwtAuthGuard)
  @Post('orders')
  async createOrder(@Body() dto: CreateImagingOrderDto, @Req() req: any) {
    return this.radiologyService.createOrder(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders')
  async getOrders(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.radiologyService.getOrders(req.user, facilityId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders/:id')
  async getOrderById(@Param('id') id: string, @Req() req: any) {
    return this.radiologyService.getOrderById(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('studies/upload')
  async uploadStudy(@Body() dto: UploadStudyDto, @Req() req: any) {
    return this.radiologyService.uploadStudy(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('studies/:id')
  async getStudyById(@Param('id') id: string, @Req() req: any) {
    return this.radiologyService.getStudyById(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('report')
  async createReport(@Body() dto: CreateRadiologyReportDto, @Req() req: any) {
    return this.radiologyService.createReport(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('report/:id/sign')
  async signReport(@Param('id') id: string, @Req() req: any) {
    return this.radiologyService.signReport(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('reports/:orderId')
  async getReportByOrderId(@Param('orderId') orderId: string, @Req() req: any) {
    return this.radiologyService.getReportByOrderId(orderId, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('patient-history/:patientId')
  async getPatientHistory(@Param('patientId') patientId: string, @Req() req: any) {
    return this.radiologyService.getPatientHistory(patientId, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('analytics')
  async getAnalytics(@Req() req: any) {
    return this.radiologyService.getAnalytics(req.user);
  }
}
