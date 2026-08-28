import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TelemedicineService } from './telemedicine.service';
import { CreateTelemedicineSessionDto } from './dto/create-telemedicine-session.dto';
import { JoinSessionDto } from './dto/join-session.dto';
import { SendChatMessageDto } from './dto/send-chat-message.dto';
import { UpdateSessionStatusDto } from './dto/update-session-status.dto';

@Controller('telemedicine')
export class TelemedicineController {
  constructor(private readonly telemedicineService: TelemedicineService) {}

  @UseGuards(JwtAuthGuard)
  @Post('session')
  async createSession(@Body() dto: CreateTelemedicineSessionDto, @Req() req: any) {
    return this.telemedicineService.createSession(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('session/:id')
  async getSession(@Param('id') id: string, @Req() req: any) {
    return this.telemedicineService.getSession(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('session/:id/join')
  async joinSession(@Param('id') id: string, @Body() dto: JoinSessionDto, @Req() req: any) {
    return this.telemedicineService.joinSession(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('session/:id/start')
  async startSession(@Param('id') id: string, @Req() req: any) {
    return this.telemedicineService.startSession(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('session/:id/end')
  async endSession(
    @Param('id') id: string,
    @Body() dto: UpdateSessionStatusDto,
    @Req() req: any,
  ) {
    return this.telemedicineService.endSession(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-sessions')
  async getMySessions(@Req() req: any) {
    return this.telemedicineService.getMySessions(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('chat')
  async sendChatMessage(@Body() dto: SendChatMessageDto, @Req() req: any) {
    return this.telemedicineService.sendChatMessage(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('chat/:sessionId')
  async getChatMessages(@Param('sessionId') sessionId: string, @Req() req: any) {
    return this.telemedicineService.getChatMessages(sessionId, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('analytics')
  async getAnalytics(@Req() req: any) {
    return this.telemedicineService.getAnalytics(req.user);
  }
}
