import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { LabService } from './lab.service';
import { CreateLabTestDto } from './dto/create-lab-test.dto';
import { CreateLabOrderDto } from './dto/create-lab-order.dto';
import { RecordLabResultDto } from './dto/record-lab-result.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleCode, LabOrderStatus } from '@medinexa/types';

@Controller()
export class LabController {
  constructor(private readonly labService: LabService) {}

  // =========================================================================
  // LAB CATALOG ENDPOINTS
  // =========================================================================

  @Get('lab/tests')
  async getLabTests() {
    return this.labService.getLabTests();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.LAB_STAFF, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('lab/tests')
  async createLabTest(@Body() dto: CreateLabTestDto) {
    return this.labService.createLabTest(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.LAB_STAFF, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Patch('lab/tests/:id')
  async updateLabTest(@Param('id') id: string, @Body() dto: Partial<CreateLabTestDto>) {
    return this.labService.updateLabTest(id, dto);
  }

  // =========================================================================
  // LAB ORDER ENDPOINTS
  // =========================================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('lab/orders')
  async createLabOrder(@Body() dto: CreateLabOrderDto, @Request() req: any) {
    return this.labService.createLabOrder(dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.NURSE, RoleCode.LAB_STAFF, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Get('lab/orders')
  async getLabOrders(
    @Query('facilityId') facilityId?: string,
    @Query('patientId') patientId?: string,
    @Query('status') status?: LabOrderStatus,
  ) {
    return this.labService.getLabOrders({ facilityId, patientId, status });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.NURSE, RoleCode.LAB_STAFF, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Get('lab/orders/:id')
  async getLabOrderById(@Param('id') id: string, @Request() req: any) {
    return this.labService.getLabOrderById(id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.NURSE, RoleCode.LAB_STAFF, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Get('encounters/:id/lab-orders')
  async getEncounterLabOrders(@Param('id') encounterId: string) {
    return this.labService.getEncounterLabOrders(encounterId);
  }

  // =========================================================================
  // SPECIMEN WORKFLOW ENDPOINTS
  // =========================================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.NURSE, RoleCode.LAB_STAFF, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('lab/orders/:id/collect')
  async collectSpecimen(@Param('id') orderId: string, @Request() req: any) {
    return this.labService.collectSpecimen(orderId, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.LAB_STAFF, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('lab/orders/:id/receive')
  async receiveSpecimen(@Param('id') orderId: string, @Request() req: any) {
    return this.labService.receiveSpecimen(orderId, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.LAB_STAFF, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('lab/orders/:id/process')
  async processSpecimen(@Param('id') orderId: string, @Request() req: any) {
    return this.labService.processSpecimen(orderId, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.LAB_STAFF, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('lab/orders/:id/reject')
  async rejectSpecimen(@Param('id') orderId: string, @Body('reason') reason: string, @Request() req: any) {
    return this.labService.rejectSpecimen(orderId, reason, req.user);
  }

  // =========================================================================
  // LAB RESULT ENDPOINTS
  // =========================================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.LAB_STAFF, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('lab/items/:itemId/result')
  async recordLabResult(
    @Param('itemId') itemId: string,
    @Body() dto: RecordLabResultDto,
    @Request() req: any,
  ) {
    return this.labService.recordLabResult(itemId, dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.LAB_STAFF, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('lab/results/:id/verify')
  async verifyLabResult(@Param('id') resultId: string, @Request() req: any) {
    return this.labService.verifyLabResult(resultId, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.LAB_STAFF, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('lab/results/:id/amend')
  async amendLabResult(
    @Param('id') resultId: string,
    @Body() dto: RecordLabResultDto & { reason: string },
    @Request() req: any,
  ) {
    return this.labService.amendLabResult(resultId, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('patients/me/lab-results')
  async getMyLabResults(@Request() req: any) {
    if (!req.user.patientProfile) {
      throw new ForbiddenException('User does not have an active patient profile');
    }
    return this.labService.getPatientLabResults(req.user.patientProfile.id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.NURSE, RoleCode.LAB_STAFF, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, RoleCode.PATIENT)
  @Get('patients/:patientId/lab-results')
  async getPatientLabResults(@Param('patientId') patientId: string, @Request() req: any) {
    return this.labService.getPatientLabResults(patientId, req.user);
  }
}
