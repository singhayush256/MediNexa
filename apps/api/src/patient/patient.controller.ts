import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleCode } from '@medinexa/types';

@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get('me')
  async getMyPatientProfile(@Request() req: any) {
    return this.patientService.getPatientByUserId(req.user.id);
  }

  @UseGuards(RolesGuard)
  @Roles(
    RoleCode.PATIENT,
    RoleCode.DOCTOR,
    RoleCode.NURSE,
    RoleCode.RECEPTIONIST,
    RoleCode.HOSPITAL_ADMIN,
    RoleCode.MEDINEXA_ADMIN,
  )
  @Get()
  async getPatients(@Request() req: any) {
    return this.patientService.getPatients(req.user);
  }

  @Get(':id')
  async getPatientById(@Param('id') id: string, @Request() req: any) {
    return this.patientService.getPatientById(id, req.user);
  }

  @Post()
  async createPatientProfile(@Body() dto: CreatePatientDto, @Request() req: any) {
    return this.patientService.createPatientProfile(dto, req.user);
  }

  @Patch(':id')
  async updatePatientProfile(
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
    @Request() req: any,
  ) {
    return this.patientService.updatePatientProfile(id, dto, req.user);
  }
}
