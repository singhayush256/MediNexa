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
import { HrmsService } from './hrms.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { CheckInDto, CheckOutDto } from './dto/attendance.dto';
import { CreateShiftDto } from './dto/create-shift.dto';
import { CreateLeaveRequestDto } from './dto/leave-request.dto';
import { GeneratePayrollDto } from './dto/payroll.dto';
import { RunPayrollDto } from './dto/run-payroll.dto';
import { CreateCredentialDto } from './dto/credential.dto';
import { CreatePerformanceReviewDto } from './dto/performance-review.dto';
import { LeaveStatus } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('hrms')
export class HrmsController {
  constructor(private readonly hrmsService: HrmsService) {}

  // ====================================================
  // 1. EMPLOYEES
  // ====================================================
  @Post('employees')
  async createEmployee(@Body() dto: CreateEmployeeDto, @Req() req: any) {
    return this.hrmsService.createEmployee(dto, req.user);
  }

  @Get('employees')
  async getEmployees(
    @Query('facilityId') facilityId: string,
    @Query('department') department: string,
    @Req() req: any,
  ) {
    return this.hrmsService.getEmployees(req.user, facilityId, department);
  }

  @Get('employees/:id')
  async getEmployeeById(@Param('id') id: string, @Req() req: any) {
    return this.hrmsService.getEmployeeById(id, req.user);
  }

  @Patch('employees/:id')
  async updateEmployee(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
    @Req() req: any,
  ) {
    return this.hrmsService.updateEmployee(id, dto, req.user);
  }

  // ====================================================
  // 2. ATTENDANCE
  // ====================================================
  @Post('attendance/check-in')
  async checkIn(@Body() dto: CheckInDto, @Req() req: any) {
    return this.hrmsService.checkIn(dto, req.user);
  }

  @Post('attendance/checkin')
  async checkInLegacy(@Body() dto: CheckInDto, @Req() req: any) {
    return this.hrmsService.checkIn(dto, req.user);
  }

  @Post('attendance/check-out')
  async checkOut(@Body() dto: CheckOutDto, @Req() req: any) {
    return this.hrmsService.checkOut(dto, req.user);
  }

  @Post('attendance/checkout')
  async checkOutLegacy(@Body() dto: CheckOutDto, @Req() req: any) {
    return this.hrmsService.checkOut(dto, req.user);
  }

  @Get('attendance')
  async getAttendance(
    @Query('facilityId') facilityId: string,
    @Query('employeeId') employeeId: string,
    @Req() req: any,
  ) {
    return this.hrmsService.getAttendance(req.user, facilityId, employeeId);
  }

  // ====================================================
  // 3. SHIFT SCHEDULING
  // ====================================================
  @Post('shifts')
  async createShift(@Body() dto: CreateShiftDto, @Req() req: any) {
    return this.hrmsService.createShift(dto, req.user);
  }

  @Get('shifts')
  async getShifts(@Query('employeeId') employeeId: string, @Req() req: any) {
    return this.hrmsService.getShifts(req.user, employeeId);
  }

  @Patch('shifts/:id')
  async updateShift(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.hrmsService.updateShift(id, dto, req.user);
  }

  // ====================================================
  // 4. LEAVE MANAGEMENT
  // ====================================================
  @Post('leave')
  async createLeave(@Body() dto: CreateLeaveRequestDto, @Req() req: any) {
    return this.hrmsService.createLeave(dto, req.user);
  }

  @Get('leave')
  async getLeaves(
    @Query('employeeId') employeeId: string,
    @Query('status') status: LeaveStatus,
    @Req() req: any,
  ) {
    return this.hrmsService.getLeaves(req.user, employeeId, status);
  }

  @Patch('leave/:id/approve')
  async approveLeave(@Param('id') id: string, @Req() req: any) {
    return this.hrmsService.approveLeave(id, req.user);
  }

  @Patch('leave/:id/reject')
  async rejectLeave(@Param('id') id: string, @Req() req: any) {
    return this.hrmsService.rejectLeave(id, req.user);
  }

  // ====================================================
  // 5. PAYROLL
  // ====================================================
  @Post('payroll/generate')
  async generatePayroll(@Body() dto: GeneratePayrollDto, @Req() req: any) {
    return this.hrmsService.generatePayroll(dto, req.user);
  }

  @Post('payroll/run')
  async runPayrollLegacy(@Body() dto: RunPayrollDto, @Req() req: any) {
    return this.hrmsService.runPayroll(dto, req.user);
  }

  @Get('payroll')
  async getPayroll(
    @Query('employeeId') employeeId: string,
    @Query('month') month: string,
    @Req() req: any,
  ) {
    return this.hrmsService.getPayroll(req.user, employeeId, month);
  }

  @Patch('payroll/:id/pay')
  async payPayroll(@Param('id') id: string, @Req() req: any) {
    return this.hrmsService.payPayroll(id, req.user);
  }

  @Get('payslips/:employeeId')
  async getPayslips(@Param('employeeId') employeeId: string, @Req() req: any) {
    return this.hrmsService.getPayslips(employeeId, req.user);
  }

  // ====================================================
  // 6. CREDENTIALS & LICENSES
  // ====================================================
  @Post('credentials')
  async createCredential(@Body() dto: CreateCredentialDto, @Req() req: any) {
    return this.hrmsService.createCredential(dto, req.user);
  }

  @Get('credentials/expiring')
  async getExpiringCredentials(@Query('days') days: string, @Req() req: any) {
    return this.hrmsService.getExpiringCredentials(days ? parseInt(days, 10) : 90, req.user);
  }

  @Get('credentials')
  async getCredentials(@Query('employeeId') employeeId: string, @Req() req: any) {
    return this.hrmsService.getCredentials(req.user, employeeId);
  }

  // ====================================================
  // 7. PERFORMANCE REVIEWS
  // ====================================================
  @Post('performance')
  async createPerformanceReview(@Body() dto: CreatePerformanceReviewDto, @Req() req: any) {
    return this.hrmsService.createPerformanceReview(dto, req.user);
  }

  @Get('performance')
  async getPerformanceReviews(@Query('employeeId') employeeId: string, @Req() req: any) {
    return this.hrmsService.getPerformanceReviews(req.user, employeeId);
  }

  // ====================================================
  // 8. ANALYTICS
  // ====================================================
  @Get('analytics')
  async getAnalytics(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.hrmsService.getAnalytics(req.user, facilityId);
  }
}
