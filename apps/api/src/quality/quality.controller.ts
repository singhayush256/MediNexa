import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QualityService } from './quality.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { CreateInfectionDto } from './dto/create-infection.dto';
import { CreateQualityAuditDto } from './dto/create-audit.dto';
import { CreateCapaDto } from './dto/create-capa.dto';
import { CreateHandHygieneDto } from './dto/create-hand-hygiene.dto';
import { CreateSafetyChecklistDto } from './dto/create-checklist.dto';

@Controller('quality')
export class QualityController {
  constructor(private readonly qualityService: QualityService) {}

  // 1. Incidents
  @UseGuards(JwtAuthGuard)
  @Post('incidents')
  async createIncident(@Body() dto: CreateIncidentDto, @Req() req: any) {
    return this.qualityService.createIncident(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('incidents')
  async getIncidents(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.qualityService.getIncidents(req.user, facilityId);
  }

  // 2. Infections
  @UseGuards(JwtAuthGuard)
  @Post('infections')
  async createInfection(@Body() dto: CreateInfectionDto, @Req() req: any) {
    return this.qualityService.createInfection(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('infections')
  async getInfections(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.qualityService.getInfections(req.user, facilityId);
  }

  // 3. Audits
  @UseGuards(JwtAuthGuard)
  @Post('audits')
  async createAudit(@Body() dto: CreateQualityAuditDto, @Req() req: any) {
    return this.qualityService.createAudit(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('audits')
  async getAudits(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.qualityService.getAudits(req.user, facilityId);
  }

  // 4. CAPA
  @UseGuards(JwtAuthGuard)
  @Post('capa')
  async createCapa(@Body() dto: CreateCapaDto, @Req() req: any) {
    return this.qualityService.createCapa(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('capa/:id/complete')
  async completeCapa(@Param('id') id: string, @Req() req: any) {
    return this.qualityService.completeCapa(id, req.user);
  }

  // 5. Hand Hygiene
  @UseGuards(JwtAuthGuard)
  @Post('hand-hygiene')
  async createHandHygiene(@Body() dto: CreateHandHygieneDto, @Req() req: any) {
    return this.qualityService.createHandHygiene(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('hand-hygiene')
  async getHandHygiene(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.qualityService.getHandHygiene(req.user, facilityId);
  }

  // 6. Safety Checklists
  @UseGuards(JwtAuthGuard)
  @Post('checklists')
  async createSafetyChecklist(@Body() dto: CreateSafetyChecklistDto, @Req() req: any) {
    return this.qualityService.createSafetyChecklist(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('checklists')
  async getSafetyChecklists(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.qualityService.getSafetyChecklists(req.user, facilityId);
  }

  // 7. Analytics
  @UseGuards(JwtAuthGuard)
  @Get('analytics')
  async getAnalytics(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.qualityService.getAnalytics(req.user, facilityId);
  }
}
