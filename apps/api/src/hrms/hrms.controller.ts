import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HrmsService } from './hrms.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { CheckInDto, CheckOutDto } from './dto/attendance.dto';
import { CreateShiftDto } from './dto/create-shift.dto';
import { CreateLeaveRequestDto } from './dto/leave-request.dto';
import { RunPayrollDto } from './dto/run-payroll.dto';

@Controller('hrms')
export class HrmsController {
  constructor(private readonly hrmsService: HrmsService) {}

  // --- EMPLOYEES ---
  @UseGuards(JwtAuthGuard)
  @Get('employees')
  async getEmployees(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.hrmsService.getEmployees(req.user, facilityId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('employees')
  async createEmployee(@Body() dto: CreateEmployeeDto, @Req() req: any) {
    return this.hrmsService.createEmployee(dto, req.user);
  }

  // --- ATTENDANCE ---
  @UseGuards(JwtAuthGuard)
  @Post('attendance/checkin')
  async checkIn(@Body() dto: CheckInDto, @Req() req: any) {
    return this.hrmsService.checkIn(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('attendance/checkout')
  async checkOut(@Body() dto: CheckOutDto, @Req() req: any) {
    return this.hrmsService.checkOut(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('attendance')
  async getAttendance(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.hrmsService.getAttendance(req.user, facilityId);
  }

  // --- SHIFTS ---
  @UseGuards(JwtAuthGuard)
  @Get('shifts')
  async getShifts(@Req() req: any) {
    return this.hrmsService.getShifts(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('shifts')
  async createShift(@Body() dto: CreateShiftDto, @Req() req: any) {
    return this.hrmsService.createShift(dto, req.user);
  }

  // --- LEAVES ---
  @UseGuards(JwtAuthGuard)
  @Post('leave')
  async createLeave(@Body() dto: CreateLeaveRequestDto, @Req() req: any) {
    return this.hrmsService.createLeave(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('leave/:id/approve')
  async approveLeave(@Param('id') id: string, @Req() req: any) {
    return this.hrmsService.approveLeave(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('leave/:id/reject')
  async rejectLeave(@Param('id') id: string, @Req() req: any) {
    return this.hrmsService.rejectLeave(id, req.user);
  }

  // --- PAYROLL & PAYSLIPS ---
  @UseGuards(JwtAuthGuard)
  @Post('payroll/run')
  async runPayroll(@Body() dto: RunPayrollDto, @Req() req: any) {
    return this.hrmsService.runPayroll(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('payroll')
  async getPayrollRuns(@Req() req: any) {
    return this.hrmsService.getPayrollRuns(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('payslips/:employeeId')
  async getPayslips(@Param('employeeId') employeeId: string, @Req() req: any) {
    return this.hrmsService.getPayslips(employeeId, req.user);
  }

  // --- ANALYTICS ---
  @UseGuards(JwtAuthGuard)
  @Get('analytics')
  async getAnalytics(@Req() req: any) {
    return this.hrmsService.getAnalytics(req.user);
  }
}
