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
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { CreateDoctorScheduleDto } from './dto/create-schedule.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleCode } from '@medinexa/types';

@Controller()
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  // =========================================================================
  // DOCTOR SCHEDULE & AVAILABILITY ENDPOINTS
  // =========================================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('doctor-schedules')
  async createSchedule(@Body() dto: CreateDoctorScheduleDto, @Request() req: any) {
    return this.appointmentService.createSchedule(dto, req.user);
  }

  @Get('doctors/:doctorId/schedules')
  async getDoctorSchedules(
    @Param('doctorId') doctorId: string,
    @Query('facilityId') facilityId?: string,
  ) {
    return this.appointmentService.getDoctorSchedules(doctorId, facilityId);
  }

  @Get('doctors/:doctorId/availability')
  async getDoctorAvailability(
    @Param('doctorId') doctorId: string,
    @Query('date') dateStr: string,
    @Query('facilityId') facilityId?: string,
  ) {
    return this.appointmentService.getDoctorAvailability(doctorId, dateStr, facilityId);
  }

  // =========================================================================
  // APPOINTMENT CRUD & LIFECYCLE ENDPOINTS
  // =========================================================================

  @UseGuards(JwtAuthGuard)
  @Post('appointments')
  async bookAppointment(@Body() dto: CreateAppointmentDto, @Request() req: any) {
    return this.appointmentService.bookAppointment(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('appointments')
  async getAppointments(@Query() filters: any, @Request() req: any) {
    return this.appointmentService.getAppointments(filters, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('patients/me/appointments')
  async getMyAppointments(@Request() req: any) {
    if (!req.user.patientProfile) {
      throw new ForbiddenException('User is not a registered patient');
    }
    return this.appointmentService.getAppointments(
      { patientId: req.user.patientProfile.id },
      req.user,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('doctors/me/appointments')
  async getMyDoctorAppointments(@Request() req: any) {
    if (!req.user.doctorProfile) {
      throw new ForbiddenException('User is not a registered doctor');
    }
    return this.appointmentService.getAppointments(
      { doctorId: req.user.doctorProfile.id },
      req.user,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('appointments/:id')
  async getAppointmentById(@Param('id') id: string, @Request() req: any) {
    return this.appointmentService.getAppointmentById(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('appointments/:id/confirm')
  async confirmAppointment(@Param('id') id: string, @Request() req: any) {
    return this.appointmentService.confirmAppointment(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('appointments/:id/check-in')
  async checkInAppointment(@Param('id') id: string, @Request() req: any) {
    return this.appointmentService.checkInAppointment(id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('appointments/:id/start')
  async startAppointment(@Param('id') id: string, @Request() req: any) {
    return this.appointmentService.startAppointment(id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.DOCTOR, RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('appointments/:id/complete')
  async completeAppointment(@Param('id') id: string, @Request() req: any) {
    return this.appointmentService.completeAppointment(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('appointments/:id/cancel')
  async cancelAppointment(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req: any,
  ) {
    return this.appointmentService.cancelAppointment(id, reason, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('appointments/:id/reschedule')
  async rescheduleAppointment(
    @Param('id') id: string,
    @Body() dto: RescheduleAppointmentDto,
    @Request() req: any,
  ) {
    return this.appointmentService.rescheduleAppointment(id, dto, req.user);
  }
}
