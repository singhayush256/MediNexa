import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorAvailabilityService } from './doctor-availability.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleCode } from '@medinexa/types';

@Controller()
export class DoctorController {
  constructor(
    private readonly doctorService: DoctorService,
    private readonly availabilityService: DoctorAvailabilityService,
  ) {}

  @Get('specialties')
  async getSpecialties() {
    return this.doctorService.getSpecialties();
  }

  @UseGuards(JwtAuthGuard)
  @Get('doctors/me')
  async getMyDoctorProfile(@Request() req: any) {
    return this.doctorService.getDoctorByUserId(req.user.id);
  }

  @Get('doctors')
  async getDoctors(
    @Query('facilityId') facilityId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('specialtyId') specialtyId?: string,
    @Request() req?: any,
  ) {
    return this.doctorService.getDoctors({ facilityId, departmentId, specialtyId }, req?.user);
  }

  @Get('doctors/:id')
  async getDoctorById(@Param('id') id: string) {
    return this.doctorService.getDoctorById(id);
  }

  // --- Doctor Availability, Schedules & Leaves ---

  @Get('doctors/:id/available-slots')
  async getAvailableSlots(
    @Param('id') id: string,
    @Query('date') date: string,
    @Query('type') type?: string,
  ) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.availabilityService.getAvailableSlots(id, targetDate, type);
  }

  @UseGuards(JwtAuthGuard)
  @Post('doctors/:id/schedule')
  async setDoctorSchedule(
    @Param('id') id: string,
    @Body('schedules') schedules: any[],
  ) {
    return this.availabilityService.setSchedule(id, schedules);
  }

  @UseGuards(JwtAuthGuard)
  @Post('doctors/:id/leaves')
  async markDoctorLeave(
    @Param('id') id: string,
    @Body('date') date: string,
    @Body('reason') reason: string,
  ) {
    return this.availabilityService.markLeave(id, date, reason);
  }

  @Get('doctors/:id/leaves')
  async getDoctorLeaves(@Param('id') id: string) {
    return this.availabilityService.getLeaves(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('doctors/:id/consultation-config')
  async updateConsultationConfig(
    @Param('id') id: string,
    @Body() config: any,
  ) {
    return this.availabilityService.setConsultationConfig(id, config);
  }

  @Get('doctors/:id/consultation-config')
  async getConsultationConfig(@Param('id') id: string) {
    return this.availabilityService.getConsultationConfig(id);
  }

  // --- Doctor Profiles ---

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post('doctors')
  async createDoctorProfile(@Body() dto: CreateDoctorDto) {
    return this.doctorService.createDoctorProfile(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('doctors/:id')
  async updateDoctorProfile(
    @Param('id') id: string,
    @Body() dto: UpdateDoctorDto,
    @Request() req: any,
  ) {
    return this.doctorService.updateDoctorProfile(id, dto, req);
  }
}
