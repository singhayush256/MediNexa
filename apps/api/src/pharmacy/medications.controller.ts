import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

/**
 * MedicationsController
 *
 * Dedicated alias controller exposing GET /medications (and /pharmacy/medications)
 * for clinical workstations and prescription drug lookup.
 * Reuses existing PharmacyService drug catalog logic, models, and tenant isolation.
 */
@Controller(['medications', 'pharmacy/medications'])
export class MedicationsController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async getMedicationsCatalog(@Req() req: any) {
    return this.pharmacyService.getDrugs(req?.user);
  }
}

