import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Ip,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ClinicalCopilotService } from './clinical-copilot.service';
import { GenerateSoapNoteDto } from './dto/generate-soap-note.dto';
import { GenerateDischargeSummaryDto } from './dto/generate-discharge-summary.dto';
import { RiskAnalysisDto } from './dto/risk-analysis.dto';

@Controller('copilot')
export class ClinicalCopilotController {
  constructor(private readonly copilotService: ClinicalCopilotService) {}

  @UseGuards(JwtAuthGuard)
  @Post('generate-note')
  async generateSoapNote(@Body() dto: GenerateSoapNoteDto, @Req() req: any, @Ip() ip: string) {
    return this.copilotService.generateSoapNote(dto, req.user, ip);
  }

  @UseGuards(JwtAuthGuard)
  @Post('generate-discharge-summary')
  async generateDischargeSummary(@Body() dto: GenerateDischargeSummaryDto, @Req() req: any, @Ip() ip: string) {
    return this.copilotService.generateDischargeSummary(dto, req.user, ip);
  }

  @UseGuards(JwtAuthGuard)
  @Post('risk-analysis')
  async runRiskAnalysis(@Body() dto: RiskAnalysisDto, @Req() req: any, @Ip() ip: string) {
    return this.copilotService.runRiskAnalysis(dto, req.user, ip);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getHistory(@Req() req: any) {
    return this.copilotService.getHistory(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('analytics')
  async getAnalytics(@Req() req: any) {
    return this.copilotService.getAnalytics(req.user);
  }
}
