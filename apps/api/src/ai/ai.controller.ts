import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async processChat(
    @Body('message') message: string,
    @Body('contextType') contextType: string | undefined,
    @Body('contextId') contextId: string | undefined,
    @Request() req: any,
  ) {
    return this.aiService.processChat(message, contextType, contextId, req.user);
  }
}
