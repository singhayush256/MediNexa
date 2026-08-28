import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import { RunAiAnalysisDto } from './dto/run-ai-analysis.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @UseGuards(JwtAuthGuard)
  @Post('run-analysis')
  async runAnalysis(@Body() dto: RunAiAnalysisDto, @Req() req: any) {
    return this.aiService.runAnalysis(dto, req.user);
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
}
