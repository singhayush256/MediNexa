import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Header,
  Res,
} from '@nestjs/common';
import { EhrImportService } from './ehr-import.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Response } from 'express';

@Controller('ehr/import')
export class EhrImportController {
  constructor(private readonly importService: EhrImportService) {}

  @UseGuards(JwtAuthGuard)
  @Get('history')
  getHistory() {
    return this.importService.getImportHistory();
  }

  @UseGuards(JwtAuthGuard)
  @Get('records')
  getRecords() {
    return this.importService.getImportedRecords();
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  async uploadFile(@Body() body: any, @Req() req: any) {
    return this.importService.processFileImport(body, req.user);
  }

  @Get('template/:format')
  getTemplate(@Param('format') format: string, @Res() res: Response) {
    const isCsv = format.toLowerCase() === 'csv';
    const sample = this.importService.getSampleTemplate(isCsv ? 'csv' : 'excel');

    if (isCsv) {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="medinexa_ehr_vitals_template.csv"');
      return res.send(sample);
    }

    res.setHeader('Content-Type', 'application/json');
    return res.json(sample);
  }
}
