import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PatientPortalService } from './patient-portal.service';
import { UpdatePatientProfileDto } from './dto/update-profile.dto';
import { CreatePatientFeedbackDto } from './dto/create-feedback.dto';
import { CreateFamilyMemberDto, UpdateFamilyMemberDto } from './dto/create-family-member.dto';
import { CreateHealthGoalDto } from './dto/create-health-goal.dto';
import { CreatePatientInsuranceDto, UpdatePatientInsuranceDto } from './dto/insurance.dto';
import { ChangePasswordDto, AccountDeleteRequestDto } from './dto/change-password.dto';

@UseGuards(JwtAuthGuard)
@Controller('patient-portal')
export class PatientPortalController {
  constructor(private readonly patientPortalService: PatientPortalService) {}

  // 1. Profile
  @Get('profile')
  async getProfile(@Query('patientId') patientId: string, @Req() req: any) {
    return this.patientPortalService.getProfile(req.user, patientId);
  }

  @Patch('profile')
  async updateProfile(@Body() dto: UpdatePatientProfileDto, @Query('patientId') patientId: string, @Req() req: any) {
    return this.patientPortalService.updateProfile(dto, req.user, patientId);
  }

  @Post('change-password')
  async changePassword(@Body() dto: ChangePasswordDto, @Req() req: any) {
    return this.patientPortalService.changePassword(dto, req.user);
  }

  @Get('export-data')
  async exportData(@Query('patientId') patientId: string, @Req() req: any) {
    return this.patientPortalService.exportData(req.user, patientId);
  }

  @Post('delete-request')
  async requestAccountDeletion(@Body() dto: AccountDeleteRequestDto, @Query('patientId') patientId: string, @Req() req: any) {
    return this.patientPortalService.requestAccountDeletion(dto, req.user, patientId);
  }

  // 2. Appointments
  @Get('appointments')
  async getAppointments(@Query('patientId') patientId: string, @Req() req: any) {
    return this.patientPortalService.getAppointments(req.user, patientId);
  }

  // 3. Prescriptions
  @Get('prescriptions')
  async getPrescriptions(@Query('patientId') patientId: string, @Req() req: any) {
    return this.patientPortalService.getPrescriptions(req.user, patientId);
  }

  // 4. Lab Reports
  @Get('lab-reports')
  async getLabReports(@Query('patientId') patientId: string, @Req() req: any) {
    return this.patientPortalService.getLabReports(req.user, patientId);
  }

  // 5. Billing & Invoices
  @Get('bills')
  async getBills(@Query('patientId') patientId: string, @Req() req: any) {
    return this.patientPortalService.getBills(req.user, patientId);
  }

  // 6. Inpatient Admissions
  @Get('admissions')
  async getAdmissions(@Query('patientId') patientId: string, @Req() req: any) {
    return this.patientPortalService.getAdmissions(req.user, patientId);
  }

  // 7. Discharge Summaries
  @Get('discharge-summaries')
  async getDischargeSummaries(@Query('patientId') patientId: string, @Req() req: any) {
    return this.patientPortalService.getDischargeSummaries(req.user, patientId);
  }

  // 8. Telemedicine Virtual Sessions
  @Get('telemedicine')
  async getTelemedicine(@Query('patientId') patientId: string, @Req() req: any) {
    return this.patientPortalService.getTelemedicine(req.user, patientId);
  }

  // 9. Notifications Center
  @Get('notifications')
  async getNotifications(@Query('patientId') patientId: string, @Req() req: any) {
    return this.patientPortalService.getNotifications(req.user, patientId);
  }

  @Patch('notifications/:id/read')
  async markNotificationRead(@Param('id') id: string, @Req() req: any) {
    return this.patientPortalService.markNotificationRead(id, req.user);
  }

  // 10. Doctor Feedback & Rating
  @Post('feedback')
  async submitFeedback(@Body() dto: CreatePatientFeedbackDto, @Query('patientId') patientId: string, @Req() req: any) {
    return this.patientPortalService.submitFeedback(dto, req.user, patientId);
  }

  // 11. Family Access Management
  @Get('family')
  async getFamily(@Query('patientId') patientId: string, @Req() req: any) {
    return this.patientPortalService.getFamily(req.user, patientId);
  }

  @Post('family')
  async addFamilyMember(@Body() dto: CreateFamilyMemberDto, @Query('patientId') patientId: string, @Req() req: any) {
    return this.patientPortalService.addFamilyMember(dto, req.user, patientId);
  }

  @Patch('family/:id')
  async updateFamilyMember(
    @Param('id') id: string,
    @Body() dto: UpdateFamilyMemberDto,
    @Query('patientId') patientId: string,
    @Req() req: any,
  ) {
    return this.patientPortalService.updateFamilyMember(id, dto, req.user, patientId);
  }

  @Delete('family/:id')
  async deleteFamilyMember(@Param('id') id: string, @Query('patientId') patientId: string, @Req() req: any) {
    return this.patientPortalService.deleteFamilyMember(id, req.user, patientId);
  }

  // 12. Health Insurance Management
  @Get('insurance')
  async getInsurance(@Query('patientId') patientId: string, @Req() req: any) {
    return this.patientPortalService.getInsurance(req.user, patientId);
  }

  @Post('insurance')
  async addInsurance(@Body() dto: CreatePatientInsuranceDto, @Query('patientId') patientId: string, @Req() req: any) {
    return this.patientPortalService.addInsurance(dto, req.user, patientId);
  }

  @Patch('insurance/:id')
  async updateInsurance(
    @Param('id') id: string,
    @Body() dto: UpdatePatientInsuranceDto,
    @Query('patientId') patientId: string,
    @Req() req: any,
  ) {
    return this.patientPortalService.updateInsurance(id, dto, req.user, patientId);
  }

  @Delete('insurance/:id')
  async deleteInsurance(@Param('id') id: string, @Query('patientId') patientId: string, @Req() req: any) {
    return this.patientPortalService.deleteInsurance(id, req.user, patientId);
  }

  @Get('insurance/claims')
  async getInsuranceClaims(@Query('patientId') patientId: string, @Req() req: any) {
    return this.patientPortalService.getInsuranceClaims(req.user, patientId);
  }

  // 13. Patient Documents & Uploads
  @Get('documents')
  async getDocuments(@Query('patientId') patientId: string, @Req() req: any) {
    return this.patientPortalService.getDocuments(req.user, patientId);
  }

  @Delete('documents/:id')
  async deleteDocument(@Param('id') id: string, @Query('patientId') patientId: string, @Req() req: any) {
    return this.patientPortalService.deleteDocument(id, req.user, patientId);
  }

  // 14. Health Goals Tracker
  @Get('health-goals')
  async getHealthGoals(@Query('patientId') patientId: string, @Req() req: any) {
    return this.patientPortalService.getHealthGoals(req.user, patientId);
  }

  @Post('health-goals')
  async createOrUpdateHealthGoal(@Body() dto: CreateHealthGoalDto, @Query('patientId') patientId: string, @Req() req: any) {
    return this.patientPortalService.createOrUpdateHealthGoal(dto, req.user, patientId);
  }

  // 15. Engagement Analytics
  @Get('analytics')
  async getAnalytics(@Query('patientId') patientId: string, @Req() req: any) {
    return this.patientPortalService.getAnalytics(req.user, patientId);
  }
}
