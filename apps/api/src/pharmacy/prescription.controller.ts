import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PharmacyService } from './pharmacy.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';

@Controller()
export class PrescriptionController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  @UseGuards(JwtAuthGuard)
  @Post('prescriptions')
  async createPrescription(@Body() dto: CreatePrescriptionDto, @Req() req: any) {
    return this.pharmacyService.createPrescription(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('prescriptions/:id/issue')
  async issuePrescription(@Param('id') id: string, @Req() req: any) {
    return this.pharmacyService.issuePrescription(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('prescriptions')
  async getPrescriptions(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.pharmacyService.getPrescriptions(req.user, facilityId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('prescriptions/:id')
  async getPrescriptionById(@Param('id') id: string, @Req() req: any) {
    return this.pharmacyService.getPrescriptionById(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('encounters/:id/prescriptions')
  async getEncounterPrescriptions(@Param('id') encounterId: string, @Req() req: any) {
    return this.pharmacyService.getEncounterPrescriptions(encounterId, req.user);
  }
}
