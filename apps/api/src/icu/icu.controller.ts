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
import { IcuService } from './icu.service';
import { CreateIcuAdmissionDto } from './dto/create-icu-admission.dto';
import { RecordVitalsDto } from './dto/record-vitals.dto';
import { CreateRoundDto } from './dto/create-round.dto';
import { CreateCodeBlueDto } from './dto/create-code-blue.dto';
import { AssignVentilatorDto } from './dto/assign-ventilator.dto';
import { CreateVentilatorDto } from './dto/create-ventilator.dto';
import { UpdateAdmissionStatusDto } from './dto/update-admission-status.dto';
import { IcuPatientStatus } from '@prisma/client';

@Controller('icu')
@UseGuards(JwtAuthGuard)
export class IcuController {
  constructor(private readonly icuService: IcuService) {}

  // ====================================================
  // 1. ICU ADMISSIONS
  // ====================================================
  @Post('admissions')
  async createAdmission(@Body() dto: CreateIcuAdmissionDto, @Req() req: any) {
    return this.icuService.createAdmission(dto, req.user);
  }

  @Get('admissions')
  async getAdmissions(
    @Query('facilityId') facilityId: string,
    @Query('status') status: IcuPatientStatus,
    @Req() req: any,
  ) {
    return this.icuService.getAdmissions(req.user, facilityId, status);
  }

  @Get('admissions/:id')
  async getAdmissionById(@Param('id') id: string, @Req() req: any) {
    return this.icuService.getAdmissionById(id, req.user);
  }

  @Patch('admissions/:id/status')
  async updateAdmissionStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAdmissionStatusDto,
    @Req() req: any,
  ) {
    return this.icuService.updateAdmissionStatus(id, dto, req.user);
  }

  // ====================================================
  // 2. CRITICAL VITALS MONITORING
  // ====================================================
  @Post('vitals')
  async recordVitals(@Body() dto: RecordVitalsDto, @Req() req: any) {
    return this.icuService.recordVitals(dto, req.user);
  }

  @Get('vitals/:patientId')
  async getVitalsByPatient(@Param('patientId') patientId: string, @Req() req: any) {
    return this.icuService.getVitalsByPatient(patientId, req.user);
  }

  // ====================================================
  // 3. ICU CLINICAL ROUNDS
  // ====================================================
  @Post('rounds')
  async createRound(@Body() dto: CreateRoundDto, @Req() req: any) {
    return this.icuService.createRound(dto, req.user);
  }

  @Get('rounds/:patientId')
  async getRoundsByPatient(@Param('patientId') patientId: string, @Req() req: any) {
    return this.icuService.getRoundsByPatient(patientId, req.user);
  }

  // ====================================================
  // 4. VENTILATOR TRACKING
  // ====================================================
  @Post('ventilators')
  async createVentilator(@Body() dto: CreateVentilatorDto, @Req() req: any) {
    return this.icuService.createVentilator(dto, req.user);
  }

  @Get('ventilators')
  async getVentilators(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.icuService.getVentilators(req.user, facilityId);
  }

  @Post('ventilators/assign')
  async assignVentilator(@Body() dto: AssignVentilatorDto, @Req() req: any) {
    return this.icuService.assignVentilator(dto, req.user);
  }

  @Patch('ventilators/remove')
  async removeVentilatorDirect(@Body('ventilatorId') ventilatorId: string, @Req() req: any) {
    return this.icuService.removeVentilator(ventilatorId, req.user);
  }

  @Patch('ventilators/:id/remove')
  async removeVentilator(@Param('id') id: string, @Req() req: any) {
    return this.icuService.removeVentilator(id, req.user);
  }

  // ====================================================
  // 5. CODE BLUE EMERGENCY ENGINE
  // ====================================================
  @Post('code-blue')
  async triggerCodeBlue(@Body() dto: CreateCodeBlueDto, @Req() req: any) {
    return this.icuService.triggerCodeBlue(dto, req.user);
  }

  @Get('code-blue')
  async getCodeBlueEvents(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.icuService.getCodeBlueEvents(req.user, facilityId);
  }

  @Patch('code-blue/:id/complete')
  async completeCodeBlue(
    @Param('id') id: string,
    @Body('outcome') outcome: string,
    @Req() req: any,
  ) {
    return this.icuService.completeCodeBlue(id, outcome || 'RESOLVED', req.user);
  }

  // ====================================================
  // 6. CRITICAL CARE ALERTS
  // ====================================================
  @Get('alerts')
  async getAlerts(
    @Query('facilityId') facilityId: string,
    @Query('unacknowledgedOnly') unacknowledgedOnly: boolean,
    @Req() req: any,
  ) {
    return this.icuService.getAlerts(req.user, facilityId, unacknowledgedOnly);
  }

  @Patch('alerts/:id/acknowledge')
  async acknowledgeAlert(@Param('id') id: string, @Req() req: any) {
    return this.icuService.acknowledgeAlert(id, req.user);
  }

  // ====================================================
  // 7. ICU ANALYTICS
  // ====================================================
  @Get('analytics')
  async getAnalytics(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.icuService.getAnalytics(req.user, facilityId);
  }
}
