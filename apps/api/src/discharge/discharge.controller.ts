import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DischargeService } from './discharge.service';
import { CreateDischargeSummaryDto } from './dto/create-discharge-summary.dto';
import { UpdateDischargeSummaryDto } from './dto/update-discharge-summary.dto';
import { ApproveClearanceDto } from './dto/approve-clearance.dto';

@Controller('discharge')
export class DischargeController {
  constructor(private readonly dischargeService: DischargeService) {}

  @UseGuards(JwtAuthGuard)
  @Post('summary')
  async createSummary(@Body() dto: CreateDischargeSummaryDto, @Req() req: any) {
    return this.dischargeService.createSummary(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('summary/:admissionId')
  async getSummary(@Param('admissionId') admissionId: string, @Req() req: any) {
    return this.dischargeService.getSummary(admissionId, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('summary/:id')
  async updateSummary(
    @Param('id') id: string,
    @Body() dto: UpdateDischargeSummaryDto,
    @Req() req: any,
  ) {
    return this.dischargeService.updateSummary(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('clearance/pharmacy')
  async approvePharmacyClearance(@Body() dto: ApproveClearanceDto, @Req() req: any) {
    return this.dischargeService.approveClearance('PHARMACY', dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('clearance/lab')
  async approveLabClearance(@Body() dto: ApproveClearanceDto, @Req() req: any) {
    return this.dischargeService.approveClearance('LAB', dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('clearance/ward')
  async approveWardClearance(@Body() dto: ApproveClearanceDto, @Req() req: any) {
    return this.dischargeService.approveClearance('WARD', dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('clearance/billing')
  async approveBillingClearance(@Body() dto: ApproveClearanceDto, @Req() req: any) {
    return this.dischargeService.approveClearance('BILLING', dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('clearance/:admissionId')
  async getClearances(@Param('admissionId') admissionId: string, @Req() req: any) {
    return this.dischargeService.getClearances(admissionId, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('finalize/:admissionId')
  async finalizeDischarge(@Param('admissionId') admissionId: string, @Req() req: any) {
    return this.dischargeService.finalizeDischarge(admissionId, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('analytics')
  async getAnalytics(@Req() req: any) {
    return this.dischargeService.getAnalytics(req.user);
  }
}
