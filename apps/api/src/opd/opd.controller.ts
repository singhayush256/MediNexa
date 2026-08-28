import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TokenStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OpdService } from './opd.service';
import { CreateOpdTokenDto } from './dto/create-opd-token.dto';
import { UpdateTokenStatusDto } from './dto/update-token-status.dto';

@Controller('opd')
export class OpdController {
  constructor(private readonly opdService: OpdService) {}

  @Get('live-board')
  async getLiveBoard(@Query('facilityId') facilityId?: string) {
    return this.opdService.getLiveBoard(facilityId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('tokens')
  async createToken(@Body() dto: CreateOpdTokenDto, @Req() req: any) {
    return this.opdService.createToken(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('tokens')
  async getTodayTokens(@Req() req: any, @Query('facilityId') facilityId?: string) {
    return this.opdService.getTodayTokens(req.user, facilityId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('analytics')
  async getAnalytics(@Req() req: any) {
    return this.opdService.getAnalytics(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('doctors/:id/queue')
  async getDoctorQueue(@Param('id') doctorId: string, @Req() req: any) {
    return this.opdService.getDoctorQueue(doctorId, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('tokens/:id/call')
  async callToken(
    @Param('id') id: string,
    @Body() dto: UpdateTokenStatusDto,
    @Req() req: any,
  ) {
    return this.opdService.updateTokenStatus(id, TokenStatus.CALLED, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('tokens/:id/start')
  async startToken(
    @Param('id') id: string,
    @Body() dto: UpdateTokenStatusDto,
    @Req() req: any,
  ) {
    return this.opdService.updateTokenStatus(id, TokenStatus.IN_PROGRESS, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('tokens/:id/complete')
  async completeToken(
    @Param('id') id: string,
    @Body() dto: UpdateTokenStatusDto,
    @Req() req: any,
  ) {
    return this.opdService.updateTokenStatus(id, TokenStatus.COMPLETED, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('tokens/:id/skip')
  async skipToken(
    @Param('id') id: string,
    @Body() dto: UpdateTokenStatusDto,
    @Req() req: any,
  ) {
    return this.opdService.updateTokenStatus(id, TokenStatus.SKIPPED, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('tokens/:id/cancel')
  async cancelToken(
    @Param('id') id: string,
    @Body() dto: UpdateTokenStatusDto,
    @Req() req: any,
  ) {
    return this.opdService.updateTokenStatus(id, TokenStatus.CANCELLED, dto, req.user);
  }
}
