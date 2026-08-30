import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
  Ip,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import { RunAiAnalysisDto } from './dto/run-ai-analysis.dto';
import { AiQueryDto } from './dto/ai-query.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @UseGuards(JwtAuthGuard)
  @Post('query')
  async queryAi(@Body() dto: AiQueryDto, @Req() req: any, @Ip() ip: string) {
    return this.aiService.queryAi(dto, req.user, ip);
  }

  @UseGuards(JwtAuthGuard)
  @Post('run-analysis')
  async runAnalysis(@Body() dto: RunAiAnalysisDto, @Req() req: any, @Ip() ip: string) {
    return this.aiService.runAnalysis(dto, req.user, ip);
  }

  @UseGuards(JwtAuthGuard)
  @Get('alerts')
  async getAlerts(@Req() req: any, @Query('facilityId') facilityId?: string) {
    return this.aiService.getAlerts(req.user, facilityId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('patient-risk/:patientId')
  async getPatientRisk(@Param('patientId') patientId: string, @Req() req: any) {
    return this.aiService.getPatientRisk(patientId, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('predictions')
  async getPredictions(@Req() req: any, @Query('facilityId') facilityId?: string) {
    return this.aiService.getPredictions(req.user, facilityId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('recommendations/:patientId')
  async getRecommendations(@Param('patientId') patientId: string, @Req() req: any) {
    return this.aiService.getRecommendations(patientId, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  async getDashboardMetrics(@Req() req: any) {
    return this.aiService.getDashboardMetrics(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('health')
  async getHealth(@Req() req: any) {
    return this.aiService.getHealthStatus(req.user);
  }
}
