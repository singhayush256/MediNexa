import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmsService } from './ems.service';
import { CreateEmergencyCallDto } from './dto/create-call.dto';
import { CreateEmergencyDispatchDto } from './dto/create-dispatch.dto';
import { AssignAmbulanceDto } from './dto/assign-ambulance.dto';
import { CreateAmbulanceDto } from './dto/create-ambulance.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Controller('ems')
export class EmsController {
  constructor(private readonly emsService: EmsService) {}

  // 1. Emergency Calls
  @UseGuards(JwtAuthGuard)
  @Post('calls')
  async createCall(@Body() dto: CreateEmergencyCallDto, @Req() req: any) {
    return this.emsService.createCall(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('calls')
  async getCalls(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.emsService.getCalls(req.user, facilityId);
  }

  // 2. Emergency Dispatches
  @UseGuards(JwtAuthGuard)
  @Post('dispatch')
  async createDispatch(@Body() dto: CreateEmergencyDispatchDto, @Req() req: any) {
    return this.emsService.createDispatch(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('dispatch')
  async getDispatches(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.emsService.getDispatches(req.user, facilityId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('dispatch/:id/assign')
  async assignAmbulance(@Param('id') id: string, @Body() dto: AssignAmbulanceDto, @Req() req: any) {
    return this.emsService.assignAmbulance(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('dispatch/:id/en-route')
  async markEnRoute(@Param('id') id: string, @Req() req: any) {
    return this.emsService.markEnRoute(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('dispatch/:id/arrived-scene')
  async markArrivedScene(@Param('id') id: string, @Req() req: any) {
    return this.emsService.markArrivedScene(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('dispatch/:id/transporting')
  async markTransporting(@Param('id') id: string, @Req() req: any) {
    return this.emsService.markTransporting(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('dispatch/:id/complete')
  async markComplete(@Param('id') id: string, @Req() req: any) {
    return this.emsService.markComplete(id, req.user);
  }

  // 3. Ambulance Fleet & GPS Telemetry
  @UseGuards(JwtAuthGuard)
  @Post('ambulances')
  async createAmbulance(@Body() dto: CreateAmbulanceDto, @Req() req: any) {
    return this.emsService.createAmbulance(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('ambulances')
  async getAmbulances(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.emsService.getAmbulances(req.user, facilityId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('ambulances/:id/location')
  async updateLocation(@Param('id') id: string, @Body() dto: UpdateLocationDto, @Req() req: any) {
    return this.emsService.updateLocation(id, dto, req.user);
  }

  // 4. EMS Analytics
  @UseGuards(JwtAuthGuard)
  @Get('analytics')
  async getAnalytics(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.emsService.getAnalytics(req.user, facilityId);
  }
}
