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
import { LaboratoryService } from './laboratory.service';
import { CreateLabOrderDto } from './dto/create-lab-order.dto';
import { SampleCollectionDto } from './dto/sample-collection.dto';
import { EnterResultDto } from './dto/enter-result.dto';

@Controller('lab')
export class LaboratoryController {
  constructor(private readonly labService: LaboratoryService) {}

  @UseGuards(JwtAuthGuard)
  @Post('orders')
  async createOrder(@Body() dto: CreateLabOrderDto, @Req() req: any) {
    return this.labService.createOrder(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders')
  async getOrders(@Query('facilityId') facilityId: string, @Req() req: any) {
    return this.labService.getOrders(req.user, facilityId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders/:id')
  async getOrderById(@Param('id') id: string, @Req() req: any) {
    return this.labService.getOrderById(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sample-collection')
  async collectSample(@Body() dto: SampleCollectionDto, @Req() req: any) {
    return this.labService.collectSample(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('orders/:id/in-process')
  async markInProcess(@Param('id') id: string, @Req() req: any) {
    return this.labService.markInProcess(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('results/:id')
  async enterResult(@Param('id') id: string, @Body() dto: EnterResultDto, @Req() req: any) {
    return this.labService.enterResult(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('results/:id/verify')
  async verifyResult(@Param('id') id: string, @Req() req: any) {
    return this.labService.verifyResult(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('reports/:orderId')
  async getReport(@Param('orderId') orderId: string, @Req() req: any) {
    return this.labService.getReport(orderId, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('analytics')
  async getAnalytics(@Req() req: any) {
    return this.labService.getAnalytics(req.user);
  }
}
