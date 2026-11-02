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
import { SupportService, CreateSupportTicketDto, TicketMessageDto } from './support.service';

@Controller('support')
@UseGuards(JwtAuthGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('tickets')
  async createTicket(@Body() dto: CreateSupportTicketDto, @Req() req: any) {
    return this.supportService.createTicket(dto, req.user);
  }

  @Get('tickets')
  async getTickets(@Req() req: any, @Query('facilityId') facilityId?: string) {
    return this.supportService.getTickets(req.user, facilityId);
  }

  @Get('tickets/:id')
  async getTicketById(@Param('id') id: string, @Req() req: any) {
    return this.supportService.getTicketById(id, req.user);
  }

  @Post('tickets/:id/messages')
  async addMessage(
    @Param('id') id: string,
    @Body() dto: TicketMessageDto,
    @Req() req: any,
  ) {
    return this.supportService.addMessage(id, dto, req.user);
  }

  @Patch('tickets/:id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED',
    @Req() req: any,
  ) {
    return this.supportService.updateStatus(id, status, req.user);
  }

  @Get('knowledge-base')
  async getKnowledgeBase() {
    return this.supportService.getKnowledgeBase();
  }
}
