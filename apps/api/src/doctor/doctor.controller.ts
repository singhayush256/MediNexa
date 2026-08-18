import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleCode } from '@medinexa/types';

@Controller()
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

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
  ) {
    return this.doctorService.getDoctors({ facilityId, departmentId, specialtyId });
  }

  @Get('doctors/:id')
  async getDoctorById(@Param('id') id: string) {
    return this.doctorService.getDoctorById(id);
  }

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
