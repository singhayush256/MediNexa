import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { BloodBankService } from './blood-bank.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RegisterDonorDto } from './dto/register-donor.dto';
import { RecordDonationDto } from './dto/record-donation.dto';
import { CreateBloodRequestDto } from './dto/create-blood-request.dto';
import { PerformCrossMatchDto } from './dto/crossmatch.dto';
import { IssueBloodDto } from './dto/issue-blood.dto';
import { RecordTransfusionDto } from './dto/transfusion.dto';
import { BloodUnitStatus, BloodGroup, BloodComponent } from '@prisma/client';

@Controller('blood-bank')
@UseGuards(JwtAuthGuard)
export class BloodBankController {
  constructor(private readonly bloodBankService: BloodBankService) {}

  // 1. DONOR REGISTRATION & DIRECTORY
  @Post('donors')
  async registerDonor(@Body() dto: RegisterDonorDto, @Req() req: any) {
    return this.bloodBankService.registerDonor(dto, req.user);
  }

  @Get('donors')
  async getDonors(
    @Query('facilityId') facilityId: string,
    @Query('search') search: string,
    @Req() req: any,
  ) {
    return this.bloodBankService.getDonors(req.user, facilityId, search);
  }

  // 2. RECORD DONATION & COMPONENT SEPARATION
  @Post('donations')
  async recordDonation(@Body() dto: RecordDonationDto, @Req() req: any) {
    return this.bloodBankService.recordDonation(dto, req.user);
  }

  // 3. BLOOD INVENTORY & COLD-CHAIN STOCK
  @Get('inventory')
  async getInventory(
    @Query('facilityId') facilityId: string,
    @Query('status') status: BloodUnitStatus,
    @Query('bloodGroup') bloodGroup: BloodGroup,
    @Query('component') component: BloodComponent,
    @Req() req: any,
  ) {
    return this.bloodBankService.getInventory(req.user, facilityId, status, bloodGroup, component);
  }

  // 4. CLINICAL BLOOD REQUISITION
  @Post('request')
  async createRequest(@Body() dto: CreateBloodRequestDto, @Req() req: any) {
    return this.bloodBankService.createRequest(dto, req.user);
  }

  // 5. SEROLOGICAL CROSSMATCH & COMPATIBILITY VERIFICATION
  @Post('crossmatch')
  async performCrossMatch(@Body() dto: PerformCrossMatchDto, @Req() req: any) {
    return this.bloodBankService.performCrossMatch(dto, req.user);
  }

  // 6. BLOOD DISPENSING & ISSUE
  @Post('issue')
  async issueBlood(@Body() dto: IssueBloodDto, @Req() req: any) {
    return this.bloodBankService.issueBlood(dto, req.user);
  }

  // 7. BEDSIDE TRANSFUSION & ADVERSE REACTION LOGGING
  @Post('transfusion')
  async recordTransfusion(@Body() dto: RecordTransfusionDto, @Req() req: any) {
    return this.bloodBankService.recordTransfusion(dto, req.user);
  }

  // 8. BLOOD BANK INTELLIGENCE & ANALYTICS
  @Get('analytics')
  async getAnalytics(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.bloodBankService.getAnalytics(req.user, facilityId);
  }
}
